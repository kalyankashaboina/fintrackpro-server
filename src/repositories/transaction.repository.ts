import { Types } from 'mongoose';
import Transaction from '../models/transaction.model.js';
import {
  ITransaction,
  ITransactionFilter,
  IPaginatedResponse,
  ITransactionStats,
  ICreditCardSummary,
} from '../types/transaction.types.js';
import { NotFoundError, DatabaseError } from '../utils/errors.util.js';
import logger from '../config/logger.js';

export class TransactionRepository {
  async findById(id: string | Types.ObjectId): Promise<ITransaction | null> {
    try {
      return await Transaction.findById(id);
    } catch (error) {
      logger.error({ err: error }, 'Error finding transaction');
      throw new DatabaseError('Failed to find transaction');
    }
  }

  async findByIdAndUserId(id: string | Types.ObjectId, userId: string | Types.ObjectId): Promise<ITransaction | null> {
    try {
      return await Transaction.findOne({ _id: id, userId });
    } catch (error) {
      logger.error({ err: error }, 'Error finding transaction');
      throw new DatabaseError('Failed to find transaction');
    }
  }

  async findWithFilters(
    filter: ITransactionFilter,
    page = 1,
    limit = 20,
    sortBy = 'date',
    sortOrder: 'asc' | 'desc' = 'desc'
  ): Promise<IPaginatedResponse<ITransaction>> {
    try {
      const skip = (page - 1) * limit;
      const sort: Record<string, 1 | -1> = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };
      const query: Record<string, unknown> = { userId: filter.userId };

      if (filter.type) {
        query.type = Array.isArray(filter.type) ? { $in: filter.type } : filter.type;
      }
      if (filter.category) query.category = new RegExp(filter.category, 'i');
      if (filter.isCredit !== undefined) query.isCredit = filter.isCredit;
      if (filter.paymentMode) query.paymentMode = new RegExp(filter.paymentMode, 'i');
      if (filter.shared !== undefined) query.shared = filter.shared;
      if (filter.dateFrom || filter.dateTo) {
        const dateQuery: Record<string, Date> = {};
        if (filter.dateFrom) dateQuery.$gte = filter.dateFrom;
        if (filter.dateTo) dateQuery.$lte = filter.dateTo;
        query.date = dateQuery;
      }
      if (filter.minAmount !== undefined || filter.maxAmount !== undefined) {
        const amtQuery: Record<string, number> = {};
        if (filter.minAmount !== undefined) amtQuery.$gte = filter.minAmount;
        if (filter.maxAmount !== undefined) amtQuery.$lte = filter.maxAmount;
        query.amount = amtQuery;
      }
      if (filter.search) {
        query.$text = { $search: filter.search };
      }

      const [data, total] = await Promise.all([
        Transaction.find(query).sort(sort).skip(skip).limit(limit).lean(),
        Transaction.countDocuments(query),
      ]);

      const totalPages = Math.ceil(total / limit);
      return {
        data: data as unknown as ITransaction[],
        pagination: { page, limit, total, totalPages, hasNext: page < totalPages, hasPrev: page > 1 },
      };
    } catch (error) {
      logger.error({ err: error }, 'Error finding transactions');
      throw new DatabaseError('Failed to find transactions');
    }
  }

  async create(data: Partial<ITransaction>): Promise<ITransaction> {
    try {
      const tx = new Transaction(data);
      await tx.save();
      return tx;
    } catch (error) {
      logger.error({ err: error }, 'Error creating transaction');
      throw new DatabaseError('Failed to create transaction');
    }
  }

  async bulkCreate(dataList: Partial<ITransaction>[]): Promise<ITransaction[]> {
    try {
      const docs = await Transaction.insertMany(dataList, { ordered: false });
      return docs as ITransaction[];
    } catch (error) {
      logger.error({ err: error }, 'Error bulk creating transactions');
      throw new DatabaseError('Failed to bulk create transactions');
    }
  }

  async update(id: string | Types.ObjectId, userId: string | Types.ObjectId, updates: Partial<ITransaction>): Promise<ITransaction> {
    try {
      const tx = await Transaction.findOneAndUpdate(
        { _id: id, userId },
        { $set: updates },
        { new: true, runValidators: true }
      );
      if (!tx) throw new NotFoundError('Transaction');
      return tx;
    } catch (error) {
      if (error instanceof NotFoundError) throw error;
      logger.error({ err: error }, 'Error updating transaction');
      throw new DatabaseError('Failed to update transaction');
    }
  }

  async delete(id: string | Types.ObjectId, userId: string | Types.ObjectId): Promise<void> {
    try {
      const result = await Transaction.findOneAndDelete({ _id: id, userId });
      if (!result) throw new NotFoundError('Transaction');
    } catch (error) {
      if (error instanceof NotFoundError) throw error;
      logger.error({ err: error }, 'Error deleting transaction');
      throw new DatabaseError('Failed to delete transaction');
    }
  }

  async getStats(userId: string | Types.ObjectId, dateFrom?: Date, dateTo?: Date): Promise<ITransactionStats> {
    try {
      const matchStage: Record<string, unknown> = { userId: new Types.ObjectId(userId as string) };
      if (dateFrom || dateTo) {
        const d: Record<string, Date> = {};
        if (dateFrom) d.$gte = dateFrom;
        if (dateTo) d.$lte = dateTo;
        matchStage.date = d;
      }

      const [typeStats, categoryStats, monthlyStats] = await Promise.all([
        Transaction.aggregate([
          { $match: matchStage },
          { $group: { _id: '$type', total: { $sum: '$userShare' }, count: { $sum: 1 } } },
        ]),
        Transaction.aggregate([
          { $match: { ...matchStage, isCredit: { $ne: true } } },
          { $group: { _id: '$category', total: { $sum: '$userShare' }, count: { $sum: 1 } } },
          { $sort: { total: -1 } },
          { $limit: 10 },
        ]),
        Transaction.aggregate([
          { $match: matchStage },
          {
            $group: {
              _id: { year: { $year: '$date' }, month: { $month: '$date' } },
              income: { $sum: { $cond: [{ $in: ['$type', ['income', 'borrow']] }, '$userShare', 0] } },
              expense: { $sum: { $cond: [{ $in: ['$type', ['expense', 'repay']] }, '$userShare', 0] } },
            },
          },
          { $sort: { '_id.year': 1, '_id.month': 1 } },
          { $limit: 12 },
        ]),
      ]);

      const getTotal = (type: string) => typeStats.find((s: { _id: string; total: number }) => s._id === type)?.total || 0;

      return {
        totalIncome: getTotal('income'),
        totalExpense: getTotal('expense'),
        balance: getTotal('income') - getTotal('expense'),
        transactionCount: typeStats.reduce((a: number, s: { count: number }) => a + s.count, 0),
        totalBorrowed: getTotal('borrow'),
        totalRepaid: getTotal('repay'),
        totalCreditSpent: getTotal('credit'),
        totalCreditRepaid: getTotal('credit-repay'),
        creditOutstanding: getTotal('credit') - getTotal('credit-repay'),
        categoryBreakdown: categoryStats.map((c: { _id: string; total: number; count: number }) => ({ category: c._id, total: c.total, count: c.count })),
        monthlyBreakdown: monthlyStats.map((m: { _id: { year: number; month: number }; income: number; expense: number }) => ({
          month: `${m._id.year}-${String(m._id.month).padStart(2, '0')}`,
          income: m.income,
          expense: m.expense,
        })),
      };
    } catch (error) {
      logger.error({ err: error }, 'Error getting stats');
      throw new DatabaseError('Failed to get stats');
    }
  }

  async getCreditCardSummaries(userId: string | Types.ObjectId, dateFrom?: Date, dateTo?: Date): Promise<ICreditCardSummary[]> {
    try {
      const match: Record<string, unknown> = { userId: new Types.ObjectId(userId as string), isCredit: true };
      if (dateFrom || dateTo) {
        const d: Record<string, Date> = {};
        if (dateFrom) d.$gte = dateFrom;
        if (dateTo) d.$lte = dateTo;
        match.date = d;
      }
      const result = await Transaction.aggregate([
        { $match: match },
        {
          $group: {
            _id: '$paymentMode',
            totalSpent: { $sum: { $cond: [{ $eq: ['$type', 'credit'] }, '$userShare', 0] } },
            totalRepaid: { $sum: { $cond: [{ $eq: ['$type', 'credit-repay'] }, '$userShare', 0] } },
            transactionCount: { $sum: 1 },
            lastTransaction: { $max: '$date' },
          },
        },
        { $sort: { lastTransaction: -1 } },
      ]);
      return result.map((r: { _id: string; totalSpent: number; totalRepaid: number; transactionCount: number; lastTransaction: Date }) => ({
        cardName: r._id,
        totalSpent: r.totalSpent,
        totalRepaid: r.totalRepaid,
        outstanding: r.totalSpent - r.totalRepaid,
        transactionCount: r.transactionCount,
        lastTransaction: r.lastTransaction,
      }));
    } catch (error) {
      logger.error({ err: error }, 'Error getting credit card summaries');
      throw new DatabaseError('Failed to get credit card summaries');
    }
  }

  async getCategories(userId: string | Types.ObjectId): Promise<string[]> {
    try {
      return Transaction.distinct('category', { userId });
    } catch (error) {
      logger.error({ err: error }, 'Error getting categories');
      throw new DatabaseError('Failed to get categories');
    }
  }
}

export default new TransactionRepository();

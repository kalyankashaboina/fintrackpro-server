import transactionRepository from '../repositories/transaction.repository.js';
import { ICreateTransactionInput, IUpdateTransactionInput, ITransaction, ITransactionFilter, IPaginatedResponse, ITransactionStats, ICreditCardSummary } from '../types/transaction.types.js';
import { NotFoundError } from '../utils/errors.util.js';
import logger from '../config/logger.js';
import { Types } from 'mongoose';

class TransactionService {
  async create(userId: string, input: ICreateTransactionInput): Promise<ITransaction> {
    const isCreditType = ['credit', 'credit-repay'].includes(input.type);
    const tx = await transactionRepository.create({
      ...input,
      userId: new Types.ObjectId(userId),
      date: input.date || new Date(),
      isCredit: isCreditType || input.isCredit || false,
      shared: input.shared || false,
      people: input.people || 1,
      userShare: input.userShare ?? input.amount,
      paymentMode: input.paymentMode || 'Cash',
    });
    logger.info({ userId, txId: tx._id }, 'Transaction created');
    return tx;
  }

  async bulkCreate(userId: string, inputs: ICreateTransactionInput[]): Promise<ITransaction[]> {
    const prepared = inputs.map(input => ({
      ...input,
      userId: new Types.ObjectId(userId),
      date: input.date || new Date(),
      isCredit: ['credit', 'credit-repay'].includes(input.type) || input.isCredit || false,
      shared: input.shared || false,
      people: input.people || 1,
      userShare: input.userShare ?? input.amount,
      paymentMode: input.paymentMode || 'Cash',
    }));
    logger.info({ userId, count: inputs.length }, 'Bulk creating transactions');
    return transactionRepository.bulkCreate(prepared);
  }

  async getAll(userId: string, filter: Partial<ITransactionFilter>, page: number, limit: number, sortBy: string, sortOrder: 'asc' | 'desc'): Promise<IPaginatedResponse<ITransaction>> {
    return transactionRepository.findWithFilters(
      { ...filter, userId: new Types.ObjectId(userId) },
      page,
      limit,
      sortBy,
      sortOrder
    );
  }

  async getById(id: string, userId: string): Promise<ITransaction> {
    const tx = await transactionRepository.findByIdAndUserId(id, userId);
    if (!tx) throw new NotFoundError('Transaction');
    return tx;
  }

  async update(id: string, userId: string, input: IUpdateTransactionInput): Promise<ITransaction> {
    const tx = await transactionRepository.update(id, userId, input);
    logger.info({ userId, txId: id }, 'Transaction updated');
    return tx;
  }

  async delete(id: string, userId: string): Promise<void> {
    await transactionRepository.delete(id, userId);
    logger.info({ userId, txId: id }, 'Transaction deleted');
  }

  async getStats(userId: string, dateFrom?: Date, dateTo?: Date): Promise<ITransactionStats> {
    return transactionRepository.getStats(userId, dateFrom, dateTo);
  }

  async getCategories(userId: string): Promise<string[]> {
    return transactionRepository.getCategories(userId);
  }

  async getCreditCardSummaries(userId: string, dateFrom?: Date, dateTo?: Date): Promise<ICreditCardSummary[]> {
    return transactionRepository.getCreditCardSummaries(userId, dateFrom, dateTo);
  }

  async getCreditCardTransactions(userId: string, cardName: string, page: number, limit: number, dateFrom?: Date, dateTo?: Date, type?: string, sortOrder: 'asc' | 'desc' = 'desc'): Promise<IPaginatedResponse<ITransaction>> {
    const filter: ITransactionFilter = {
      userId: new Types.ObjectId(userId),
      isCredit: true,
      paymentMode: cardName,
    };
    if (dateFrom) filter.dateFrom = dateFrom;
    if (dateTo) filter.dateTo = dateTo;
    if (type) filter.type = type as 'credit' | 'credit-repay';
    return transactionRepository.findWithFilters(filter, page, limit, 'date', sortOrder);
  }
}

export default new TransactionService();

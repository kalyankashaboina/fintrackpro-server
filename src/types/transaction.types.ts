import { Document, Types } from 'mongoose';

export type TransactionType =
  | 'income'
  | 'expense'
  | 'borrow'
  | 'repay'
  | 'credit'
  | 'credit-repay';

export interface ITransaction extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  amount: number;
  type: TransactionType;
  category: string;
  description?: string;
  date: Date;
  paymentMode: string;
  isCredit: boolean;
  shared: boolean;
  people: number;
  userShare: number;
  tags?: string[];
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICreditCardSummary {
  cardName: string;
  totalSpent: number;
  totalRepaid: number;
  outstanding: number;
  transactionCount: number;
  lastTransaction?: Date;
}

export interface ITransactionFilter {
  userId: Types.ObjectId;
  type?: TransactionType | TransactionType[];
  category?: string;
  dateFrom?: Date;
  dateTo?: Date;
  minAmount?: number;
  maxAmount?: number;
  search?: string;
  isCredit?: boolean;
  paymentMode?: string;
  shared?: boolean;
}

export interface ITransactionStats {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  transactionCount: number;
  totalBorrowed: number;
  totalRepaid: number;
  totalCreditSpent: number;
  totalCreditRepaid: number;
  creditOutstanding: number;
  categoryBreakdown: { category: string; total: number; count: number }[];
  monthlyBreakdown: { month: string; income: number; expense: number }[];
}

export interface IPaginationQuery {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface IPaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface ICreateTransactionInput {
  amount: number;
  type: TransactionType;
  category: string;
  description?: string;
  date?: Date;
  paymentMode?: string;
  isCredit?: boolean;
  shared?: boolean;
  people?: number;
  userShare?: number;
  tags?: string[];
  notes?: string;
}

export interface IUpdateTransactionInput {
  amount?: number;
  type?: TransactionType;
  category?: string;
  description?: string;
  date?: Date;
  paymentMode?: string;
  isCredit?: boolean;
  shared?: boolean;
  people?: number;
  userShare?: number;
  tags?: string[];
  notes?: string;
}

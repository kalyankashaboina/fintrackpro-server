import { z } from 'zod';

const TYPES = ['income', 'expense', 'borrow', 'repay', 'credit', 'credit-repay'] as const;
const mongoId = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid ID');

const transactionBody = {
  amount: z.number().positive('Amount must be greater than 0'),
  type: z.enum(TYPES, { message: 'Invalid transaction type' }),
  category: z.string().min(1, 'Category is required').trim(),
  description: z.string().max(500).trim().optional(),
  notes: z.string().max(1000).trim().optional(),
  date: z.string().optional().transform(s => s ? new Date(s) : new Date()),
  paymentMode: z.string().trim().optional().default('Cash'),
  isCredit: z.boolean().optional().default(false),
  shared: z.boolean().optional().default(false),
  people: z.number().int().min(1).optional().default(1),
  userShare: z.number().min(0).optional(),
  tags: z.array(z.string().trim()).optional(),
};

export const createTransactionSchema = z.object({
  body: z.object(transactionBody),
});

export const updateTransactionSchema = z.object({
  params: z.object({ id: mongoId }),
  body: z.object({
    amount: z.number().positive().optional(),
    type: z.enum(TYPES).optional(),
    category: z.string().min(1).trim().optional(),
    description: z.string().max(500).trim().optional(),
    notes: z.string().max(1000).trim().optional(),
    date: z.string().optional().transform(s => s ? new Date(s) : undefined),
    paymentMode: z.string().trim().optional(),
    isCredit: z.boolean().optional(),
    shared: z.boolean().optional(),
    people: z.number().int().min(1).optional(),
    userShare: z.number().min(0).optional(),
    tags: z.array(z.string().trim()).optional(),
  }),
});

export const getTransactionSchema = z.object({
  params: z.object({ id: mongoId }),
});

export const deleteTransactionSchema = z.object({
  params: z.object({ id: mongoId }),
});

export const queryTransactionsSchema = z.object({
  query: z.object({
    page: z.string().default('1').transform(Number),
    limit: z.string().default('20').transform(Number),
    type: z.string().optional(),
    category: z.string().optional(),
    dateFrom: z.string().optional().transform(s => s ? new Date(s) : undefined),
    dateTo: z.string().optional().transform(s => s ? new Date(s) : undefined),
    minAmount: z.string().optional().transform(s => s ? Number(s) : undefined),
    maxAmount: z.string().optional().transform(s => s ? Number(s) : undefined),
    search: z.string().trim().optional(),
    isCredit: z.string().optional().transform(s => s === 'true' ? true : s === 'false' ? false : undefined),
    paymentMode: z.string().optional(),
    shared: z.string().optional().transform(s => s === 'true' ? true : s === 'false' ? false : undefined),
    sortBy: z.enum(['date', 'amount', 'category', 'createdAt']).default('date'),
    sortOrder: z.enum(['asc', 'desc']).default('desc'),
  }),
});

export const getStatsSchema = z.object({
  query: z.object({
    dateFrom: z.string().optional().transform(s => s ? new Date(s) : undefined),
    dateTo: z.string().optional().transform(s => s ? new Date(s) : undefined),
  }),
});

export const bulkCreateSchema = z.object({
  body: z.array(z.object(transactionBody)).min(1, 'At least one transaction required').max(500, 'Max 500 per bulk import'),
});

export const creditCardSummarySchema = z.object({
  query: z.object({
    dateFrom: z.string().optional().transform(s => s ? new Date(s) : undefined),
    dateTo: z.string().optional().transform(s => s ? new Date(s) : undefined),
  }),
});

export const creditCardDetailSchema = z.object({
  params: z.object({ cardName: z.string().min(1) }),
  query: z.object({
    page: z.string().default('1').transform(Number),
    limit: z.string().default('20').transform(Number),
    dateFrom: z.string().optional().transform(s => s ? new Date(s) : undefined),
    dateTo: z.string().optional().transform(s => s ? new Date(s) : undefined),
    type: z.enum(['credit', 'credit-repay']).optional(),
    sortOrder: z.enum(['asc', 'desc']).default('desc'),
  }),
});

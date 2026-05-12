import { Response } from 'express';
import transactionService from '../services/transaction.service.js';
import { IAuthRequest } from '../types/express.types.js';
import { successResponse, paginatedResponse } from '../utils/response.util.js';
import { asyncHandler } from '../utils/async-handler.util.js';
import { NotFoundError } from '../utils/errors.util.js';

export const createTransaction = asyncHandler(async (req: IAuthRequest, res: Response) => {
  const tx = await transactionService.create(req.userId!, req.body);
  successResponse(res, tx, 'Transaction created', 201);
});

export const bulkCreateTransactions = asyncHandler(async (req: IAuthRequest, res: Response) => {
  const txs = await transactionService.bulkCreate(req.userId!, req.body);
  successResponse(res, txs, `${txs.length} transactions imported`, 201);
});

export const getTransactions = asyncHandler(async (req: IAuthRequest, res: Response) => {
  const { page = '1', limit = '20', type, category, dateFrom, dateTo,
    minAmount, maxAmount, search, isCredit, paymentMode, shared,
    sortBy = 'date', sortOrder = 'desc' } = req.query as Record<string, string>;

  const filter = {
    ...(type && { type: type as 'income' }),
    ...(category && { category }),
    ...(dateFrom && { dateFrom: new Date(dateFrom) }),
    ...(dateTo && { dateTo: new Date(dateTo) }),
    ...(minAmount && { minAmount: Number(minAmount) }),
    ...(maxAmount && { maxAmount: Number(maxAmount) }),
    ...(search && { search }),
    ...(isCredit !== undefined && { isCredit: isCredit === 'true' }),
    ...(paymentMode && { paymentMode }),
    ...(shared !== undefined && { shared: shared === 'true' }),
  };

  const result = await transactionService.getAll(req.userId!, filter, Number(page), Number(limit), sortBy, sortOrder as 'asc' | 'desc');
  paginatedResponse(res, result.data, result.pagination.page, result.pagination.limit, result.pagination.total);
});

export const getTransaction = asyncHandler(async (req: IAuthRequest, res: Response) => {
  const tx = await transactionService.getById(req.params.id as string, req.userId!);
  if (!tx) throw new NotFoundError('Transaction');
  successResponse(res, tx);
});

export const updateTransaction = asyncHandler(async (req: IAuthRequest, res: Response) => {
  const tx = await transactionService.update(req.params.id as string, req.userId!, req.body);
  successResponse(res, tx, 'Transaction updated');
});

export const deleteTransaction = asyncHandler(async (req: IAuthRequest, res: Response) => {
  await transactionService.delete(req.params.id as string, req.userId!);
  successResponse(res, null, 'Transaction deleted');
});

export const getStats = asyncHandler(async (req: IAuthRequest, res: Response) => {
  const { dateFrom, dateTo } = req.query as Record<string, string>;
  const stats = await transactionService.getStats(
    req.userId!,
    dateFrom ? new Date(dateFrom) : undefined,
    dateTo ? new Date(dateTo) : undefined
  );
  successResponse(res, stats);
});

export const getCategories = asyncHandler(async (req: IAuthRequest, res: Response) => {
  const categories = await transactionService.getCategories(req.userId!);
  successResponse(res, categories);
});

export const getCreditCardSummaries = asyncHandler(async (req: IAuthRequest, res: Response) => {
  const { dateFrom, dateTo } = req.query as Record<string, string>;
  const summaries = await transactionService.getCreditCardSummaries(
    req.userId!,
    dateFrom ? new Date(dateFrom) : undefined,
    dateTo ? new Date(dateTo) : undefined
  );
  successResponse(res, summaries, 'Credit card summaries fetched');
});

export const getCreditCardTransactions = asyncHandler(async (req: IAuthRequest, res: Response) => {
  const { cardName } = req.params as { cardName: string };
  const { page = '1', limit = '20', dateFrom, dateTo, type, sortOrder = 'desc' } = req.query as Record<string, string>;

  const result = await transactionService.getCreditCardTransactions(
    req.userId!,
    decodeURIComponent(cardName),
    Number(page),
    Number(limit),
    dateFrom ? new Date(dateFrom) : undefined,
    dateTo ? new Date(dateTo) : undefined,
    type,
    sortOrder as 'asc' | 'desc'
  );
  paginatedResponse(res, result.data, result.pagination.page, result.pagination.limit, result.pagination.total);
});

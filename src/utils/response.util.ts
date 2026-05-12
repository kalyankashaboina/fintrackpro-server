import { Response } from 'express';
import { IApiResponse } from '../types/express.types.js';

export function successResponse<T>(
  res: Response,
  data: T,
  message?: string,
  statusCode = 200,
  meta?: Record<string, unknown>
): Response {
  const response: IApiResponse<T> = { success: true, message, data, meta };
  return res.status(statusCode).json(response);
}

export function errorResponse(
  res: Response,
  message: string,
  code = 'ERROR',
  statusCode = 500,
  details?: Record<string, unknown>[] | Record<string, unknown>
): Response {
  const response: IApiResponse = {
    success: false,
    error: { code, message, details },
  };
  return res.status(statusCode).json(response);
}

export function paginatedResponse<T>(
  res: Response,
  data: T[],
  page: number,
  limit: number,
  total: number,
  message?: string
): Response {
  const totalPages = Math.ceil(total / limit);
  const response: IApiResponse<T[]> = {
    success: true,
    message,
    data,
    meta: { page, limit, total, totalPages },
  };
  return res.status(200).json(response);
}

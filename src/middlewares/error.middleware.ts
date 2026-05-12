import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { AppError } from '../utils/errors.util.js';
import { env } from '../config/env.js';
import logger from '../config/logger.js';
import { IApiResponse } from '../types/express.types.js';

interface MongooseValidationError extends Error {
  errors: Record<string, { path: string; message: string }>;
}

interface MongoDuplicateKeyError extends Error {
  code: number;
  keyPattern: Record<string, unknown>;
}

export function errorHandler(
  error: Error | AppError,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  logger.error({ err: error, path: req.path, method: req.method }, 'Error occurred');

  let statusCode = 500;
  let code = 'INTERNAL_ERROR';
  let message = 'An unexpected error occurred';
  let details: Record<string, unknown>[] | undefined;

  if (error instanceof AppError) {
    statusCode = error.statusCode;
    code = error.code;
    message = error.message;
  } else if (error instanceof ZodError) {
    statusCode = 400;
    code = 'VALIDATION_ERROR';
    message = 'Validation failed';
    details = error.issues.map((err) => ({ field: err.path.join('.'), message: err.message }));
  } else if (error.name === 'ValidationError') {
    statusCode = 400;
    code = 'VALIDATION_ERROR';
    message = 'Validation failed';
    const ve = error as MongooseValidationError;
    details = Object.values(ve.errors).map((e) => ({ field: e.path, message: e.message }));
  } else if (error.name === 'CastError') {
    statusCode = 400;
    code = 'INVALID_ID';
    message = 'Invalid ID format';
  } else if ((error as MongoDuplicateKeyError).code === 11000) {
    statusCode = 409;
    code = 'DUPLICATE_ERROR';
    const field = Object.keys((error as MongoDuplicateKeyError).keyPattern)[0];
    message = `${field} already exists`;
  } else if (error.name === 'JsonWebTokenError') {
    statusCode = 401;
    code = 'INVALID_TOKEN';
    message = 'Invalid token';
  } else if (error.name === 'TokenExpiredError') {
    statusCode = 401;
    code = 'TOKEN_EXPIRED';
    message = 'Token has expired';
  }

  const response: IApiResponse = {
    success: false,
    error: {
      code,
      message,
      ...(details && { details }),
      ...(env.NODE_ENV === 'development' && { stack: error.stack }),
    },
  };

  res.status(statusCode).json(response);
}

export function notFoundHandler(req: Request, res: Response, _next: NextFunction): void {
  const response: IApiResponse = {
    success: false,
    error: { code: 'NOT_FOUND', message: `Route ${req.method} ${req.path} not found` },
  };
  res.status(404).json(response);
}

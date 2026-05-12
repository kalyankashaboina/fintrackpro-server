import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { errorResponse } from '../utils/response.util.js';
import logger from '../config/logger.js';

export function validate(schema: ZodSchema) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.issues.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        }));

        logger.warn({ errors, path: req.path }, 'Validation failed');

        errorResponse(
          res,
          'Validation failed',
          'VALIDATION_ERROR',
          400,
          errors
        );
        return;
      }

      logger.error({ err: error }, 'Validation middleware error');
      errorResponse(res, 'Internal server error', 'INTERNAL_ERROR', 500);
    }
  };
}

export default validate;

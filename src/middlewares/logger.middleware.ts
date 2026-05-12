import { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'crypto';
import logger from '../config/logger.js';

export function requestLogger(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const start = process.hrtime.bigint();

  const requestId = randomUUID();

  req.id = requestId;

  res.setHeader('X-Request-ID', requestId);

  logger.info(
    {
      reqId: requestId,
      type: 'request',
      req: {
        method: req.method,
        url: req.originalUrl,
        query: req.query,
        params: req.params,
        ip: req.ip,
        userAgent: req.get('user-agent'),
      },
    },
    `${req.method} ${req.originalUrl} started`,
  );

  res.on('finish', () => {
    const end = process.hrtime.bigint();

    const durationMs =
      Number(end - start) / 1_000_000;

    const payload = {
      reqId: requestId,
      type: 'response',
      req: {
        method: req.method,
        url: req.originalUrl,
      },
      res: {
        statusCode: res.statusCode,
      },
      duration: `${durationMs.toFixed(2)}ms`,
      contentLength: res.getHeader('content-length'),
    };

    if (res.statusCode >= 500) {
      logger.error(
        payload,
        `${req.method} ${req.originalUrl} failed`,
      );
    } else if (res.statusCode >= 400) {
      logger.warn(
        payload,
        `${req.method} ${req.originalUrl} warning`,
      );
    } else {
      logger.info(
        payload,
        `${req.method} ${req.originalUrl} completed`,
      );
    }
  });

  next();
}

export default requestLogger;
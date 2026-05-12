import pino from 'pino';
import { env } from './env.js';

const isProd = env.NODE_ENV === 'production';

export const logger = pino({
  level: env.LOG_LEVEL,

  transport: !isProd
    ? {
        target: 'pino-pretty',
        options: {
          colorize: true,
          singleLine: true,
          messageFormat: '{msg}',
        },
      }
    : undefined,

  base: isProd
    ? {
        service: 'fintrackpro-api',
        env: env.NODE_ENV,
      }
    : undefined,
});

export default logger;
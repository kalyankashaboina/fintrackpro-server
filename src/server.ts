import 'dotenv/config';
import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';

import { env } from './config/env.js';
import logger from './config/logger.js';
import connectDatabase from './config/database.js';
import { swaggerSpec } from './config/swagger.js';

import { setupSecurityMiddleware } from './middlewares/security.middleware.js';
import { requestLogger } from './middlewares/logger.middleware.js';
import { errorHandler, notFoundHandler } from './middlewares/error.middleware.js';
import { apiLimiter } from './middlewares/rate-limit.middleware.js';

import v1Routes from './routes/v1/index.js';

const app = express();

/* ---------------- SECURITY BASE ---------------- */
setupSecurityMiddleware(app);

/* ---------------- CORE MIDDLEWARES ---------------- */
app.use(
  cors({
    origin: env.CLIENT_URL,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }),
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser(env.COOKIE_SECRET));

/* ---------------- REQUEST LOGGER ---------------- */
app.use(requestLogger);

/* ---------------- HEALTH CHECK (NO SECURITY MIDDLEWARE) ---------------- */
app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

/* ---------------- SWAGGER (ALWAYS BEFORE API SECURITY) ---------------- */
app.use(
  '/api-docs',
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    explorer: true,
    customSiteTitle: 'FinTrackPro API Docs',
    swaggerOptions: {
      persistAuthorization: true,
    },
  }),
);

/* ---------------- API ROUTES (PROTECTED STACK) ---------------- */
app.use('/api/v1', apiLimiter, v1Routes);

/* ---------------- 404 HANDLER ---------------- */
app.use(notFoundHandler);

/* ---------------- GLOBAL ERROR HANDLER ---------------- */
app.use(errorHandler);

/* ---------------- SERVER START ---------------- */
async function startServer() {
  try {
    await connectDatabase();

    const port = env.PORT;

    app.listen(port, () => {
      logger.info(`Server running on port ${port}`);
      logger.info(`Swagger docs: http://localhost:${port}/api-docs`);
      logger.info(`Environment: ${env.NODE_ENV}`);
    });
  } catch (error) {
    logger.error({ err: error }, 'Failed to start server');
    process.exit(1);
  }
}

startServer();

export default app;
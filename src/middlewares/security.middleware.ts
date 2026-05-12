import helmet from 'helmet';
import { Express } from 'express';

export function setupSecurityMiddleware(app: Express): void {
  // Helmet - Set security headers
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", 'data:', 'https:'],
          connectSrc: ["'self'"],
          fontSrc: ["'self'"],
          objectSrc: ["'none'"],
          mediaSrc: ["'self'"],
          frameSrc: ["'none'"],
        },
      },
      crossOriginEmbedderPolicy: false,
    })
  );

  // Note: NoSQL injection prevention through:
  // 1. Input validation with Zod validators
  // 2. Parameterized queries with Mongoose
  // 3. Request sanitization in individual routes/controllers

  // Note: xss-clean is deprecated and no longer recommended
  // XSS protection is now handled by:
  // 1. Helmet's CSP headers
  // 2. Proper input validation with Zod
  // 3. Output encoding (handled by frameworks like React)
}

export default setupSecurityMiddleware;

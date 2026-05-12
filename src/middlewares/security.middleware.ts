import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
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

  // Prevent NoSQL injection
  app.use(
    mongoSanitize({
      replaceWith: '_',
      onSanitize: ({ req, key }) => {
        console.warn(`Sanitized request: ${req.path}, key: ${key}`);
      },
    })
  );

  // Note: xss-clean is deprecated and no longer recommended
  // XSS protection is now handled by:
  // 1. Helmet's CSP headers
  // 2. Proper input validation with Zod
  // 3. Output encoding (handled by frameworks like React)
}

export default setupSecurityMiddleware;

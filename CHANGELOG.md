# Backend Changelog

## [2.0.0] - 2026-05-09

### Added
- Full TypeScript migration with strict mode
- Zod validation on all endpoints
- Pino structured logging (pretty dev, JSON prod)
- Centralized environment validation
- JWT access + refresh tokens with rotation
- Token blacklisting via RefreshToken model
- Rate limiting (5/15min auth, 100/15min API, 3/hr password reset)
- Helmet security headers
- MongoDB input sanitization
- Email verification flow
- Password reset flow with expiring tokens
- Bcrypt hashing (12 rounds)
- Custom error classes (AppError, ValidationError, AuthenticationError, etc.)
- Centralized error handling middleware
- Request logging middleware with request IDs
- API versioning (v1)
- Health check endpoint
- Upload service with Cloudinary
- Email service with HTML templates
- RecurringTransaction model
- Budget model
- Docker + docker-compose support
- GitHub Actions CI/CD pipeline
- ESLint + Prettier configuration
- Comprehensive API documentation

### Changed
- Architecture: Controller → Service → Repository pattern
- Replaced Winston with Pino
- All process.env usage replaced with validated env config
- Improved Mongoose models with proper indexes

### Removed
- All JavaScript source files
- Mock data and seed scripts
- Old event-based email handling

### Security
- Fixed 16 npm vulnerabilities (nodemailer, body-parser, etc.)
- 0 vulnerabilities remaining

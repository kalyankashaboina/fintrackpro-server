import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('5000').transform(Number),

  // MongoDB - use string() not url() because mongodb:// fails Zod's URL validator
  MONGODB_URI: z.string().min(10, 'MONGODB_URI is required'),

  // JWT
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  JWT_REFRESH_SECRET: z.string().min(32, 'JWT_REFRESH_SECRET must be at least 32 characters'),
  JWT_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),

  // Cloudinary - optional in dev (uploads will fail gracefully)
  CLOUDINARY_CLOUD_NAME: z.string().default(''),
  CLOUDINARY_API_KEY: z.string().default(''),
  CLOUDINARY_API_SECRET: z.string().default(''),

  // Email - optional in dev (emails will fail gracefully)
  EMAIL_HOST: z.string().default('smtp.gmail.com'),
  EMAIL_PORT: z.string().default('587').transform(Number),
  EMAIL_USER: z.string().default(''),
  EMAIL_PASSWORD: z.string().default(''),
  EMAIL_FROM: z.string().default('noreply@fintrackpro.com'),

  // Client
  CLIENT_URL: z.string().default('http://localhost:5173'),

  // Cookie
  COOKIE_SECRET: z.string().min(32, 'COOKIE_SECRET must be at least 32 characters'),

  // Security
  BCRYPT_ROUNDS: z.string().default('12').transform(Number),

  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: z.string().default('900000').transform(Number),
  RATE_LIMIT_MAX_REQUESTS: z.string().default('100').transform(Number),

  // Logging
  LOG_LEVEL: z
    .enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace'])
    .default('info'),
});

export type Env = z.infer<typeof envSchema>;

function validateEnv(): Env {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const lines = error.issues.map((e) => `  • ${e.path.join('.')}: ${e.message}`).join('\n');
      console.error(`\n❌ Server cannot start — environment validation failed:\n${lines}\n`);
      console.error('Copy .env.example to .env and fill in the required values.\n');
      process.exit(1);
    }
    throw error;
  }
}

export const env = validateEnv();

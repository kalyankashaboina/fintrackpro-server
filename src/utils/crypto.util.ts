import crypto from 'crypto';
import { env } from '../config/env.js';
import logger from '../config/logger.js';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;

export function generateRandomToken(length: number = 32): string {
  return crypto.randomBytes(length).toString('hex');
}

export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export async function hashPassword(password: string): Promise<string> {
  const bcrypt = await import('bcryptjs');
  return bcrypt.hash(password, env.BCRYPT_ROUNDS);
}

export async function comparePassword(password: string, hashedPassword: string): Promise<boolean> {
  const bcrypt = await import('bcryptjs');
  return bcrypt.compare(password, hashedPassword);
}

export function generatePasswordResetToken(): { token: string; hashedToken: string; expiresAt: Date } {
  const token = generateRandomToken(32);
  const hashedToken = hashToken(token);
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  return { token, hashedToken, expiresAt };
}

export function generateEmailVerificationToken(): { token: string; hashedToken: string; expiresAt: Date } {
  const token = generateRandomToken(32);
  const hashedToken = hashToken(token);
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

  return { token, hashedToken, expiresAt };
}

/**
 * Encrypt sensitive data (not used for passwords)
 * Uses AES-256-GCM for authenticated encryption
 */
export function encrypt(text: string, key?: string): string {
  try {
    const encryptionKey = key ? Buffer.from(key, 'hex') : crypto.randomBytes(32);
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, encryptionKey, iv);
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag();
    
    return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
  } catch (error) {
    logger.error({ err: error }, 'Encryption failed');
    throw new Error('Encryption failed');
  }
}

/**
 * Decrypt sensitive data
 */
export function decrypt(encryptedText: string, key?: string): string | null {
  try {
    if (typeof encryptedText !== 'string' || !encryptedText.includes(':')) {
      return encryptedText; // Return original if not encrypted
    }

    const parts = encryptedText.split(':');
    if (parts.length !== 3) {
      return encryptedText; // Invalid format
    }

    const [ivHex, authTagHex, encrypted] = parts;
    const encryptionKey = key ? Buffer.from(key, 'hex') : crypto.randomBytes(32);
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    
    const decipher = crypto.createDecipheriv(ALGORITHM, encryptionKey, iv);
    decipher.setAuthTag(authTag);
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    logger.error({ err: error }, 'Decryption failed');
    return null;
  }
}

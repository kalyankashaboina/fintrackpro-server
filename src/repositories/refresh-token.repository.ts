import { Types } from 'mongoose';
import RefreshToken, { IRefreshToken } from '../models/refresh-token.model.js';
import { DatabaseError } from '../utils/errors.util.js';
import logger from '../config/logger.js';

export class RefreshTokenRepository {
  async create(userId: string | Types.ObjectId, token: string, expiresAt: Date): Promise<IRefreshToken> {
    try {
      const refreshToken = new RefreshToken({
        userId: new Types.ObjectId(userId as string),
        token,
        expiresAt,
      });
      await refreshToken.save();
      return refreshToken;
    } catch (error) {
      logger.error({ err: error, userId }, 'Error creating refresh token');
      throw new DatabaseError('Failed to create refresh token');
    }
  }

  async findByToken(token: string): Promise<IRefreshToken | null> {
    try {
      return await RefreshToken.findOne({ token, isRevoked: false });
    } catch (error) {
      logger.error({ err: error }, 'Error finding refresh token');
      throw new DatabaseError('Failed to find refresh token');
    }
  }

  async revokeToken(token: string): Promise<void> {
    try {
      await RefreshToken.updateOne({ token }, { isRevoked: true });
    } catch (error) {
      logger.error({ err: error }, 'Error revoking token');
      throw new DatabaseError('Failed to revoke token');
    }
  }

  async revokeAllUserTokens(userId: string | Types.ObjectId): Promise<void> {
    try {
      await RefreshToken.updateMany({ userId, isRevoked: false }, { isRevoked: true });
    } catch (error) {
      logger.error({ err: error, userId }, 'Error revoking user tokens');
      throw new DatabaseError('Failed to revoke user tokens');
    }
  }

  async deleteExpiredTokens(): Promise<number> {
    try {
      const result = await RefreshToken.deleteMany({
        expiresAt: { $lt: new Date() },
      });
      return result.deletedCount || 0;
    } catch (error) {
      logger.error({ err: error }, 'Error deleting expired tokens');
      throw new DatabaseError('Failed to delete expired tokens');
    }
  }
}

export default new RefreshTokenRepository();

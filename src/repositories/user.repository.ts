import { Types } from 'mongoose';
import User from '../models/user.model.js';
import { IUser } from '../types/user.types.js';
import { NotFoundError, DatabaseError } from '../utils/errors.util.js';
import logger from '../config/logger.js';

export class UserRepository {
  async findById(id: string | Types.ObjectId): Promise<IUser | null> {
    try {
      return await User.findById(id);
    } catch (error) {
      logger.error({ err: error, userId: id }, 'Error finding user by ID');
      throw new DatabaseError('Failed to find user');
    }
  }

  async findByIdWithPassword(id: string | Types.ObjectId): Promise<IUser | null> {
    try {
      return await User.findById(id).select('+password');
    } catch (error) {
      logger.error({ err: error, userId: id }, 'Error finding user by ID');
      throw new DatabaseError('Failed to find user');
    }
  }

  async findByEmail(email: string): Promise<IUser | null> {
    try {
      return await User.findOne({ email: email.toLowerCase() });
    } catch (error) {
      logger.error({ err: error, email }, 'Error finding user by email');
      throw new DatabaseError('Failed to find user');
    }
  }

  async findByEmailWithPassword(email: string): Promise<IUser | null> {
    try {
      return await User.findOne({ email: email.toLowerCase() }).select('+password');
    } catch (error) {
      logger.error({ err: error, email }, 'Error finding user by email');
      throw new DatabaseError('Failed to find user');
    }
  }

  async findByPasswordResetToken(token: string): Promise<IUser | null> {
    try {
      return await User.findOne({
        passwordResetToken: token,
        passwordResetExpires: { $gt: new Date() },
      }).select('+passwordResetToken +passwordResetExpires');
    } catch (error) {
      logger.error({ err: error }, 'Error finding user by reset token');
      throw new DatabaseError('Failed to find user');
    }
  }

  async findByEmailVerificationToken(token: string): Promise<IUser | null> {
    try {
      return await User.findOne({
        emailVerificationToken: token,
        emailVerificationExpires: { $gt: new Date() },
      }).select('+emailVerificationToken +emailVerificationExpires');
    } catch (error) {
      logger.error({ err: error }, 'Error finding user by verification token');
      throw new DatabaseError('Failed to find user');
    }
  }

  async create(userData: Partial<IUser>): Promise<IUser> {
    try {
      const user = new User(userData);
      await user.save();
      return user;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (error: any) {
      if (error.code === 11000) {
        throw new DatabaseError('Email already exists');
      }
      logger.error({ err: error, userData }, 'Error creating user');
      throw new DatabaseError('Failed to create user');
    }
  }

  async update(id: string | Types.ObjectId, updates: Partial<IUser>): Promise<IUser> {
    try {
      const user = await User.findByIdAndUpdate(
        id,
        { $set: updates },
        { new: true, runValidators: true }
      );

      if (!user) {
        throw new NotFoundError('User');
      }

      return user;
    } catch (error) {
      logger.error({ err: error, userId: id, updates }, 'Error updating user');
      throw new DatabaseError('Failed to update user');
    }
  }

  async delete(id: string | Types.ObjectId): Promise<void> {
    try {
      const result = await User.findByIdAndDelete(id);
      
      if (!result) {
        throw new NotFoundError('User');
      }
    } catch (error) {
      logger.error({ err: error, userId: id }, 'Error deleting user');
      throw new DatabaseError('Failed to delete user');
    }
  }

  async updatePassword(id: string | Types.ObjectId, newPassword: string): Promise<void> {
    try {
      const user = await User.findById(id);
      
      if (!user) {
        throw new NotFoundError('User');
      }

      user.password = newPassword;
      await user.save();
    } catch (error) {
      logger.error({ err: error, userId: id }, 'Error updating password');
      throw new DatabaseError('Failed to update password');
    }
  }

  async setPasswordResetToken(
    id: string | Types.ObjectId,
    token: string,
    expires: Date
  ): Promise<void> {
    try {
      await User.findByIdAndUpdate(id, {
        passwordResetToken: token,
        passwordResetExpires: expires,
      });
    } catch (error) {
      logger.error({ err: error, userId: id }, 'Error setting password reset token');
      throw new DatabaseError('Failed to set password reset token');
    }
  }

  async clearPasswordResetToken(id: string | Types.ObjectId): Promise<void> {
    try {
      await User.findByIdAndUpdate(id, {
        $unset: { passwordResetToken: 1, passwordResetExpires: 1 },
      });
    } catch (error) {
      logger.error({ err: error, userId: id }, 'Error clearing password reset token');
      throw new DatabaseError('Failed to clear password reset token');
    }
  }

  async setEmailVerificationToken(
    id: string | Types.ObjectId,
    token: string,
    expires: Date
  ): Promise<void> {
    try {
      await User.findByIdAndUpdate(id, {
        emailVerificationToken: token,
        emailVerificationExpires: expires,
      });
    } catch (error) {
      logger.error({ err: error, userId: id }, 'Error setting email verification token');
      throw new DatabaseError('Failed to set email verification token');
    }
  }

  async verifyEmail(id: string | Types.ObjectId): Promise<void> {
    try {
      await User.findByIdAndUpdate(id, {
        isEmailVerified: true,
        $unset: { emailVerificationToken: 1, emailVerificationExpires: 1 },
      });
    } catch (error) {
      logger.error({ err: error, userId: id }, 'Error verifying email');
      throw new DatabaseError('Failed to verify email');
    }
  }
}

export default new UserRepository();

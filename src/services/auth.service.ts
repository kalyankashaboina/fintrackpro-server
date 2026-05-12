import userRepository from '../repositories/user.repository.js';
import refreshTokenRepository from '../repositories/refresh-token.repository.js';
import emailService from './email.service.js';
import { generateTokenPair, verifyRefreshToken } from '../utils/jwt.util.js';
import { generatePasswordResetToken, generateEmailVerificationToken, hashToken } from '../utils/crypto.util.js';
import { AuthenticationError, ConflictError, ValidationError } from '../utils/errors.util.js';
import { IRegisterInput, ILoginInput, IUser } from '../types/user.types.js';
import { ITokenPair } from '../types/express.types.js';
import logger from '../config/logger.js';

class AuthService {
  async register(input: IRegisterInput): Promise<{ user: IUser; tokens: ITokenPair }> {
    const existingUser = await userRepository.findByEmail(input.email);
    if (existingUser) {
      throw new ConflictError('Email already registered');
    }

    const user = await userRepository.create({
      name: input.name,
      email: input.email,
      password: input.password,
      isEmailVerified: false,
    });

    const { token, hashedToken, expiresAt } = generateEmailVerificationToken();
    await userRepository.setEmailVerificationToken(user._id, hashedToken, expiresAt);

    await emailService.sendVerificationEmail(user.email, user.name, token);

    const tokens = generateTokenPair(user._id.toString(), user.email);
    
    const refreshTokenExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await refreshTokenRepository.create(user._id, tokens.refreshToken, refreshTokenExpiry);

    logger.info({ userId: user._id }, 'User registered successfully');

    return { user, tokens };
  }

  async login(input: ILoginInput): Promise<{ user: IUser; tokens: ITokenPair }> {
    const user = await userRepository.findByEmailWithPassword(input.email);
    if (!user) {
      throw new AuthenticationError('Invalid email or password');
    }

    const isPasswordValid = await user.comparePassword(input.password);
    if (!isPasswordValid) {
      throw new AuthenticationError('Invalid email or password');
    }

    const tokens = generateTokenPair(user._id.toString(), user.email);
    
    const refreshTokenExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await refreshTokenRepository.create(user._id, tokens.refreshToken, refreshTokenExpiry);

    logger.info({ userId: user._id }, 'User logged in successfully');

    return { user, tokens };
  }

  async refreshToken(oldRefreshToken: string): Promise<ITokenPair> {
    const decoded = verifyRefreshToken(oldRefreshToken);

    const storedToken = await refreshTokenRepository.findByToken(oldRefreshToken);
    if (!storedToken) {
      throw new AuthenticationError('Invalid refresh token');
    }

    const user = await userRepository.findById(decoded.userId);
    if (!user) {
      throw new AuthenticationError('User not found');
    }

    await refreshTokenRepository.revokeToken(oldRefreshToken);

    const tokens = generateTokenPair(user._id.toString(), user.email);
    
    const refreshTokenExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await refreshTokenRepository.create(user._id, tokens.refreshToken, refreshTokenExpiry);

    logger.info({ userId: user._id }, 'Token refreshed successfully');

    return tokens;
  }

  async logout(refreshToken: string): Promise<void> {
    try {
      await refreshTokenRepository.revokeToken(refreshToken);
      logger.info('User logged out successfully');
    } catch (error) {
      logger.warn({ err: error }, 'Logout error');
    }
  }

  async forgotPassword(email: string): Promise<void> {
    const user = await userRepository.findByEmail(email);
    if (!user) {
      return;
    }

    const { token, hashedToken, expiresAt } = generatePasswordResetToken();
    await userRepository.setPasswordResetToken(user._id, hashedToken, expiresAt);

    await emailService.sendPasswordResetEmail(user.email, user.name, token);

    logger.info({ userId: user._id }, 'Password reset email sent');
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    const hashedToken = hashToken(token);
    const user = await userRepository.findByPasswordResetToken(hashedToken);

    if (!user) {
      throw new ValidationError('Invalid or expired reset token');
    }

    await userRepository.updatePassword(user._id, newPassword);
    await userRepository.clearPasswordResetToken(user._id);

    logger.info({ userId: user._id }, 'Password reset successfully');
  }

  async verifyEmail(token: string): Promise<void> {
    const hashedToken = hashToken(token);
    const user = await userRepository.findByEmailVerificationToken(hashedToken);

    if (!user) {
      throw new ValidationError('Invalid or expired verification token');
    }

    await userRepository.verifyEmail(user._id);
    await emailService.sendWelcomeEmail(user.email, user.name);

    logger.info({ userId: user._id }, 'Email verified successfully');
  }
}

export default new AuthService();

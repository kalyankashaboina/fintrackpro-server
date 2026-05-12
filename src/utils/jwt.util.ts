import jwt from 'jsonwebtoken';
import { Response } from 'express';
import { env } from '../config/env.js';
import { ITokenPayload, ITokenPair } from '../types/express.types.js';
import { AuthenticationError } from './errors.util.js';

export function generateAccessToken(userId: string, email: string): string {
  const payload: ITokenPayload = { userId, email };
  
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN,
  } as jwt.SignOptions);
}

export function generateRefreshToken(userId: string, email: string): string {
  const payload: ITokenPayload = { userId, email };
  
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRES_IN,
  } as jwt.SignOptions);
}

export function generateTokenPair(userId: string, email: string): ITokenPair {
  const accessToken = generateAccessToken(userId, email);
  const refreshToken = generateRefreshToken(userId, email);
  
  return { accessToken, refreshToken };
}

export function verifyAccessToken(token: string): ITokenPayload {
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as ITokenPayload;
    return decoded;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new AuthenticationError('Access token has expired');
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw new AuthenticationError('Invalid access token');
    }
    throw new AuthenticationError('Token verification failed');
  }
}

export function verifyRefreshToken(token: string): ITokenPayload {
  try {
    const decoded = jwt.verify(token, env.JWT_REFRESH_SECRET) as ITokenPayload;
    return decoded;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new AuthenticationError('Refresh token has expired');
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw new AuthenticationError('Invalid refresh token');
    }
    throw new AuthenticationError('Token verification failed');
  }
}

export function setRefreshTokenCookie(res: Response, token: string): void {
  res.cookie('refreshToken', token, {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: '/',
  });
}

export function clearRefreshTokenCookie(res: Response): void {
  res.cookie('refreshToken', '', {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 0,
    path: '/',
  });
}

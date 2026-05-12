import { Request } from 'express';
import { IUser } from './user.types.js';

export interface IAuthRequest extends Request {
  user?: IUser;
  userId?: string;
}

export interface ITokenPayload {
  userId: string;
  email: string;
  iat?: number;
  exp?: number;
}

export interface IRefreshTokenPayload {
  userId: string;
  tokenId: string;
  iat?: number;
  exp?: number;
}

export interface ITokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface IApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T | null;
  error?: {
    code: string;
    message: string;
    details?: Record<string, unknown>[] | Record<string, unknown>;
  };
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
}

export interface IEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

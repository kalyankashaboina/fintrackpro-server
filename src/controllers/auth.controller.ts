import { Response } from 'express';
import authService from '../services/auth.service.js';
import { IAuthRequest } from '../types/express.types.js';
import { successResponse } from '../utils/response.util.js';
import { asyncHandler } from '../utils/async-handler.util.js';
import { setRefreshTokenCookie, clearRefreshTokenCookie } from '../utils/jwt.util.js';
import userRepository from '../repositories/user.repository.js';
import uploadService from '../services/upload.service.js';

export const register = asyncHandler(async (req: IAuthRequest, res: Response) => {
  const { user, tokens } = await authService.register(req.body);
  setRefreshTokenCookie(res, tokens.refreshToken);
  successResponse(res, { user, accessToken: tokens.accessToken }, 'Registration successful', 201);
});

export const login = asyncHandler(async (req: IAuthRequest, res: Response) => {
  const { user, tokens } = await authService.login(req.body);
  setRefreshTokenCookie(res, tokens.refreshToken);
  successResponse(res, { user, accessToken: tokens.accessToken }, 'Login successful');
});

export const refreshToken = asyncHandler(async (req: IAuthRequest, res: Response) => {
  const tokens = await authService.refreshToken(req.cookies.refreshToken);
  setRefreshTokenCookie(res, tokens.refreshToken);
  successResponse(res, { accessToken: tokens.accessToken }, 'Token refreshed');
});

export const logout = asyncHandler(async (req: IAuthRequest, res: Response) => {
  const refreshToken = req.cookies.refreshToken;
  if (refreshToken) await authService.logout(refreshToken);
  clearRefreshTokenCookie(res);
  successResponse(res, null, 'Logout successful');
});

export const forgotPassword = asyncHandler(async (req: IAuthRequest, res: Response) => {
  await authService.forgotPassword(req.body.email);
  successResponse(res, null, 'Password reset email sent');
});

export const resetPassword = asyncHandler(async (req: IAuthRequest, res: Response) => {
  await authService.resetPassword(req.body.token, req.body.password);
  successResponse(res, null, 'Password reset successful');
});

export const verifyEmail = asyncHandler(async (req: IAuthRequest, res: Response) => {
  await authService.verifyEmail(req.body.token);
  successResponse(res, null, 'Email verified successfully');
});

export const getProfile = asyncHandler(async (req: IAuthRequest, res: Response) => {
  successResponse(res, req.user, 'Profile fetched successfully');
});

export const updateProfile = asyncHandler(async (req: IAuthRequest, res: Response) => {
  const { name, email } = req.body as { name?: string; email?: string };
  const updates: { name?: string; email?: string; profileImage?: string } = {};

  if (name) updates.name = name;
  if (email) updates.email = email;

  if (req.file) {
    const imageUrl = await uploadService.uploadImage(req.file, 'fintrackpro/profiles');
    updates.profileImage = imageUrl;
  }

  const updated = await userRepository.update(req.userId!, updates);
  successResponse(res, updated, 'Profile updated successfully');
});

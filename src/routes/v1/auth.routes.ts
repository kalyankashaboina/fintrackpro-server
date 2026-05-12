import { Router } from 'express';
import * as authController from '../../controllers/auth.controller.js';
import { authenticate } from '../../middlewares/auth.middleware.js';
import { validate } from '../../middlewares/validation.middleware.js';
import { authLimiter, passwordResetLimiter } from '../../middlewares/rate-limit.middleware.js';
import { registerSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema, verifyEmailSchema } from '../../validators/auth.validator.js';
import { uploadProfileImage } from '../../middlewares/upload.middleware.js';

const router = Router();

router.post('/register', authLimiter, validate(registerSchema), authController.register);
router.post('/login', authLimiter, validate(loginSchema), authController.login);
router.post('/refresh', authController.refreshToken);
router.post('/logout', authController.logout);
router.post('/forgot-password', passwordResetLimiter, validate(forgotPasswordSchema), authController.forgotPassword);
router.post('/reset-password', validate(resetPasswordSchema), authController.resetPassword);
router.post('/verify-email', validate(verifyEmailSchema), authController.verifyEmail);
router.get('/profile', authenticate, authController.getProfile);
router.put('/profile', authenticate, uploadProfileImage, authController.updateProfile);

export default router;

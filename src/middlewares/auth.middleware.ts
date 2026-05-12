import { Response, NextFunction } from 'express';
import { IAuthRequest } from '../types/express.types.js';
import { verifyAccessToken } from '../utils/jwt.util.js';
import { AuthenticationError } from '../utils/errors.util.js';
import User from '../models/user.model.js';
import logger from '../config/logger.js';

export async function authenticate(
  req: IAuthRequest,
  _res: Response,
  next: NextFunction
): Promise<void> {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AuthenticationError('No token provided');
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify token
    const decoded = verifyAccessToken(token);

    // Get user from database
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      throw new AuthenticationError('User not found');
    }

    // Attach user to request
    req.user = user;
    req.userId = user._id.toString();

    logger.debug({ userId: user._id }, 'User authenticated');
    
    next();
  } catch (error) {
    logger.warn({ err: error, path: req.path }, 'Authentication failed');
    next(error);
  }
}

export function optionalAuthenticate(
  req: IAuthRequest,
  res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }

  // Try to authenticate, but don't fail if token is invalid
  authenticate(req, res, (error) => {
    if (error) {
      // Continue without authentication
      return next();
    }
    next();
  });
}

export default authenticate;

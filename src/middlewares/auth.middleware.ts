import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';
import { UnauthorizedError } from '../utils/errors';

export interface AuthRequest extends Request {
  userId?: string;
  userEmail?: string;
}

export const authenticate = (
  req: AuthRequest,
  _res: Response,
  next: NextFunction
) => {
  try {
    // Get token from cookies
    const token = req.cookies?.token;

    if (!token) {
      throw new UnauthorizedError('No token provided');
    }

    // Verify token
    const payload = verifyToken(token);

    // Attach user info to request
    req.userId = payload.userId;
    req.userEmail = payload.email;

    next();
  } catch (error) {
    if (error instanceof Error && error.message.includes('token')) {
      throw new UnauthorizedError(error.message);
    }
    next(error);
  }
};


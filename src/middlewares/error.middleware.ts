import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors';
import env from '../config/env';

export const errorHandler = (
  err: Error | AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      error: {
        message: err.message,
        ...(env.NODE_ENV === 'development' && { stack: err.stack }),
      },
    });
  }

  // Handle Prisma errors
  if (err.name === 'PrismaClientKnownRequestError') {
    // Handle unique constraint violations
    if ((err as any).code === 'P2002') {
      return res.status(409).json({
        success: false,
        error: {
          message: 'A record with this value already exists',
        },
      });
    }
    // Handle record not found
    if ((err as any).code === 'P2025') {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Resource not found',
        },
      });
    }
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      error: {
        message: 'Invalid or expired token',
      },
    });
  }

  // Default error
  console.error('Unhandled error:', err);
  return res.status(500).json({
    success: false,
    error: {
      message: env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
      ...(env.NODE_ENV === 'development' && { stack: err.stack }),
    },
  });
};


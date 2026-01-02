import { Router } from 'express';
import authController from '../controllers/auth.controller';
import { validate } from '../middlewares/validation.middleware';
import { z } from 'zod';
import rateLimit from 'express-rate-limit';

const router = Router();

// Rate limiting for auth endpoints
const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'development' ? 100 : 5, // Higher limit for development
  message: 'Too many authentication attempts, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Validation schemas
const registerSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email format'),
    username: z.string().min(3, 'Username must be at least 3 characters').max(30, 'Username must be less than 30 characters'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
  }),
});

const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email format'),
    password: z.string().min(1, 'Password is required'),
  }),
});

router.post(
  '/register',
  authRateLimiter,
  validate(registerSchema),
  authController.register.bind(authController)
);

router.post(
  '/login',
  authRateLimiter,
  validate(loginSchema),
  authController.login.bind(authController)
);

router.post('/logout', authController.logout.bind(authController));

export default router;


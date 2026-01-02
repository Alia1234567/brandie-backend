import { Router } from 'express';
import userController from '../controllers/user.controller';
import { validate } from '../middlewares/validation.middleware';
import { z } from 'zod';

const router = Router();

// Validation schemas
const searchByUsernameSchema = z.object({
  query: z.object({
    username: z.string().min(1, 'Username is required'),
  }),
});

const searchByEmailSchema = z.object({
  query: z.object({
    email: z.string().email('Invalid email format'),
  }),
});

// Public routes for user search
router.get(
  '/search/username',
  validate(searchByUsernameSchema),
  userController.searchByUsername.bind(userController)
);

router.get(
  '/search/email',
  validate(searchByEmailSchema),
  userController.searchByEmail.bind(userController)
);

export default router;


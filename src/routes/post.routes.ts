import { Router } from 'express';
import postController from '../controllers/post.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validation.middleware';
import { z } from 'zod';

const router = Router();

// Validation schemas
const createPostSchema = z.object({
  body: z.object({
    content: z.string().min(1, 'Content cannot be empty').max(5000, 'Content cannot exceed 5000 characters'),
    mediaUrl: z.string().url('Invalid media URL').optional(),
  }),
});

const userIdParamSchema = z.object({
  params: z.object({
    userId: z.string().uuid('Invalid user ID format'),
  }),
  query: z.object({
    page: z.string().optional().transform((val) => (val ? parseInt(val) : undefined)),
    limit: z.string().optional().transform((val) => (val ? parseInt(val) : undefined)),
  }),
});

// Create post requires authentication
router.post(
  '/',
  authenticate,
  validate(createPostSchema),
  postController.createPost.bind(postController)
);

// Get posts by user (public endpoint, but can be used by authenticated users)
router.get(
  '/:userId',
  validate(userIdParamSchema),
  postController.getPostsByUser.bind(postController)
);

export default router;


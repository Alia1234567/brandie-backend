import { Router } from 'express';
import followController from '../controllers/follow.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validation.middleware';
import { z } from 'zod';

const router = Router();

// Validation schema
const userIdParamSchema = z.object({
  params: z.object({
    userId: z.string().uuid('Invalid user ID format'),
  }),
});

// All follow routes require authentication
router.use(authenticate);

router.post(
  '/:userId',
  validate(userIdParamSchema),
  followController.follow.bind(followController)
);

router.delete(
  '/:userId',
  validate(userIdParamSchema),
  followController.unfollow.bind(followController)
);

router.get(
  '/followers/:userId',
  validate(userIdParamSchema),
  followController.getFollowers.bind(followController)
);

router.get(
  '/following/:userId',
  validate(userIdParamSchema),
  followController.getFollowing.bind(followController)
);

export default router;



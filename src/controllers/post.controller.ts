import { Response, NextFunction } from 'express';
import postService from '../services/post.service';
import { AuthRequest } from '../middlewares/auth.middleware';

export class PostController {
  async createPost(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.userId!;
      const { content, mediaUrl } = req.body;

      const post = await postService.createPost(userId, content, mediaUrl);

      res.status(201).json({
        success: true,
        data: post,
      });
    } catch (error) {
      next(error);
    }
  }

  async getPostsByUser(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.params.userId;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const result = await postService.getPostsByUser(userId, page, limit);

      res.status(200).json({
        success: true,
        data: result.posts,
        pagination: {
          page,
          limit,
          total: result.total,
          totalPages: Math.ceil(result.total / limit),
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async getFeed(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.userId!;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const result = await postService.getFeed(userId, page, limit);

      res.status(200).json({
        success: true,
        data: result.posts,
        pagination: {
          page,
          limit,
          total: result.total,
          totalPages: Math.ceil(result.total / limit),
        },
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new PostController();



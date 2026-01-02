import { Response, NextFunction } from 'express';
import followService from '../services/follow.service';
import { AuthRequest } from '../middlewares/auth.middleware';

export class FollowController {
  async follow(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const followerId = req.userId!;
      const followingId = req.params.userId;

      const result = await followService.follow(followerId, followingId);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async unfollow(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const followerId = req.userId!;
      const followingId = req.params.userId;

      const result = await followService.unfollow(followerId, followingId);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async getFollowers(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.params.userId;

      const followers = await followService.getFollowers(userId);

      res.status(200).json({
        success: true,
        data: followers,
      });
    } catch (error) {
      next(error);
    }
  }

  async getFollowing(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.params.userId;

      const following = await followService.getFollowing(userId);

      res.status(200).json({
        success: true,
        data: following,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new FollowController();



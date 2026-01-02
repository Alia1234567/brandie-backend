import { Response, NextFunction } from 'express';
import userRepository from '../repositories/user.repository';
import { NotFoundError } from '../utils/errors';
import { Request } from 'express';

export class UserController {
  async searchByUsername(req: Request, res: Response, next: NextFunction) {
    try {
      const { username } = req.query;

      if (!username || typeof username !== 'string') {
        return res.status(400).json({
          success: false,
          error: { message: 'Username is required' },
        });
      }

      const user = await userRepository.findByUsername(username);

      if (!user) {
        throw new NotFoundError('User not found');
      }

      // Return user without password hash
      return res.status(200).json({
        success: true,
        data: {
          id: user.id,
          email: user.email,
          username: user.username,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
      });
    } catch (error) {
      return next(error);
    }
  }

  async searchByEmail(req: Request, res: Response, next: NextFunction) {
    try {
      const { email } = req.query;

      if (!email || typeof email !== 'string') {
        return res.status(400).json({
          success: false,
          error: { message: 'Email is required' },
        });
      }

      const user = await userRepository.findByEmail(email);

      if (!user) {
        throw new NotFoundError('User not found');
      }

      // Return user without password hash
      return res.status(200).json({
        success: true,
        data: {
          id: user.id,
          email: user.email,
          username: user.username,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
      });
    } catch (error) {
      return next(error);
    }
  }
}

export default new UserController();


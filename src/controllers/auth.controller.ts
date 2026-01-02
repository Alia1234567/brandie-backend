import { Request, Response, NextFunction } from 'express';
import authService from '../services/auth.service';
import { getCookieOptions } from '../utils/jwt';

export class AuthController {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, username, password } = req.body;

      const result = await authService.register(email, username, password);

      // Set JWT in HttpOnly cookie
      res.cookie('token', result.token, getCookieOptions());

      res.status(201).json({
        success: true,
        data: {
          user: result.user,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;

      const result = await authService.login(email, password);

      // Set JWT in HttpOnly cookie
      res.cookie('token', result.token, getCookieOptions());

      res.status(200).json({
        success: true,
        data: {
          user: result.user,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async logout(req: Request, res: Response, next: NextFunction) {
    try {
      res.clearCookie('token', {
        httpOnly: true,
        secure: req.secure,
        sameSite: 'lax',
        path: '/',
      });

      res.status(200).json({
        success: true,
        message: 'Logged out successfully',
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new AuthController();


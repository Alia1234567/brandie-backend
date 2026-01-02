import userRepository from '../repositories/user.repository';
import { hashPassword, comparePassword } from '../utils/password';
import { signToken } from '../utils/jwt';
import { ConflictError, UnauthorizedError, ValidationError } from '../utils/errors';

export class AuthService {
  async register(email: string, username: string, password: string) {
    // Validate password strength
    if (password.length < 6) {
      throw new ValidationError('Password must be at least 6 characters long');
    }

    // Check if email already exists
    const existingUserByEmail = await userRepository.findByEmail(email);
    if (existingUserByEmail) {
      throw new ConflictError('Email already registered');
    }

    // Check if username already exists
    const existingUserByUsername = await userRepository.findByUsername(username);
    if (existingUserByUsername) {
      throw new ConflictError('Username already taken');
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user
    const user = await userRepository.create({
      email,
      username,
      passwordHash,
    });

    // Generate JWT
    const token = signToken({
      userId: user.id,
      email: user.email,
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
      },
      token,
    };
  }

  async login(email: string, password: string) {
    // Find user by email
    const user = await userRepository.findByEmail(email);
    if (!user) {
      throw new UnauthorizedError('Invalid email or password');
    }

    // Verify password
    const isPasswordValid = await comparePassword(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedError('Invalid email or password');
    }

    // Generate JWT
    const token = signToken({
      userId: user.id,
      email: user.email,
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
      },
      token,
    };
  }
}

export default new AuthService();



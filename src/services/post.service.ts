import postRepository from '../repositories/post.repository';
import { ValidationError } from '../utils/errors';

export class PostService {
  async createPost(userId: string, content: string, mediaUrl?: string) {
    // Validate content
    if (!content || content.trim().length === 0) {
      throw new ValidationError('Post content cannot be empty');
    }

    if (content.length > 5000) {
      throw new ValidationError('Post content cannot exceed 5000 characters');
    }

    // Validate media URL if provided
    if (mediaUrl) {
      try {
        new URL(mediaUrl);
      } catch {
        throw new ValidationError('Invalid media URL format');
      }
    }

    return postRepository.create(userId, content, mediaUrl);
  }

  async getPostsByUser(userId: string, page: number = 1, limit: number = 10) {
    // Validate pagination params
    if (page < 1) {
      throw new ValidationError('Page must be greater than 0');
    }
    if (limit < 1 || limit > 100) {
      throw new ValidationError('Limit must be between 1 and 100');
    }

    return postRepository.findByUserId(userId, page, limit);
  }

  async getFeed(userId: string, page: number = 1, limit: number = 10) {
    // Validate pagination params
    if (page < 1) {
      throw new ValidationError('Page must be greater than 0');
    }
    if (limit < 1 || limit > 100) {
      throw new ValidationError('Limit must be between 1 and 100');
    }

    return postRepository.getFeed(userId, page, limit);
  }
}

export default new PostService();


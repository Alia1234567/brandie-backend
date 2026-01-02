import followRepository from '../repositories/follow.repository';
import userRepository from '../repositories/user.repository';
import { ConflictError, NotFoundError, ValidationError } from '../utils/errors';

export class FollowService {
  async follow(followerId: string, followingId: string) {
    // Prevent self-follow
    if (followerId === followingId) {
      throw new ValidationError('Cannot follow yourself');
    }

    // Check if target user exists
    const targetUser = await userRepository.findById(followingId);
    if (!targetUser) {
      throw new NotFoundError('User not found');
    }

    // Check if already following
    const existingFollow = await followRepository.find(followerId, followingId);
    if (existingFollow) {
      throw new ConflictError('Already following this user');
    }

    // Create follow relationship
    await followRepository.create(followerId, followingId);

    return { message: 'Successfully followed user' };
  }

  async unfollow(followerId: string, followingId: string) {
    // Check if follow relationship exists
    const existingFollow = await followRepository.find(followerId, followingId);
    if (!existingFollow) {
      throw new NotFoundError('You are not following this user');
    }

    // Delete follow relationship
    await followRepository.delete(followerId, followingId);

    return { message: 'Successfully unfollowed user' };
  }

  async getFollowers(userId: string) {
    // Check if user exists
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    return followRepository.getFollowers(userId);
  }

  async getFollowing(userId: string) {
    // Check if user exists
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    return followRepository.getFollowing(userId);
  }
}

export default new FollowService();



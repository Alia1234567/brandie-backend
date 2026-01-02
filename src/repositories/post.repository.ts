import prisma from '../config/database';
import { Post, PostMedia } from '@prisma/client';

export interface PostWithMedia extends Post {
  media: PostMedia[];
  user: {
    id: string;
    username: string;
    email: string;
  };
}

export class PostRepository {
  async create(userId: string, content: string, mediaUrl?: string): Promise<PostWithMedia> {
    const post = await prisma.post.create({
      data: {
        userId,
        content,
        ...(mediaUrl && {
          media: {
            create: {
              mediaUrl,
            },
          },
        }),
      },
      include: {
        media: true,
        user: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
      },
    });

    return post as PostWithMedia;
  }

  async findByUserId(
    userId: string,
    page: number = 1,
    limit: number = 10
  ): Promise<{ posts: PostWithMedia[]; total: number }> {
    const skip = (page - 1) * limit;

    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where: { userId },
        include: {
          media: true,
          user: {
            select: {
              id: true,
              username: true,
              email: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.post.count({
        where: { userId },
      }),
    ]);

    return {
      posts: posts as PostWithMedia[],
      total,
    };
  }

  async getFeed(
    userId: string,
    page: number = 1,
    limit: number = 10
  ): Promise<{ posts: PostWithMedia[]; total: number }> {
    const skip = (page - 1) * limit;

    // Get IDs of users that the current user follows
    const follows = await prisma.follow.findMany({
      where: { followerId: userId },
      select: { followingId: true },
    });

    const followingIds = follows.map((f) => f.followingId);

    // Include user's own posts + posts from users they follow
    const userIds = [userId, ...followingIds];

    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where: {
          userId: {
            in: userIds,
          },
        },
        include: {
          media: true,
          user: {
            select: {
              id: true,
              username: true,
              email: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.post.count({
        where: {
          userId: {
            in: userIds,
          },
        },
      }),
    ]);

    return {
      posts: posts as PostWithMedia[],
      total,
    };
  }

  async findById(postId: string): Promise<PostWithMedia | null> {
    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: {
        media: true,
        user: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
      },
    });

    return post as PostWithMedia | null;
  }
}

export default new PostRepository();



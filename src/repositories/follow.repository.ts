import prisma from '../config/database';

type Follow = {
    followerId: string;
    followingId: string;
    createdAt: Date;
};

type User = {
    id: string;
    email: string;
    username: string;
    createdAt: Date;
    updatedAt: Date;
};

export class FollowRepository {
    async create(followerId: string, followingId: string): Promise<Follow> {
        return prisma.follow.create({
            data: {
                followerId,
                followingId,
            },
        });
    }

    async delete(followerId: string, followingId: string): Promise<void> {
        await prisma.follow.delete({
            where: {
                followerId_followingId: {
                    followerId,
                    followingId,
                },
            },
        });
    }

    async find(followerId: string, followingId: string): Promise<Follow | null> {
        return prisma.follow.findUnique({
            where: {
                followerId_followingId: {
                    followerId,
                    followingId,
                },
            },
        });
    }

    async getFollowers(userId: string): Promise<User[]> {
        const follows = await prisma.follow.findMany({
            where: {followingId: userId},
            include: {
                follower: {
                    select: {
                        id: true,
                        email: true,
                        username: true,
                        createdAt: true,
                        updatedAt: true,
                    },
                },
            },
            orderBy: {createdAt: 'desc'},
        });

        return follows.map((follow: {follower: User}) => follow.follower);
    }

    async getFollowing(userId: string): Promise<User[]> {
        const follows = await prisma.follow.findMany({
            where: {followerId: userId},
            include: {
                following: {
                    select: {
                        id: true,
                        email: true,
                        username: true,
                        createdAt: true,
                        updatedAt: true,
                    },
                },
            },
            orderBy: {createdAt: 'desc'},
        });

        return follows.map((follow: {following: User}) => follow.following);
    }
}

export default new FollowRepository();


import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import {z} from 'zod';
import env from './config/env';
import {errorHandler} from './middlewares/error.middleware';
import {authenticate} from './middlewares/auth.middleware';
import {validate} from './middlewares/validation.middleware';

// Routes
import authRoutes from './routes/auth.routes';
import followRoutes from './routes/follow.routes';
import postRoutes from './routes/post.routes';
import userRoutes from './routes/user.routes';
import postController from './controllers/post.controller';

const app = express();

// Middleware
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || '*', // Allow all origins for backend API
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
  })
);
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cookieParser());

// Root endpoint - API information
app.get('/', (_req, res) => {
  res.status(200).json({
    success: true,
    message: 'Social Media Backend API',
    version: '1.0.0',
    endpoints: {
      health: 'GET /health',
      auth: {
        register: 'POST /auth/register',
        login: 'POST /auth/login',
        logout: 'POST /auth/logout',
      },
      users: {
        searchByUsername: 'GET /users/search/username?username=xxx',
        searchByEmail: 'GET /users/search/email?email=xxx',
      },
      follow: {
        follow: 'POST /follow/:userId',
        unfollow: 'DELETE /follow/:userId',
        getFollowers: 'GET /follow/followers/:userId',
        getFollowing: 'GET /follow/following/:userId',
      },
      posts: {
        create: 'POST /posts',
        getByUser: 'GET /posts/:userId?page=1&limit=10',
        getFeed: 'GET /feed?page=1&limit=10',
      },
    },
    documentation: 'See README.md for detailed API documentation',
  });
});

// Health check endpoint
app.get('/health', (_req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is healthy',
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/follow', followRoutes);
app.use('/posts', postRoutes);

// Feed route (must be before 404 handler)
const feedQuerySchema = z.object({
  query: z.object({
    page: z.string().optional().transform((val) => (val ? parseInt(val) : undefined)),
    limit: z.string().optional().transform((val) => (val ? parseInt(val) : undefined)),
  }),
});

app.get(
  '/feed',
  authenticate,
  validate(feedQuerySchema),
  postController.getFeed.bind(postController)
);

// 404 handler
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    error: {
      message: 'Route not found',
    },
  });
});

// Error handling middleware (must be last)
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📝 Environment: ${env.NODE_ENV}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
});

export default app;


# Social Media Backend

A production-ready social media backend built with Node.js, TypeScript, Express, and PostgreSQL. This backend demonstrates clean architecture, secure authentication, and scalable data modeling.

## Features

- **Authentication**: User registration and login with JWT stored in HttpOnly cookies
- **Follow System**: Follow/unfollow users with proper validation
- **Posts**: Create posts with text and optional media URLs
- **Feed**: Personalized timeline showing user's posts and posts from followed users
- **Security**: Password hashing, SQL injection protection, rate limiting

## Tech Stack

- **Runtime**: Node.js 18+
- **Language**: TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL 15
- **ORM**: Prisma
- **Validation**: Zod
- **Authentication**: JWT with HttpOnly cookies
- **Password Hashing**: bcrypt

## Project Structure

```
src/
├── controllers/     # Request handlers
├── routes/          # Route definitions
├── services/        # Business logic
├── repositories/    # Data access layer (Prisma)
├── middlewares/     # Auth, validation, error handling
├── utils/           # Helpers (JWT, bcrypt, etc.)
├── config/          # Configuration (DB, env)
├── types/           # TypeScript types
└── index.ts         # Application entry point
```

## Database Schema

### Users
- `id` (UUID, Primary Key)
- `email` (String, Unique, Indexed)
- `username` (String, Unique, Indexed)
- `password_hash` (String)
- `created_at` (DateTime)
- `updated_at` (DateTime)

### Follows
- `follower_id` (UUID, Foreign Key → users.id)
- `following_id` (UUID, Foreign Key → users.id)
- `created_at` (DateTime)
- **Unique Constraint**: (follower_id, following_id)
- **Indexes**: follower_id, following_id

### Posts
- `id` (UUID, Primary Key)
- `user_id` (UUID, Foreign Key → users.id, Indexed)
- `content` (String)
- `created_at` (DateTime, Indexed)
- `updated_at` (DateTime)

### Post Media
- `id` (UUID, Primary Key)
- `post_id` (UUID, Foreign Key → posts.id, Indexed)
- `media_url` (String)
- `created_at` (DateTime)

## Setup Instructions

### Prerequisites

- Node.js 18+ installed
- PostgreSQL 15 installed
- npm or yarn

### Local Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd social-media-backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and update:
   - `DATABASE_URL`: Your PostgreSQL connection string
   - `JWT_SECRET`: A strong secret key (at least 32 characters)

4. **Set up the database**
   ```bash
   # Generate Prisma Client
   npm run prisma:generate
   
   # Run migrations
   npm run prisma:migrate
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

   The server will start on `http://localhost:3000`

## API Documentation

### Base URL
```
http://localhost:3000
```

### Authentication Endpoints

#### Register
```http
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "username": "johndoe",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "username": "johndoe"
    }
  }
}
```

**Note:** JWT token is automatically set in HttpOnly cookie.

#### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "username": "johndoe"
    }
  }
}
```

#### Logout
```http
POST /auth/logout
```

**Response:**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

### Follow Endpoints

All follow endpoints require authentication (JWT cookie).

#### Follow User
```http
POST /follow/:userId
```

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "Successfully followed user"
  }
}
```

**Errors:**
- `400`: Cannot follow yourself
- `404`: User not found
- `409`: Already following this user

#### Unfollow User
```http
DELETE /follow/:userId
```

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "Successfully unfollowed user"
  }
}
```

**Errors:**
- `404`: You are not following this user

#### Get Followers
```http
GET /follow/followers/:userId
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "email": "follower@example.com",
      "username": "follower",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

#### Get Following
```http
GET /follow/following/:userId
```

**Response:** Same format as Get Followers

### Post Endpoints

#### Create Post
```http
POST /posts
Content-Type: application/json
Cookie: token=<jwt-token>

{
  "content": "This is my first post!",
  "mediaUrl": "https://example.com/image.jpg" // optional
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "userId": "uuid",
    "content": "This is my first post!",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z",
    "media": [
      {
        "id": "uuid",
        "postId": "uuid",
        "mediaUrl": "https://example.com/image.jpg",
        "createdAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "user": {
      "id": "uuid",
      "username": "johndoe",
      "email": "user@example.com"
    }
  }
}
```

#### Get Posts by User
```http
GET /posts/:userId?page=1&limit=10
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10, max: 100)

**Response:**
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 50,
    "totalPages": 5
  }
}
```

#### Get Feed
```http
GET /feed?page=1&limit=10
Cookie: token=<jwt-token>
```

**Response:** Same format as Get Posts by User

**Feed Logic:**
- Includes user's own posts
- Includes posts from users they follow
- Sorted by newest first (created_at DESC)
- Supports pagination

### Health Check

```http
GET /health
```

**Response:**
```json
{
  "success": true,
  "message": "Server is healthy",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## Design Decisions

### Architecture

1. **Layered Architecture**: Clear separation between controllers, services, and repositories enables testability and maintainability.

2. **Repository Pattern**: Abstracts data access logic, making it easy to swap implementations or add caching layers.

3. **Service Layer**: Contains business logic and validation, keeping controllers thin.

### Database Design

1. **Composite Unique Constraint on Follows**: Prevents duplicate follow relationships at the database level.

2. **Separate Post Media Table**: Allows multiple media items per post (extensible for future features).

3. **Indexes**: Strategic indexes on foreign keys and `created_at` optimize feed queries and lookups.

4. **Cascade Deletes**: When a user is deleted, their posts and follow relationships are automatically cleaned up.

### Security

1. **HttpOnly Cookies**: JWT tokens stored in HttpOnly cookies prevent XSS attacks.

2. **Password Hashing**: bcrypt with 10 salt rounds provides strong password protection.

3. **Input Validation**: Zod schemas validate all inputs at API boundaries.

4. **Rate Limiting**: Auth endpoints are rate-limited to prevent brute force attacks.

5. **SQL Injection Protection**: Prisma ORM uses parameterized queries, preventing SQL injection.

### Trade-offs

1. **Offset Pagination**: Used instead of cursor-based pagination for simplicity. Cursor-based would be better for very large datasets.

2. **Feed Query**: Current implementation fetches all followed user IDs first, then queries posts. For users with many follows, this could be optimized with a single JOIN query.

3. **Media Storage**: Media URLs are stored as strings. In production, consider using object storage (S3, Cloudinary) with proper URL validation.

4. **Error Messages**: Some error messages are generic for security (e.g., "Invalid email or password" instead of specifying which is wrong).

## Security Considerations

- ✅ Password hashing with bcrypt (10 salt rounds)
- ✅ JWT tokens with expiration (7 days default)
- ✅ HttpOnly, Secure, SameSite cookies
- ✅ Environment variables for secrets
- ✅ Input validation on all endpoints
- ✅ SQL injection protection (Prisma)
- ✅ Rate limiting on auth endpoints (5 requests per 15 minutes)
- ✅ Protected routes require valid JWT
- ✅ CORS configuration
- ✅ Error handling without exposing sensitive information

## Testing Checklist

### Authentication Flows

- [ ] Register with valid data
- [ ] Register with duplicate email (should fail)
- [ ] Register with duplicate username (should fail)
- [ ] Register with invalid email format (should fail)
- [ ] Register with short password (should fail)
- [ ] Login with correct credentials
- [ ] Login with incorrect email (should fail)
- [ ] Login with incorrect password (should fail)
- [ ] Access protected route without token (should fail)
- [ ] Access protected route with invalid token (should fail)
- [ ] Access protected route with expired token (should fail)
- [ ] Logout clears cookie

### Follow System

- [ ] Follow valid user (authenticated)
- [ ] Follow self (should fail with 400)
- [ ] Follow same user twice (should fail with 409)
- [ ] Follow non-existent user (should fail with 404)
- [ ] Unfollow existing follow
- [ ] Unfollow non-existent follow (should fail with 404)
- [ ] Get followers list for valid user
- [ ] Get following list for valid user
- [ ] Get followers/following for non-existent user (should fail with 404)

### Posts & Feed

- [ ] Create post with content (authenticated)
- [ ] Create post with content and media URL
- [ ] Create post with empty content (should fail)
- [ ] Create post with content exceeding 5000 chars (should fail)
- [ ] Create post with invalid media URL (should fail)
- [ ] Get posts by valid user ID
- [ ] Get posts by non-existent user ID (returns empty array)
- [ ] Get posts with pagination
- [ ] Get feed when authenticated (own posts + followed users)
- [ ] Get feed with pagination
- [ ] Get feed with no follows (returns only own posts)
- [ ] Get feed without authentication (should fail)

### Security

- [ ] SQL injection attempts in input fields
- [ ] XSS attempts in post content (should be sanitized/stored as-is, handled by client)
- [ ] Cookie manipulation attempts
- [ ] Rate limiting on auth endpoints (5 requests per 15 minutes)
- [ ] Access protected routes with manipulated token

## Deployment

### Environment Variables for Production

```env
DATABASE_URL=<production-database-url>
JWT_SECRET=<strong-random-secret-32-chars-minimum>
JWT_EXPIRES_IN=7d
PORT=3000
NODE_ENV=production
COOKIE_SECURE=true
COOKIE_SAME_SITE=strict
CORS_ORIGIN=*  # Or specify allowed origins, e.g., https://your-client-domain.com
```

### Deployment Platforms

#### Render

1. Create a new Web Service
2. Connect your repository
3. Set build command: `npm install && npm run build`
4. Set start command: `npm start`
5. Add PostgreSQL database service
6. Set environment variables
7. Deploy

#### Railway

1. Create a new project
2. Add PostgreSQL service
3. Add Node.js service
4. Connect repository
5. Set environment variables
6. Deploy

#### Fly.io

1. Install Fly CLI: `flyctl install`
2. Launch app: `flyctl launch`
3. Add PostgreSQL: `flyctl postgres create`
4. Set secrets: `flyctl secrets set JWT_SECRET=...`
5. Deploy: `flyctl deploy`

### Post-Deployment

1. Run migrations: `npx prisma migrate deploy`
2. Verify health endpoint
3. Test authentication flow
4. Monitor logs for errors

## Future Improvements

- [ ] Add automated tests (Jest, Supertest)
- [ ] Implement cursor-based pagination for better performance
- [ ] Add post likes/comments functionality
- [ ] Implement real-time notifications (WebSockets)
- [ ] Add image upload with proper storage (S3, Cloudinary)
- [ ] Implement post search functionality
- [ ] Add user profiles with avatars
- [ ] Implement email verification
- [ ] Add password reset functionality
- [ ] Implement refresh tokens
- [ ] Add API documentation with Swagger/OpenAPI
- [ ] Implement caching layer (Redis)
- [ ] Add request logging and monitoring
- [ ] Implement database connection pooling optimization
- [ ] Add comprehensive error tracking (Sentry)

## License

ISC

## Author

Built as a production-ready backend demonstration project.


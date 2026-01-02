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

For detailed API documentation and testing instructions, see [API_TESTING.md](./API_TESTING.md).

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

### Post-Deployment

1. Run migrations: `npx prisma migrate deploy`
2. Verify health endpoint
3. Test authentication flow
4. Monitor logs for errors


## License

ISC

## Author

Built as a production-ready backend demonstration project.


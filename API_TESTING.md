# API Testing Documentation

## Overview

This backend exposes a **REST API** (not GraphQL).

All endpoints can be tested using Postman or any REST client.

Authentication is handled using JWT stored in HttpOnly cookies.

---

## Base URLs

**Deployed Backend:**
```
https://brandie-backend-b8lc.onrender.com
```

**Local Development:**
```
http://localhost:3000
```

---

## Health Check

**GET /health**

**Example:**
```http
GET https://brandie-backend-b8lc.onrender.com/health
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Server is healthy",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

---

## Authentication Endpoints

- **POST /auth/register**
- **POST /auth/login**
- **POST /auth/logout**

**Example - Register:**
```http
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "username": "johndoe",
  "password": "password123"
}
```

**Expected Response:**
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

**Note:** JWT token is automatically set in HttpOnly cookie after registration/login.

---

## User Search Endpoints

- **GET /users/search/username?username={username}**
- **GET /users/search/email?email={email}**

**Example:**
```http
GET /users/search/username?username=johndoe
```

---

## Follow System Endpoints

- **POST /follow/:userId** → Follow a user
- **DELETE /follow/:userId** → Unfollow a user
- **GET /follow/followers/:userId** → Get user's followers
- **GET /follow/following/:userId** → Get users that a user is following

**Note:** All follow endpoints require authentication.

**Example - Follow User:**
```http
POST /follow/123e4567-e89b-12d3-a456-426614174000
```

---

## Post Endpoints

- **POST /posts** → Create a new post
- **GET /posts/:userId?page=1&limit=10** → Get posts by user with pagination

**Create Post Example:**
```http
POST /posts
Content-Type: application/json

{
  "content": "My first post",
  "mediaUrl": "https://example.com/image.jpg"
}
```

**Note:** `mediaUrl` is optional. Authentication required.

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "userId": "uuid",
    "content": "My first post",
    "createdAt": "ISO timestamp",
    "updatedAt": "ISO timestamp",
    "media": [
      {
        "id": "uuid",
        "postId": "uuid",
        "mediaUrl": "https://example.com/image.jpg",
        "createdAt": "ISO timestamp"
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

---

## Feed Endpoint

- **GET /feed?page=1&limit=10** → Get personalized feed

Returns posts created by:
- The authenticated user
- Users followed by the authenticated user

Posts are sorted by newest first (created_at DESC).

**Note:** Authentication required.

**Expected Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "userId": "uuid",
      "content": "Post content",
      "createdAt": "ISO timestamp",
      "updatedAt": "ISO timestamp",
      "media": [],
      "user": {
        "id": "uuid",
        "username": "johndoe",
        "email": "user@example.com"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 50,
    "totalPages": 5
  }
}
```

---

## Postman Testing Guide

### Setup

1. **Open Postman**
2. **Create an environment variable:**
   - `baseUrl` = `https://brandie-backend-b8lc.onrender.com`
     (or `http://localhost:3000` for local testing)
3. **Enable cookies in Postman** (required for JWT authentication)
   - Go to Settings → Enable "Send cookies"

### Recommended Testing Flow

1. **Health check** → Verify server is running
2. **Register or login** → Get authentication cookie
3. **Test follow system** → Follow/unfollow users
4. **Create posts** → Test post creation with/without media
5. **Fetch user posts and feed** → Test pagination
6. **Test error cases** → Invalid data, unauthorized access, etc.

### Cookie Handling

- After successful login/register, JWT is stored in HttpOnly cookie
- Postman automatically sends cookies in subsequent requests
- No need to manually set Authorization headers
- Logout clears the authentication cookie

---

## Feature Test Cases (Summary)

### Authentication

- ✅ Register user (valid / invalid data)
- ✅ Login with valid and invalid credentials
- ✅ Logout user
- ✅ Access protected routes without authentication (should fail with 401)
- ✅ Register with duplicate email/username (should fail with 409)
- ✅ Register with invalid email format (should fail with 400)
- ✅ Register with short password (should fail with 400)

### Follow System

- ✅ Follow another user
- ✅ Follow self (should fail with 400)
- ✅ Follow same user twice (should fail with 409)
- ✅ Follow non-existent user (should fail with 404)
- ✅ Unfollow user
- ✅ Unfollow non-existent relationship (should fail with 404)
- ✅ Get followers list
- ✅ Get following list

### Posts

- ✅ Create post (text only)
- ✅ Create post (text + media)
- ✅ Create post with empty content (should fail with 400)
- ✅ Create post with content exceeding 5000 characters (should fail with 400)
- ✅ Get posts by user with pagination
- ✅ Get posts for non-existent user (returns empty array)

### Feed

- ✅ Get feed for authenticated user
- ✅ Feed pagination
- ✅ Access feed without authentication (should fail with 401)
- ✅ Feed includes own posts + followed users' posts
- ✅ Feed sorted by newest first

### Error & Security

- ✅ Invalid route returns 404
- ✅ Invalid UUID format (should fail with 400)
- ✅ Invalid or expired JWT token (should fail with 401)
- ✅ Rate limiting on auth endpoints (429 after threshold)
- ✅ Missing required fields (should fail with 400)

---

## Quick Reference - All Endpoints

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| GET | `/health` | No | Health check |
| GET | `/` | No | API information |
| POST | `/auth/register` | No | Register new user |
| POST | `/auth/login` | No | Login user |
| POST | `/auth/logout` | Yes | Logout user |
| GET | `/users/search/username?username={username}` | No | Search user by username |
| GET | `/users/search/email?email={email}` | No | Search user by email |
| POST | `/follow/:userId` | Yes | Follow a user |
| DELETE | `/follow/:userId` | Yes | Unfollow a user |
| GET | `/follow/followers/:userId` | Yes | Get user's followers |
| GET | `/follow/following/:userId` | Yes | Get users that a user is following |
| POST | `/posts` | Yes | Create a new post |
| GET | `/posts/:userId?page=1&limit=10` | No | Get posts by user (with pagination) |
| GET | `/feed?page=1&limit=10` | Yes | Get personalized feed |

---

## Notes

- Authentication uses **HttpOnly cookies** (no Authorization header needed)
- Same endpoints work for local and deployed environments
- Pagination: `page` (default: 1) and `limit` (default: 10, max: 100)
- All UUIDs must be valid UUID v4 format
- Rate limiting: Auth endpoints limited to 5 requests per 15 minutes (production)
- Automated tests are intentionally excluded as per assignment scope

---

## Error Response Format

All error responses follow this format:

```json
{
  "success": false,
  "error": {
    "message": "Error description"
  }
}
```

Common HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (authentication required)
- `404` - Not Found
- `409` - Conflict (duplicate resources)
- `429` - Too Many Requests (rate limited)
- `500` - Internal Server Error

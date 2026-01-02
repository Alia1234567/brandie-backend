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

## Feature Test Cases

### 1. Health Check

**TC-001: Health Check - Deployed Server**
- **Endpoint**: `GET https://brandie-backend-b8lc.onrender.com/health`
- **Local Alternative**: `GET http://localhost:3000/health`
- **Expected Status**: 200
- **Expected Response**: `{"success": true, "message": "Server is healthy", "timestamp": "ISO timestamp"}`
- **Test**: Verify server is accessible and responding

**TC-002: Health Check - Local Server**
- **Endpoint**: `GET http://localhost:3000/health`
- **Deployed Alternative**: `GET https://brandie-backend-b8lc.onrender.com/health`
- **Expected Status**: 200
- **Expected Response**: Same as TC-001
- **Test**: Verify local server is running

---

### 2. Authentication

**TC-003: Register User - Valid Data**
- **Endpoint**: `POST https://brandie-backend-b8lc.onrender.com/auth/register`
- **Local Alternative**: `POST http://localhost:3000/auth/register`
- **Request Body**: `{"email": "user@example.com", "username": "johndoe", "password": "password123"}`
- **Expected Status**: 200
- **Expected Response**: User object (without password), JWT cookie set
- **Test**: Verify user registration succeeds and cookie is set

**TC-004: Register User - Invalid Email Format**
- **Endpoint**: `POST https://brandie-backend-b8lc.onrender.com/auth/register`
- **Local Alternative**: `POST http://localhost:3000/auth/register`
- **Request Body**: `{"email": "invalid-email", "username": "testuser", "password": "password123"}`
- **Expected Status**: 400
- **Expected Response**: Validation error about email format
- **Test**: Verify email validation works

**TC-005: Register User - Short Username**
- **Endpoint**: `POST https://brandie-backend-b8lc.onrender.com/auth/register`
- **Local Alternative**: `POST http://localhost:3000/auth/register`
- **Request Body**: `{"email": "user@example.com", "username": "ab", "password": "password123"}`
- **Expected Status**: 400
- **Expected Response**: Error about username length (min 3 characters)
- **Test**: Verify username length validation

**TC-006: Register User - Short Password**
- **Endpoint**: `POST https://brandie-backend-b8lc.onrender.com/auth/register`
- **Local Alternative**: `POST http://localhost:3000/auth/register`
- **Request Body**: `{"email": "user@example.com", "username": "testuser", "password": "12345"}`
- **Expected Status**: 400
- **Expected Response**: Error about password length (min 6 characters)
- **Test**: Verify password length validation

**TC-007: Register User - Duplicate Email**
- **Endpoint**: `POST https://brandie-backend-b8lc.onrender.com/auth/register`
- **Local Alternative**: `POST http://localhost:3000/auth/register`
- **Prerequisites**: User with email exists
- **Request Body**: `{"email": "existing@example.com", "username": "differentuser", "password": "password123"}`
- **Expected Status**: 409
- **Expected Response**: Error about duplicate email
- **Test**: Verify duplicate email prevention

**TC-008: Register User - Duplicate Username**
- **Endpoint**: `POST https://brandie-backend-b8lc.onrender.com/auth/register`
- **Local Alternative**: `POST http://localhost:3000/auth/register`
- **Prerequisites**: User with username exists
- **Request Body**: `{"email": "different@example.com", "username": "existinguser", "password": "password123"}`
- **Expected Status**: 409
- **Expected Response**: Error about duplicate username
- **Test**: Verify duplicate username prevention

**TC-009: Login - Valid Credentials**
- **Endpoint**: `POST https://brandie-backend-b8lc.onrender.com/auth/login`
- **Local Alternative**: `POST http://localhost:3000/auth/login`
- **Prerequisites**: User exists
- **Request Body**: `{"email": "user@example.com", "password": "password123"}`
- **Expected Status**: 200
- **Expected Response**: User object, JWT cookie set
- **Test**: Verify successful login and cookie authentication

**TC-010: Login - Invalid Email**
- **Endpoint**: `POST https://brandie-backend-b8lc.onrender.com/auth/login`
- **Local Alternative**: `POST http://localhost:3000/auth/login`
- **Request Body**: `{"email": "nonexistent@example.com", "password": "password123"}`
- **Expected Status**: 401
- **Expected Response**: Error about invalid credentials
- **Test**: Verify invalid email handling

**TC-011: Login - Invalid Password**
- **Endpoint**: `POST https://brandie-backend-b8lc.onrender.com/auth/login`
- **Local Alternative**: `POST http://localhost:3000/auth/login`
- **Prerequisites**: User exists
- **Request Body**: `{"email": "user@example.com", "password": "wrongpassword"}`
- **Expected Status**: 401
- **Expected Response**: Error about invalid credentials
- **Test**: Verify invalid password handling

**TC-012: Logout - Authenticated User**
- **Endpoint**: `POST https://brandie-backend-b8lc.onrender.com/auth/logout`
- **Local Alternative**: `POST http://localhost:3000/auth/logout`
- **Prerequisites**: User is authenticated
- **Expected Status**: 200
- **Expected Response**: `{"success": true, "message": "Logged out successfully"}`
- **Test**: Verify logout clears cookie and subsequent requests fail

**TC-013: Access Protected Route - Unauthenticated**
- **Endpoint**: `POST https://brandie-backend-b8lc.onrender.com/posts`
- **Local Alternative**: `POST http://localhost:3000/posts`
- **Prerequisites**: No authentication
- **Expected Status**: 401
- **Expected Response**: Error about authentication required
- **Test**: Verify protected routes require authentication

---

### 3. User Search

**TC-014: Search User by Username - Valid**
- **Endpoint**: `GET https://brandie-backend-b8lc.onrender.com/users/search/username?username=johndoe`
- **Local Alternative**: `GET http://localhost:3000/users/search/username?username=johndoe`
- **Prerequisites**: User with username exists
- **Expected Status**: 200
- **Expected Response**: User object
- **Test**: Verify username search works

**TC-015: Search User by Username - Not Found**
- **Endpoint**: `GET https://brandie-backend-b8lc.onrender.com/users/search/username?username=nonexistent`
- **Local Alternative**: `GET http://localhost:3000/users/search/username?username=nonexistent`
- **Expected Status**: 404
- **Expected Response**: Error about user not found
- **Test**: Verify non-existent username handling

**TC-016: Search User by Email - Valid**
- **Endpoint**: `GET https://brandie-backend-b8lc.onrender.com/users/search/email?email=user@example.com`
- **Local Alternative**: `GET http://localhost:3000/users/search/email?email=user@example.com`
- **Prerequisites**: User with email exists
- **Expected Status**: 200
- **Expected Response**: User object
- **Test**: Verify email search works

**TC-017: Search User by Email - Invalid Format**
- **Endpoint**: `GET https://brandie-backend-b8lc.onrender.com/users/search/email?email=invalid-email`
- **Local Alternative**: `GET http://localhost:3000/users/search/email?email=invalid-email`
- **Expected Status**: 400
- **Expected Response**: Validation error about email format
- **Test**: Verify email format validation

---

### 4. Follow System

**TC-018: Follow User - Success**
- **Endpoint**: `POST https://brandie-backend-b8lc.onrender.com/follow/{userId}`
- **Local Alternative**: `POST http://localhost:3000/follow/{userId}`
- **Prerequisites**: Authenticated user (User A), target user exists (User B), not already following
- **Expected Status**: 200
- **Expected Response**: `{"success": true, "data": {"message": "Successfully followed user"}}`
- **Test**: Verify follow relationship is created

**TC-019: Follow User - Follow Self**
- **Endpoint**: `POST https://brandie-backend-b8lc.onrender.com/follow/{userId}`
- **Local Alternative**: `POST http://localhost:3000/follow/{userId}`
- **Prerequisites**: Authenticated user (User A)
- **Request**: Follow User A's own ID
- **Expected Status**: 400
- **Expected Response**: Error about cannot follow yourself
- **Test**: Verify self-follow prevention

**TC-020: Follow User - Already Following**
- **Endpoint**: `POST https://brandie-backend-b8lc.onrender.com/follow/{userId}`
- **Local Alternative**: `POST http://localhost:3000/follow/{userId}`
- **Prerequisites**: User A already following User B
- **Expected Status**: 409
- **Expected Response**: Error about already following
- **Test**: Verify duplicate follow prevention

**TC-021: Follow User - User Not Found**
- **Endpoint**: `POST https://brandie-backend-b8lc.onrender.com/follow/{userId}`
- **Local Alternative**: `POST http://localhost:3000/follow/{userId}`
- **Prerequisites**: Authenticated user
- **Request**: Follow non-existent user ID (valid UUID format but doesn't exist)
- **Expected Status**: 404
- **Expected Response**: Error about user not found
- **Test**: Verify non-existent user handling

**TC-022: Follow User - Invalid UUID**
- **Endpoint**: `POST https://brandie-backend-b8lc.onrender.com/follow/invalid-uuid`
- **Local Alternative**: `POST http://localhost:3000/follow/invalid-uuid`
- **Prerequisites**: Authenticated user
- **Expected Status**: 400
- **Expected Response**: Validation error about invalid UUID format
- **Test**: Verify UUID format validation

**TC-023: Unfollow User - Success**
- **Endpoint**: `DELETE https://brandie-backend-b8lc.onrender.com/follow/{userId}`
- **Local Alternative**: `DELETE http://localhost:3000/follow/{userId}`
- **Prerequisites**: User A is following User B
- **Expected Status**: 200
- **Expected Response**: `{"success": true, "data": {"message": "Successfully unfollowed user"}}`
- **Test**: Verify unfollow removes relationship

**TC-024: Unfollow User - Not Following**
- **Endpoint**: `DELETE https://brandie-backend-b8lc.onrender.com/follow/{userId}`
- **Local Alternative**: `DELETE http://localhost:3000/follow/{userId}`
- **Prerequisites**: User A is NOT following User B
- **Expected Status**: 404
- **Expected Response**: Error about not following this user
- **Test**: Verify unfollow non-existent relationship handling

**TC-025: Get Followers - Success**
- **Endpoint**: `GET https://brandie-backend-b8lc.onrender.com/follow/followers/{userId}`
- **Local Alternative**: `GET http://localhost:3000/follow/followers/{userId}`
- **Prerequisites**: Authenticated user, target user has followers
- **Expected Status**: 200
- **Expected Response**: Array of user objects (followers)
- **Test**: Verify followers list retrieval

**TC-026: Get Followers - Empty List**
- **Endpoint**: `GET https://brandie-backend-b8lc.onrender.com/follow/followers/{userId}`
- **Local Alternative**: `GET http://localhost:3000/follow/followers/{userId}`
- **Prerequisites**: Authenticated user, target user has no followers
- **Expected Status**: 200
- **Expected Response**: Empty array `[]`
- **Test**: Verify empty followers list handling

**TC-027: Get Following - Success**
- **Endpoint**: `GET https://brandie-backend-b8lc.onrender.com/follow/following/{userId}`
- **Local Alternative**: `GET http://localhost:3000/follow/following/{userId}`
- **Prerequisites**: Authenticated user, target user is following others
- **Expected Status**: 200
- **Expected Response**: Array of user objects (users being followed)
- **Test**: Verify following list retrieval

**TC-028: Get Following - Empty List**
- **Endpoint**: `GET https://brandie-backend-b8lc.onrender.com/follow/following/{userId}`
- **Local Alternative**: `GET http://localhost:3000/follow/following/{userId}`
- **Prerequisites**: Authenticated user, target user follows no one
- **Expected Status**: 200
- **Expected Response**: Empty array `[]`
- **Test**: Verify empty following list handling

---

### 5. Posts

**TC-029: Create Post - Text Only**
- **Endpoint**: `POST https://brandie-backend-b8lc.onrender.com/posts`
- **Local Alternative**: `POST http://localhost:3000/posts`
- **Prerequisites**: Authenticated user
- **Request Body**: `{"content": "This is my first post!"}`
- **Expected Status**: 201
- **Expected Response**: Post object with id, userId, content, timestamps, empty media array
- **Test**: Verify post creation without media

**TC-030: Create Post - With Media**
- **Endpoint**: `POST https://brandie-backend-b8lc.onrender.com/posts`
- **Local Alternative**: `POST http://localhost:3000/posts`
- **Prerequisites**: Authenticated user
- **Request Body**: `{"content": "Check out this image!", "mediaUrl": "https://example.com/image.jpg"}`
- **Expected Status**: 201
- **Expected Response**: Post object with media array containing media URL
- **Test**: Verify post creation with media

**TC-031: Create Post - Empty Content**
- **Endpoint**: `POST https://brandie-backend-b8lc.onrender.com/posts`
- **Local Alternative**: `POST http://localhost:3000/posts`
- **Prerequisites**: Authenticated user
- **Request Body**: `{"content": ""}`
- **Expected Status**: 400
- **Expected Response**: Validation error about content cannot be empty
- **Test**: Verify empty content validation

**TC-032: Create Post - Content Too Long**
- **Endpoint**: `POST https://brandie-backend-b8lc.onrender.com/posts`
- **Local Alternative**: `POST http://localhost:3000/posts`
- **Prerequisites**: Authenticated user
- **Request Body**: Content exceeding 5000 characters
- **Expected Status**: 400
- **Expected Response**: Validation error about content length (max 5000 characters)
- **Test**: Verify content length validation

**TC-033: Create Post - Invalid Media URL**
- **Endpoint**: `POST https://brandie-backend-b8lc.onrender.com/posts`
- **Local Alternative**: `POST http://localhost:3000/posts`
- **Prerequisites**: Authenticated user
- **Request Body**: `{"content": "Test post", "mediaUrl": "not-a-valid-url"}`
- **Expected Status**: 400
- **Expected Response**: Validation error about invalid media URL format
- **Test**: Verify media URL format validation

**TC-034: Create Post - Unauthenticated**
- **Endpoint**: `POST https://brandie-backend-b8lc.onrender.com/posts`
- **Local Alternative**: `POST http://localhost:3000/posts`
- **Prerequisites**: No authentication
- **Expected Status**: 401
- **Expected Response**: Error about authentication required
- **Test**: Verify authentication requirement

**TC-035: Get Posts by User - Success**
- **Endpoint**: `GET https://brandie-backend-b8lc.onrender.com/posts/{userId}?page=1&limit=10`
- **Local Alternative**: `GET http://localhost:3000/posts/{userId}?page=1&limit=10`
- **Prerequisites**: User has posts
- **Expected Status**: 200
- **Expected Response**: Array of posts with pagination object
- **Test**: Verify posts retrieval with pagination

**TC-036: Get Posts by User - Pagination**
- **Endpoint**: `GET https://brandie-backend-b8lc.onrender.com/posts/{userId}?page=2&limit=5`
- **Local Alternative**: `GET http://localhost:3000/posts/{userId}?page=2&limit=5`
- **Prerequisites**: User has more than 5 posts
- **Expected Status**: 200
- **Expected Response**: Pagination object with correct page, limit, total, totalPages
- **Test**: Verify pagination works correctly

**TC-037: Get Posts by User - Empty Result**
- **Endpoint**: `GET https://brandie-backend-b8lc.onrender.com/posts/{userId}`
- **Local Alternative**: `GET http://localhost:3000/posts/{userId}`
- **Prerequisites**: User has no posts
- **Expected Status**: 200
- **Expected Response**: Empty data array with pagination showing total: 0
- **Test**: Verify empty posts list handling

**TC-038: Get Posts by User - Invalid UUID**
- **Endpoint**: `GET https://brandie-backend-b8lc.onrender.com/posts/invalid-uuid`
- **Local Alternative**: `GET http://localhost:3000/posts/invalid-uuid`
- **Expected Status**: 400
- **Expected Response**: Validation error about invalid UUID format
- **Test**: Verify UUID validation

---

### 6. Feed

**TC-039: Get Feed - Success**
- **Endpoint**: `GET https://brandie-backend-b8lc.onrender.com/feed?page=1&limit=10`
- **Local Alternative**: `GET http://localhost:3000/feed?page=1&limit=10`
- **Prerequisites**: Authenticated user, user has posts OR follows users with posts
- **Expected Status**: 200
- **Expected Response**: Array of posts from user and followed users, sorted by newest first
- **Test**: Verify feed includes own posts and followed users' posts

**TC-040: Get Feed - Only Own Posts**
- **Endpoint**: `GET https://brandie-backend-b8lc.onrender.com/feed?page=1&limit=10`
- **Local Alternative**: `GET http://localhost:3000/feed?page=1&limit=10`
- **Prerequisites**: Authenticated user has posts, follows no one
- **Expected Status**: 200
- **Expected Response**: Only user's own posts
- **Test**: Verify feed shows only own posts when not following anyone

**TC-041: Get Feed - Pagination**
- **Endpoint**: `GET https://brandie-backend-b8lc.onrender.com/feed?page=2&limit=5`
- **Local Alternative**: `GET http://localhost:3000/feed?page=2&limit=5`
- **Prerequisites**: User has more than 5 posts in feed
- **Expected Status**: 200
- **Expected Response**: Correct pagination with page 2 results
- **Test**: Verify feed pagination works

**TC-042: Get Feed - Empty Feed**
- **Endpoint**: `GET https://brandie-backend-b8lc.onrender.com/feed`
- **Local Alternative**: `GET http://localhost:3000/feed`
- **Prerequisites**: Authenticated user, no posts (own or from followed users)
- **Expected Status**: 200
- **Expected Response**: Empty array with pagination
- **Test**: Verify empty feed handling

**TC-043: Get Feed - Unauthenticated**
- **Endpoint**: `GET https://brandie-backend-b8lc.onrender.com/feed`
- **Local Alternative**: `GET http://localhost:3000/feed`
- **Prerequisites**: No authentication
- **Expected Status**: 401
- **Expected Response**: Error about authentication required
- **Test**: Verify feed requires authentication

---

### 7. Error Cases

**TC-044: Invalid Route - 404**
- **Endpoint**: `GET https://brandie-backend-b8lc.onrender.com/invalid/route`
- **Local Alternative**: `GET http://localhost:3000/invalid/route`
- **Expected Status**: 404
- **Expected Response**: `{"success": false, "error": {"message": "Route not found"}}`
- **Test**: Verify 404 handling for non-existent routes

**TC-045: Missing Required Fields**
- **Endpoint**: `POST https://brandie-backend-b8lc.onrender.com/auth/register`
- **Local Alternative**: `POST http://localhost:3000/auth/register`
- **Request Body**: `{}` (empty object)
- **Expected Status**: 400
- **Expected Response**: Validation errors for missing required fields
- **Test**: Verify required field validation

**TC-046: Invalid JSON Body**
- **Endpoint**: `POST https://brandie-backend-b8lc.onrender.com/auth/register`
- **Local Alternative**: `POST http://localhost:3000/auth/register`
- **Request Body**: Invalid JSON string
- **Expected Status**: 400
- **Expected Response**: Error about invalid JSON
- **Test**: Verify JSON parsing error handling

---

### 8. Security Cases

**TC-047: Invalid JWT Token**
- **Endpoint**: `POST https://brandie-backend-b8lc.onrender.com/posts`
- **Local Alternative**: `POST http://localhost:3000/posts`
- **Prerequisites**: Invalid/expired JWT token in cookie
- **Expected Status**: 401
- **Expected Response**: Error about invalid token
- **Test**: Verify invalid token handling

**TC-048: Rate Limiting - Auth Endpoints**
- **Endpoint**: `POST https://brandie-backend-b8lc.onrender.com/auth/login`
- **Local Alternative**: `POST http://localhost:3000/auth/login`
- **Expected Behavior**: After 5 requests (production) or 100 (development), subsequent requests rate limited
- **Expected Status**: 429
- **Expected Response**: Error about rate limiting
- **Test**: Verify rate limiting on authentication endpoints

**TC-049: SQL Injection Attempt**
- **Endpoint**: `GET https://brandie-backend-b8lc.onrender.com/users/search/username?username=' OR '1'='1`
- **Local Alternative**: `GET http://localhost:3000/users/search/username?username=' OR '1'='1`
- **Expected Status**: 400 or 404 (should not execute SQL)
- **Expected Response**: Validation error or empty result
- **Test**: Verify SQL injection protection

**TC-050: XSS Attempt in Post Content**
- **Endpoint**: `POST https://brandie-backend-b8lc.onrender.com/posts`
- **Local Alternative**: `POST http://localhost:3000/posts`
- **Prerequisites**: Authenticated user
- **Request Body**: `{"content": "<script>alert('XSS')</script>"}`
- **Expected Status**: 201
- **Expected Response**: Post created (content stored as-is, sanitization handled by frontend)
- **Test**: Verify XSS content is stored but not executed

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

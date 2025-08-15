# Authentication System Documentation

## Overview

This authentication system provides a comprehensive, secure, and scalable solution for user authentication and authorization in the Next.js application. It includes features like JWT-based authentication, rate limiting, session management, password security, and caching.

## Features

- ✅ **JWT-based Authentication** - Secure token-based authentication with access and refresh tokens
- ✅ **Password Security** - Strong password hashing with bcrypt and password strength validation
- ✅ **Rate Limiting** - Protection against brute force attacks and abuse
- ✅ **Session Management** - Comprehensive session tracking and management
- ✅ **Caching** - Redis-based caching for improved performance
- ✅ **Input Validation** - Zod-based schema validation for all inputs
- ✅ **Error Handling** - Comprehensive error handling and logging
- ✅ **TypeScript Support** - Full TypeScript support with proper types
- ✅ **Frontend Integration** - React components and context for seamless integration

## Architecture

### Backend Components

1. **Database Layer** (`src/lib/db/`)
   - Prisma ORM for database operations
   - Redis for caching and session storage
   - Database health checks and connection management

2. **Authentication Layer** (`src/lib/auth/`)
   - JWT token generation and verification
   - Password hashing and validation
   - Session management
   - Rate limiting
   - Input validation with Zod schemas

3. **API Routes** (`src/app/api/auth/`)
   - `/api/auth/signup` - User registration
   - `/api/auth/signin` - User login
   - `/api/auth/logout` - User logout
   - `/api/auth/refresh` - Token refresh
   - `/api/auth/me` - Get/update user profile

4. **Middleware** (`src/lib/auth/middleware.ts`)
   - Authentication verification
   - Role-based authorization
   - Rate limiting enforcement

### Frontend Components

1. **Authentication Context** (`src/contexts/AuthContext.tsx`)
   - Global authentication state management
   - Token management and automatic refresh
   - User profile management

2. **UI Components** (`src/components/auth/`)
   - `SigninForm` - Login form with validation
   - `SignupForm` - Registration form with password strength indicator
   - `ProtectedRoute` - Route protection component

## API Endpoints

### POST /api/auth/signup

Register a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!",
  "confirmPassword": "SecurePassword123!",
  "firstName": "John",
  "lastName": "Doe",
  "username": "johndoe",
  "phone": "+1234567890",
  "acceptTerms": true
}
```

**Response (201):**
```json
{
  "message": "Account created successfully",
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "username": "johndoe",
    "role": "USER",
    "isEmailVerified": false,
    "createdAt": "2024-01-01T00:00:00.000Z"
  },
  "tokens": {
    "accessToken": "jwt_access_token",
    "refreshToken": "jwt_refresh_token",
    "expiresIn": 604800
  }
}
```

### POST /api/auth/signin

Authenticate user and get tokens.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!",
  "rememberMe": false
}
```

**Response (200):**
```json
{
  "message": "Signed in successfully",
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "USER",
    "lastLoginAt": "2024-01-01T00:00:00.000Z"
  },
  "tokens": {
    "accessToken": "jwt_access_token",
    "refreshToken": "jwt_refresh_token",
    "expiresIn": 604800
  }
}
```

### POST /api/auth/logout

Logout user and invalidate tokens.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200):**
```json
{
  "message": "Logged out successfully"
}
```

### POST /api/auth/refresh

Refresh access token using refresh token.

**Request Body:**
```json
{
  "refreshToken": "jwt_refresh_token"
}
```

**Response (200):**
```json
{
  "message": "Token refreshed successfully",
  "tokens": {
    "accessToken": "new_jwt_access_token",
    "refreshToken": "new_jwt_refresh_token",
    "expiresIn": 604800
  }
}
```

### GET /api/auth/me

Get current user profile.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200):**
```json
{
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "username": "johndoe",
    "role": "USER",
    "isEmailVerified": false,
    "lastLoginAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### PUT /api/auth/me

Update user profile.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Smith",
  "username": "johnsmith",
  "phone": "+1234567890",
  "avatar": "https://example.com/avatar.jpg"
}
```

## Security Features

### Password Security

- **Minimum Requirements:**
  - At least 8 characters long
  - Contains uppercase and lowercase letters
  - Contains at least one number
  - Contains at least one special character
  - Not a common password

- **Hashing:** bcrypt with configurable rounds (default: 12)
- **Strength Indicator:** Real-time password strength feedback

### Rate Limiting

- **Signin Attempts:** 5 attempts per 15 minutes per IP
- **Signup Attempts:** 3 attempts per hour per IP
- **Password Reset:** 3 attempts per hour per IP
- **API Requests:** 100 requests per minute per IP

### JWT Security

- **Access Tokens:** Short-lived (7 days default)
- **Refresh Tokens:** Longer-lived (30 days default)
- **Token Blacklisting:** Immediate invalidation on logout
- **Automatic Refresh:** Seamless token renewal

### Session Management

- **Session Tracking:** IP address and user agent logging
- **Session Expiration:** Configurable session timeouts
- **Multi-device Support:** Multiple active sessions per user
- **Session Cleanup:** Automatic cleanup of expired sessions

## Environment Variables

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/nextadmin"

# JWT Configuration
JWT_SECRET="your-super-secret-jwt-key"
JWT_EXPIRES_IN="7d"
JWT_REFRESH_SECRET="your-super-secret-refresh-jwt-key"
JWT_REFRESH_EXPIRES_IN="30d"

# Redis Configuration
REDIS_URL="redis://localhost:6379"
REDIS_PASSWORD=""

# Security
BCRYPT_ROUNDS="12"
SESSION_TIMEOUT="86400000"

# Rate Limiting
RATE_LIMIT_MAX_REQUESTS="5"
RATE_LIMIT_WINDOW_MS="900000"
```

## Usage Examples

### Frontend Authentication

```tsx
import { useAuth } from '@/contexts/AuthContext'

function MyComponent() {
  const { user, signin, signup, logout, isAuthenticated } = useAuth()

  const handleSignin = async () => {
    const result = await signin('user@example.com', 'password')
    if (result.success) {
      // Handle success
    } else {
      // Handle error
      console.error(result.error)
    }
  }

  return (
    <div>
      {isAuthenticated ? (
        <div>
          <p>Welcome, {user?.firstName}!</p>
          <button onClick={logout}>Logout</button>
        </div>
      ) : (
        <button onClick={handleSignin}>Sign In</button>
      )}
    </div>
  )
}
```

### Protected Routes

```tsx
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'

function AdminPage() {
  return (
    <ProtectedRoute 
      requireAuth={true}
      allowedRoles={['ADMIN']}
      requireEmailVerification={true}
    >
      <div>Admin content here</div>
    </ProtectedRoute>
  )
}
```

### API Route Protection

```tsx
import { withAuth } from '@/lib/auth/middleware'

export async function GET(request: NextRequest) {
  const authResult = await withAuth(request, {
    requireAuth: true,
    allowedRoles: ['ADMIN'],
    rateLimit: { maxRequests: 10, windowMs: 60000 }
  })

  if (!authResult.success) {
    return authResult.response!
  }

  // Your protected API logic here
  return NextResponse.json({ data: 'Protected data' })
}
```

## Error Handling

The system provides comprehensive error handling with appropriate HTTP status codes:

- **400 Bad Request** - Validation errors
- **401 Unauthorized** - Authentication required or invalid credentials
- **403 Forbidden** - Insufficient permissions
- **409 Conflict** - Resource already exists (e.g., email taken)
- **429 Too Many Requests** - Rate limit exceeded
- **500 Internal Server Error** - Server errors

## Monitoring and Logging

- **Login Attempts:** All login attempts are logged with IP and user agent
- **Session Activity:** Session creation, updates, and termination
- **Rate Limiting:** Rate limit violations and blocks
- **Error Logging:** Comprehensive error logging for debugging

## Testing

The system includes test utilities and helpers for comprehensive testing:

```typescript
import { createMockRequest, testUsers, setupTestEnv } from '@/lib/auth/test-utils'

// Example test
describe('Authentication API', () => {
  beforeEach(() => {
    setupTestEnv()
  })

  it('should create a new user', async () => {
    const request = createMockRequest('POST', testUsers.validUser)
    const response = await POST(request)
    expect(response.status).toBe(201)
  })
})
```

## Performance Considerations

- **Caching:** User data and sessions are cached in Redis
- **Database Optimization:** Efficient queries with proper indexing
- **Token Management:** Minimal database queries for token verification
- **Rate Limiting:** Distributed rate limiting with Redis

## Security Best Practices

1. **Always use HTTPS** in production
2. **Rotate JWT secrets** regularly
3. **Monitor failed login attempts**
4. **Implement proper CORS policies**
5. **Keep dependencies updated**
6. **Use environment variables** for sensitive configuration
7. **Implement proper logging** and monitoring
8. **Regular security audits** and penetration testing

## Troubleshooting

### Common Issues

1. **JWT Secret Not Set**
   - Ensure `JWT_SECRET` and `JWT_REFRESH_SECRET` are set in environment variables

2. **Database Connection Issues**
   - Check `DATABASE_URL` configuration
   - Ensure database is running and accessible

3. **Redis Connection Issues**
   - Verify `REDIS_URL` configuration
   - Check if Redis server is running

4. **Rate Limiting Too Strict**
   - Adjust rate limiting configuration in environment variables
   - Check rate limit headers in responses

For more detailed troubleshooting, check the application logs and health check endpoint at `/api/health`.

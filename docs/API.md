# API Documentation

## Base URL
```
http://localhost:3000/api
```

## Authentication

All protected endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer <access_token>
```

## Rate Limiting

All endpoints are rate-limited. Rate limit information is included in response headers:
- `X-RateLimit-Limit`: Maximum requests allowed
- `X-RateLimit-Remaining`: Remaining requests in current window
- `X-RateLimit-Reset`: Unix timestamp when the rate limit resets

## Error Responses

All error responses follow this format:
```json
{
  "error": "Error message",
  "details": ["Detailed error messages"],
  "retryAfter": 300
}
```

## Endpoints

### Health Check

#### GET /health
Check the health status of the application and its dependencies.

**Response (200):**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "services": {
    "database": {
      "status": "healthy",
      "timestamp": "2024-01-01T00:00:00.000Z"
    },
    "redis": {
      "status": "healthy",
      "timestamp": "2024-01-01T00:00:00.000Z"
    }
  },
  "version": "1.0.0",
  "environment": "development"
}
```

### Authentication Endpoints

#### POST /auth/signup
Register a new user account.

**Rate Limit:** 3 requests per hour per IP

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

**Validation Rules:**
- `email`: Valid email address, unique
- `password`: Min 8 chars, uppercase, lowercase, number, special char
- `confirmPassword`: Must match password
- `firstName`: Optional, 1-50 characters, letters only
- `lastName`: Optional, 1-50 characters, letters only
- `username`: Optional, 3-30 characters, alphanumeric + underscore/hyphen, unique
- `phone`: Optional, valid phone number format
- `acceptTerms`: Must be true

**Success Response (201):**
```json
{
  "message": "Account created successfully",
  "user": {
    "id": "clp123abc456",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "username": "johndoe",
    "role": "USER",
    "isEmailVerified": false,
    "createdAt": "2024-01-01T00:00:00.000Z"
  },
  "tokens": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 604800
  }
}
```

**Error Responses:**
- `400`: Validation failed
- `409`: Email or username already exists
- `429`: Too many signup attempts

#### POST /auth/signin
Authenticate user and receive tokens.

**Rate Limit:** 5 requests per 15 minutes per IP

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!",
  "rememberMe": false
}
```

**Success Response (200):**
```json
{
  "message": "Signed in successfully",
  "user": {
    "id": "clp123abc456",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "username": "johndoe",
    "role": "USER",
    "isEmailVerified": false,
    "lastLoginAt": "2024-01-01T00:00:00.000Z",
    "createdAt": "2024-01-01T00:00:00.000Z"
  },
  "tokens": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 604800
  }
}
```

**Error Responses:**
- `400`: Validation failed
- `401`: Invalid credentials
- `403`: Account deactivated
- `429`: Too many signin attempts

#### POST /auth/logout
Logout user and invalidate current session.

**Authentication:** Required

**Success Response (200):**
```json
{
  "message": "Logged out successfully"
}
```

#### DELETE /auth/logout
Logout user from all devices and invalidate all sessions.

**Authentication:** Required

**Success Response (200):**
```json
{
  "message": "Logged out from all devices successfully"
}
```

#### POST /auth/refresh
Refresh access token using refresh token.

**Rate Limit:** 100 requests per minute per IP

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Success Response (200):**
```json
{
  "message": "Token refreshed successfully",
  "tokens": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 604800
  }
}
```

**Error Responses:**
- `400`: Validation failed
- `401`: Invalid or expired refresh token

#### GET /auth/me
Get current user profile information.

**Authentication:** Required
**Rate Limit:** 100 requests per minute per IP

**Success Response (200):**
```json
{
  "user": {
    "id": "clp123abc456",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "username": "johndoe",
    "avatar": "https://example.com/avatar.jpg",
    "phone": "+1234567890",
    "role": "USER",
    "isEmailVerified": false,
    "isPhoneVerified": false,
    "isActive": true,
    "twoFactorEnabled": false,
    "lastLoginAt": "2024-01-01T00:00:00.000Z",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

#### PUT /auth/me
Update current user profile information.

**Authentication:** Required
**Rate Limit:** 10 requests per minute per IP

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

**Success Response (200):**
```json
{
  "message": "Profile updated successfully",
  "user": {
    "id": "clp123abc456",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Smith",
    "username": "johnsmith",
    "avatar": "https://example.com/avatar.jpg",
    "phone": "+1234567890",
    "role": "USER",
    "isEmailVerified": false,
    "isPhoneVerified": false,
    "isActive": true,
    "twoFactorEnabled": false,
    "lastLoginAt": "2024-01-01T00:00:00.000Z",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Error Responses:**
- `400`: Validation failed
- `409`: Username already taken

## Status Codes

- `200 OK`: Request successful
- `201 Created`: Resource created successfully
- `400 Bad Request`: Invalid request data
- `401 Unauthorized`: Authentication required or invalid
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Resource not found
- `409 Conflict`: Resource already exists
- `429 Too Many Requests`: Rate limit exceeded
- `500 Internal Server Error`: Server error

## Example Usage

### JavaScript/TypeScript

```javascript
// Signup
const signupResponse = await fetch('/api/auth/signup', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'SecurePassword123!',
    confirmPassword: 'SecurePassword123!',
    firstName: 'John',
    lastName: 'Doe',
    acceptTerms: true
  })
})

const signupData = await signupResponse.json()

// Signin
const signinResponse = await fetch('/api/auth/signin', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'SecurePassword123!'
  })
})

const signinData = await signinResponse.json()
const accessToken = signinData.tokens.accessToken

// Get user profile
const profileResponse = await fetch('/api/auth/me', {
  headers: {
    'Authorization': `Bearer ${accessToken}`
  }
})

const profileData = await profileResponse.json()

// Logout
const logoutResponse = await fetch('/api/auth/logout', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${accessToken}`
  }
})
```

### cURL Examples

```bash
# Signup
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePassword123!",
    "confirmPassword": "SecurePassword123!",
    "firstName": "John",
    "lastName": "Doe",
    "acceptTerms": true
  }'

# Signin
curl -X POST http://localhost:3000/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePassword123!"
  }'

# Get profile (replace TOKEN with actual access token)
curl -X GET http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer TOKEN"

# Logout
curl -X POST http://localhost:3000/api/auth/logout \
  -H "Authorization: Bearer TOKEN"
```

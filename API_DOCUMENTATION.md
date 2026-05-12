# FinTrackPro API Documentation

## Base URL
```
Production: https://api.fintrackpro.com/api/v1
Development: http://localhost:5000/api/v1
```

## Authentication
All protected endpoints require a JWT access token in the Authorization header:
```
Authorization: Bearer <access_token>
```

Refresh tokens are stored in httpOnly cookies.

---

## Endpoints

### Authentication

#### POST /auth/register
Register a new user account.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "message": "Registration successful",
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "name": "John Doe",
      "email": "john@example.com",
      "isEmailVerified": false,
      "createdAt": "2026-05-09T12:00:00.000Z"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Rate Limit:** 5 requests per 15 minutes

---

#### POST /auth/login
Login with email and password.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": { /* user object */ },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Rate Limit:** 5 requests per 15 minutes

---

#### POST /auth/refresh
Refresh access token using refresh token cookie.

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Token refreshed",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

#### POST /auth/logout
Logout and revoke refresh token.

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Logout successful"
}
```

---

#### POST /auth/forgot-password
Request password reset email.

**Request Body:**
```json
{
  "email": "john@example.com"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Password reset email sent"
}
```

**Rate Limit:** 3 requests per hour

---

#### POST /auth/reset-password
Reset password with token from email.

**Request Body:**
```json
{
  "token": "abc123...",
  "password": "NewSecurePass123!"
}
```

**Response:** `200 OK`

---

#### POST /auth/verify-email
Verify email address with token from email.

**Request Body:**
```json
{
  "token": "xyz789..."
}
```

**Response:** `200 OK`

---

#### GET /auth/profile
Get current user profile (requires authentication).

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "isEmailVerified": true,
    "profileImage": "https://res.cloudinary.com/...",
    "createdAt": "2026-05-09T12:00:00.000Z"
  }
}
```

---

### Transactions

#### POST /transactions
Create a new transaction (requires authentication).

**Request Body:**
```json
{
  "amount": 50.00,
  "type": "expense",
  "category": "Food & Dining",
  "description": "Lunch at restaurant",
  "date": "2026-05-09T12:00:00.000Z",
  "paymentMethod": "Credit Card"
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "message": "Transaction created successfully",
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "amount": 50.00,
    "type": "expense",
    "category": "Food & Dining",
    "description": "Lunch at restaurant",
    "date": "2026-05-09T12:00:00.000Z",
    "paymentMethod": "Credit Card",
    "userId": "507f1f77bcf86cd799439012",
    "createdAt": "2026-05-09T12:05:00.000Z"
  }
}
```

---

#### GET /transactions
Get all transactions with filtering and pagination (requires authentication).

**Query Parameters:**
- `page` (number, default: 1)
- `limit` (number, default: 20, max: 100)
- `type` (string: "income" | "expense")
- `category` (string)
- `dateFrom` (ISO date string)
- `dateTo` (ISO date string)
- `minAmount` (number)
- `maxAmount` (number)
- `search` (string)
- `sortBy` (string: "date" | "amount" | "category", default: "date")
- `sortOrder` (string: "asc" | "desc", default: "desc")

**Example:**
```
GET /transactions?page=1&limit=10&type=expense&category=Food&dateFrom=2026-05-01
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [ /* array of transactions */ ],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 45,
    "totalPages": 5
  }
}
```

---

#### GET /transactions/stats
Get transaction statistics (requires authentication).

**Query Parameters:**
- `dateFrom` (ISO date string)
- `dateTo` (ISO date string)

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "totalIncome": 5000.00,
    "totalExpense": 3200.00,
    "balance": 1800.00,
    "transactionCount": 127,
    "categoryBreakdown": [
      {
        "category": "Food & Dining",
        "total": 850.00,
        "count": 32
      },
      {
        "category": "Shopping",
        "total": 650.00,
        "count": 18
      }
    ]
  }
}
```

---

#### GET /transactions/categories
Get list of all used categories (requires authentication).

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    "Food & Dining",
    "Shopping",
    "Transportation",
    "Entertainment",
    "Bills & Utilities"
  ]
}
```

---

#### GET /transactions/:id
Get single transaction by ID (requires authentication).

**Response:** `200 OK`
```json
{
  "success": true,
  "data": { /* transaction object */ }
}
```

**Error:** `404 Not Found` if transaction doesn't exist

---

#### PUT /transactions/:id
Update a transaction (requires authentication).

**Request Body:** (all fields optional)
```json
{
  "amount": 60.00,
  "description": "Updated description"
}
```

**Response:** `200 OK`

---

#### DELETE /transactions/:id
Delete a transaction (requires authentication).

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Transaction deleted successfully"
}
```

---

### Health Check

#### GET /health
Check API health (no authentication required).

**Response:** `200 OK`
```json
{
  "status": "ok",
  "timestamp": "2026-05-09T12:00:00.000Z",
  "uptime": 12345.67
}
```

---

## Error Responses

All errors follow this format:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": [
      {
        "field": "email",
        "message": "Invalid email address"
      }
    ]
  }
}
```

### Common Error Codes
- `VALIDATION_ERROR` (400) - Invalid request data
- `AUTHENTICATION_ERROR` (401) - Invalid or missing token
- `AUTHORIZATION_ERROR` (403) - Insufficient permissions
- `NOT_FOUND` (404) - Resource not found
- `CONFLICT` (409) - Resource already exists
- `RATE_LIMIT_EXCEEDED` (429) - Too many requests
- `INTERNAL_ERROR` (500) - Server error

---

## Rate Limiting

- **General API**: 100 requests per 15 minutes
- **Authentication endpoints**: 5 requests per 15 minutes
- **Password reset**: 3 requests per hour

Rate limit info is included in response headers:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1683896400
```

---

## Security

- All endpoints use HTTPS in production
- Passwords are hashed with bcrypt (12 rounds)
- JWT tokens expire after 15 minutes
- Refresh tokens expire after 7 days
- Refresh tokens are rotated on each use
- CORS is configured for approved origins only
- All inputs are validated and sanitized
- Security headers (Helmet) are enabled

---

## Versioning

Current API version: **v1**

The API version is included in the URL: `/api/v1/...`

Breaking changes will result in a new version (v2, v3, etc.)

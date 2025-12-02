# 💰 FinTrackPro Backend API

A powerful, secure, and scalable backend service for personal finance management. Built with **Node.js**, **Express.js**, and **MongoDB** with enterprise-grade features like encryption, authentication, and rate limiting.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [Project Structure](#project-structure)
- [Security Features](#security-features)
- [Error Handling](#error-handling)
- [Contributing](#contributing)
- [License](#license)

---

## 🎯 Overview

FinTrackPro Backend is a comprehensive REST API for managing personal finances with support for:

- 👤 **User Authentication** - Secure JWT-based authentication
- 💳 **Transaction Management** - Full CRUD operations with encryption
- 🔍 **Advanced Filtering** - Filter by date range, transaction type, and payment mode
- 📊 **Pagination** - Efficient data retrieval with configurable pagination
- 👥 **Shared Expenses** - Automatic calculation of individual shares in shared transactions
- 🔐 **Data Encryption** - Sensitive financial data encrypted at rest
- 🛡️ **Security** - Rate limiting, CORS, password hashing with bcryptjs
- 📧 **Email Notifications** - Transactional email support with Nodemailer
- 📁 **File Upload** - Image upload to Cloudinary with automatic optimization
- 📈 **Logging** - Comprehensive logging with Winston

---

## ✨ Features

### Authentication & Security

- ✅ User registration with email validation
- ✅ Secure login with JWT tokens
- ✅ Password hashing with bcryptjs
- ✅ Protected routes with authentication middleware
- ✅ Rate limiting to prevent abuse
- ✅ CORS configuration for cross-origin requests

### Transaction Management

- ✅ Create transactions with encryption
- ✅ Read transactions with filtering and pagination
- ✅ Update transactions with validation
- ✅ Delete transactions with ownership verification
- ✅ Bulk import transactions from CSV/JSON
- ✅ Support for multiple transaction types (Income, Expense, Borrow, Repay, Credit, Credit-Repay)

### Data Management

- ✅ Shared expense calculation
- ✅ Multiple payment modes support
- ✅ Category organization
- ✅ Transaction descriptions
- ✅ Date range filtering
- ✅ Automatic userShare calculation for shared expenses

### Infrastructure

- ✅ MongoDB indexing for performance
- ✅ Centralized error handling
- ✅ Request validation
- ✅ Logging and monitoring
- ✅ Environment-based configuration

---

## 🛠️ Tech Stack

| Layer                 | Technology                   |
| --------------------- | ---------------------------- |
| **Runtime**           | Node.js                      |
| **Framework**         | Express.js 5.1.0             |
| **Database**          | MongoDB with Mongoose 8.15.1 |
| **Authentication**    | JWT (jsonwebtoken 9.0.2)     |
| **Encryption**        | Native Node.js crypto        |
| **Password Security** | bcryptjs 3.0.2               |
| **File Upload**       | Multer 2.0.0, Cloudinary     |
| **Image Processing**  | Sharp 0.34.2                 |
| **Email**             | Nodemailer 7.0.3             |
| **Logging**           | Winston 3.17.0               |
| **Rate Limiting**     | express-rate-limit 8.1.0     |
| **Development**       | Nodemon 3.1.10               |

---

## 📦 Prerequisites

Before running the application, ensure you have:

- **Node.js** v14.0.0 or higher ([Download](https://nodejs.org/))
- **npm** v6.0.0 or higher
- **MongoDB** v4.4 or higher ([Download](https://www.mongodb.com/try/download/community) or use [MongoDB Atlas](https://www.mongodb.com/cloud/atlas))
- **Cloudinary Account** (for image uploads) - [Sign up](https://cloudinary.com/)
- **Nodemailer Setup** (Gmail App Password or SMTP credentials)

---

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/kalyankashaboina/Fintrackpro-server.git
cd Fintrackpro-server
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Create Environment File

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

---

## ⚙️ Configuration

### Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/fintrackpro

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production

# Email Configuration (Gmail)
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-specific-password

# Cloudinary Configuration (Image Upload)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Frontend URL
FRONTEND_URL=http://localhost:3000

# Encryption Key (should be 32 characters)
ENCRYPTION_KEY=your-32-character-encryption-key-here
```

### Obtaining Required Credentials

#### MongoDB Atlas

1. Visit [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster
3. Get your connection string
4. Update `MONGO_URI` in `.env`

#### Gmail App Password

1. Enable 2-Factor Authentication on Gmail
2. Go to [Google Account Security](https://myaccount.google.com/security)
3. Generate an App Password
4. Use it for `EMAIL_PASS`

#### Cloudinary

1. Sign up at [Cloudinary](https://cloudinary.com/)
2. Go to Dashboard
3. Copy Cloud Name, API Key, and API Secret
4. Update your `.env` file

---

## ▶️ Running the Application

### Development Mode

```bash
npm run dev
```

Runs with **Nodemon** for automatic restart on file changes.

### Production Mode

```bash
npm start
```

### Check Logs

The application logs are stored in the `logs/` directory (if configured).

### API Base URL

```
http://localhost:5000/api
```

---

## 📚 API Documentation

### Authentication Endpoints

#### Register User

```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Response:**

```json
{
  "success": true,
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

#### Login User

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

### Transaction Endpoints

All transaction endpoints require authentication. Include the JWT token in the header:

```
Authorization: Bearer <your_jwt_token>
```

#### Create Transaction

```http
POST /api/transactions
Content-Type: application/json
Authorization: Bearer <token>

{
  "date": "2025-12-02",
  "category": "Groceries",
  "amount": 150.50,
  "type": "expense",
  "paymentMode": "credit_card",
  "shared": false,
  "people": 1,
  "description": "Weekly grocery shopping"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Transaction created",
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "date": "2025-12-02",
    "category": "Groceries",
    "amount": 150.5,
    "type": "expense",
    "paymentMode": "credit_card",
    "shared": false,
    "userShare": 150.5,
    "description": "Weekly grocery shopping",
    "isCredit": false
  }
}
```

#### Get All Transactions

```http
GET /api/transactions?page=1&limit=10&type=expense&startDate=2025-01-01&endDate=2025-12-31
Authorization: Bearer <token>
```

**Query Parameters:**
| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `page` | number | Page number (default: 1) | 1 |
| `limit` | number | Items per page (default: 10) | 20 |
| `type` | string | Transaction type | `expense`, `income`, `borrow` |
| `startDate` | string | Start date (YYYY-MM-DD) | 2025-01-01 |
| `endDate` | string | End date (YYYY-MM-DD) | 2025-12-31 |
| `paymentMode` | string | Payment mode | `credit_card`, `cash`, `bank_transfer` |
| `isCredit` | boolean | Filter credit transactions | true |

**Response:**

```json
{
  "success": true,
  "message": "Transactions fetched successfully",
  "data": [
    {
      "id": "507f1f77bcf86cd799439011",
      "date": "2025-12-02",
      "category": "Groceries",
      "amount": 150.5,
      "type": "expense",
      "paymentMode": "credit_card",
      "shared": false,
      "userShare": 150.5,
      "description": "Weekly grocery shopping",
      "isCredit": false
    }
  ],
  "page": 1,
  "totalPages": 5,
  "totalTransactions": 47
}
```

#### Get Single Transaction

```http
GET /api/transactions/507f1f77bcf86cd799439011
Authorization: Bearer <token>
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "date": "2025-12-02",
    "category": "Groceries",
    "amount": 150.5,
    "type": "expense",
    "paymentMode": "credit_card",
    "shared": false,
    "userShare": 150.5,
    "description": "Weekly grocery shopping",
    "isCredit": false
  }
}
```

#### Update Transaction

```http
PUT /api/transactions/507f1f77bcf86cd799439011
Content-Type: application/json
Authorization: Bearer <token>

{
  "amount": 160.75,
  "category": "Food & Groceries",
  "description": "Updated grocery shopping"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Transaction updated",
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "date": "2025-12-02",
    "category": "Food & Groceries",
    "amount": 160.75,
    "type": "expense",
    "paymentMode": "credit_card",
    "shared": false,
    "userShare": 160.75,
    "description": "Updated grocery shopping",
    "isCredit": false
  }
}
```

**Update Validation:**

- ✅ Type must be valid (`income`, `expense`, `borrow`, `repay`, `credit`, `credit-repay`)
- ✅ Amount must be > 0
- ✅ If shared, people count must be ≥ 1
- ✅ userShare is automatically recalculated

#### Delete Transaction

```http
DELETE /api/transactions/507f1f77bcf86cd799439011
Authorization: Bearer <token>
```

**Response:**

```json
{
  "success": true,
  "message": "Transaction deleted successfully"
}
```

#### Bulk Create Transactions

```http
POST /api/transactions/bulk
Content-Type: application/json
Authorization: Bearer <token>

[
  {
    "date": "2025-12-01",
    "category": "Groceries",
    "amount": 50.00,
    "type": "expense",
    "paymentMode": "cash"
  },
  {
    "date": "2025-12-02",
    "category": "Salary",
    "amount": 5000.00,
    "type": "income",
    "paymentMode": "bank_transfer"
  }
]
```

**Response:**

```json
{
  "success": true,
  "message": "2 transactions created successfully.",
  "data": [...]
}
```

---

## 📁 Project Structure

```
Fintrackpro-server/
├── config/                    # Configuration files
│   ├── db.js                  # MongoDB connection
│   └── cloudinary.config.js   # Cloudinary setup
├── controllers/               # Business logic
│   ├── authController.js      # Authentication logic
│   └── transactionController.js # Transaction CRUD
├── middlewares/               # Custom middlewares
│   ├── authMiddleware.js      # JWT verification
│   └── upload.js              # File upload handling
├── models/                    # Mongoose schemas
│   ├── userModel.js           # User schema
│   └── transactionModel.js    # Transaction schema
├── routes/                    # API routes
│   ├── authRoutes.js          # Auth endpoints
│   └── transactionRoutes.js   # Transaction endpoints
├── utils/                     # Utility functions
│   ├── crypto-util.js         # Encryption/Decryption
│   ├── jwt-helper.js          # JWT utilities
│   ├── nodemailer.js          # Email setup
│   ├── emailTemplates.js      # Email templates
│   ├── categoryUtils.js       # Category helpers
│   ├── logger.js              # Winston logger
│   └── resizeImage.js         # Image optimization
├── events/                    # Event handlers
│   └── emailEvents.js         # Email event listeners
├── uploads/                   # Temporary file storage
├── seedTransactions.js        # Database seeding
├── server.js                  # Entry point
├── package.json              # Dependencies
├── .env.example              # Example env variables
└── README.md                 # This file
```

---

## 🔐 Security Features

### Data Encryption

- All sensitive financial data (amount, userShare) is encrypted using AES-256-GCM
- Encryption/Decryption is handled by `utils/crypto-util.js`
- Keys are stored securely in environment variables

### Authentication

- JWT tokens with configurable expiration
- Password hashing with bcryptjs (salt rounds: 10)
- Token verification on all protected routes

### Rate Limiting

- 100 requests per 15 minutes per IP address
- Protects against brute force attacks

### CORS

- Configured for specific origins
- Prevents unauthorized cross-origin requests

### Data Validation

- Input validation on all endpoints
- Type checking and sanitization
- Prevention of MongoDB injection

---

## ⚠️ Error Handling

### Common Error Responses

#### 400 Bad Request

```json
{
  "success": false,
  "message": "Missing required fields"
}
```

#### 401 Unauthorized

```json
{
  "message": "Not authorized, token missing"
}
```

#### 404 Not Found

```json
{
  "success": false,
  "message": "Transaction not found"
}
```

#### 500 Server Error

```json
{
  "success": false,
  "message": "Server error",
  "error": "Error details"
}
```

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the **ISC License** - see the LICENSE file for details.

---

## 📧 Support & Contact

For support, questions, or suggestions, please:

- Open an issue on GitHub
- Contact the development team

---

## 🙏 Acknowledgments

- Express.js community
- MongoDB documentation
- All contributors and users

---

**Last Updated:** December 2, 2025  
**Version:** 1.0.0

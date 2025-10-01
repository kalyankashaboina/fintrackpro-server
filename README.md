# FinTrackPro Backend API

## Overview

This backend service for **FinTrackPro** is built with **Node.js**, **Express**, and **MongoDB**.  
It provides user authentication and full CRUD for personal finance transactions with support for:

- Filtering by date/type
- Pagination
- Shared expenses
- JWT-based protected routes

---

## Features

- User registration/login with hashed passwords and JWT tokens
- Transaction CRUD (Create, Read, Update, Delete)
- Query transactions with filters: date range, type (Income, Expense, Borrow, Lend)
- Pagination support (`page` and `limit` query params)
- Shared expense auto calculation of user share
- Category emoji enrichment on response
- Secure routes with authentication middleware
- CORS enabled for cross-origin requests

---

## Environment Variables

Create a `.env` file at the root with:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_password_or_app_password
FRONTEND_URL=http://localhost:3000



| Method | Endpoint                 | Description                  | Query Parameters                                                | Request Body                                                                                   | Response                                  |
|--------|--------------------------|------------------------------|----------------------------------------------------------------|------------------------------------------------------------------------------------------------|-------------------------------------------|
| GET    | `/api/transactions`       | Get transactions list        | `page` (number), `limit` (number), `startDate`, `endDate`, `type` (Income/Expense/Borrow/Lend) | N/A                                                                                            | `{ transactions, page, totalPages, totalTransactions }` |
| POST   | `/api/transactions`       | Create new transaction       | N/A                                                            | `{ date, category, amount, type, paymentMode, shared, people, description }`                   | `{ message, transaction }`                 |
| GET    | `/api/transactions/:id`   | Get single transaction by ID | N/A                                                            | N/A                                                                                            | Transaction object                        |
| PUT    | `/api/transactions/:id`   | Update transaction by ID     | N/A                                                            | Partial or full transaction data                                                              | `{ message, transaction }`                 |
| DELETE | `/api/transactions/:id`   | Delete transaction by ID     | N/A                                                            | N/A                                                                                            | `{ message }`                             |

---

## Data Model: Transaction

| Field       | Type      | Description                              |
|-------------|-----------|----------------------------------------|
| `userId`    | ObjectId  | Reference to User                       |
| `date`      | Date      | Date of the transaction                 |
| `category`  | String    | Category name (e.g. Food & Dining)     |
| `amount`    | Number    | Transaction amount                      |
| `type`      | String    | One of: Income, Expense, Borrow, Lend  |
| `paymentMode` | String  | Payment method used                     |
| `shared`    | Boolean   | Whether expense is shared               |
| `people`    | Number    | Number of people sharing expense       |
| `userShare` | Number    | User's share of the amount              |
| `description` | String  | Optional description                    |

---

## Notes

- The backend adds category emojis to transactions before sending to the frontend.
- Colors for categories are handled on the frontend.
- Passwords are securely hashed using bcrypt.
- JWT tokens expire after 1 hour.
- Shared expenses automatically divide amount by number of people to calculate user share.

---

## License

This project is licensed under the MIT License.

---

## Contact

Created by Kalyan Kashaboina - feel free to reach out!
```

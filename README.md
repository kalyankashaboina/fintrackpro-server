# FinTrackPro — Backend

## Quick Start (Local Dev)

### Prerequisites
- Node.js 20+
- MongoDB running locally on port 27017
  - macOS: `brew services start mongodb-community`
  - Linux: `sudo systemctl start mongod`
  - Windows: Start MongoDB service or run `mongod`

### Setup

```bash
# 1. Install dependencies
npm install

# 2. Copy env (already pre-filled for local dev — no changes needed!)
cp .env.example .env

# 3. Start development server
npm run dev
```

Server starts at **http://localhost:5000**  
Swagger API docs at **http://localhost:5000/api-docs**  
Health check at **http://localhost:5000/health**

### Optional: Enable Email & Image Uploads

Open `.env` and fill in:

```env
# For image uploads (free at cloudinary.com)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# For emails (use Gmail App Password)
EMAIL_USER=your@gmail.com
EMAIL_PASSWORD=your_app_password
```

> Without these, the app still runs — emails are logged to console, image uploads return a placeholder.

### Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start with hot reload |
| `npm run build` | Compile TypeScript |
| `npm start` | Run production build |
| `npm run typecheck` | TypeScript check |
| `npm run lint` | ESLint check |
| `npm audit` | Security audit |

### API Documentation

Interactive Swagger UI: **http://localhost:5000/api-docs**

All endpoints documented with request/response schemas.

### Production (MongoDB Atlas)

Change in `.env`:
```env
NODE_ENV=production
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/fintrackpro
JWT_SECRET=<random-64-char-string>
JWT_REFRESH_SECRET=<random-64-char-string>
COOKIE_SECRET=<random-64-char-string>
CLIENT_URL=https://your-frontend-domain.com
```

Generate secrets: `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path'); 
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const transactionRoutes = require('./routes/transactionRoutes');

dotenv.config();
connectDB();

const app = express();

// Restrict CORS to your frontend only
const allowedOrigins = ['https://fintrackpro-three.vercel.app', 'http://localhost:8080' ];


app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.use(express.json());

// Serve uploads folder statically so images can be accessed via URL
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/transactions', transactionRoutes);

app.get('/', (req, res) => res.send('FinTrackPro Backend Running'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

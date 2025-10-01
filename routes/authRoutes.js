const express = require('express');
const router = express.Router();
// --- 1. IMPORT RATE LIMITER ---
const rateLimit = require('express-rate-limit');

const {
  registerUser,
  loginUser,
  forgotPassword,
  resetPassword,
  updateProfile,
  googleLogin,
} = require('../controllers/authController');
const { protect } = require('../middlewares/authMiddleware');
const { conditionalUpload } = require('../middlewares/upload');

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: 'Too many authentication attempts from this IP, please try again after 15 minutes.',
  standardHeaders: true,
  legacyHeaders: false,
});

router.post('/register', authLimiter, conditionalUpload, registerUser);

router.post('/login', authLimiter, loginUser);

router.post('/forgot-password', authLimiter, forgotPassword);

router.post('/reset-password/:token', authLimiter, resetPassword);

router.post('/google-login', googleLogin);
router.put('/update-profile', protect, conditionalUpload, updateProfile);

module.exports = router;

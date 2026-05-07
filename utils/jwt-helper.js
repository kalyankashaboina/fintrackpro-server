// src/utils/jwt-helper.js
const jwt = require('jsonwebtoken');

// Generates both access and refresh tokens
const generateTokens = (user) => {
  const accessToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_ACCESS_EXPIRATION,
  });

  const refreshToken = jwt.sign({ id: user._id }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRATION,
  });

  return { accessToken, refreshToken };
};

const verifyAccessToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    return null;
  }
};

const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
  } catch (error) {
    return null;
  }
};

const sendRefreshToken = (res, token) => {
  res.cookie('refreshToken', token, {
    httpOnly: true, // Prevents client-side JS from accessing the cookie
    secure: process.env.NODE_ENV === 'production', // Only transmit over HTTPS
    sameSite: 'strict', // Mitigates Cross-Site Request Forgery attacks
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days (must match refresh token expiry)
  });
};

const validatePassword = (password) => {
  const errors = [];
  if (password.length < 8) errors.push('Must be at least 8 characters long.');
  if (!/[a-z]/.test(password)) errors.push('Must contain at least one lowercase letter.');
  if (!/[A-Z]/.test(password)) errors.push('Must contain at least one uppercase letter.');
  if (!/\d/.test(password)) errors.push('Must contain at least one number.');
  return { isValid: errors.length === 0, errors };
};

module.exports = {
  generateTokens,
  verifyAccessToken,
  verifyRefreshToken,
  sendRefreshToken,
  validatePassword,
};

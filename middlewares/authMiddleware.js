const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

const protect = async (req, res, next) => {
  let token = req.headers.authorization;

  // Log to check if authorization header is present
  // console.log('Authorization header:', req.headers.authorization);

  if (!token || !token.startsWith('Bearer ')) {
    // console.log('Token missing or malformed');
    return res.status(401).json({ message: 'Not authorized, token missing' });
  }

  token = token.split(' ')[1]; // Get the token from the "Bearer <token>" format

  // Log the token value to verify it
  // console.log('Extracted Token:', token);

  try {
    // Decode the token using the secret key
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // console.log('Decoded JWT:', decoded);  // Log the decoded token to see the payload

    // Find the user based on the decoded ID
    req.user = await User.findById(decoded.id).select('-password');

    // Log to see the user data fetched
    // console.log('User fetched from database:', req.user);

    if (!req.user) {
      // console.log('User not found');
      return res.status(401).json({ message: 'Not authorized, user not found' });
    }

    next(); // If everything is fine, proceed to the next middleware
  } catch (error) {
    console.error('Error in token verification:', error);
    res.status(401).json({ message: 'Not authorized, token invalid' });
  }
};

module.exports = { protect };

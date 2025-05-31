// config/cloudinary.config.js
const cloudinary = require('cloudinary').v2;
require('dotenv').config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,   // Cloudinary Cloud Name
  api_key: process.env.CLOUDINARY_API_KEY,         // Cloudinary API Key
  api_secret: process.env.CLOUDINARY_API_SECRET,   // Cloudinary API Secret
});

module.exports = cloudinary;

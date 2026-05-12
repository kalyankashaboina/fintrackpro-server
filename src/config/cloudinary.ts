import { v2 as cloudinary } from 'cloudinary';
import { env } from './env.js';
import logger from './logger.js';

const isConfigured =
  env.CLOUDINARY_CLOUD_NAME &&
  env.CLOUDINARY_CLOUD_NAME !== 'your-cloudinary-cloud-name' &&
  env.CLOUDINARY_API_KEY &&
  env.CLOUDINARY_API_SECRET;

if (isConfigured) {
  cloudinary.config({
    cloud_name: env.CLOUDINARY_CLOUD_NAME,
    api_key: env.CLOUDINARY_API_KEY,
    api_secret: env.CLOUDINARY_API_SECRET,
    secure: true,
  });
  logger.info('Cloudinary configured');
} else {
  logger.warn('Cloudinary not configured — image uploads disabled in dev. Set CLOUDINARY_* in .env to enable.');
}

export const cloudinaryEnabled = !!isConfigured;
export default cloudinary;

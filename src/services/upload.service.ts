import cloudinary, { cloudinaryEnabled } from '../config/cloudinary.js';
import logger from '../config/logger.js';
import { ValidationError } from '../utils/errors.util.js';

class UploadService {
  async uploadImage(file: Express.Multer.File, folder = 'fintrackpro'): Promise<string> {
    if (!cloudinaryEnabled) {
      logger.warn('Cloudinary not configured — returning placeholder image URL');
      return `https://api.dicebear.com/7.x/initials/svg?seed=${Date.now()}`;
    }
    try {
      const result = await new Promise<{ secure_url: string }>((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder, resource_type: 'image' },
          (error, result) => {
            if (error || !result) reject(error ?? new Error('Upload failed'));
            else resolve(result);
          }
        );
        stream.end(file.buffer);
      });
      logger.info({ url: result.secure_url }, 'Image uploaded');
      return result.secure_url;
    } catch (error) {
      logger.error({ err: error }, 'Image upload failed');
      throw new ValidationError('Image upload failed');
    }
  }

  async deleteImage(publicId: string): Promise<void> {
    if (!cloudinaryEnabled) return;
    try {
      await cloudinary.uploader.destroy(publicId);
    } catch (error) {
      logger.warn({ err: error, publicId }, 'Image delete failed (non-fatal)');
    }
  }
}

export default new UploadService();

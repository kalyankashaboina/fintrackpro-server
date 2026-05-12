import multer, { FileFilterCallback } from 'multer';
import { Request, Response, NextFunction } from 'express';
import { ValidationError } from '../utils/errors.util.js';

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE = 5 * 1024 * 1024;

const storage = multer.memoryStorage();

const imageFileFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback
): void => {
  if (ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new ValidationError('Only .jpg, .jpeg, .png, and .webp files are allowed'));
  }
};

export const uploadProfileImage = multer({
  storage,
  fileFilter: imageFileFilter,
  limits: { fileSize: MAX_FILE_SIZE, files: 1 },
}).single('profileImage');

export const uploadReceipt = multer({
  storage,
  fileFilter: imageFileFilter,
  limits: { fileSize: MAX_FILE_SIZE, files: 5 },
}).array('receipts', 5);

export function handleMulterError(error: multer.MulterError | Error, _req: Request, _res: Response, next: NextFunction): void {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') throw new ValidationError('File size exceeds 5MB limit');
    if (error.code === 'LIMIT_FILE_COUNT') throw new ValidationError('Too many files uploaded');
    if (error.code === 'LIMIT_UNEXPECTED_FILE') throw new ValidationError('Unexpected file field');
    throw new ValidationError(error.message);
  }
  next(error);
}

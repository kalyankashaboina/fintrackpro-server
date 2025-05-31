const multer = require('multer');

// In-memory storage
const storage = multer.memoryStorage();

// File filter (optional)
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only .jpg, .jpeg, and .png files are allowed'), false);
  }
};

const upload = multer({ storage, fileFilter });

module.exports = upload;

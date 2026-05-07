const sharp = require('sharp');
const path = require('path');

// Resize image to fit within 1000px width and reduce quality to ~80% to reduce file size
const resizeImage = async (filePath) => {
  const resizedFilePath = filePath.replace(path.extname(filePath), '-resized.jpg');

  // Resize the image
  await sharp(filePath)
    .resize(1000) // Resize to max width of 1000px (can be adjusted as needed)
    .toFormat('jpeg')
    .jpeg({ quality: 80 }) // Reduce quality to ~80%
    .toFile(resizedFilePath);

  return resizedFilePath;
};

module.exports = resizeImage;

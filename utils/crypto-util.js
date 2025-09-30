// src/utils/crypto-util.js

const crypto = require('crypto');

// Safety check
if (!process.env.ENCRYPTION_KEY) {
  throw new Error('FATAL ERROR: ENCRYPTION_KEY is not defined in the environment variables.');
}

const ALGORITHM = 'aes-256-cbc';
const ENCRYPTION_KEY = Buffer.from(process.env.ENCRYPTION_KEY, 'hex'); 
const IV_LENGTH = 16; 

function encrypt(text) {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
  let encrypted = cipher.update(String(text)); // Ensure text is a string
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
}

function decrypt(text) {
  try {
    // --- THIS IS THE FIX ---
    // If the text doesn't contain a ':', it's old, unencrypted data.
    if (typeof text !== 'string' || !text.includes(':')) {
      return text; // Return the plain number or original string.
    }

    const textParts = text.split(':');
    const iv = Buffer.from(textParts.shift(), 'hex');
    const encryptedText = Buffer.from(textParts.join(':'), 'hex');
    const decipher = crypto.createDecipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
  } catch (error) {
    console.error("Decryption failed:", error);
    return null; 
  }
}

module.exports = { encrypt, decrypt };
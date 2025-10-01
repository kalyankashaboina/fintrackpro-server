// utils/logger.js

const winston = require('winston');
require('winston-mongodb'); // Important: register MongoDB transport

// MongoDB connection string (use environment variable in production)
const MONGO_URI = process.env.MONGO_URI || 'your-mongodb-atlas-uri';

// Define log format
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message }) => {
    return `[${timestamp}] ${level.toUpperCase()}: ${message}`;
  })
);

// Create logger
const logger = winston.createLogger({
  level: 'info',
  format: logFormat,
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),

    // Add MongoDB transport
    new winston.transports.MongoDB({
      level: 'info',
      db: MONGO_URI,
      collection: 'fintrackpro-logs',
      format: winston.format.metadata(),
    }),
  ],
});

module.exports = logger;

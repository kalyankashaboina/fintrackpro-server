import mongoose from 'mongoose';
import { env } from './env.js';
import logger from './logger.js';

export async function connectDatabase(): Promise<void> {
  try {
    const conn = await mongoose.connect(env.MONGODB_URI);
    
    logger.info({
      msg: 'MongoDB connected successfully',
      host: conn.connection.host,
      database: conn.connection.name,
    });

    // Handle connection events
    mongoose.connection.on('error', (error) => {
      logger.error({ err: error }, 'MongoDB connection error');
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected');
    });

    // Graceful shutdown
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      logger.info('MongoDB connection closed through app termination');
      process.exit(0);
    });
  } catch (error) {
    logger.error({ err: error }, 'Failed to connect to MongoDB');
    process.exit(1);
  }
}

export default connectDatabase;

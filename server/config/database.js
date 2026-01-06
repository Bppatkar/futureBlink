import mongoose from 'mongoose';
import logger from '../utils/logger.js';
import config from './config.js'; 

const connectDB = async () => {
  try {
    if (!config.mongodbUri) {
      throw new Error('MONGODB_URI environment variable is not set');
    }

    const conn = await mongoose.connect(config.mongodbUri);

    logger.info(`✅ MongoDB connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    logger.error(`❌ MongoDB connection failed: ${error.message}`, { error });
    process.exit(1);
  }
};

export default connectDB;
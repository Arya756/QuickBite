import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

export const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      console.warn('MONGODB_URI not found in environment variables. Using local fallback.');
    }
    const conn = await mongoose.connect(uri || 'mongodb://localhost:27017/quickbite');
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    if (error instanceof Error) {
      console.error(`MongoDB Connection Error: ${error.message}`);
    } else {
      console.error('An unknown error occurred during database connection');
    }
    // We don't exit here so the server can still run, 
    // but DB operations will fail until connection is fixed.
  }
};

import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from the directory where this file is located
// so the backend works regardless of the current working directory.
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const config = {
  server: {
    port: parseInt(process.env.PORT || '5000', 10),
    nodeEnv: process.env.NODE_ENV || 'development',
    clientUrl: process.env.CLIENT_URL || 'http://localhost:3000'
  },
  database: {
    uri: process.env.MONGODB_URI!,
    options: {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      retryWrites: true
    }
  }
};

export default config;

import mongoose from 'mongoose';
import { app } from './app';
import { config } from './config/index';

const PORT = config.port;

/**
 * Connect to MongoDB
 */
async function connectDB(): Promise<void> {
  try {
    console.log('Mongo URI in use:', config.mongo.uri);
    await mongoose.connect(config.mongo.uri);
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
}

/**
 * Start the server
 */
async function startServer(): Promise<void> {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`
🚀 StoryForge API Server
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📡 Server:      http://localhost:${PORT}
🔗 API:         http://localhost:${PORT}/api
🏥 Health:      http://localhost:${PORT}/api/health
🌍 Environment: ${config.nodeEnv}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    `);
  });
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  await mongoose.connection.close();
  process.exit(0);
});

// Start the server
startServer();

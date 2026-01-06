import config from './config/config.js';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import logger from './utils/logger.js';
import connectDB from './config/database.js';
import aiRoutes from './routes/aiRouter.js';
import saveRoutes from './routes/saveRouter.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';

const app = express();
const PORT = config.port;

// Security Middleware
app.use(helmet());
app.use(
  cors({
    origin: config.clientUrl,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Body Parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check (required for deployment)
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'FutureBlink AI Server is running',
    timestamp: new Date().toISOString(),
  });
});

// API Routes 
app.use('/api', aiRoutes);    
app.use('/api', saveRoutes);  

// Error Handling
app.use(notFound);
app.use(errorHandler);

// Server Startup
const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      logger.info(`🚀 FutureBlink API Server running on port ${PORT}`);
      logger.info(`📝 Health check: http://localhost:${PORT}/api/health`);
    });
  } catch (error) {
    logger.error(`❌ Failed to start server: ${error.message}`);
    process.exit(1);
  }
};

startServer();
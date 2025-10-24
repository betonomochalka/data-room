import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

import { errorHandler } from './middleware/errorHandler';
import { authRoutes } from './routes/auth';
import { dataRoomRoutes } from './routes/dataRooms';
import { folderRoutes } from './routes/folders';
import { fileRoutes } from './routes/files';
import { corsConfig } from './config/cors';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
console.log('🔧 [CORS] Environment:', process.env.NODE_ENV || 'development');
console.log('🔧 [CORS] Current allowed origins:', corsConfig.origin);
// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
});

// Middleware
app.use(helmet());

// Manual CORS headers as fallback
app.use(cors(corsConfig));
app.use(morgan('combined'));
app.use(limiter);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/data-rooms', dataRoomRoutes);
app.use('/api/folders', folderRoutes);
app.use('/api/files', fileRoutes);

// Health check
app.get('/api/health', (req, res) => {
  console.log('[HEALTH] Health check requested');
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Root health check
app.get('/', (req, res) => {
  console.log('[ROOT] Root endpoint hit');
  res.status(200).json({ 
    message: 'Backend server is running!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Simple test endpoint
app.get('/api/test', (req, res) => {
  console.log(`[TEST] Simple test endpoint hit`);
  res.status(200).json({ 
    message: 'Backend is working!',
    timestamp: new Date().toISOString()
  });
});

// Handle preflight requests explicitly for all routes
app.options('*', (req, res) => {
  console.log(`[CORS] Handling preflight request for ${req.originalUrl}`);
  console.log(`[CORS] Origin: ${req.headers.origin}`);
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.status(200).end();
});

// Error handling
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Route not found',
    path: req.originalUrl 
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🔗 Root endpoint: http://localhost:${PORT}/`);
  console.log(`🔗 CORS test: http://localhost:${PORT}/api/cors-test`);
  console.log(`🔗 Auth endpoint: http://localhost:${PORT}/api/auth/login`);
});

// Export removed to prevent Vercel from detecting this as a serverless function
// This file is only for local development

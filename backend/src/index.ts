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

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const allowedOrigins = [
  'https://data-room-196e.vercel.app', 
  'http://localhost:3000'
];
// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
});

// Middleware
app.use(helmet());
// CORS configuration with debugging
app.use(cors({
  origin: function (origin, callback) {
    console.log(`[CORS] Request from origin: ${origin}`);
    console.log(`[CORS] Allowed origins: ${JSON.stringify(allowedOrigins)}`);
    
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) {
      console.log(`[CORS] No origin provided, allowing request`);
      return callback(null, true);
    }
    
    if (allowedOrigins.includes(origin)) {
      console.log(`[CORS] Origin ${origin} is allowed`);
      return callback(null, true);
    } else {
      console.log(`[CORS] Origin ${origin} not allowed`);
      return callback(new Error(`CORS policy does not allow access from origin ${origin}`), false);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  optionsSuccessStatus: 200,
}));
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
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// CORS test endpoint
app.get('/api/cors-test', (req, res) => {
  console.log(`[CORS-TEST] Request from origin: ${req.headers.origin}`);
  res.status(200).json({ 
    message: 'CORS is working!',
    origin: req.headers.origin,
    timestamp: new Date().toISOString()
  });
});

// Handle preflight requests explicitly
app.options('/api/*', (req, res) => {
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
});

export default app;

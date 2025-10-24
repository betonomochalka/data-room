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
// Environment-based CORS configuration
const allowedOrigins = process.env.NODE_ENV === 'production' 
  ? [
      'https://data-room-196e.vercel.app',
      'https://data-room-seven.vercel.app'
    ]
  : [
      'http://localhost:3000',
      'http://localhost:3001',
      'https://data-room-196e.vercel.app',
      'https://data-room-seven.vercel.app'
    ];

console.log('🔧 [CORS] Current allowed origins:', allowedOrigins);
console.log('🔧 [CORS] Environment:', process.env.NODE_ENV || 'development');
// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
});

// Middleware
app.use(helmet());

// Manual CORS headers as fallback
app.use((req, res, next) => {
  const origin = req.headers.origin;
  console.log(`[CORS-FALLBACK] Request from origin: ${origin}`);
  
  if (origin && allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
    console.log(`[CORS-FALLBACK] Origin ${origin} allowed`);
  } else if (!origin) {
    // Allow requests with no origin (like mobile apps or curl)
    res.header('Access-Control-Allow-Origin', '*');
    console.log(`[CORS-FALLBACK] No origin provided, allowing with *`);
  } else {
    console.log(`[CORS-FALLBACK] Origin ${origin} not in allowed list`);
  }
  
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin');
  
  if (req.method === 'OPTIONS') {
    console.log(`[CORS-FALLBACK] Handling OPTIONS request for ${req.originalUrl}`);
    return res.sendStatus(200);
  }
  
  return next();
});

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

// CORS test endpoint
app.get('/api/cors-test', (req, res) => {
  console.log(`[CORS-TEST] Request from origin: ${req.headers.origin}`);
  console.log(`[CORS-TEST] Request headers:`, req.headers);
  res.status(200).json({ 
    message: 'CORS is working!',
    origin: req.headers.origin,
    allowedOrigins: allowedOrigins,
    timestamp: new Date().toISOString()
  });
});

// CORS debug endpoint
app.get('/api/cors-debug', (req, res) => {
  console.log(`[CORS-DEBUG] Full request details:`, {
    origin: req.headers.origin,
    method: req.method,
    url: req.url,
    headers: req.headers
  });
  res.status(200).json({ 
    message: 'CORS Debug Info',
    requestOrigin: req.headers.origin,
    allowedOrigins: allowedOrigins,
    isOriginAllowed: req.headers.origin ? allowedOrigins.includes(req.headers.origin) : false,
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString()
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

export default app;

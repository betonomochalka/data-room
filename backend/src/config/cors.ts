// Centralized CORS configuration
export const corsConfig = {
  origin: process.env.NODE_ENV === 'production' 
    ? [
        'https://data-room-196e.vercel.app',
        'https://data-room-seven.vercel.app'
      ]
    : [
        'http://localhost:3000',
        'http://localhost:3001',
        'https://data-room-196e.vercel.app',
        'https://data-room-seven.vercel.app'
      ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
};

// Function to set CORS headers for Vercel API functions
export const setCorsHeaders = (res: any, origin?: string) => {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  
  // Use corsConfig.origin if origin is allowed, otherwise use '*'
  const allowedOrigin = corsConfig.origin.includes(origin || '') ? origin : '*';
  res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
  
  res.setHeader('Access-Control-Allow-Methods', corsConfig.methods.join(', '));
  res.setHeader('Access-Control-Allow-Headers', corsConfig.allowedHeaders.join(', '));
};

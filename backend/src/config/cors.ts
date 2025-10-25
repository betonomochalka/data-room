// Centralized CORS configuration for Vercel Serverless Functions
export const corsConfig = {
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.ALLOWED_ORIGINS?.split(',') || ['https://data-room-196e.vercel.app']
    : ['*'],
  methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Origin', 'X-Requested-With', 'Accept'],
  credentials: true,
};

// Set CORS headers for Vercel API functions
export const setCorsHeaders = (res: any, origin?: string) => {
  // Allow specific frontend domain
  const allowedOrigins = [
    'https://data-room-196e.vercel.app',
    'http://localhost:3000', // For local development
  ];
  
  const requestOrigin = origin || '';
  const allowedOrigin = allowedOrigins.includes(requestOrigin) 
    ? requestOrigin 
    : allowedOrigins[0];
  
  // Set all required CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
  res.setHeader('Access-Control-Allow-Methods', corsConfig.methods.join(', '));
  res.setHeader('Access-Control-Allow-Headers', corsConfig.allowedHeaders.join(', '));
  res.setHeader('Access-Control-Max-Age', '86400'); // Cache preflight for 24 hours
};

// Handle preflight OPTIONS requests
export const handlePreflight = (req: any, res: any) => {
  // Set CORS headers for preflight
  setCorsHeaders(res, req.headers.origin);
  
  // Return 200 OK for OPTIONS preflight
  res.status(200).end();
};

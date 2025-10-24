// Centralized CORS configuration - Simplified for Vercel
// Note: Main CORS headers are now handled by vercel.json
export const corsConfig = {
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.ALLOWED_ORIGINS?.split(',') || ['*']
    : ['*'],
  methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Origin', 'X-Requested-With', 'Accept'],
};

// Simplified CORS headers function for Vercel API functions
// Main CORS headers are handled by vercel.json, this is for additional headers if needed
export const setCorsHeaders = (res: any, origin?: string) => {
  // Allow specific frontend domain
  const allowedOrigins = [
    'https://data-room-196e.vercel.app',
  ];
  
  const requestOrigin = origin || '';
  const allowedOrigin = allowedOrigins.includes(requestOrigin) ? requestOrigin : allowedOrigins[0];
  
  res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
  res.setHeader('Access-Control-Allow-Methods', corsConfig.methods.join(', '));
  res.setHeader('Access-Control-Allow-Headers', corsConfig.allowedHeaders.join(', '));
};

// Handle preflight requests - Simplified for Vercel
export const handlePreflight = (req: any, res: any) => {
  // Vercel.json handles most CORS headers, just return success
  res.status(200).end();
};

// Centralized CORS configuration - Vercel only
export const corsConfig = {
  origin: [
    'https://data-room-196e.vercel.app',
    'https://data-room-seven.vercel.app'
  ]
};

// Function to set CORS headers for Vercel API functions
export const setCorsHeaders = (res: any, origin?: string) => {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  
  // Use corsConfig.origin if origin is allowed, otherwise use '*'
  const allowedOrigin = corsConfig.origin.includes(origin || '') ? origin : '*';
  res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
  
  // Use default CORS headers
  res.setHeader('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
};

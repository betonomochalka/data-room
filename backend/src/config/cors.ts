// Centralized CORS configuration - Simplified for Vercel
// Note: Main CORS headers are now handled by vercel.json
export const corsConfig = {
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.ALLOWED_ORIGINS?.split(',') || ['*']
    : ['*'],
  methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Origin', 'X-Requested-With', 'Accept'],
  credentials: true
};

// Simplified CORS headers function for Vercel API functions
// Main CORS headers are handled by vercel.json, this is for additional headers if needed
export const setCorsHeaders = (res: any, origin?: string) => {
  // Vercel.json handles main CORS headers, this is for any additional headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', corsConfig.methods.join(', '));
  res.setHeader('Access-Control-Allow-Headers', corsConfig.allowedHeaders.join(', '));
  res.setHeader('Access-Control-Allow-Credentials', 'true');
};

// Handle preflight requests - Simplified for Vercel
export const handlePreflight = (req: any, res: any) => {
  // Vercel.json handles most CORS headers, just return success
  res.status(200).end();
};

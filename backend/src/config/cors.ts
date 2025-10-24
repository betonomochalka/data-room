// Centralized CORS configuration - Allow all origins temporarily
export const corsConfig = {
  origin: '*'
};

// Function to set CORS headers for Vercel API functions
export const setCorsHeaders = (res: any, origin?: string) => {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  
  // Allow all origins temporarily
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  // Use default CORS headers
  res.setHeader('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
};

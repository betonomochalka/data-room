import { VercelRequest, VercelResponse } from '@vercel/node';

// Inline CORS headers function
const setCorsHeaders = (res: VercelResponse) => {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
};

export default function handler(req: VercelRequest, res: VercelResponse) {
  console.log('[HEALTH] Health endpoint called');
  console.log('[HEALTH] Request method:', req.method);
  console.log('[HEALTH] Request URL:', req.url);
  
  // Set CORS headers
  setCorsHeaders(res);
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  return res.json({ 
    status: 'OK', 
    message: 'Backend is working!',
    timestamp: new Date().toISOString(),
    endpoint: 'health'
  });
}
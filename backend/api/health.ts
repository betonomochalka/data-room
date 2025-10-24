import { VercelRequest, VercelResponse } from '@vercel/node';
import { setCorsHeaders } from '../../src/config/cors';

export default function handler(req: VercelRequest, res: VercelResponse) {
  console.log('[HEALTH] Health endpoint called');
  console.log('[HEALTH] Request method:', req.method);
  console.log('[HEALTH] Request URL:', req.url);
  
  // Set CORS headers from centralized config
  setCorsHeaders(res, req.headers.origin as string);
  
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
import { VercelRequest, VercelResponse } from '@vercel/node';
import { setCorsHeaders } from '../../src/config/cors';

export default function handler(req: VercelRequest, res: VercelResponse) {
  console.log('[TEST] Test endpoint called');
  console.log('[TEST] Request method:', req.method);
  console.log('[TEST] Request URL:', req.url);
  
  // Set CORS headers from centralized config
  setCorsHeaders(res, req.headers.origin as string);
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  return res.json({ 
    message: 'Test endpoint is working!',
    timestamp: new Date().toISOString(),
    endpoint: 'test'
  });
}

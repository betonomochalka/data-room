import { VercelRequest, VercelResponse } from '@vercel/node';
import { setCorsHeaders } from '../../src/config/cors';

export default function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers from centralized config
  setCorsHeaders(res, req.headers.origin as string);
  return res.json({ 
    message: 'API root is working',
    timestamp: new Date().toISOString()
  });
}
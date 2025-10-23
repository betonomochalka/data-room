import { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
  console.log('[HEALTH] Health endpoint called');
  console.log('[HEALTH] Request method:', req.method);
  console.log('[HEALTH] Request URL:', req.url);
  
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  res.json({ 
    status: 'OK', 
    message: 'Backend is working!',
    timestamp: new Date().toISOString(),
    endpoint: 'health'
  });
}
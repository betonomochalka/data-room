import { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
  console.log('[TEST] Test endpoint called');
  console.log('[TEST] Request method:', req.method);
  console.log('[TEST] Request URL:', req.url);
  
  // Set CORS headers for all origins
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  return res.json({ 
    message: 'Test endpoint is working!',
    timestamp: new Date().toISOString(),
    endpoint: 'test'
  });
}

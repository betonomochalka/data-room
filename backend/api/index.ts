import { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  return res.json({ 
    message: 'API root is working',
    timestamp: new Date().toISOString()
  });
}
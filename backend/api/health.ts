import { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.json({ 
    status: 'OK', 
    message: 'Backend is working!',
    timestamp: new Date().toISOString()
  });
}
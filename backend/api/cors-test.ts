import { VercelRequest, VercelResponse } from '@vercel/node';

const allowedOrigins = process.env.NODE_ENV === 'production' 
  ? [
      'https://data-room-196e.vercel.app',
      'https://data-room-seven.vercel.app'
    ]
  : [
      'http://localhost:3000',
      'http://localhost:3001',
      'https://data-room-196e.vercel.app',
      'https://data-room-seven.vercel.app'
    ];

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  console.log(`[CORS-TEST] Request from origin: ${req.headers.origin}`);
  console.log(`[CORS-TEST] Request headers:`, req.headers);
  
  return res.status(200).json({ 
    message: 'CORS is working!',
    origin: req.headers.origin,
    allowedOrigins: allowedOrigins,
    timestamp: new Date().toISOString()
  });
}

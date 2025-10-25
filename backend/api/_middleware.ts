import { VercelRequest, VercelResponse } from '@vercel/node';

// CORS middleware that ALWAYS runs, even on errors
export function withCORS(handler: (req: VercelRequest, res: VercelResponse) => Promise<void>) {
  return async (req: VercelRequest, res: VercelResponse) => {
    // Set CORS headers FIRST, before anything else
    const allowedOrigins = [
      'https://data-room-196e.vercel.app',
      'http://localhost:3000',
    ];
    
    const origin = req.headers.origin || '';
    const allowedOrigin = allowedOrigins.includes(origin) 
      ? origin 
      : allowedOrigins[0];
    
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
    res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, PUT, PATCH, POST, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin');
    res.setHeader('Access-Control-Max-Age', '86400');
    
    // Handle preflight
    if (req.method === 'OPTIONS') {
      res.status(200).end();
      return;
    }
    
    // Run the actual handler with error catching
    try {
      await handler(req, res);
    } catch (error) {
      console.error('API Error:', error);
      
      // Ensure CORS headers are set even on error
      res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
      res.setHeader('Access-Control-Allow-Credentials', 'true');
      
      if (!res.headersSent) {
        res.status(500).json({
          error: 'Internal server error',
          message: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
  };
}


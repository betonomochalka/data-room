# CORS Fix for Vercel Deployment

## ❌ The Problem

**Error**: 
```
Access to XMLHttpRequest at 'https://data-room-seven.vercel.app/api/...' 
from origin 'https://data-room-196e.vercel.app' has been blocked by CORS policy: 
Response to preflight request doesn't pass access control check
```

### Root Cause:
The `backend/vercel.json` had **conflicting CORS configuration**:
- ❌ `Access-Control-Allow-Origin: "*"` (wildcard)
- ❌ `Access-Control-Allow-Credentials: "true"`

**This is FORBIDDEN!** When using `credentials: true`, you CANNOT use wildcard `*` for origin.

---

## ✅ The Solution

### 1. Fixed `backend/vercel.json`
**Removed** the routes section with conflicting CORS headers. Let each API function handle CORS dynamically.

**Before**:
```json
{
  "routes": [
    {
      "headers": {
        "Access-Control-Allow-Origin": "*",  // ❌ CONFLICT!
        "Access-Control-Allow-Credentials": "true"
      }
    }
  ]
}
```

**After**:
```json
{
  "version": 2,
  "functions": {
    "api/*.ts": {
      "maxDuration": 30
    }
  }
}
```

### 2. Fixed `backend/src/config/cors.ts`
Updated to properly handle CORS headers in each API function:

**Key Changes**:
- ✅ Added `Access-Control-Allow-Credentials: true` header
- ✅ Added `Access-Control-Max-Age` to cache preflight responses
- ✅ Dynamic origin checking (allows specific origins only)
- ✅ Proper OPTIONS preflight handling with 200 status

**New Implementation**:
```typescript
export const setCorsHeaders = (res: any, origin?: string) => {
  const allowedOrigins = [
    'https://data-room-196e.vercel.app',
    'http://localhost:3000',
  ];
  
  const requestOrigin = origin || '';
  const allowedOrigin = allowedOrigins.includes(requestOrigin) 
    ? requestOrigin 
    : allowedOrigins[0];
  
  // Set all required CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
  res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, PUT, PATCH, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Origin, X-Requested-With, Accept');
  res.setHeader('Access-Control-Max-Age', '86400'); // Cache for 24 hours
};

export const handlePreflight = (req: any, res: any) => {
  setCorsHeaders(res, req.headers.origin);
  res.status(200).end(); // ✅ Must return 200 for OPTIONS
};
```

### 3. Verified All API Routes
All API functions already properly use:
- ✅ `setCorsHeaders(res, req.headers.origin)` - at the start
- ✅ `handlePreflight(req, res)` - for OPTIONS requests

**Example** (all API files follow this pattern):
```typescript
export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCorsHeaders(res, req.headers.origin); // ✅ Set CORS headers
  
  if (req.method === 'OPTIONS') {
    handlePreflight(req, res); // ✅ Handle preflight
    return;
  }
  
  // ... rest of the API logic
}
```

---

## 🚀 Deploy the Fix

```bash
# 1. Stage the fixed files
git add backend/vercel.json backend/src/config/cors.ts

# 2. Commit
git commit -m "Fix CORS for Vercel - remove conflicting headers"

# 3. Deploy
git push origin main
```

---

## 🧪 Test After Deployment

1. **Open your frontend**: https://data-room-196e.vercel.app
2. **Open browser DevTools** → Network tab
3. **Sign in with Google**
4. **Check the network requests**:
   - Look for OPTIONS preflight requests
   - They should return **200 OK** ✅
   - Headers should include:
     - `Access-Control-Allow-Origin: https://data-room-196e.vercel.app`
     - `Access-Control-Allow-Credentials: true`
     - `Access-Control-Allow-Methods: ...`

5. **API requests should work** without CORS errors!

---

## 📚 Why This Works

### The CORS Flow:
1. **Browser sends OPTIONS preflight** → Backend returns 200 with CORS headers ✅
2. **Browser checks headers** → Origin matches, credentials allowed ✅
3. **Browser sends actual request** → Backend processes with CORS headers ✅

### Key Rules:
- ✅ `credentials: true` requires **specific origin** (not `*`)
- ✅ OPTIONS requests must return **200 status**
- ✅ All responses need **proper CORS headers**
- ✅ Origin must be **explicitly allowed**

---

## 🔧 Troubleshooting

### If CORS still fails after deployment:

1. **Clear browser cache** (hard refresh: Ctrl+Shift+R)
2. **Check Vercel logs**:
   - Go to Vercel Dashboard → Backend project
   - Click on latest deployment
   - Check Function logs for errors

3. **Verify OPTIONS request**:
   - Open DevTools → Network
   - Look for OPTIONS request
   - Check response status (should be 200)
   - Check response headers

4. **Check environment variables**:
   - Ensure `ALLOWED_ORIGINS` is set (if used)
   - Verify frontend URL is correct

---

## ✅ What Changed

| File | Change | Why |
|------|--------|-----|
| `backend/vercel.json` | Removed routes/CORS headers | Conflicting wildcard + credentials |
| `backend/src/config/cors.ts` | Added credentials header | Required for auth tokens |
| `backend/src/config/cors.ts` | Fixed preflight handler | Must return 200 for OPTIONS |
| All API files | Already correct | Using setCorsHeaders properly |

---

## 📖 References

- [Vercel CORS Guide](https://vercel.com/guides/how-to-enable-cors)
- [MDN CORS Documentation](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)
- [MDN Preflight Requests](https://developer.mozilla.org/en-US/docs/Glossary/Preflight_request)

---

**Your CORS issue should now be fixed!** 🎉


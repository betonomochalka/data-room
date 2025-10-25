# Vercel Deployment Guide

This project is designed to run entirely on Vercel - NO local servers needed!

## 📋 Prerequisites

Before deploying, ensure you have:
- ✅ [Vercel account](https://vercel.com) (free tier works)
- ✅ [Supabase project](https://supabase.com) set up
- ✅ Google OAuth credentials configured
- ✅ Git repository connected to Vercel

---

## 🚀 Quick Start: Deploy Your Project

### Step 1: Deploy Backend to Vercel

1. **Connect Backend to Vercel**:
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click **"Add New..."** → **"Project"**
   - Import your Git repository
   - Select the **backend** folder as the root directory

2. **Configure Backend Build Settings**:
   - **Framework Preset**: Other
   - **Root Directory**: `backend`
   - **Build Command**: `npm install && npx prisma generate && npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

3. **Add Backend Environment Variables**:
   
   Go to **Settings** → **Environment Variables** and add:

   ```env
   # Database (Use DIRECT connection - port 5432)
   DATABASE_URL=postgresql://postgres.YOUR_PROJECT_REF:YOUR_PASSWORD@aws-0-us-east-1.pooler.supabase.com:5432/postgres
   
   # JWT Secret (generate random string)
   JWT_SECRET=your-super-secret-jwt-key-make-it-long-and-random
   
   # Supabase
   SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
   SUPABASE_SERVICE_KEY=your-supabase-service-role-key
   
   # Node Environment
   NODE_ENV=production
   
   # CORS (will update after frontend deployment)
   ALLOWED_ORIGINS=https://your-frontend-domain.vercel.app
   ```

4. **Deploy Backend**:
   - Click **"Deploy"**
   - Wait for deployment to complete
   - Copy your backend URL (e.g., `https://your-backend.vercel.app`)

---

### Step 2: Deploy Frontend to Vercel

1. **Connect Frontend to Vercel**:
   - In Vercel Dashboard, click **"Add New..."** → **"Project"**
   - Import the same Git repository
   - Select the **frontend** folder as the root directory

2. **Configure Frontend Build Settings**:
   - **Framework Preset**: Create React App
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`
   - **Install Command**: `npm install`

3. **Add Frontend Environment Variables**:
   
   Go to **Settings** → **Environment Variables** and add:

   ```env
   # Backend API (use your backend URL from Step 1)
   REACT_APP_API_URL=https://your-backend.vercel.app/api
   
   # Supabase (for Google OAuth)
   REACT_APP_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
   REACT_APP_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```

4. **Deploy Frontend**:
   - Click **"Deploy"**
   - Wait for deployment to complete
   - Copy your frontend URL (e.g., `https://your-frontend.vercel.app`)

---

### Step 3: Update CORS Configuration

1. Go back to your **Backend** project in Vercel
2. Go to **Settings** → **Environment Variables**
3. Update `ALLOWED_ORIGINS` with your frontend URL:
   ```
   ALLOWED_ORIGINS=https://your-frontend.vercel.app
   ```
4. **Redeploy** the backend (Vercel → Deployments → click ⋯ → Redeploy)

---

### Step 4: Update Google OAuth Redirect URIs

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to **APIs & Services** → **Credentials**
3. Click your OAuth 2.0 Client ID
4. Add your production URLs to **Authorized redirect URIs**:
   ```
   https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback
   https://your-frontend.vercel.app
   ```
5. Click **"Save"**

---

## ✅ Testing Your Deployment

1. Open your frontend URL: `https://your-frontend.vercel.app`
2. Click **"Sign in with Google"**
3. Complete Google authentication
4. You should be redirected to the dashboard
5. Test creating data rooms, folders, and uploading files

---

## 🔄 How to Update Your Project

### Option 1: Push to Git (Automatic Deployment)
```bash
git add .
git commit -m "Your changes"
git push origin main
```
Vercel will automatically detect the push and redeploy both projects.

### Option 2: Manual Redeploy in Vercel
1. Go to Vercel Dashboard
2. Select your project
3. Go to **Deployments** tab
4. Click **⋯** on latest deployment → **Redeploy**

---

## 📝 Environment Variables Reference

### Backend Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | Supabase PostgreSQL connection (port **5432** for production) | `postgresql://postgres.xxx:pass@aws-0-us-east-1.pooler.supabase.com:5432/postgres` |
| `JWT_SECRET` | Secret key for JWT token signing (min 32 chars) | Generate with: `openssl rand -base64 32` |
| `SUPABASE_URL` | Your Supabase project URL | `https://xxx.supabase.co` |
| `SUPABASE_SERVICE_KEY` | Supabase service role key (from Settings → API) | `eyJhbGciOiJ...` |
| `NODE_ENV` | Environment mode | `production` |
| `ALLOWED_ORIGINS` | Frontend URL for CORS | `https://your-frontend.vercel.app` |

### Frontend Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `REACT_APP_API_URL` | Backend API endpoint | `https://your-backend.vercel.app/api` |
| `REACT_APP_SUPABASE_URL` | Supabase project URL | `https://xxx.supabase.co` |
| `REACT_APP_SUPABASE_ANON_KEY` | Supabase anonymous key | `eyJhbGciOiJ...` |

---

## 🐛 Troubleshooting

### Backend Issues

**❌ Error: "Can't reach database server"**
- ✅ **Fix**: Use port **5432** (direct connection) not 6543 in `DATABASE_URL`
- ✅ Format: `postgresql://postgres.xxx:pass@aws-0-us-east-1.pooler.supabase.com:5432/postgres`

**❌ Error: "Prisma Client not generated"**
- ✅ **Fix**: Add `npx prisma generate` to build command
- ✅ Build command: `npm install && npx prisma generate && npm run build`

**❌ Error: "CORS policy blocked"**
- ✅ **Fix**: Update `ALLOWED_ORIGINS` in backend with exact frontend URL
- ✅ Redeploy backend after changing environment variables

### Frontend Issues

**❌ Error: "Network Error" or "Failed to fetch"**
- ✅ **Fix**: Check `REACT_APP_API_URL` points to correct backend URL
- ✅ Must include `/api` at the end

**❌ Error: "Google OAuth not working"**
- ✅ **Fix**: Add production URLs to Google Cloud Console redirect URIs
- ✅ Include both Supabase callback URL and frontend URL

### Deployment Issues

**❌ Build failing on Vercel**
- ✅ **Fix**: Check build logs in Vercel dashboard
- ✅ Ensure all environment variables are set
- ✅ Verify root directory is set correctly (`backend` or `frontend`)

**❌ Changes not reflecting**
- ✅ **Fix**: Hard refresh browser (Ctrl+Shift+R or Cmd+Shift+R)
- ✅ Check deployment status in Vercel dashboard
- ✅ May need to wait 1-2 minutes for DNS propagation

---

## 🔒 Security Checklist

Before going live, verify:

- [ ] `JWT_SECRET` is a strong random string (min 32 characters)
- [ ] Using **port 5432** for `DATABASE_URL` (production)
- [ ] `ALLOWED_ORIGINS` is set to exact frontend URL (not `*`)
- [ ] `SUPABASE_SERVICE_KEY` is kept private (never expose to frontend)
- [ ] Google OAuth redirect URIs are production URLs only
- [ ] Supabase storage bucket is **private** (not public)
- [ ] All environment variables are set in Vercel (not in code)

---

## 💡 Pro Tips

### Custom Domains
1. In Vercel, go to **Settings** → **Domains**
2. Add your custom domain (e.g., `app.yourdomain.com`)
3. Update `ALLOWED_ORIGINS` in backend
4. Update Google OAuth redirect URIs

### Environment-Specific Variables
- Use Vercel's environment scoping (Production, Preview, Development)
- Set different values for preview deployments if needed

### Monitoring
- Check Vercel **Analytics** tab for usage
- Monitor **Functions** tab for backend performance
- Review **Logs** for errors and debugging

---

## 📞 Need Help?

- 📖 [Vercel Documentation](https://vercel.com/docs)
- 📖 [Supabase Documentation](https://supabase.com/docs)
- 🐛 [Report Issues](https://github.com/yourusername/data-room/issues)

---

**Remember**: Every git push triggers automatic deployment. No local servers needed! 🚀

# Vercel Workflow - Quick Reference

## 🎯 Daily Workflow

```bash
# 1. Make changes to your code in VS Code/Cursor
# 2. Commit and push
git add .
git commit -m "Your change description"
git push origin main

# 3. Vercel automatically deploys (wait 1-2 min)
# 4. Test at your live URLs
```

---

## 🔗 Your Project URLs

After initial setup, you'll have these URLs:

| Service | URL | Purpose |
|---------|-----|---------|
| **Frontend** | `https://your-frontend.vercel.app` | User interface |
| **Backend** | `https://your-backend.vercel.app` | API server |
| **Health Check** | `https://your-backend.vercel.app/api/health` | Test backend |

---

## 📝 Environment Variables Setup

### Where to Set Them
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project (backend or frontend)
3. Go to **Settings** → **Environment Variables**
4. Click **"Add New"**
5. Enter name, value, and select environment (Production)

### Backend Variables

```plaintext
DATABASE_URL=postgresql://postgres.xxx:pass@...pooler.supabase.com:5432/postgres
JWT_SECRET=your-super-secret-jwt-key-make-it-long-and-random
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NODE_ENV=production
ALLOWED_ORIGINS=https://your-frontend.vercel.app
```

### Frontend Variables

```plaintext
REACT_APP_API_URL=https://your-backend.vercel.app/api
REACT_APP_SUPABASE_URL=https://xxx.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 🚀 Initial Deployment Checklist

### Prerequisites
- [ ] Vercel account created
- [ ] Supabase project created
- [ ] Google OAuth configured
- [ ] Git repository pushed to GitHub/GitLab

### Backend Deployment
- [ ] Import repository to Vercel
- [ ] Set root directory to `backend`
- [ ] Set build command: `npm install && npx prisma generate && npm run build`
- [ ] Set output directory: `dist`
- [ ] Add all backend environment variables
- [ ] Deploy and copy backend URL

### Frontend Deployment
- [ ] Import same repository to Vercel (new project)
- [ ] Set root directory to `frontend`
- [ ] Framework preset: Create React App
- [ ] Add all frontend environment variables (use backend URL)
- [ ] Deploy and copy frontend URL

### Post-Deployment
- [ ] Update backend `ALLOWED_ORIGINS` with frontend URL
- [ ] Redeploy backend
- [ ] Add frontend URL to Google OAuth redirect URIs
- [ ] Test login flow
- [ ] Test file upload
- [ ] Verify all features work

---

## 🛠️ Common Operations

### Check Deployment Status
1. Vercel Dashboard → Your Project
2. **Deployments** tab
3. Latest deployment shows status:
   - 🟢 Ready = Success
   - 🟡 Building = In progress
   - 🔴 Error = Failed (check logs)

### View Logs
1. Click on a deployment
2. **Functions** tab = Runtime logs
3. **Build Logs** = Build process logs

### Manual Redeploy
1. Deployments tab
2. Find deployment
3. Click **⋯** → **Redeploy**

### Rollback
1. Deployments tab
2. Find previous working deployment
3. Click **⋯** → **Promote to Production**

### Update Environment Variable
1. Settings → Environment Variables
2. Find variable
3. Click **⋯** → **Edit**
4. Change value
5. **Important**: Redeploy after changing variables!

---

## 🐛 Quick Troubleshooting

| Problem | Solution |
|---------|----------|
| Build fails | Check build logs in Vercel |
| Can't reach database | Use port **5432** in DATABASE_URL |
| CORS error | Update ALLOWED_ORIGINS, redeploy backend |
| Network error | Check REACT_APP_API_URL ends with `/api` |
| OAuth not working | Add URLs to Google Console |
| Changes not showing | Hard refresh (Ctrl+Shift+R) |
| 404 errors | Check root directory in Vercel settings |

---

## 📊 Monitoring Your App

### Vercel Analytics
- Dashboard → Analytics tab
- See page views, performance
- Monitor function invocations

### Error Tracking
- Dashboard → Functions tab
- See function errors in real-time
- Click error to see stack trace

### Performance
- Dashboard → Analytics → Insights
- See Core Web Vitals
- Identify slow pages

---

## 🔄 Branch Deployments (Advanced)

Vercel automatically creates preview deployments for branches:

```bash
# Create feature branch
git checkout -b feature/new-feature

# Make changes, commit, push
git add .
git commit -m "Add new feature"
git push origin feature/new-feature

# Vercel creates preview URL automatically
# Test at: https://your-app-git-feature-new-feature-username.vercel.app

# Merge to main when ready
git checkout main
git merge feature/new-feature
git push origin main

# Production automatically updates
```

---

## 🔒 Security Best Practices

- ✅ Always use HTTPS URLs (Vercel provides this)
- ✅ Never commit `.env` files to git
- ✅ Keep `JWT_SECRET` long and random (32+ chars)
- ✅ Use port **5432** for production database
- ✅ Set `ALLOWED_ORIGINS` to exact frontend URL
- ✅ Keep `SUPABASE_SERVICE_KEY` private (backend only)
- ✅ Regularly rotate sensitive keys
- ✅ Enable Vercel's security features (password protection, etc.)

---

## 💡 Tips & Tricks

### Faster Deployments
- Vercel caches node_modules
- Small commits = faster builds
- Use `.vercelignore` to exclude files

### Custom Domains
1. Vercel → Settings → Domains
2. Add your domain
3. Update DNS records as shown
4. Update ALLOWED_ORIGINS and OAuth URIs

### Preview Deployments
- Every PR gets a unique URL
- Test before merging
- Share with team for review

### Environment Scoping
- Set different values for Preview vs Production
- Example: Use test database for previews

### Automatic Deployment Disabling
- Settings → Git
- Toggle "Automatic Deployments"
- Useful when working on big changes

---

## 📞 Getting Help

- 📖 [Vercel Docs](https://vercel.com/docs)
- 💬 [Vercel Community](https://github.com/vercel/vercel/discussions)
- 🐛 [Report Issues](https://github.com/vercel/vercel/issues)
- 📧 Vercel Support (Pro/Enterprise plans)

---

## 🎯 Summary: The Only Commands You Need

```bash
# Start working
git pull origin main

# Make changes in your editor
# (VS Code, Cursor, etc.)

# Deploy changes
git add .
git commit -m "What you changed"
git push origin main

# Wait 1-2 minutes, then visit:
# https://your-frontend.vercel.app
```

**That's it! No npm start, no local servers, just push and go!** 🚀


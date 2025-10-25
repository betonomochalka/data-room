# Quick Start Guide - Vercel Only

## ⚡ No Local Servers - Vercel Only!

This project runs **entirely on Vercel**. You never need to run local servers for testing.

---

## 🚀 When You Want to Start/Test Your Project

### 1. Make Your Changes
Edit your code in your IDE (VS Code, Cursor, etc.)

### 2. Push to Git
```bash
git add .
git commit -m "Description of changes"
git push origin main
```

### 3. Vercel Automatically Deploys
- Vercel detects your push
- Builds and deploys automatically (1-2 minutes)
- No manual deployment needed!

### 4. Test Your Live App
- **Frontend**: `https://your-frontend.vercel.app`
- **Backend API**: `https://your-backend.vercel.app/api/health`

---

## 📋 First Time Setup (One-Time Only)

If this is your **first deployment**, follow these steps once:

1. **Read**: [VERCEL_DEPLOYMENT_GUIDE.md](./VERCEL_DEPLOYMENT_GUIDE.md)
2. **Create** two Vercel projects (backend + frontend)
3. **Set** environment variables in Vercel dashboard
4. **Deploy** both projects
5. **Update** CORS and Google OAuth settings

After this, you're done! Just use `git push` to update.

---

## 🔗 Your Vercel URLs

After deployment, you'll have:

- **Backend**: `https://data-room-backend.vercel.app`
- **Frontend**: `https://data-room-frontend.vercel.app`

Save these URLs for reference!

---

## 🛠️ Common Tasks

### Update Code
```bash
# 1. Make changes to your files
# 2. Push to git
git add .
git commit -m "Updated feature X"
git push origin main
# 3. Wait 1-2 minutes
# 4. Check your Vercel URL - changes are live!
```

### Check Deployment Status
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click your project
3. See **Deployments** tab
4. Green checkmark = successful ✅

### View Logs
1. Vercel Dashboard → Your Project
2. Click on a deployment
3. Click **"Functions"** or **"Build Logs"**
4. See real-time logs and errors

### Rollback to Previous Version
1. Vercel Dashboard → Deployments
2. Find previous working deployment
3. Click **⋯** → **"Promote to Production"**

---

## ❌ What NOT to Do

- ❌ Don't run `npm start` or `npm run dev` (not needed)
- ❌ Don't use `localhost:3000` or `localhost:3001` (use Vercel URLs)
- ❌ Don't create `.env` files locally (set in Vercel dashboard)
- ❌ Don't install Vercel CLI unless you want manual control

---

## 🆘 Troubleshooting

### Changes not showing up?
```bash
# Hard refresh your browser
Windows/Linux: Ctrl + Shift + R
Mac: Cmd + Shift + R
```

### Build failed?
1. Check Vercel build logs
2. Verify all environment variables are set
3. Check for TypeScript/lint errors in your code

### API not responding?
1. Check backend URL is correct: `https://your-backend.vercel.app/api`
2. Verify CORS settings: `ALLOWED_ORIGINS` = your frontend URL
3. Check backend logs in Vercel dashboard

---

## 💡 Pro Tips

1. **Enable Vercel GitHub Integration** for automatic deployments
2. **Use Vercel Preview Deployments** for testing branches
3. **Monitor Analytics** in Vercel dashboard
4. **Set up Custom Domain** in Vercel settings (optional)

---

## 📖 Need More Details?

- **Full Setup**: [VERCEL_DEPLOYMENT_GUIDE.md](./VERCEL_DEPLOYMENT_GUIDE.md)
- **Project Overview**: [README.md](./README.md)
- **Architecture**: [ARCHITECTURE.md](./ARCHITECTURE.md)

---

**Remember**: Every `git push` = automatic deployment! 🎉


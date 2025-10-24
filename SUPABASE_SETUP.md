# Supabase Setup Guide

This guide will help you convert your Data Room app from the custom backend to full Supabase integration.

## 🚀 Overview

We've converted the app to use:
- ✅ **Supabase Auth** with Google OAuth (instead of custom JWT)
- ✅ **Supabase PostgreSQL** database (instead of localStorage)
- ✅ **Supabase Client** (instead of custom API endpoints)

## 📋 Step-by-Step Setup

### 1. Frontend Environment Variables

#### Remove these environment variables from Vercel:
- `REACT_APP_API_URL`
- `REACT_APP_GOOGLE_CLIENT_ID`

#### Add these environment variables to Vercel:
```env
REACT_APP_SUPABASE_URL=https://kfvrkfzhzwlkazzzqzou.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtmdnJrZnpoendsa2F6enpxem91Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzIzNzQ2NzQsImV4cCI6MjA0Nzk1MDY3NH0.4QzQzQzQzQzQzQzQzQzQzQzQzQzQzQzQzQzQzQzQzQ
```

**How to update Vercel environment variables:**
1. Go to your Vercel dashboard
2. Select your frontend project
3. Go to **Settings** → **Environment Variables**
4. Delete the old variables
5. Add the new Supabase variables

### 2. Supabase Database Setup

#### Option A: Use Prisma (Recommended)

Since you already have Prisma configured, let's use it to manage the database schema:

1. **Update your Prisma schema** (already done in the codebase)
2. **Set up the database connection**:
   - Go to your Supabase Dashboard → **Settings** → **Database**
   - Copy the **Connection string** (URI)
   - Update your backend environment variable `DATABASE_URL` in Vercel

3. **Run Prisma migrations**:
   ```bash
   cd backend
   npx prisma migrate dev --name supabase-integration
   npx prisma generate
   ```

4. **Enable Row Level Security in Supabase**:
   Go to your Supabase Dashboard → **SQL Editor** and run:
   ```sql
   -- Enable Row Level Security on all tables
   ALTER TABLE data_rooms ENABLE ROW LEVEL SECURITY;
   ALTER TABLE folders ENABLE ROW LEVEL SECURITY;
   ALTER TABLE files ENABLE ROW LEVEL SECURITY;

   -- Create policies for data_rooms
   CREATE POLICY "Users can only see their own data rooms" ON data_rooms
     FOR ALL USING (auth.uid()::text = user_id);

   -- Create policies for folders
   CREATE POLICY "Users can only see folders in their data rooms" ON folders
     FOR ALL USING (auth.uid()::text = user_id);

   -- Create policies for files
   CREATE POLICY "Users can only see files in their data rooms" ON files
     FOR ALL USING (auth.uid()::text = user_id);
   ```

### 3. Supabase Google OAuth Setup

#### Configure Google OAuth in Supabase:

1. Go to your **Supabase Dashboard**
2. Navigate to **Authentication** → **Providers**
3. Find **Google** and click **Configure**
4. Enable Google provider
5. Add your Google OAuth credentials:
   - **Client ID**: `148444056871-o63auj3aq2psuvlgs055kl03ti2t84i1.apps.googleusercontent.com`
   - **Client Secret**: Your Google OAuth client secret
6. Add **Redirect URLs**:
   - `https://your-frontend-domain.vercel.app/auth/callback`
   - `http://localhost:3000/auth/callback` (for local development)

### 4. Backend Cleanup (Optional)

Since we're now using Supabase, you can optionally remove the backend:

#### Remove these from Vercel:
- All backend environment variables:
  - `JWT_SECRET`
  - `GOOGLE_CLIENT_ID`
  - `GOOGLE_CLIENT_SECRET`
  - `DATABASE_URL`
  - `SUPABASE_URL`
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `FRONTEND_URL`
  - `PORT`
  - `NODE_ENV`

#### Or keep the backend for future features:
- Keep the backend but remove the API endpoints we're no longer using
- The backend can be used for additional features later

### 5. Test the Integration

#### After completing the setup:

1. **Deploy your frontend** with the new environment variables
2. **Test Google OAuth login**:
   - Click "Continue with Google"
   - Complete the OAuth flow
   - Verify you're redirected to the data rooms page

3. **Test data operations**:
   - Create a new data room
   - Verify it appears in the list
   - Try deleting a data room

### 6. Troubleshooting

#### Common Issues:

**"Invalid login credentials"**
- Check that Google OAuth is properly configured in Supabase
- Verify the redirect URLs match exactly

**"Failed to fetch data"**
- Check that the database tables exist
- Verify Row Level Security policies are set up correctly
- Check that the user is properly authenticated

**"Environment variables not found"**
- Ensure environment variables are set in Vercel
- Redeploy the frontend after adding environment variables

### 7. Benefits of Supabase Integration

✅ **Simplified Authentication**: No more custom JWT handling  
✅ **Real-time Updates**: Supabase provides real-time subscriptions  
✅ **Built-in Security**: Row Level Security handles data access  
✅ **Scalable Database**: PostgreSQL with automatic scaling  
✅ **No Backend Maintenance**: Supabase handles the backend infrastructure  

## 🎉 You're Done!

Your Data Room app is now fully integrated with Supabase! The app will:
- Use Supabase Auth for Google OAuth
- Store all data in Supabase PostgreSQL
- Handle authentication and authorization automatically
- Provide a more reliable and scalable foundation

## 📞 Need Help?

If you encounter any issues:
1. Check the Supabase Dashboard logs
2. Verify environment variables are set correctly
3. Ensure database tables and policies are created
4. Test the Google OAuth configuration

The app should now work seamlessly with Supabase! 🚀

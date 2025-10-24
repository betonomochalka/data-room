# Vercel Deployment Guide

## Environment Variables Setup

Add these environment variables in your Vercel project settings:

### 1. Database Configuration
```
DATABASE_URL=postgresql://postgres.kfvrkfzhzwlkazzzqzou:EyKsdKJCIklzHHde@aws-1-eu-west-1.pooler.supabase.com:5432/postgres
```

### 2. JWT Configuration
```
JWT_SECRET=your-super-secret-jwt-key-here-make-it-long-and-random
```

### 3. Supabase Configuration (you already have these)
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key
```

### 4. Google OAuth Configuration
```
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
```

### 5. CORS Configuration
```
ALLOWED_ORIGINS=https://your-frontend-domain.vercel.app
```

## Deployment Steps

1. **Set Environment Variables**: Go to your Vercel project dashboard → Settings → Environment Variables and add all the variables above.

2. **Deploy**: Push your code to trigger a new deployment.

3. **Verify Database Connection**: The backend will use the direct connection URL (port 5432) to avoid prepared statement issues.

## Important Notes

- Use the **direct connection URL** (port 5432) instead of the pooled connection (port 6543) for production
- Make sure your JWT_SECRET is a long, random string
- Update ALLOWED_ORIGINS to match your frontend domain
- The database tables are already created and have test data

## Troubleshooting

If you encounter issues:
- Check that all environment variables are set correctly
- Verify the database connection URL is using port 5432
- Ensure your Supabase service key has the correct permissions

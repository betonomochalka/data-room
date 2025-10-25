# Data Room - Secure Document Management

A modern, secure document management system built with React, Node.js, and Supabase. Manage your confidential documents with nested folder structures, Google OAuth authentication, and cloud storage.

![Tech Stack](https://img.shields.io/badge/React-18.x-blue)
![Node.js](https://img.shields.io/badge/Node.js-18.x-green)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-green)

---

## ⚡ IMPORTANT: Vercel-Only Project

**This project runs entirely on Vercel - NO local servers needed!**

To start/test your project:
1. Make changes to your code
2. Run `git push origin main`
3. Vercel automatically deploys
4. Test at your Vercel URLs

### 📖 Documentation Guide
- **👉 New here?** Start with [START_HERE.md](./START_HERE.md) to choose the right guide
- **⚡ Quick start**: [QUICK_START.md](./QUICK_START.md) - Deploy in minutes
- **🔧 Full setup**: [VERCEL_DEPLOYMENT_GUIDE.md](./VERCEL_DEPLOYMENT_GUIDE.md) - Complete deployment guide
- **📋 Daily workflow**: [VERCEL_WORKFLOW.md](./VERCEL_WORKFLOW.md) - Quick reference for daily use

---

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Running the Application](#running-the-application)
- [Project Structure](#project-structure)
- [API Documentation](#api-documentation)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

---

## ✨ Features

### Core Features
- 🔐 **Google OAuth Authentication** - Secure, one-click sign-in
- 📁 **Nested Folder Structure** - Organize documents with unlimited folder depth
- 📄 **PDF Upload & Management** - Upload documents up to 50MB
- ✏️ **Rename & Delete** - Full CRUD operations on folders and files
- 🔍 **Search Functionality** - Find documents quickly
- 🎨 **Modern UI** - Clean, responsive design with Tailwind CSS
- 🔒 **Secure by Default** - All data scoped to authenticated users

### Security Features
- JWT-based authentication
- Resource ownership verification
- File type validation (PDF only)
- Size limits (50MB per file)
- HTTPS-ready for production

---

## 🛠 Tech Stack

### Frontend
- **React 18** - UI framework
- **TypeScript** - Type safety
- **React Router** - Client-side routing
- **React Query** - Server state management
- **Axios** - HTTP client
- **Tailwind CSS** - Utility-first styling
- **Lucide React** - Icon library

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **TypeScript** - Type safety
- **Prisma** - Type-safe ORM
- **JWT** - Authentication tokens
- **Multer** - File upload handling

### Infrastructure
- **Supabase PostgreSQL** - Managed database
- **Supabase Storage** - File storage with CDN
- **Supabase Auth** - OAuth provider management

---

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 18.x or higher ([Download](https://nodejs.org/))
- **npm** or **yarn** package manager
- **Supabase Account** ([Sign up free](https://supabase.com/))
- **Google Cloud Account** (for OAuth - [Get started](https://console.cloud.google.com/))

---

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/data-room.git
cd data-room
```

### 2. Set Up Supabase

#### Create a Supabase Project

1. Go to [Supabase Dashboard](https://app.supabase.com/)
2. Click **"New Project"**
3. Fill in:
   - **Name**: `data-room` (or any name)
   - **Database Password**: Save this securely!
   - **Region**: Choose closest to you
4. Wait for project to initialize (~2 minutes)

#### Get Supabase Credentials

From your Supabase project dashboard:

1. Go to **Settings** → **API**
2. Copy:
   - **Project URL** (e.g., `https://xyz.supabase.co`)
   - **Anon/Public Key** (starts with `eyJh...`)
3. Go to **Settings** → **Database**
4. Under **Connection Pooling**, copy:
   - **Session Mode** connection string (port `6543`)
   - Format: `postgresql://postgres.xxx:password@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true`

#### Create Storage Bucket

1. Go to **Storage** in Supabase dashboard
2. Click **"New bucket"**
3. Name: `data-room-files`
4. **Public bucket**: ❌ No (keep private)
5. Click **"Create bucket"**

### 3. Set Up Google OAuth

#### Create Google OAuth Client

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Go to **APIs & Services** → **Credentials**
4. Click **"Create Credentials"** → **"OAuth client ID"**
5. If prompted, configure the **OAuth consent screen**:
   - User Type: **External**
   - App name: `Data Room`
   - User support email: Your email
   - Authorized domains: `supabase.co`
6. Create **OAuth client ID**:
   - Application type: **Web application**
   - Name: `Data Room`
   - Authorized redirect URIs:
     ```
     https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback
     ```
     (Replace `YOUR_PROJECT_REF` with your Supabase project reference)
7. Copy **Client ID** and **Client Secret**

#### Configure Google OAuth in Supabase

1. In Supabase dashboard, go to **Authentication** → **Providers**
2. Find **Google** and click to expand
3. Enable Google provider
4. Paste:
   - **Client ID** (from Google Console)
   - **Client Secret** (from Google Console)
5. Click **"Save"**

### 4. Configure Environment Variables (for Vercel)

You'll set these environment variables in the **Vercel Dashboard** (not in local files).

#### Backend Environment Variables (Set in Vercel)

```env
# Database (Use port 5432 for Vercel production)
DATABASE_URL=postgresql://postgres.YOUR_PROJECT_REF:YOUR_PASSWORD@aws-0-us-east-1.pooler.supabase.com:5432/postgres

# JWT Secret (generate a random string)
JWT_SECRET=your-super-secret-jwt-key-make-it-long-and-random

# Supabase
SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
SUPABASE_SERVICE_KEY=your-supabase-service-role-key

# Node Environment
NODE_ENV=production

# CORS
ALLOWED_ORIGINS=https://your-frontend.vercel.app
```

#### Frontend Environment Variables (Set in Vercel)

```env
REACT_APP_API_URL=https://your-backend.vercel.app/api
REACT_APP_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-supabase-anon-key
```

**See [VERCEL_DEPLOYMENT_GUIDE.md](./VERCEL_DEPLOYMENT_GUIDE.md) for complete setup instructions.**

---

## 🏃 Running the Application

### ⚠️ IMPORTANT: This Project Uses Vercel for Testing

**No local servers needed!** This project is designed to run entirely on Vercel.

### Deploy & Test on Vercel

1. **Push your code to Git**:
   ```bash
   git add .
   git commit -m "Your changes"
   git push origin main
   ```

2. **Vercel will automatically deploy** your changes

3. **Access your application** at your Vercel URLs:
   - Frontend: `https://your-frontend.vercel.app`
   - Backend: `https://your-backend.vercel.app`

### First Time Setup

For detailed deployment instructions, see **[VERCEL_DEPLOYMENT_GUIDE.md](./VERCEL_DEPLOYMENT_GUIDE.md)**

**Quick Steps**:
1. Create two Vercel projects (one for backend, one for frontend)
2. Set environment variables in Vercel dashboard
3. Deploy both projects
4. Update CORS and Google OAuth settings
5. Test your live application

---

## 🔧 Environment Variables

All environment variables are set in the **Vercel Dashboard** (Settings → Environment Variables).

### Backend Variables (Vercel)

| Variable | Description | Production Value |
|----------|-------------|------------------|
| `NODE_ENV` | Environment mode | `production` |
| `DATABASE_URL` | Supabase PostgreSQL (port **5432**) | `postgresql://postgres.xxx:pass@...pooler.supabase.com:5432/postgres` |
| `JWT_SECRET` | Secret for JWT token signing | Generate: `openssl rand -base64 32` |
| `SUPABASE_URL` | Supabase project URL | `https://xxx.supabase.co` |
| `SUPABASE_SERVICE_KEY` | Supabase service role key | From Supabase Settings → API |
| `ALLOWED_ORIGINS` | Frontend URL for CORS | `https://your-frontend.vercel.app` |

### Frontend Variables (Vercel)

| Variable | Description | Production Value |
|----------|-------------|------------------|
| `REACT_APP_API_URL` | Backend API URL | `https://your-backend.vercel.app/api` |
| `REACT_APP_SUPABASE_URL` | Supabase project URL | `https://xxx.supabase.co` |
| `REACT_APP_SUPABASE_ANON_KEY` | Supabase anonymous key | From Supabase Settings → API |

---

## 📁 Project Structure

```
data-room/
├── backend/
│   ├── src/
│   │   ├── routes/           # API route handlers
│   │   │   ├── auth.ts       # Authentication routes
│   │   │   ├── dataRooms.ts  # Data room CRUD
│   │   │   ├── folders.ts    # Folder CRUD
│   │   │   └── files.ts      # File upload/management
│   │   ├── middleware/       # Express middleware
│   │   │   ├── auth.ts       # JWT verification
│   │   │   └── errorHandler.ts
│   │   ├── utils/            # Utility functions
│   │   │   └── supabase.ts   # Supabase Storage helpers
│   │   ├── types/            # TypeScript type definitions
│   │   └── index.ts          # Server entry point
│   ├── prisma/
│   │   └── schema.prisma     # Database schema
│   ├── package.json
│   ├── tsconfig.json
│   └── .env                  # Environment variables (create this)
│
├── frontend/
│   ├── src/
│   │   ├── components/       # React components
│   │   │   ├── ui/           # Reusable UI components
│   │   │   ├── Layout.tsx    # App layout (header, footer)
│   │   │   └── ProtectedRoute.tsx
│   │   ├── pages/            # Page components
│   │   │   ├── Login.tsx     # Login page
│   │   │   ├── AuthCallback.tsx  # OAuth callback handler
│   │   │   ├── Dashboard.tsx # User dashboard
│   │   │   └── DataRoomView.tsx  # Data room detail view
│   │   ├── contexts/         # React contexts
│   │   │   └── AuthContext.tsx
│   │   ├── lib/              # Utilities
│   │   │   ├── api.ts        # Axios instance
│   │   │   └── supabase.ts   # Supabase client
│   │   ├── App.tsx           # Main app component
│   │   └── index.tsx         # React entry point
│   ├── public/
│   ├── package.json
│   ├── tsconfig.json
│   └── .env                  # Environment variables (create this)
│
├── ARCHITECTURE.md           # Architecture documentation
├── README.md                 # This file
└── package.json
```

---

## 📚 API Documentation

### Authentication

#### Sign In with Google
```http
POST /api/auth/google
Content-Type: application/json

{
  "supabaseUser": {
    "id": "...",
    "email": "user@example.com",
    "user_metadata": { "name": "John Doe" }
  }
}

Response:
{
  "success": true,
  "data": {
    "user": { "id": "...", "email": "...", "name": "..." },
    "token": "eyJhbGc..."
  }
}
```

### Data Rooms

#### List Data Rooms
```http
GET /api/data-rooms
Authorization: Bearer {token}

Response:
{
  "success": true,
  "data": [
    { "id": "...", "name": "My Data Room", "description": "..." }
  ]
}
```

#### Create Data Room
```http
POST /api/data-rooms
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "New Data Room",
  "description": "Optional description"
}

Response:
{
  "success": true,
  "data": { "id": "...", "name": "...", ... }
}
```

### Folders

#### Create Folder
```http
POST /api/folders
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "New Folder",
  "dataRoomId": "uuid",
  "parentId": "uuid or null"
}

Response:
{
  "success": true,
  "data": { "id": "...", "name": "...", ... }
}
```

### Files

#### Upload File
```http
POST /api/files/upload
Authorization: Bearer {token}
Content-Type: multipart/form-data

FormData:
- file: [PDF file, max 50MB]
- name: "Document Name"
- folderId: "uuid"

Response:
{
  "success": true,
  "data": { "id": "...", "name": "...", "blobUrl": "...", ... }
}
```

For complete API documentation, see [ARCHITECTURE.md](./ARCHITECTURE.md#api-design).

---

## 🚢 Deployment

### Deploy to Vercel (Required for Testing)

This project **requires Vercel** for testing and production. No local servers are used.

**📖 Complete Deployment Guide**: See **[VERCEL_DEPLOYMENT_GUIDE.md](./VERCEL_DEPLOYMENT_GUIDE.md)**

**Quick Overview**:
1. Connect your Git repository to Vercel
2. Create two projects: one for `backend`, one for `frontend`
3. Set environment variables in Vercel dashboard
4. Deploy both projects
5. Update CORS and Google OAuth settings with production URLs

**To Update Your App**:
```bash
git push origin main
```
Vercel automatically redeploys on every push!

---

## 🧪 Testing

### Live Testing on Vercel
Test your application by visiting your deployed Vercel URLs:
- **Frontend**: `https://your-frontend.vercel.app`
- **Backend**: `https://your-backend.vercel.app/api/health`

### Unit Tests (Optional - Local Only)
If you want to run unit tests locally:
```bash
cd backend && npm test
cd frontend && npm test
```
*Note: These tests don't require running the actual servers.*

---

## 🐛 Troubleshooting

### Deployment Issues

**Error**: `Can't reach database server` on Vercel
- **Solution**: Use port **5432** (not 6543) in `DATABASE_URL` for production
- Format: `postgresql://postgres.xxx:pass@...pooler.supabase.com:5432/postgres`

**Error**: `CORS policy blocked`
- **Solution**: Set `ALLOWED_ORIGINS` in backend to exact frontend URL
- Must match exactly: `https://your-frontend.vercel.app`

**Error**: `Network Error` from frontend
- **Solution**: Check `REACT_APP_API_URL` includes `/api` at the end
- Format: `https://your-backend.vercel.app/api`

### Google OAuth Issues

**Error**: `redirect_uri_mismatch`
- **Solution**: Add production URLs to Google Cloud Console redirect URIs:
  - `https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback`
  - `https://your-frontend.vercel.app`

**Error**: `Bad ID token`
- **Solution**: Ensure Google OAuth is enabled in Supabase dashboard

### File Upload Issues

**Error**: `File too large`
- **Solution**: Files must be under 50MB

**Error**: `Only PDF files are allowed`
- **Solution**: Upload only PDF files

### Changes Not Appearing

**Issue**: Code changes not reflecting on Vercel
- **Solution**: Push to git (`git push origin main`)
- Wait 1-2 minutes for deployment
- Hard refresh browser (Ctrl+Shift+R)

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- [Supabase](https://supabase.com/) - Backend as a Service
- [Prisma](https://www.prisma.io/) - Next-generation ORM
- [React Query](https://tanstack.com/query) - Powerful data fetching
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS

---

## 📞 Support

If you have any questions or need help:

- 📧 Email: support@dataroom.app
- 🐛 Issues: [GitHub Issues](https://github.com/yourusername/data-room/issues)
- 💬 Discussions: [GitHub Discussions](https://github.com/yourusername/data-room/discussions)

---

**Built with ❤️ by [Your Name]**


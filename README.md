# Data Room - Secure Document Management

A modern, secure document management system built with React, Node.js, and Supabase. Manage your confidential documents with nested folder structures, Google OAuth authentication, and cloud storage.

![Tech Stack](https://img.shields.io/badge/React-18.x-blue)
![Node.js](https://img.shields.io/badge/Node.js-18.x-green)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-green)

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

### 4. Install Dependencies

#### Backend

```bash
cd backend
npm install
```

#### Frontend

```bash
cd ../frontend
npm install
```

### 5. Configure Environment Variables

#### Backend Environment

Create `backend/.env`:

```bash
cd backend
cp env.example .env
```

Edit `backend/.env`:

```env
# Server
NODE_ENV=development
PORT=3001

# Database (Supabase PostgreSQL - Session Pooler for IPv4 compatibility)
DATABASE_URL="postgresql://postgres.YOUR_PROJECT_REF:YOUR_PASSWORD@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true"

# JWT Secret (generate a random string)
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"

# Supabase
SUPABASE_URL="https://YOUR_PROJECT_REF.supabase.co"
SUPABASE_SERVICE_KEY="your-supabase-service-role-key"

# CORS
ALLOWED_ORIGINS="http://localhost:3000"
```

**Important**:
- Replace `YOUR_PROJECT_REF` with your Supabase project reference
- Replace `YOUR_PASSWORD` with your Supabase database password
- Generate a secure `JWT_SECRET` (can use: `openssl rand -base64 32`)
- Get `SUPABASE_SERVICE_KEY` from Supabase Dashboard → Settings → API → `service_role` key

#### Frontend Environment

Create `frontend/.env`:

```bash
cd ../frontend
cp .env.example .env
```

Edit `frontend/.env`:

```env
REACT_APP_API_URL=http://localhost:3001/api
REACT_APP_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-supabase-anon-key
```

**Important**:
- Replace `YOUR_PROJECT_REF` with your Supabase project reference
- Get `REACT_APP_SUPABASE_ANON_KEY` from Supabase Dashboard → Settings → API → `anon` key

### 6. Initialize Database

Run Prisma migrations to create database tables:

```bash
cd backend
npx prisma generate
npx prisma db push
```

**Expected output**:
```
✔ Generated Prisma Client
✔ Database synchronized
```

---

## 🏃 Running the Application

### Development Mode

Open **two terminal windows**:

#### Terminal 1: Backend

```bash
cd backend
npm run dev
```

**Expected output**:
```
🚀 Server running on port 3001
📊 Environment: development
🔗 Health check: http://localhost:3001/api/health
```

#### Terminal 2: Frontend

```bash
cd frontend
npm start
```

**Expected output**:
```
webpack compiled successfully
Local: http://localhost:3000
```

### Access the Application

Open your browser and navigate to:
```
http://localhost:3000
```

You should see the Data Room login page with **"Sign in with Google"** button.

---

## 🔧 Environment Variables

### Backend Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `NODE_ENV` | Environment (development/production) | `development` |
| `PORT` | Server port | `3001` |
| `DATABASE_URL` | Supabase PostgreSQL connection string | `postgresql://...` |
| `JWT_SECRET` | Secret for JWT token signing | `random-secure-string` |
| `SUPABASE_URL` | Supabase project URL | `https://xyz.supabase.co` |
| `SUPABASE_SERVICE_KEY` | Supabase service role key | `eyJh...` |
| `ALLOWED_ORIGINS` | CORS allowed origins | `http://localhost:3000` |

### Frontend Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `REACT_APP_API_URL` | Backend API URL | `http://localhost:3001/api` |
| `REACT_APP_SUPABASE_URL` | Supabase project URL | `https://xyz.supabase.co` |
| `REACT_APP_SUPABASE_ANON_KEY` | Supabase anonymous key | `eyJh...` |

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

### Recommended: Vercel + Supabase

#### Prerequisites
- Vercel account ([Sign up](https://vercel.com/))
- Supabase project (already created in setup)

#### Deploy Backend

1. Install Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Deploy backend:
   ```bash
   cd backend
   vercel
   ```

3. Set environment variables in Vercel dashboard:
   - All variables from `backend/.env`
   - Set `NODE_ENV=production`
   - Set `ALLOWED_ORIGINS` to your frontend URL

4. Run Prisma migrations:
   ```bash
   npx prisma migrate deploy
   ```

#### Deploy Frontend

1. Update `frontend/.env`:
   ```env
   REACT_APP_API_URL=https://your-backend.vercel.app/api
   ```

2. Deploy frontend:
   ```bash
   cd frontend
   vercel
   ```

3. Update Google OAuth redirect URIs to include production URL

For detailed deployment guide, see [DEPLOYMENT.md](./DEPLOYMENT.md) (if created).

---

## 🧪 Testing

### Run Backend Tests
```bash
cd backend
npm test
```

### Run Frontend Tests
```bash
cd frontend
npm test
```

---

## 🐛 Troubleshooting

### Backend won't start

**Error**: `P1001: Can't reach database server`
- **Solution**: Check `DATABASE_URL` in `backend/.env`
- Make sure you're using the **Session Pooler** URL (port `6543`)

**Error**: `P1013: Invalid database string`
- **Solution**: Ensure `DATABASE_URL` includes `?pgbouncer=true`

### Google OAuth not working

**Error**: `redirect_uri_mismatch`
- **Solution**: Check Google Console redirect URIs match Supabase callback URL

**Error**: `Bad ID token`
- **Solution**: Ensure Google OAuth is enabled in Supabase dashboard

### File upload fails

**Error**: `File too large`
- **Solution**: Files must be under 50MB

**Error**: `Only PDF files are allowed`
- **Solution**: Upload only PDF files

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


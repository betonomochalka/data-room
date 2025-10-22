# Data Room Architecture

## Overview

Data Room is a secure document management system built with a modern, scalable architecture. This document outlines the key design decisions, system architecture, and technical rationale behind the application.

---

## Table of Contents

1. [System Architecture](#system-architecture)
2. [Technology Stack](#technology-stack)
3. [Design Decisions](#design-decisions)
4. [Database Schema](#database-schema)
5. [Authentication & Authorization](#authentication--authorization)
6. [File Storage Strategy](#file-storage-strategy)
7. [API Design](#api-design)
8. [Frontend Architecture](#frontend-architecture)
9. [Security Considerations](#security-considerations)
10. [Scalability & Performance](#scalability--performance)

---

## System Architecture

### High-Level Architecture

```
┌─────────────┐         ┌─────────────┐         ┌─────────────┐
│   Browser   │ ◄─────► │   Backend   │ ◄─────► │  Supabase   │
│   (React)   │         │  (Express)  │         │ PostgreSQL  │
└─────────────┘         └─────────────┘         └─────────────┘
                              │
                              ▼
                        ┌─────────────┐
                        │  Supabase   │
                        │   Storage   │
                        └─────────────┘
                              │
                              ▼
                        ┌─────────────┐
                        │  Supabase   │
                        │    Auth     │
                        └─────────────┘
```

### Component Breakdown

**Frontend Layer**
- React SPA with React Router for navigation
- React Query for server state management
- Tailwind CSS for styling
- TypeScript for type safety

**Backend Layer**
- Node.js with Express.js for API endpoints
- Prisma ORM for database operations
- JWT for session management
- Multer for file upload handling

**Data Layer**
- Supabase PostgreSQL (via Session Pooler for IPv4 compatibility)
- Supabase Storage for file blobs
- Supabase Auth for OAuth management

---

## Technology Stack

### Backend Stack

| Technology | Purpose | Why We Chose It |
|------------|---------|-----------------|
| **Node.js** | Runtime | JavaScript across the stack, excellent ecosystem, high performance for I/O operations |
| **Express.js** | Web framework | Battle-tested, minimal overhead, extensive middleware ecosystem |
| **TypeScript** | Language | Type safety, better developer experience, catch errors at compile time |
| **Prisma** | ORM | Type-safe database access, excellent migrations, auto-generated types |
| **Supabase PostgreSQL** | Database | Managed PostgreSQL, built-in features, generous free tier, excellent for production |
| **JWT** | Authentication | Stateless, scalable, industry standard for API authentication |

### Frontend Stack

| Technology | Purpose | Why We Chose It |
|------------|---------|-----------------|
| **React** | UI framework | Component-based, large ecosystem, excellent developer tools |
| **TypeScript** | Language | Type safety across the entire application |
| **React Router** | Routing | De facto standard for React routing |
| **React Query** | Data fetching | Server state management, caching, automatic refetching |
| **Axios** | HTTP client | Interceptors for auth, better error handling than fetch |
| **Tailwind CSS** | Styling | Utility-first, rapid development, consistent design |

### Infrastructure

| Technology | Purpose | Why We Chose It |
|------------|---------|-----------------|
| **Supabase** | Backend-as-a-Service | All-in-one: PostgreSQL, Auth, Storage; excellent free tier |
| **Vercel** (recommended) | Deployment | Seamless Next.js/React deployment, global CDN, serverless functions |

---

## Design Decisions

### 1. Monorepo Structure

**Decision**: Separate `frontend/` and `backend/` directories in a single repository.

**Rationale**:
- Easy to share types and interfaces
- Simplified version control
- Single source of truth for the entire application
- Better for small to medium teams

### 2. Prisma ORM

**Decision**: Use Prisma instead of raw SQL or other ORMs.

**Rationale**:
- **Type Safety**: Auto-generated TypeScript types from schema
- **Migrations**: Version-controlled database changes
- **Developer Experience**: Excellent IDE autocomplete
- **Performance**: Efficient query generation
- **Database Agnostic**: Easy to switch databases if needed

Example of type safety:
```typescript
const user = await prisma.user.findUnique({ where: { id } });
// TypeScript knows exactly what fields `user` has
```

### 3. Google OAuth Only

**Decision**: Remove email/password authentication, use Google OAuth exclusively.

**Rationale**:
- **Security**: No password storage, no password reset flows
- **User Experience**: One-click sign-in, no password to remember
- **Trust**: Users trust Google's authentication
- **Compliance**: Reduces security audit surface area
- **Simplicity**: Fewer auth flows to maintain

### 4. JWT for Session Management

**Decision**: Use JWT tokens stored in localStorage.

**Rationale**:
- **Stateless**: Backend doesn't need to store sessions
- **Scalable**: Works across multiple backend instances
- **API-Friendly**: Easy to authenticate API requests
- **Standard**: Industry-standard approach

**Security Considerations**:
- Short token expiration (24 hours)
- HTTPS only in production
- XSS protection via Content Security Policy

### 5. Supabase Storage for Files

**Decision**: Use Supabase Storage instead of local filesystem or S3.

**Rationale**:
- **Integration**: Seamless with Supabase PostgreSQL and Auth
- **CDN**: Built-in CDN for fast file delivery
- **Scalability**: Handles growth automatically
- **Cost**: Free tier generous enough for development and small production
- **Simplicity**: No need to manage S3 credentials or configure separate storage

### 6. PDF-Only File Upload

**Decision**: Restrict file uploads to PDF format only (50MB max).

**Rationale**:
- **Security**: Reduces attack surface (no executable files)
- **Consistency**: PDFs are platform-independent
- **Use Case**: Data rooms typically store documents (contracts, agreements)
- **Preview**: PDFs can be previewed in browsers natively

**Configurable**: Easy to extend to other formats by modifying multer configuration.

### 7. Nested Folder Structure

**Decision**: Support unlimited folder nesting with `parentId` relationship.

**Rationale**:
- **Flexibility**: Users can organize documents as they need
- **Familiar**: Matches file system users are accustomed to
- **Scalable**: Self-referential relationship scales well

Database design:
```prisma
model Folder {
  id       String   @id @default(uuid())
  parentId String?  // null = root level
  parent   Folder?  @relation("FolderHierarchy", fields: [parentId], references: [id])
  children Folder[] @relation("FolderHierarchy")
}
```

### 8. React Query for State Management

**Decision**: Use React Query instead of Redux or Context API for server state.

**Rationale**:
- **Cache Management**: Automatic caching and invalidation
- **Less Boilerplate**: No actions, reducers, or complex setup
- **Optimistic Updates**: Built-in support
- **Automatic Refetching**: Keeps data fresh
- **Developer Experience**: Less code, more features

Example:
```typescript
const { data, isLoading } = useQuery({
  queryKey: ['dataRoom', id],
  queryFn: () => api.get(`/data-rooms/${id}`),
});
```

---

## Database Schema

### Entity Relationship Diagram

```
┌─────────────┐
│    User     │
└─────────────┘
      │ 1
      │ owns
      │
      ▼ *
┌─────────────┐
│  DataRoom   │
└─────────────┘
      │ 1
      │ contains
      │
      ▼ *
┌─────────────┐      ┌─────────────┐
│   Folder    │ ────►│    File     │
└─────────────┘  1   └─────────────┘
      │ *              contains
      │
      │ self-referential
      │ (parent-child)
      ▼
┌─────────────┐
│   Folder    │
└─────────────┘
```

### Schema Details

**User**
```prisma
model User {
  id        String     @id @default(uuid())
  email     String     @unique
  name      String?
  dataRooms DataRoom[]
  createdAt DateTime   @default(now())
  updatedAt DateTime   @updatedAt
}
```

**Design Rationale**:
- `id` as UUID: More secure than auto-incrementing integers
- `email` unique: Primary identifier from Google OAuth
- `name` optional: Some OAuth providers may not provide it
- Timestamps: Audit trail for user creation/updates

**DataRoom**
```prisma
model DataRoom {
  id          String   @id @default(uuid())
  name        String
  description String?
  ownerId     String
  owner       User     @relation(fields: [ownerId], references: [id])
  folders     Folder[]
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

**Design Rationale**:
- Each data room belongs to one user
- `description` optional: Flexibility for users
- Cascade delete: When user is deleted, data rooms are deleted

**Folder**
```prisma
model Folder {
  id         String   @id @default(uuid())
  name       String
  dataRoomId String
  dataRoom   DataRoom @relation(fields: [dataRoomId], references: [id], onDelete: Cascade)
  parentId   String?
  parent     Folder?  @relation("FolderHierarchy", fields: [parentId], references: [id])
  children   Folder[] @relation("FolderHierarchy")
  files      File[]
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt
}
```

**Design Rationale**:
- Self-referential relationship for nesting
- `parentId` nullable: Root folders have `parentId = null`
- Cascade delete: When data room deleted, all folders deleted
- Index on `dataRoomId` and `parentId` for query performance

**File**
```prisma
model File {
  id        String   @id @default(uuid())
  name      String
  fileType  String
  size      Int
  blobUrl   String
  folderId  String
  folder    Folder   @relation(fields: [folderId], references: [id], onDelete: Cascade)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

**Design Rationale**:
- `blobUrl`: Reference to Supabase Storage
- `size`: For quota management and display
- `fileType`: MIME type for proper handling
- Cascade delete: When folder deleted, files deleted

---

## Authentication & Authorization

### Authentication Flow

```
1. User clicks "Sign in with Google"
   ↓
2. Frontend redirects to Supabase Auth (Google OAuth)
   ↓
3. User authenticates with Google
   ↓
4. Google redirects back to /auth/callback
   ↓
5. Frontend gets Supabase session
   ↓
6. Frontend sends session.user to backend /auth/google
   ↓
7. Backend finds or creates user in Prisma
   ↓
8. Backend generates JWT token
   ↓
9. Frontend stores JWT + user data in localStorage
   ↓
10. Subsequent requests include JWT in Authorization header
```

### Authorization Model

**Resource Ownership**:
- Users can only access their own data rooms
- Data rooms, folders, and files are scoped to the owner

**Backend Enforcement**:
```typescript
// Every protected endpoint verifies ownership
const dataRoom = await prisma.dataRoom.findFirst({
  where: {
    id: dataRoomId,
    ownerId: req.user!.id, // Ensures user owns the data room
  },
});
```

**Frontend Protection**:
- Protected routes redirect unauthenticated users to `/login`
- Auth context provides user state across components

---

## File Storage Strategy

### Upload Flow

```
1. User selects file in browser
   ↓
2. Frontend validates file (type, size)
   ↓
3. FormData sent to backend /files/upload
   ↓
4. Multer middleware validates (50MB max, PDF only)
   ↓
5. Backend uploads to Supabase Storage
   ↓
6. Supabase returns blob URL
   ↓
7. Backend saves file metadata + blobUrl to PostgreSQL
   ↓
8. Frontend invalidates queries to refresh UI
```

### Storage Organization

**Supabase Storage Bucket**: `data-room-files`

**File Path Pattern**: `{dataRoomId}/{folderId}/{fileId}-{originalName}`

**Benefits**:
- Easy to locate files by data room or folder
- File ID prevents naming collisions
- Original name preserved for user reference

### File Validation

**Backend (Multer)**:
```typescript
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'), false);
    }
  },
});
```

**Frontend**:
- File input accepts only PDFs: `accept="application/pdf"`
- Client-side size validation before upload
- User-friendly error messages

---

## API Design

### RESTful Principles

All endpoints follow REST conventions:

| Method | Endpoint | Purpose |
|--------|----------|---------|
| `GET` | `/api/data-rooms` | List all data rooms |
| `POST` | `/api/data-rooms` | Create new data room |
| `GET` | `/api/data-rooms/:id` | Get data room details |
| `PATCH` | `/api/data-rooms/:id` | Update data room |
| `DELETE` | `/api/data-rooms/:id` | Delete data room |

### Response Format

**Success Response**:
```json
{
  "success": true,
  "data": { ... }
}
```

**Error Response**:
```json
{
  "success": false,
  "error": "Error message"
}
```

### Error Handling

**Centralized Error Handler**:
```typescript
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.statusCode || 500).json({
    success: false,
    error: err.message || 'Internal server error',
  });
});
```

**Common HTTP Status Codes**:
- `200 OK`: Successful GET/PATCH/DELETE
- `201 Created`: Successful POST
- `400 Bad Request`: Validation errors
- `401 Unauthorized`: Missing/invalid token
- `404 Not Found`: Resource doesn't exist
- `409 Conflict`: Duplicate resource
- `500 Internal Server Error`: Unexpected errors

---

## Frontend Architecture

### Component Structure

```
src/
├── components/
│   ├── ui/              # Reusable UI components (Button, Card, Dialog)
│   ├── Layout.tsx       # App shell (header, footer, navigation)
│   └── ProtectedRoute.tsx
├── pages/               # Route components
│   ├── Login.tsx
│   ├── AuthCallback.tsx
│   ├── Dashboard.tsx
│   └── DataRoomView.tsx
├── contexts/
│   └── AuthContext.tsx  # Authentication state
├── lib/
│   ├── api.ts           # Axios instance with interceptors
│   └── supabase.ts      # Supabase client
└── App.tsx              # Route configuration
```

### State Management Strategy

**Server State**: React Query
- Data from API (data rooms, folders, files)
- Automatic caching, refetching, invalidation

**Client State**: React Context
- User authentication state
- UI state (modals, dialogs)

**Local State**: useState
   - Form inputs
- Component-specific state

### React Query Usage

**Query Keys**:
```typescript
['dataRooms']                    // All data rooms
['dataRoom', id]                 // Specific data room
['folder', folderId]             // Folder contents
```

**Automatic Invalidation**:
```typescript
onSuccess: () => {
  queryClient.invalidateQueries({ queryKey: ['dataRoom', id] });
  // UI automatically refetches and updates
}
```

---

## Security Considerations

### 1. Authentication Security

✅ **Google OAuth**: Delegates authentication to Google  
✅ **HTTPS Only**: Production environment requires HTTPS  
✅ **JWT Expiration**: Tokens expire after 24 hours  
✅ **Token Validation**: Every protected endpoint validates JWT  

### 2. Authorization Security

✅ **Ownership Verification**: All queries check `ownerId`  
✅ **No Direct Access**: Can't access other users' resources  
✅ **Cascade Deletes**: Related data deleted automatically  

### 3. File Upload Security

✅ **File Type Restriction**: PDF only  
✅ **Size Limit**: 50MB maximum  
✅ **Validation**: Both frontend and backend validation  
✅ **Memory Storage**: Files don't touch filesystem  
✅ **Unique IDs**: Prevents filename-based attacks  

### 4. Database Security

✅ **Parameterized Queries**: Prisma prevents SQL injection  
✅ **Connection Pooling**: Supabase Session Pooler  
✅ **Environment Variables**: Credentials not in code  
✅ **UUID IDs**: Hard to guess resource IDs  

### 5. Frontend Security

✅ **XSS Protection**: React auto-escapes content  
✅ **CORS**: Backend configures allowed origins  
✅ **No Sensitive Data**: Tokens in httpOnly would be better (future improvement)  

---

## Scalability & Performance

### Database Performance

**Indexes** (via Prisma):
- Primary keys: Automatic B-tree index
- Foreign keys: Indexed for join performance
- Unique constraints: Indexed for fast lookups

**Query Optimization**:
```typescript
// Efficient: Only fetch needed data
include: {
  folders: {
    select: { id: true, name: true },
  },
}

// Use pagination for large datasets (future improvement)
```

### Caching Strategy

**React Query Cache**:
- 5-minute stale time for data rooms
- Aggressive invalidation on mutations
- Background refetching when window refocuses

**Supabase CDN**:
- Files served from global CDN
- Reduced latency for file downloads

### Horizontal Scalability

**Stateless Backend**:
- JWT tokens = no session storage
- Can run multiple backend instances
- Load balancer distributes requests

**Database Pooling**:
- Supabase Session Pooler handles connections
- Efficient connection reuse

---

## Future Improvements

### Short Term
- [ ] File download functionality
- [ ] File preview (PDF viewer)
- [ ] Drag & drop file upload
- [ ] Bulk operations (select multiple files)
- [ ] Search functionality

### Medium Term
- [ ] Sharing & permissions (read-only, edit access)
- [ ] Activity logs (who accessed what, when)
- [ ] File versioning
- [ ] Trash/recycle bin
- [ ] Advanced search with filters

### Long Term
- [ ] Real-time collaboration (WebSockets)
- [ ] E-signature integration
- [ ] Advanced analytics & reporting
- [ ] Mobile app (React Native)
- [ ] API rate limiting
- [ ] Multi-factor authentication

---

## Conclusion

This architecture balances **simplicity**, **security**, and **scalability**. Key decisions prioritize:

1. **Developer Experience**: TypeScript, Prisma, React Query
2. **Security**: Google OAuth, ownership verification, file validation
3. **Scalability**: Stateless backend, managed infrastructure
4. **Maintainability**: Clear separation of concerns, documented code

The system is designed to handle growth from prototype to production while maintaining code quality and security standards.


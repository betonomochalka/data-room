# Manual Supabase Setup (Alternative Approach)

Since Prisma is having connection issues, let's create the tables manually in Supabase.

## Step 1: Create Tables in Supabase

Go to your **Supabase Dashboard** → **SQL Editor** and run this SQL:

```sql
-- Create data_rooms table
CREATE TABLE IF NOT EXISTS data_rooms (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  user_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create folders table
CREATE TABLE IF NOT EXISTS folders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  data_room_id UUID REFERENCES data_rooms(id) ON DELETE CASCADE,
  parent_folder_id UUID REFERENCES folders(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create files table
CREATE TABLE IF NOT EXISTS files (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  data_room_id UUID REFERENCES data_rooms(id) ON DELETE CASCADE,
  folder_id UUID REFERENCES folders(id) ON DELETE SET NULL,
  user_id TEXT NOT NULL,
  file_size BIGINT,
  mime_type TEXT,
  file_path TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE data_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE files ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can only see their own data rooms" ON data_rooms
  FOR ALL USING (auth.uid()::text = user_id);

CREATE POLICY "Users can only see folders in their data rooms" ON folders
  FOR ALL USING (auth.uid()::text = user_id);

CREATE POLICY "Users can only see files in their data rooms" ON files
  FOR ALL USING (auth.uid()::text = user_id);
```

## Step 2: Update Prisma Schema

After creating the tables, update your Prisma schema to match:

```prisma
model DataRoom {
  id          String   @id @default(uuid())
  name        String
  description String?
  user_id     String   @map("user_id")
  folders     Folder[]
  files       File[]
  created_at  DateTime @default(now()) @map("created_at")
  updated_at  DateTime @updatedAt @map("updated_at")

  @@map("data_rooms")
}

model Folder {
  id             String   @id @default(uuid())
  name           String
  data_room_id   String   @map("data_room_id")
  parent_folder_id String? @map("parent_folder_id")
  user_id        String   @map("user_id")
  created_at     DateTime @default(now()) @map("created_at")
  updated_at     DateTime @updatedAt @map("updated_at")

  @@map("folders")
}

model File {
  id          String   @id @default(uuid())
  name        String
  data_room_id String   @map("data_room_id")
  folder_id   String?  @map("folder_id")
  user_id     String   @map("user_id")
  file_size   BigInt?  @map("file_size")
  mime_type   String?  @map("mime_type")
  file_path   String?  @map("file_path")
  created_at  DateTime @default(now()) @map("created_at")
  updated_at  DateTime @updatedAt @map("updated_at")

  @@map("files")
}
```

## Step 3: Generate Prisma Client

After updating the schema:

```bash
cd backend
npx prisma generate
```

## Step 4: Test the Connection

Try to connect to the database:

```bash
npx prisma studio --port 5556
```

This approach bypasses the migration issues and creates the tables directly in Supabase.

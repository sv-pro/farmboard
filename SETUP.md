# Farmboard Setup Guide

This guide will help you get Farmboard up and running with Supabase for progress persistence.

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Supabase (Option A - Recommended for Production)

#### Create a Supabase Project

1. Go to [https://app.supabase.com](https://app.supabase.com)
2. Create a new project (free tier available)
3. Wait for the project to be ready (~2 minutes)

#### Get Your API Keys

1. Go to **Settings** → **API**
2. Copy your **Project URL** and **anon/public** key

#### Create Database Table

1. Go to **SQL Editor** in your Supabase dashboard
2. Copy and paste the SQL from `supabase/schema.sql`
3. Click **Run** to create the table

#### Configure Environment Variables

```bash
cp .env.example .env
```

Edit `.env` and add your Supabase credentials:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

### 3. Set Up Local Development with Docker (Option B - For Testing)

If you want to test locally without Supabase cloud:

```bash
# Start PostgreSQL database
docker-compose up -d

# The app will connect to localhost PostgreSQL
# (Note: You'll need to configure connection manually)
```

### 4. Run the App

```bash
npm run dev
```

Visit [http://localhost:5173](http://localhost:5173)

## How It Works

### Progressive Persistence

Farmboard uses a **progressive persistence** strategy:

1. **Always works offline** - Progress is saved to localStorage first
2. **Syncs when online** - Automatically pushes to Supabase in background
3. **Auto-recovery** - Retries failed syncs when connection is restored

### Sync Status Indicator

The header shows the current sync status:

- ✅ **Synced** - All changes saved to Supabase
- 🔄 **Syncing...** - Currently saving to Supabase
- ⚠️ **X pending syncs** - Failed syncs (click to retry)

### Data Flow

```
User completes mission
  ↓
Saved to localStorage (instant)
  ↓
Synced to Supabase (background)
  ↓
If offline: queued for retry
```

## Database Schema

The app uses a single table `users_progress`:

| Column       | Type         | Description                              |
| ------------ | ------------ | ---------------------------------------- |
| id           | UUID         | Primary key                              |
| user_id      | TEXT         | User identifier (auto-generated)         |
| missions     | JSONB        | Mission progress data                    |
| last_updated | TIMESTAMPTZ  | Last update timestamp                    |
| created_at   | TIMESTAMPTZ  | Creation timestamp                       |

## Migration Guide

### From MongoDB to Supabase

The app is designed with an abstraction layer (`src/services/storage.ts`) that makes database migration easy.

**To switch back to MongoDB:**

1. Install MongoDB: `npm install mongodb`
2. Edit `src/services/storage.ts`
3. Change the export from `SupabaseStorageService` to `MongoStorageService`
4. Update environment variables

That's it! The rest of the app doesn't need changes.

### From Supabase to Another DB

1. Implement the `StorageService` interface in a new class
2. Update the export in `src/services/storage.ts`
3. Update environment variables

Example: See the commented MongoDB implementation in `storage.ts`.

## Troubleshooting

### "Missing env.VITE_SUPABASE_URL"

**Solution:** Make sure you've created `.env` file with your Supabase credentials.

### Progress not syncing

1. Check browser console for errors
2. Verify your Supabase credentials
3. Check if RLS policies are set correctly in Supabase
4. Try manual sync (click the pending syncs button)

### Offline mode

Progress is always saved locally, so the app works without internet. Changes will sync automatically when connection is restored.

## Security Notes

### Row Level Security (RLS)

The default schema has permissive RLS policies for MVP. For production:

1. Add proper authentication (wallet connect)
2. Update RLS policies to restrict access per user
3. See commented policies in `supabase/schema.sql`

### API Keys

- ✅ **anon/public key** is safe to expose (read-only by default)
- ❌ **service_role key** should NEVER be exposed in frontend

## Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import to Vercel
3. Add environment variables in Vercel dashboard:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Deploy!

The `vercel.json` is already configured.

## Support

For issues or questions:

- Check `CONTRIBUTING.md` for development guidelines
- Check `PROJECT_SUMMARY.md` for architecture overview
- Open an issue on GitHub

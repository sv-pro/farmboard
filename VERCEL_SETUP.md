# Vercel Environment Variables Setup

## Problem

The farmboard app is deployed but showing a **500 FUNCTION_INVOCATION_FAILED** error because Supabase environment variables are not set.

## Solution

Set these environment variables in your Vercel dashboard:

### 1. Go to Vercel Dashboard

1. Visit https://vercel.com/dashboard
2. Select your **farmboard** project
3. Click **Settings** in the top menu
4. Click **Environment Variables** in the left sidebar

### 2. Add Supabase Credentials

Add these two variables:

| Key | Value | Where to Find It |
|-----|-------|------------------|
| `SUPABASE_URL` | `https://[your-project].supabase.co` | Supabase Dashboard → Project Settings → API → Project URL |
| `SUPABASE_ANON_KEY` | `eyJhbGciOi...` | Supabase Dashboard → Project Settings → API → Project API keys → `anon` `public` |

### 3. Set Environment Scope

For each variable:
- ✅ Check **Production**
- ✅ Check **Preview**
- ✅ Check **Development**

This ensures the variables work in all environments.

### 4. Redeploy

After saving the variables:
1. Go to **Deployments** tab
2. Click the **⋯** menu on the latest deployment
3. Click **Redeploy**

OR just push a new commit - Vercel will automatically redeploy.

---

## How to Find Your Supabase Credentials

### Supabase URL
1. Go to https://app.supabase.com
2. Select your farmboard project
3. Click the **Settings** (gear icon)
4. Click **API** in the left sidebar
5. Copy the **Project URL** (e.g., `https://xyz123.supabase.co`)

### Supabase Anon Key
1. Same location as above (Settings → API)
2. Under **Project API keys**, find the `anon` `public` key
3. Click **Copy** to copy the long JWT token (starts with `eyJ...`)

---

## Verify It Works

After redeploying:

1. Go to https://farmboard.vercel.app/
2. Click the **🐛 Debug** button in the bottom-right
3. Click **Test API Connection**

**Expected result:**
```json
{
  "userId": "test_connection",
  "missions": {},
  "lastUpdated": "2025-..."
}
```

If you still see an error, check the error message in the debug panel and verify:
- Environment variables are spelled correctly
- The Supabase project URL is correct
- The anon key is the full JWT token
- You ran the `supabase/schema.sql` in your Supabase SQL Editor

---

## Troubleshooting

### Still getting 500 error?

1. **Check Vercel Logs:**
   - Go to Vercel Dashboard → Your Project → Deployments
   - Click on the latest deployment
   - Click **Functions** tab
   - Look for `/api/progress` errors

2. **Verify Supabase Table Exists:**
   - Go to Supabase Dashboard → Table Editor
   - You should see a `users_progress` table
   - If not, run the SQL from `supabase/schema.sql`

3. **Test Supabase Connection:**
   - Go to Supabase Dashboard → SQL Editor
   - Run: `SELECT * FROM users_progress LIMIT 1;`
   - Should return empty or with data (not an error)

### Debug Panel shows "non-JSON response"?

This means the API is returning an HTML error page instead of JSON. Check:
- Environment variables are set in Vercel
- Supabase credentials are valid
- The Supabase project is not paused or deleted

---

## Local Development

For local development, create a `.env` file:

```bash
cp .env.example .env
```

Then edit `.env` and add:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

Run the app:
```bash
make dev
```

The debug panel will work locally too!

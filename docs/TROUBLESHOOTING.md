# Troubleshooting Guide

Common issues and solutions for Farmboard development.

## Table of Contents

- [Makefile Issues](#makefile-issues)
- [Build & TypeScript Errors](#build--typescript-errors)
- [Environment & Configuration](#environment--configuration)
- [Development Server](#development-server)
- [Supabase & Database](#supabase--database)
- [Git & Deployment](#git--deployment)

---

## Makefile Issues

### `make stop` or `make quickstart` terminates itself

**Symptom:**
```bash
make[1]: *** [Makefile:106: stop] Terminated
make: *** [Makefile:20: quickstart] Error 2
```

**Cause:**
The `pkill` command matches its own process name in the Makefile.

**Solution:**
Already fixed in the current Makefile using the "square brackets trick":
```makefile
# Wrong (matches itself):
pkill -f "vite"

# Correct (won't match itself):
pkill -f "[v]ite"
```

**Why it works:**
- The pattern `[v]ite` matches the literal string "vite"
- But the make command line contains `[v]ite` (with brackets), not `vite`
- So it won't match the make process itself

### Background process not starting with `make dev-bg`

**Symptom:**
```bash
❌ Failed to start dev server
```

**Check:**
1. Verify no other process is using port 5173:
   ```bash
   lsof -i :5173
   # or
   netstat -tlnp | grep 5173
   ```

2. Check the logs:
   ```bash
   cat /tmp/farmboard-dev.log
   ```

3. Check if PID file exists:
   ```bash
   ls -la /tmp/farmboard-dev.pid
   ```

**Solution:**
- Kill any existing process on port 5173
- Clean up stale PID file: `rm /tmp/farmboard-dev.pid`
- Try `make stop` then `make dev-bg` again

### `make sync` fails with rebase conflict

**Symptom:**
```bash
⚠️  Rebase conflict detected. Please resolve manually.
```

**Solution:**
1. Check git status:
   ```bash
   git status
   ```

2. Resolve conflicts manually:
   ```bash
   # Edit conflicted files
   git add <resolved-files>
   git rebase --continue
   ```

3. Or abort and merge instead:
   ```bash
   git rebase --abort
   git pull origin <branch-name>
   ```

---

## Build & TypeScript Errors

### `import type` errors when building

**Symptom:**
```
error TS1484: 'UserProgress' is a type and must be imported using a type-only import when 'verbatimModuleSyntax' is enabled.
```

**Cause:**
TypeScript strict mode with `verbatimModuleSyntax` requires type-only imports.

**Solution:**
Use `import type` for type-only imports:
```typescript
// Wrong:
import { UserProgress, MissionProgress } from '../types';

// Correct:
import type { UserProgress, MissionProgress } from '../types';
```

### `process is not defined` error

**Symptom:**
```
error TS2591: Cannot find name 'process'
```

**Cause:**
Vite doesn't provide Node.js `process` in browser environment.

**Solution:**
Use `import.meta.env` instead:
```typescript
// Wrong (Node.js style):
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;

// Correct (Vite style):
const url = import.meta.env.VITE_SUPABASE_URL;
```

### Build succeeds but runtime error: "module doesn't provide export"

**Symptom:**
```
The requested module doesn't provide an export named: 'MissionProgress'
```

**Solutions:**
1. **Clear Vite cache:**
   ```bash
   make clean
   rm -rf node_modules/.vite
   npm run dev
   ```

2. **Check export syntax:**
   - Ensure types are properly exported in `src/types/index.ts`
   - Use `export type` or `export interface`

3. **Restart dev server:**
   ```bash
   make stop
   make dev
   ```

---

## Environment & Configuration

### Missing environment variables

**Symptom:**
```
Error: Missing env.VITE_SUPABASE_URL
```

**Solution:**
1. Create `.env` file from example:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` with your credentials:
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your_anon_key_here
   ```

3. Restart dev server:
   ```bash
   make restart
   ```

**Note:** The app works offline without Supabase - it will only log a warning.

### Environment variables not updating

**Symptom:**
Changed `.env` but app still uses old values.

**Solution:**
Vite requires a server restart to pick up `.env` changes:
```bash
make restart
# or
make stop
make dev
```

**Important:**
- Environment variables are embedded at build time
- Browser needs page reload after server restart
- Use `import.meta.env` not `process.env`

### `.env` file not being read

**Check:**
1. File must be in project root (same level as `package.json`)
2. File must be named exactly `.env` (not `.env.local` or `.env.development`)
3. Variables must start with `VITE_` prefix for Vite to expose them

**Verify it's working:**
```typescript
console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL);
```

---

## Development Server

### Port 5173 already in use

**Symptom:**
```
Error: Port 5173 is already in use
```

**Solution:**
1. Find and kill the process:
   ```bash
   # Find process
   lsof -ti:5173

   # Kill it
   kill -9 $(lsof -ti:5173)

   # Or use make command
   make stop
   ```

2. Or use a different port:
   ```bash
   PORT=5174 npm run dev
   ```

### Hot reload not working

**Symptoms:**
- Changes to files don't trigger browser reload
- Edits to `missions.yaml` don't update UI

**Solutions:**
1. **Check Vite config:**
   Verify `vite.config.ts` includes YAML files:
   ```typescript
   assetsInclude: ['**/*.yaml', '**/*.yml']
   ```

2. **Hard reload browser:**
   - Chrome/Firefox: `Ctrl+Shift+R` (Windows/Linux) or `Cmd+Shift+R` (Mac)

3. **Clear cache and restart:**
   ```bash
   make clean
   make dev
   ```

4. **Check file watchers (Linux):**
   ```bash
   # Increase file watch limit
   echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf
   sudo sysctl -p
   ```

### Development server crashes or hangs

**Symptoms:**
- Server stops responding
- White screen in browser
- No errors in console

**Solutions:**
1. **Check logs:**
   ```bash
   make logs
   # or
   cat /tmp/farmboard-dev.log
   ```

2. **Full restart:**
   ```bash
   make stop
   make clean
   make dev
   ```

3. **Check memory usage:**
   ```bash
   # If using dev-bg
   ps aux | grep vite
   ```

4. **Nuclear option:**
   ```bash
   make clean-all
   make setup
   make dev
   ```

---

## Supabase & Database

### Progress not syncing to Supabase

**Symptoms:**
- Changes saved locally but not in Supabase
- Sync status shows pending syncs
- Warning icon in header

**Check:**
1. **Verify Supabase credentials:**
   ```bash
   # Should show your actual URL, not placeholder
   cat .env | grep VITE_SUPABASE
   ```

2. **Check browser console:**
   Open DevTools (F12) and look for errors

3. **Verify Supabase table exists:**
   - Go to Supabase dashboard → Table Editor
   - Check if `users_progress` table exists
   - If not, run `supabase/schema.sql` in SQL Editor

4. **Check Row Level Security (RLS):**
   - Table Editor → `users_progress` → RLS Status
   - Should be "Enabled" with permissive policy for testing
   - Check policies in `supabase/schema.sql`

**Test connection:**
```typescript
// Add to browser console
const { data, error } = await supabase.from('users_progress').select('*').limit(1);
console.log({ data, error });
```

### "PGRST116" error (row not found)

**Symptom:**
```
error: { code: 'PGRST116', message: 'The result contains 0 rows' }
```

**Explanation:**
This is **not an error** - it just means the user has no progress yet. The code handles this correctly by returning `null`.

**Verify it's working:**
1. Complete a mission
2. Check Supabase dashboard → Table Editor → `users_progress`
3. Should see a new row with your `user_id`

### Can't connect to Supabase (network errors)

**Symptoms:**
- All API calls fail
- Console shows network errors
- Offline mode works fine

**Check:**
1. **Verify URL format:**
   ```env
   # Wrong:
   VITE_SUPABASE_URL=your-project.supabase.co

   # Correct:
   VITE_SUPABASE_URL=https://your-project.supabase.co
   ```

2. **Test Supabase is reachable:**
   ```bash
   curl https://your-project.supabase.co/rest/v1/
   ```

3. **Check firewall/proxy:**
   - Corporate firewall might block Supabase
   - Try from different network
   - Check if VPN is interfering

4. **Verify project is active:**
   - Login to Supabase dashboard
   - Check project status
   - Ensure it hasn't been paused (free tier)

---

## Git & Deployment

### Push rejected: "failed to push some refs"

**Symptom:**
```bash
! [rejected]        branch -> branch (fetch first)
error: failed to push some refs
```

**Solution:**
```bash
# Use make command (handles rebase automatically)
make sync
git push

# Or manually
git pull --rebase origin <branch-name>
git push
```

### Branch name doesn't match session ID

**Symptom:**
```
CRITICAL: the branch should start with 'claude/' and end with matching session id
```

**Explanation:**
This is a GitHub App restriction for security.

**Solution:**
Ensure branch name format is: `claude/description-<session-id>`

Example: `claude/study-codebase-016fCnCuVuGrTN2ghRKuQatw`

### Vercel deployment fails

**Common issues:**

1. **Missing environment variables:**
   - Go to Vercel Dashboard → Settings → Environment Variables
   - Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
   - Redeploy

2. **Build command not found:**
   - Ensure `vercel.json` exists
   - Check `package.json` has `build` script

3. **Build succeeds but runtime error:**
   - Check browser console for errors
   - Verify environment variables are set
   - Check if `.env.example` has correct variable names

**Test locally before deploying:**
```bash
make build
make preview
```

---

## General Debugging Tips

### Enable verbose logging

**Browser:**
```typescript
// In browser console
localStorage.setItem('debug', '*');
location.reload();
```

**Vite:**
```bash
DEBUG=vite:* npm run dev
```

### Check what's actually running

```bash
# Process status
make status

# Full project info
make info

# View logs
make logs
```

### Reset everything

When all else fails:
```bash
# Nuclear reset
make clean-all
rm -rf .vite
rm -f /tmp/farmboard-*
git clean -fdx
make setup
make dev
```

⚠️ **Warning:** This deletes everything including `node_modules` and local changes!

---

## Getting Help

If you're still stuck:

1. **Check logs first:**
   ```bash
   make logs
   # Check browser console (F12)
   # Check /tmp/farmboard-dev.log
   ```

2. **Gather info:**
   ```bash
   make info > debug-info.txt
   ```

3. **Search issues:**
   - Check GitHub issues for similar problems
   - Search for error messages

4. **Ask for help:**
   - Include output of `make info`
   - Include relevant error messages
   - Include steps to reproduce

---

## Quick Reference

| Problem | Quick Fix |
|---------|-----------|
| Make kills itself | Use `[v]ite` pattern (already fixed) |
| TypeScript errors | Use `import type` for types |
| Env vars not working | Restart server, check `VITE_` prefix |
| Build cache issues | `make clean && make dev` |
| Port in use | `make stop` |
| Supabase not syncing | Check credentials, check browser console |
| Hot reload broken | Hard refresh browser (Ctrl+Shift+R) |
| Push rejected | `make sync` first |
| Everything broken | `make clean-all && make setup` |

---

**Last Updated:** 2025-11-15
**Version:** 1.0.0

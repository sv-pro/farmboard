/**
 * Progressive Progress Sync Service
 * - Always works offline (localStorage)
 * - Syncs to Supabase when available
 * - Auto-retries when connection restored
 */

import { UserProgress, MissionProgress } from '../types';

const STORAGE_KEY = 'farmboard_progress';
const PENDING_SYNC_KEY = 'farmboard_pending_sync';
const USER_ID_KEY = 'farmboard_user_id';

interface PendingSync {
  userId: string;
  missionId: string;
  progress: MissionProgress;
  timestamp: string;
}

/**
 * Generate or retrieve user ID
 */
export function getUserId(): string {
  let userId = localStorage.getItem(USER_ID_KEY);
  if (!userId) {
    userId = `user_${crypto.randomUUID()}`;
    localStorage.setItem(USER_ID_KEY, userId);
  }
  return userId;
}

/**
 * Get progress from localStorage (instant, always available)
 */
export function getLocalProgress(userId: string): UserProgress {
  const stored = localStorage.getItem(`${STORAGE_KEY}_${userId}`);
  if (!stored) {
    return {
      userId,
      missions: {},
      lastUpdated: new Date().toISOString(),
    };
  }
  return JSON.parse(stored);
}

/**
 * Save progress to localStorage (instant)
 */
export function saveLocalProgress(progress: UserProgress): void {
  localStorage.setItem(
    `${STORAGE_KEY}_${progress.userId}`,
    JSON.stringify(progress)
  );
}

/**
 * Get pending syncs queue
 */
function getPendingSyncs(): PendingSync[] {
  const stored = localStorage.getItem(PENDING_SYNC_KEY);
  return stored ? JSON.parse(stored) : [];
}

/**
 * Add to pending syncs queue
 */
function addPendingSync(sync: PendingSync): void {
  const pending = getPendingSyncs();
  // Dedupe by userId + missionId
  const filtered = pending.filter(
    (s) => !(s.userId === sync.userId && s.missionId === sync.missionId)
  );
  filtered.push(sync);
  localStorage.setItem(PENDING_SYNC_KEY, JSON.stringify(filtered));
}

/**
 * Clear pending sync
 */
function removePendingSync(userId: string, missionId: string): void {
  const pending = getPendingSyncs();
  const filtered = pending.filter(
    (s) => !(s.userId === userId && s.missionId === missionId)
  );
  localStorage.setItem(PENDING_SYNC_KEY, JSON.stringify(filtered));
}

/**
 * Check if Supabase API is available
 */
async function isSupabaseAvailable(): Promise<boolean> {
  try {
    const response = await fetch('/api/progress?userId=health_check', {
      method: 'GET',
      signal: AbortSignal.timeout(3000), // 3s timeout
    });
    return response.ok || response.status === 400; // 400 means API is up
  } catch {
    return false;
  }
}

/**
 * Sync progress to Supabase (background)
 */
async function syncToSupabase(
  userId: string,
  missionId: string,
  progress: MissionProgress
): Promise<boolean> {
  try {
    const response = await fetch('/api/progress', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, missionId, progress }),
      signal: AbortSignal.timeout(5000),
    });

    if (response.ok) {
      removePendingSync(userId, missionId);
      return true;
    }
    return false;
  } catch (error) {
    console.warn('Supabase sync failed (will retry):', error);
    return false;
  }
}

/**
 * Fetch full progress from Supabase
 */
export async function fetchFromSupabase(userId: string): Promise<UserProgress | null> {
  try {
    const response = await fetch(`/api/progress?userId=${userId}`, {
      signal: AbortSignal.timeout(5000),
    });

    if (response.ok) {
      return await response.json();
    }
    return null;
  } catch (error) {
    console.warn('Failed to fetch from Supabase:', error);
    return null;
  }
}

/**
 * Process pending syncs queue
 */
async function processPendingSyncs(): Promise<void> {
  const pending = getPendingSyncs();
  if (pending.length === 0) return;

  console.log(`Processing ${pending.length} pending sync(s)...`);

  for (const sync of pending) {
    const success = await syncToSupabase(
      sync.userId,
      sync.missionId,
      sync.progress
    );
    if (!success) {
      console.warn('Sync failed, will retry later');
      break; // Stop processing if one fails
    }
  }
}

/**
 * Main: Update mission progress (progressive!)
 * 1. Update localStorage immediately (always works)
 * 2. Try to sync to Supabase in background
 * 3. Queue for retry if sync fails
 */
export async function updateMissionProgress(
  userId: string,
  missionId: string,
  progress: MissionProgress
): Promise<{ success: boolean; synced: boolean }> {
  // 1. Update localStorage immediately (instant feedback)
  const localProgress = getLocalProgress(userId);
  localProgress.missions[missionId] = {
    ...progress,
    missionId,
  };
  localProgress.lastUpdated = new Date().toISOString();
  saveLocalProgress(localProgress);

  // 2. Try to sync to Supabase
  const synced = await syncToSupabase(userId, missionId, progress);

  // 3. Queue if sync failed
  if (!synced) {
    addPendingSync({
      userId,
      missionId,
      progress,
      timestamp: new Date().toISOString(),
    });
  }

  return { success: true, synced };
}

/**
 * Delete mission progress
 */
export async function deleteMissionProgress(
  userId: string,
  missionId: string
): Promise<{ success: boolean; synced: boolean }> {
  // 1. Update localStorage
  const localProgress = getLocalProgress(userId);
  delete localProgress.missions[missionId];
  localProgress.lastUpdated = new Date().toISOString();
  saveLocalProgress(localProgress);

  // 2. Try to sync to Supabase
  try {
    const response = await fetch(
      `/api/progress?userId=${userId}&missionId=${missionId}`,
      {
        method: 'DELETE',
        signal: AbortSignal.timeout(5000),
      }
    );
    return { success: true, synced: response.ok };
  } catch {
    return { success: true, synced: false };
  }
}

/**
 * Initialize sync service
 * - Loads progress from Supabase if available
 * - Falls back to localStorage
 * - Sets up auto-sync interval
 */
export async function initializeSync(userId: string): Promise<UserProgress> {
  // Try to fetch from Supabase
  const remoteProgress = await fetchFromSupabase(userId);

  if (remoteProgress) {
    // Merge with local (remote wins)
    saveLocalProgress(remoteProgress);
    console.log('✅ Progress loaded from Supabase');
  } else {
    console.log('⚠️ Using local-only mode (Supabase unavailable)');
  }

  // Process any pending syncs
  processPendingSyncs();

  // Set up auto-sync every 30 seconds
  setInterval(async () => {
    const isOnline = await isSupabaseAvailable();
    if (isOnline) {
      processPendingSyncs();
    }
  }, 30000);

  // Return current progress
  return getLocalProgress(userId);
}

/**
 * Get sync status
 */
export function getSyncStatus(): {
  pendingCount: number;
  pending: PendingSync[];
} {
  const pending = getPendingSyncs();
  return {
    pendingCount: pending.length,
    pending,
  };
}

/**
 * Manual sync trigger
 */
export async function triggerManualSync(): Promise<boolean> {
  const isOnline = await isSupabaseAvailable();
  if (!isOnline) return false;

  await processPendingSyncs();
  return true;
}

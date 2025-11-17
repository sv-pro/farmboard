/**
 * React hook for progressive mission progress tracking
 * - Works offline (localStorage)
 * - Syncs to Supabase when available
 * - Provides real-time sync status
 */

import { useState, useEffect, useCallback } from 'react';
import type {
  UserProgress,
  MissionProgress,
  ProgressStatus,
} from '../types';
import {
  getUserId,
  getLocalProgress,
  updateMissionProgress as syncUpdateProgress,
  deleteMissionProgress as syncDeleteProgress,
  initializeSync,
  getSyncStatus,
  triggerManualSync,
} from '../services/progressSync';

interface UseProgressReturn {
  progress: UserProgress;
  userId: string;
  isLoading: boolean;
  isSyncing: boolean;
  pendingSyncs: number;
  updateProgress: (missionId: string, progress: MissionProgress) => Promise<void>;
  deleteProgress: (missionId: string) => Promise<void>;
  getMissionStatus: (missionId: string) => ProgressStatus;
  getSubmissionCount: (missionId: string) => number;
  manualSync: () => Promise<void>;
}

/**
 * Hook for managing mission progress
 */
export function useProgress(): UseProgressReturn {
  const [userId] = useState(() => getUserId());
  const [progress, setProgress] = useState<UserProgress>(() =>
    getLocalProgress(userId)
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [pendingSyncs, setPendingSyncs] = useState(0);

  // Initialize on mount
  useEffect(() => {
    async function init() {
      setIsLoading(true);
      const initialProgress = await initializeSync(userId);
      setProgress(initialProgress);
      setIsLoading(false);

      // Update pending count
      const status = getSyncStatus();
      setPendingSyncs(status.pendingCount);
    }
    init();

    // Poll for sync status updates
    const interval = setInterval(() => {
      const status = getSyncStatus();
      setPendingSyncs(status.pendingCount);
    }, 2000);

    return () => clearInterval(interval);
  }, [userId]);

  /**
   * Update mission progress
   */
  const updateProgress = useCallback(
    async (missionId: string, missionProgress: MissionProgress) => {
      setIsSyncing(true);

      const result = await syncUpdateProgress(userId, missionId, missionProgress);

      // Refresh local state
      setProgress(getLocalProgress(userId));

      // Update pending count
      const status = getSyncStatus();
      setPendingSyncs(status.pendingCount);

      setIsSyncing(false);

      if (!result.synced) {
        console.warn('⚠️ Progress saved locally, will sync when online');
      }
    },
    [userId]
  );

  /**
   * Delete mission progress
   */
  const deleteProgress = useCallback(
    async (missionId: string) => {
      setIsSyncing(true);

      await syncDeleteProgress(userId, missionId);

      // Refresh local state
      setProgress(getLocalProgress(userId));

      setIsSyncing(false);
    },
    [userId]
  );

  /**
   * Get mission status
   */
  const getMissionStatus = useCallback(
    (missionId: string): ProgressStatus => {
      const mission = progress.missions[missionId];
      return mission?.status || 'not_started';
    },
    [progress]
  );

  /**
   * Get submission count for a mission
   */
  const getSubmissionCount = useCallback(
    (missionId: string): number => {
      const mission = progress.missions[missionId];
      return mission?.submissions?.length || 0;
    },
    [progress]
  );

  /**
   * Trigger manual sync
   */
  const manualSync = useCallback(async () => {
    setIsSyncing(true);
    await triggerManualSync();
    setProgress(getLocalProgress(userId));
    const status = getSyncStatus();
    setPendingSyncs(status.pendingCount);
    setIsSyncing(false);
  }, [userId]);

  return {
    progress,
    userId,
    isLoading,
    isSyncing,
    pendingSyncs,
    updateProgress,
    deleteProgress,
    getMissionStatus,
    getSubmissionCount,
    manualSync,
  };
}

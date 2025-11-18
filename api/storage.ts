/**
 * Storage service for Vercel serverless functions
 * Self-contained - doesn't import from src/
 */

import { createClient } from '@supabase/supabase-js';

// Types (copied from src/types)
export type ProgressStatus = 'not_started' | 'in_progress' | 'completed';

export interface MissionSubmission {
  missionId: string;
  txHash: string;
  explorerUrl: string;
  notes?: string;
  timestamp: string;
}

export interface MissionProgress {
  missionId: string;
  status: ProgressStatus;
  txHash?: string;
  explorerUrl?: string;
  notes?: string;
  startedAt?: string;
  completedAt?: string;
  submissions?: MissionSubmission[];
  [key: string]: any;
}

export interface UserProgress {
  userId: string;
  missions: Record<string, MissionProgress>;
  lastUpdated: string;
  [key: string]: any;
}

// Supabase client setup
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

// Storage service
export class SupabaseStorage {
  async getProgress(userId: string): Promise<UserProgress | null> {
    const { data, error } = await supabase
      .from('users_progress')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw error;
    }

    return {
      userId: data.user_id,
      missions: data.missions || {},
      lastUpdated: data.last_updated,
    };
  }

  async saveProgress(userId: string, progress: UserProgress): Promise<void> {
    const { error } = await supabase
      .from('users_progress')
      .upsert({
        user_id: userId,
        missions: progress.missions,
        last_updated: new Date().toISOString(),
      }, {
        onConflict: 'user_id', // Specify which column to use for conflict resolution
      });

    if (error) {
      throw error;
    }
  }

  async updateMissionProgress(
    userId: string,
    missionId: string,
    progress: MissionProgress
  ): Promise<void> {
    const existing = await this.getProgress(userId);
    const missions = existing?.missions || {};

    missions[missionId] = {
      ...progress,
      missionId,
    };

    await this.saveProgress(userId, {
      userId,
      missions,
      lastUpdated: new Date().toISOString(),
    });
  }

  async deleteMissionProgress(userId: string, missionId: string): Promise<void> {
    const existing = await this.getProgress(userId);
    if (!existing) return;

    const missions = { ...existing.missions };
    delete missions[missionId];

    await this.saveProgress(userId, {
      userId,
      missions,
      lastUpdated: new Date().toISOString(),
    });
  }
}

export const storage = new SupabaseStorage();

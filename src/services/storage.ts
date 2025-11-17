/**
 * Storage service abstraction layer
 * Makes database migration easy - just swap implementations!
 */

import type { UserProgress, MissionProgress } from '../types';
import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * Storage service interface
 * Swap implementations by changing the export at the bottom!
 */
export interface StorageService {
  getProgress(userId: string): Promise<UserProgress | null>;
  saveProgress(userId: string, progress: UserProgress): Promise<void>;
  updateMissionProgress(
    userId: string,
    missionId: string,
    progress: MissionProgress
  ): Promise<void>;
  deleteMissionProgress(userId: string, missionId: string): Promise<void>;
}

/**
 * Supabase implementation of StorageService
 * Table: users_progress
 * Schema: { id, user_id, missions (JSONB), last_updated }
 */
export class SupabaseStorageService implements StorageService {
  private supabase: SupabaseClient;

  constructor(supabaseClient: SupabaseClient) {
    this.supabase = supabaseClient;
  }

  async getProgress(userId: string): Promise<UserProgress | null> {
    const supabase = this.supabase;

    const { data, error } = await supabase
      .from('users_progress')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      // Return null if not found (not an error)
      if (error.code === 'PGRST116') {
        return null;
      }
      throw error;
    }

    // Map database columns to UserProgress type
    return {
      userId: data.user_id,
      missions: data.missions || {},
      lastUpdated: data.last_updated,
    };
  }

  async saveProgress(userId: string, progress: UserProgress): Promise<void> {
    const supabase = this.supabase;

    const { error } = await supabase
      .from('users_progress')
      .upsert({
        user_id: userId,
        missions: progress.missions,
        last_updated: new Date().toISOString(),
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
    // First, get existing progress
    const existing = await this.getProgress(userId);
    const missions = existing?.missions || {};

    // Update specific mission
    missions[missionId] = {
      ...progress,
      missionId,
    };

    // Save back
    await this.saveProgress(userId, {
      userId,
      missions,
      lastUpdated: new Date().toISOString(),
    });
  }

  async deleteMissionProgress(userId: string, missionId: string): Promise<void> {
    // Get existing progress
    const existing = await this.getProgress(userId);
    if (!existing) return;

    // Remove mission
    const missions = { ...existing.missions };
    delete missions[missionId];

    // Save back
    await this.saveProgress(userId, {
      userId,
      missions,
      lastUpdated: new Date().toISOString(),
    });
  }
}

/**
 * MongoDB implementation (kept for reference - easy to switch back!)
 *
 * export class MongoStorageService implements StorageService {
 *   private collectionName = 'users_progress';
 *
 *   async getProgress(userId: string): Promise<UserProgress | null> {
 *     const db = await getDb();
 *     const collection = db.collection<UserProgress>(this.collectionName);
 *     return await collection.findOne({ userId });
 *   }
 *
 *   async saveProgress(userId: string, progress: UserProgress): Promise<void> {
 *     const db = await getDb();
 *     const collection = db.collection<UserProgress>(this.collectionName);
 *     await collection.updateOne(
 *       { userId },
 *       { $set: { ...progress, lastUpdated: new Date().toISOString() } },
 *       { upsert: true }
 *     );
 *   }
 *
 *   async updateMissionProgress(userId: string, missionId: string, progress: MissionProgress): Promise<void> {
 *     const db = await getDb();
 *     const collection = db.collection<UserProgress>(this.collectionName);
 *     await collection.updateOne(
 *       { userId },
 *       {
 *         $set: {
 *           [`missions.${missionId}`]: { ...progress, missionId },
 *           lastUpdated: new Date().toISOString(),
 *         },
 *       },
 *       { upsert: true }
 *     );
 *   }
 *
 *   async deleteMissionProgress(userId: string, missionId: string): Promise<void> {
 *     const db = await getDb();
 *     const collection = db.collection<UserProgress>(this.collectionName);
 *     await collection.updateOne(
 *       { userId },
 *       {
 *         $unset: { [`missions.${missionId}`]: '' },
 *         $set: { lastUpdated: new Date().toISOString() },
 *       }
 *     );
 *   }
 * }
 */

// Export class for manual instantiation
// API routes and other code should create their own instance with appropriate supabase client

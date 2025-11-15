/**
 * Core type definitions for the Farming Mission Board
 * These types mirror the YAML schema structure
 */

export interface LoggingConfig {
  requireTxHash?: boolean;
  requireExplorerUrl?: boolean;
  allowMultipleTxs?: boolean;
  [key: string]: any; // Support future fields
}

export interface MissionMeta {
  recommendedFrequency?: string;
  [key: string]: any; // Support future fields
}

export interface Mission {
  id: string;
  label: string;
  description?: string;
  goal?: string;
  difficulty?: string;
  suggestedProtocols?: string[];
  steps?: string[];
  logging?: LoggingConfig;
  meta?: MissionMeta;
  [key: string]: any; // Support future fields
}

export interface Network {
  key: string;
  label: string;
  priority?: number;
  explorer?: string;
  missions: Mission[];
  [key: string]: any; // Support future fields
}

export interface MissionBoardConfig {
  version: number;
  networks: Network[];
  [key: string]: any; // Support future fields
}

/**
 * Form submission data for logging mission completion
 */
export interface MissionSubmission {
  missionId: string;
  txHash: string;
  explorerUrl: string;
  notes?: string;
  timestamp: string;
}

// Legacy types for backward compatibility (if needed)
export interface Protocol {
  name: string;
  url?: string;
  description?: string;
  [key: string]: any;
}

export interface Action {
  id: string;
  name: string;
  description?: string;
  estimatedReward?: string;
  difficulty?: string;
  protocols?: Protocol[];
  steps?: string[];
  notes?: string;
  [key: string]: any;
}

/**
 * User progress tracking types
 */
export type ProgressStatus = 'not_started' | 'in_progress' | 'completed';

export interface MissionProgress {
  missionId: string;
  status: ProgressStatus;
  txHash?: string;
  explorerUrl?: string;
  notes?: string;
  startedAt?: string;
  completedAt?: string;
  submissions?: MissionSubmission[]; // Support multiple submissions
  [key: string]: any; // Support future fields
}

export interface UserProgress {
  userId: string;
  missions: Record<string, MissionProgress>; // missionId -> progress
  lastUpdated: string;
  [key: string]: any; // Support future fields
}


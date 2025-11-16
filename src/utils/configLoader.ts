import yaml from 'js-yaml';
import type { MissionBoardConfig } from '../types';

/**
 * Loads and parses the missions.yaml file
 * File is served from public/data/missions.yaml
 * Vite will automatically hot-reload this module when missions.yaml changes
 */
export async function loadMissionsConfig(): Promise<MissionBoardConfig> {
  try {
    // Fetch from public folder (works in both dev and production)
    const response = await fetch('/data/missions.yaml');
    if (!response.ok) {
      throw new Error(`Failed to fetch missions.yaml: ${response.statusText}`);
    }

    const yamlText = await response.text();
    const config = yaml.load(yamlText) as MissionBoardConfig;

    // Validate basic structure
    if (!config.networks || !Array.isArray(config.networks)) {
      throw new Error('Invalid missions.yaml: networks array is required');
    }

    return config;
  } catch (error) {
    console.error('Error loading missions configuration:', error);
    throw error;
  }
}

/**
 * Validates mission configuration structure
 */
export function validateConfig(config: MissionBoardConfig): boolean {
  if (!config.networks || !Array.isArray(config.networks)) {
    return false;
  }

  for (const network of config.networks) {
    if (!network.id || !network.name || !Array.isArray(network.missions)) {
      return false;
    }

    for (const mission of network.missions) {
      if (!mission.id || !mission.name || !Array.isArray(mission.actions)) {
        return false;
      }
    }
  }

  return true;
}

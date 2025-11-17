/**
 * API Route: /api/progress
 * Handles user progress fetching and updating
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { storage, type MissionProgress } from './storage';

/**
 * GET /api/progress?userId=xxx
 * Fetch user progress
 */
async function handleGet(req: VercelRequest, res: VercelResponse) {
  const { userId } = req.query;

  if (!userId || typeof userId !== 'string') {
    return res.status(400).json({ error: 'userId is required' });
  }

  try {
    const progress = await storage.getProgress(userId);

    if (!progress) {
      // Return empty progress if user not found
      return res.status(200).json({
        userId,
        missions: {},
        lastUpdated: new Date().toISOString(),
      });
    }

    return res.status(200).json(progress);
  } catch (error) {
    console.error('Error fetching progress:', error);
    return res.status(500).json({ error: 'Failed to fetch progress' });
  }
}

/**
 * POST /api/progress
 * Update mission progress
 * Body: { userId, missionId, progress: MissionProgress }
 */
async function handlePost(req: VercelRequest, res: VercelResponse) {
  const { userId, missionId, progress } = req.body as {
    userId?: string;
    missionId?: string;
    progress?: MissionProgress;
  };

  if (!userId || !missionId || !progress) {
    return res.status(400).json({
      error: 'userId, missionId, and progress are required',
    });
  }

  try {
    await storage.updateMissionProgress(userId, missionId, progress);

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error updating progress:', error);
    return res.status(500).json({ error: 'Failed to update progress' });
  }
}

/**
 * DELETE /api/progress?userId=xxx&missionId=xxx
 * Reset mission progress
 */
async function handleDelete(req: VercelRequest, res: VercelResponse) {
  const { userId, missionId } = req.query;

  if (!userId || typeof userId !== 'string' || !missionId || typeof missionId !== 'string') {
    return res.status(400).json({ error: 'userId and missionId are required' });
  }

  try {
    await storage.deleteMissionProgress(userId, missionId);

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error deleting progress:', error);
    return res.status(500).json({ error: 'Failed to delete progress' });
  }
}

/**
 * Main handler - routes by HTTP method
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers (adjust for production)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  switch (req.method) {
    case 'GET':
      return handleGet(req, res);
    case 'POST':
      return handlePost(req, res);
    case 'DELETE':
      return handleDelete(req, res);
    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
}

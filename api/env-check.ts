/**
 * Diagnostic endpoint to check environment variables
 * Helps debug Supabase connection issues
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Check what env vars are available
  const envCheck = {
    SUPABASE_URL: {
      exists: !!process.env.SUPABASE_URL,
      value: process.env.SUPABASE_URL ?
        `${process.env.SUPABASE_URL.substring(0, 20)}...` :
        'NOT SET',
    },
    VITE_SUPABASE_URL: {
      exists: !!process.env.VITE_SUPABASE_URL,
      value: process.env.VITE_SUPABASE_URL ?
        `${process.env.VITE_SUPABASE_URL.substring(0, 20)}...` :
        'NOT SET',
    },
    SUPABASE_ANON_KEY: {
      exists: !!process.env.SUPABASE_ANON_KEY,
      value: process.env.SUPABASE_ANON_KEY ?
        `${process.env.SUPABASE_ANON_KEY.substring(0, 20)}...` :
        'NOT SET',
    },
    VITE_SUPABASE_ANON_KEY: {
      exists: !!process.env.VITE_SUPABASE_ANON_KEY,
      value: process.env.VITE_SUPABASE_ANON_KEY ?
        `${process.env.VITE_SUPABASE_ANON_KEY.substring(0, 20)}...` :
        'NOT SET',
    },
  };

  const summary = {
    hasSupabaseUrl: envCheck.SUPABASE_URL.exists || envCheck.VITE_SUPABASE_URL.exists,
    hasSupabaseKey: envCheck.SUPABASE_ANON_KEY.exists || envCheck.VITE_SUPABASE_ANON_KEY.exists,
    ready: (envCheck.SUPABASE_URL.exists || envCheck.VITE_SUPABASE_URL.exists) &&
           (envCheck.SUPABASE_ANON_KEY.exists || envCheck.VITE_SUPABASE_ANON_KEY.exists),
  };

  return res.status(200).json({
    environment: process.env.VERCEL_ENV || 'unknown',
    region: process.env.VERCEL_REGION || 'unknown',
    timestamp: new Date().toISOString(),
    summary,
    envVars: envCheck,
    message: summary.ready
      ? '✅ Environment variables are configured correctly!'
      : '❌ Missing environment variables - check Vercel settings',
  });
}

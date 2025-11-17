/**
 * Supabase client for serverless/Node.js environments
 * Used by API routes in Vercel Functions
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Use process.env for Node.js/Vercel
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  console.error('Missing SUPABASE_URL or VITE_SUPABASE_URL environment variable');
  throw new Error('Missing Supabase URL - check Vercel environment variables');
}
if (!supabaseAnonKey) {
  console.error('Missing SUPABASE_ANON_KEY or VITE_SUPABASE_ANON_KEY environment variable');
  throw new Error('Missing Supabase Anon Key - check Vercel environment variables');
}

let supabaseClient: SupabaseClient | null = null;

/**
 * Get Supabase client for serverless environment
 * Reuses connection to avoid creating too many clients
 */
export function getSupabaseServer(): SupabaseClient {
  if (!supabaseClient) {
    supabaseClient = createClient(supabaseUrl!, supabaseAnonKey!, {
      auth: {
        persistSession: false, // No session persistence in serverless
        autoRefreshToken: false,
      },
    });
  }
  return supabaseClient;
}

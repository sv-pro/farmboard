/**
 * Supabase client configuration
 * Works in both browser and serverless environments
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Use import.meta.env for Vite
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  throw new Error('Missing env.VITE_SUPABASE_URL');
}
if (!supabaseAnonKey) {
  throw new Error('Missing env.VITE_SUPABASE_ANON_KEY');
}

/**
 * Singleton Supabase client
 * Safe for both browser and serverless (automatically reuses connections)
 */
export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

/**
 * Get Supabase client (convenience function)
 */
export function getSupabase(): SupabaseClient {
  return supabase;
}

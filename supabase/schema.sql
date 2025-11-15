-- Farmboard Database Schema for Supabase
-- Run this in your Supabase SQL Editor to create the necessary tables

-- Enable UUID extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users Progress Table
CREATE TABLE IF NOT EXISTS users_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT UNIQUE NOT NULL,
  missions JSONB NOT NULL DEFAULT '{}',
  last_updated TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add index on user_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_progress_user_id ON users_progress(user_id);

-- Add index on last_updated for sorting
CREATE INDEX IF NOT EXISTS idx_users_progress_last_updated ON users_progress(last_updated DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE users_progress ENABLE ROW LEVEL SECURITY;

-- Policy: Allow anonymous access (for MVP)
-- TODO: Replace with proper auth policies when adding wallet authentication
CREATE POLICY "Allow all access for now"
  ON users_progress
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Alternative: Restrictive policies for when you add auth
-- Uncomment these and remove the above policy when ready:
/*
CREATE POLICY "Users can view their own progress"
  ON users_progress
  FOR SELECT
  USING (auth.uid()::TEXT = user_id);

CREATE POLICY "Users can update their own progress"
  ON users_progress
  FOR UPDATE
  USING (auth.uid()::TEXT = user_id)
  WITH CHECK (auth.uid()::TEXT = user_id);

CREATE POLICY "Users can insert their own progress"
  ON users_progress
  FOR INSERT
  WITH CHECK (auth.uid()::TEXT = user_id);

CREATE POLICY "Users can delete their own progress"
  ON users_progress
  FOR DELETE
  USING (auth.uid()::TEXT = user_id);
*/

-- Add helpful comments
COMMENT ON TABLE users_progress IS 'Stores user mission completion progress';
COMMENT ON COLUMN users_progress.user_id IS 'User identifier (wallet address or UUID)';
COMMENT ON COLUMN users_progress.missions IS 'JSONB object storing mission progress by mission ID';
COMMENT ON COLUMN users_progress.last_updated IS 'Timestamp of last progress update';

-- Example query to view all progress:
-- SELECT * FROM users_progress ORDER BY last_updated DESC;

-- Example query to get specific user:
-- SELECT * FROM users_progress WHERE user_id = 'your-user-id';

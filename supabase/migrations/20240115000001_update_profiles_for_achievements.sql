-- Add last_login_at column to profiles table for streak tracking
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMPTZ;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_profiles_last_login ON profiles(last_login_at); 
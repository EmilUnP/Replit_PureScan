-- Create achievements table
CREATE TABLE IF NOT EXISTS achievements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  badge_icon VARCHAR(50) NOT NULL, -- emoji or icon name
  progress_required INTEGER NOT NULL DEFAULT 1,
  type VARCHAR(50) NOT NULL, -- 'scan', 'share', 'streak', 'profile', 'social'
  category VARCHAR(50) NOT NULL, -- 'Progress', 'Social', 'Milestones', 'Engagement'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create user_achievements table
CREATE TABLE IF NOT EXISTS user_achievements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_id UUID NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
  progress_current INTEGER DEFAULT 0,
  completed_at TIMESTAMPTZ NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, achievement_id)
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_achievement_id ON user_achievements(achievement_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_completed ON user_achievements(completed_at) WHERE completed_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_achievements_type ON achievements(type);
CREATE INDEX IF NOT EXISTS idx_achievements_category ON achievements(category);

-- Add RLS policies
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;

-- Achievements are readable by everyone (public)
CREATE POLICY "Achievements are viewable by everyone" ON achievements
  FOR SELECT USING (true);

-- User achievements are only viewable by the user themselves
CREATE POLICY "Users can view their own achievements" ON user_achievements
  FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own achievement progress
CREATE POLICY "Users can insert their own achievement progress" ON user_achievements
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own achievement progress
CREATE POLICY "Users can update their own achievement progress" ON user_achievements
  FOR UPDATE USING (auth.uid() = user_id);

-- Insert sample achievements
INSERT INTO achievements (title, description, badge_icon, progress_required, type, category) VALUES
-- Progress Achievements
('First Scan', 'Complete your first cosmetic or skin analysis', '🎯', 1, 'scan', 'Progress'),
('Scan Explorer', 'Complete 5 total scans', '🔍', 5, 'scan', 'Progress'),
('Analysis Expert', 'Complete 25 total scans', '🧪', 25, 'scan', 'Progress'),
('Scan Master', 'Complete 100 total scans', '🏆', 100, 'scan', 'Progress'),

-- Cosmetic Specific
('Cosmetic Newbie', 'Analyze your first cosmetic product', '💄', 1, 'cosmetic_scan', 'Progress'),
('Ingredient Hunter', 'Analyze 10 cosmetic products', '🧴', 10, 'cosmetic_scan', 'Progress'),
('Beauty Scientist', 'Analyze 50 cosmetic products', '🔬', 50, 'cosmetic_scan', 'Progress'),

-- Skin Analysis
('Skin Aware', 'Complete your first skin analysis', '✨', 1, 'skin_scan', 'Progress'),
('Skin Care Enthusiast', 'Complete 10 skin analyses', '🌟', 10, 'skin_scan', 'Progress'),

-- Social Achievements
('First Share', 'Share your first scan result publicly', '📢', 1, 'share', 'Social'),
('Social Butterfly', 'Share 10 scan results publicly', '🦋', 10, 'share', 'Social'),
('Community Leader', 'Share 25 scan results publicly', '👑', 25, 'share', 'Social'),

-- Engagement Achievements
('Profile Complete', 'Complete your profile with all information', '👤', 1, 'profile', 'Engagement'),
('Daily User', 'Log in for 3 consecutive days', '📅', 3, 'streak', 'Engagement'),
('Weekly Warrior', 'Log in for 7 consecutive days', '🔥', 7, 'streak', 'Engagement'),
('Monthly Master', 'Log in for 30 consecutive days', '⭐', 30, 'streak', 'Engagement'),

-- Milestones
('Safety First', 'Find your first unsafe ingredient', '⚠️', 1, 'safety_alert', 'Milestones'),
('Perfect Score', 'Get a 100% safety score on a product', '💯', 1, 'perfect_score', 'Milestones'),
('Early Adopter', 'One of the first 1000 users', '🚀', 1, 'early_adopter', 'Milestones');

-- Function to update user achievement progress
CREATE OR REPLACE FUNCTION update_achievement_progress(
  p_user_id UUID,
  p_achievement_type VARCHAR,
  p_increment INTEGER DEFAULT 1
)
RETURNS VOID AS $$
DECLARE
  achievement_record RECORD;
BEGIN
  -- Loop through all achievements of the given type
  FOR achievement_record IN 
    SELECT id, progress_required FROM achievements WHERE type = p_achievement_type
  LOOP
    -- Insert or update user achievement progress
    INSERT INTO user_achievements (user_id, achievement_id, progress_current)
    VALUES (p_user_id, achievement_record.id, p_increment)
    ON CONFLICT (user_id, achievement_id) 
    DO UPDATE SET 
      progress_current = user_achievements.progress_current + p_increment,
      updated_at = NOW()
    WHERE user_achievements.completed_at IS NULL; -- Only update if not completed
    
    -- Check if achievement should be completed
    UPDATE user_achievements 
    SET completed_at = NOW(), updated_at = NOW()
    WHERE user_id = p_user_id 
      AND achievement_id = achievement_record.id
      AND progress_current >= achievement_record.progress_required
      AND completed_at IS NULL;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check and complete profile achievement
CREATE OR REPLACE FUNCTION check_profile_completion(p_user_id UUID)
RETURNS VOID AS $$
DECLARE
  profile_complete BOOLEAN := FALSE;
  profile_data RECORD;
BEGIN
  -- Get profile data
  SELECT 
    full_name, bio, age, skin_type, avatar_url,
    preferences
  INTO profile_data
  FROM profiles 
  WHERE id = p_user_id;
  
  -- Check if profile is complete (basic requirements)
  IF profile_data.full_name IS NOT NULL 
     AND profile_data.bio IS NOT NULL 
     AND profile_data.age IS NOT NULL 
     AND profile_data.skin_type IS NOT NULL THEN
    profile_complete := TRUE;
  END IF;
  
  -- If complete, update achievement
  IF profile_complete THEN
    PERFORM update_achievement_progress(p_user_id, 'profile', 1);
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 
-- Setup script for PureScan2 database schema
-- Run this in your Supabase SQL editor or via migration

-- 1. Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT,
    email TEXT,
    avatar_url TEXT,
    full_name TEXT,
    gender TEXT,
    date_of_birth DATE,
    public_profile BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create achievements table
CREATE TABLE IF NOT EXISTS achievements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key TEXT UNIQUE NOT NULL,
    label TEXT NOT NULL,
    description TEXT,
    category TEXT DEFAULT 'general',
    progress_required INTEGER DEFAULT 1,
    icon TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create user_achievements table
CREATE TABLE IF NOT EXISTS user_achievements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    achievement_key TEXT REFERENCES achievements(key) ON DELETE CASCADE,
    achievement_label TEXT,
    achievement_description TEXT,
    achievement_category TEXT,
    progress_value INTEGER DEFAULT 1,
    progress_max INTEGER DEFAULT 1,
    unlocked_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Add created_at column to scans table (to match what the frontend expects)
ALTER TABLE scans ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT scanned_at;

-- Update created_at to match scanned_at for existing records
UPDATE scans SET created_at = scanned_at WHERE created_at IS NULL;

-- 5. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_achievement_key ON user_achievements(achievement_key);
CREATE INDEX IF NOT EXISTS idx_scans_created_at ON scans(created_at);

-- 6. Enable RLS on new tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;

-- 7. Create RLS policies for profiles
CREATE POLICY "Users can view their own profile" ON profiles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" ON profiles
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 8. Create RLS policies for achievements (public read)
CREATE POLICY "Anyone can view achievements" ON achievements
    FOR SELECT USING (true);

-- 9. Create RLS policies for user_achievements
CREATE POLICY "Users can view their own achievements" ON user_achievements
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own achievements" ON user_achievements
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 10. Insert some sample achievements
INSERT INTO achievements (key, label, description, category, progress_required, icon) VALUES
('first_scan', 'First Scan', 'Complete your first cosmetic scan', 'scanning', 1, '🎯'),
('five_scans', 'Scanner Pro', 'Complete 5 cosmetic scans', 'scanning', 5, '⭐'),
('ten_scans', 'Expert Scanner', 'Complete 10 cosmetic scans', 'scanning', 10, '🏆'),
('streak_3', '3-Day Streak', 'Scan products for 3 consecutive days', 'consistency', 3, '🔥'),
('streak_7', 'Weekly Warrior', 'Scan products for 7 consecutive days', 'consistency', 7, '💪'),
('share_first', 'First Share', 'Share your first scan result', 'social', 1, '📤'),
('safety_conscious', 'Safety First', 'Find 5 products with harmful ingredients', 'safety', 5, '🛡️'),
('ingredient_expert', 'Ingredient Expert', 'Learn about 50 different ingredients', 'knowledge', 50, '🧠')
ON CONFLICT (key) DO NOTHING;

-- 11. Insert a sample profile for the existing user
INSERT INTO profiles (user_id, name, email, full_name, public_profile)
SELECT id, 'Demo User', email, 'Demo User', true 
FROM auth.users 
WHERE email = 'demo@example.com'
ON CONFLICT (user_id) DO NOTHING; 
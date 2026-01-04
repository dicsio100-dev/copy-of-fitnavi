-- 1. Workout Logs Table
CREATE TABLE IF NOT EXISTS workout_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    workout_type TEXT NOT NULL,
    duration INTEGER DEFAULT 0, -- minutes
    intensity INTEGER DEFAULT 2, -- 1=Low, 2=Medium, 3=High
    completed_at TIMESTAMPTZ DEFAULT now()
);

-- RLS for workout_logs
ALTER TABLE workout_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own workout logs" ON workout_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own workout logs" ON workout_logs FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 2. Daily Stats Table
CREATE TABLE IF NOT EXISTS daily_stats (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    date DATE DEFAULT CURRENT_DATE,
    sleep_hours NUMERIC DEFAULT 0,
    hydration_liters NUMERIC DEFAULT 0,
    mood TEXT DEFAULT 'Normal', -- 'Excellent', 'Bien', 'Normal', 'Fatigué', 'Stressé'
    protein_met BOOLEAN DEFAULT false,
    no_sugar BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id, date)
);

-- RLS for daily_stats
ALTER TABLE daily_stats ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own daily stats" ON daily_stats FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert/update own daily stats" ON daily_stats FOR ALL USING (auth.uid() = user_id);

-- 3. User Achievements Table
CREATE TABLE IF NOT EXISTS user_achievements (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    achievement_id TEXT NOT NULL,
    unlocked_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id, achievement_id)
);

-- RLS for user_achievements
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own achievements" ON user_achievements FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own achievements" ON user_achievements FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 4. Profile Updates (Add columns if they don't exist)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS xp_points INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS fitness_level TEXT DEFAULT 'Débutant';
-- Also ensure premium columns exist
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_premium BOOLEAN DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS subscription_type TEXT DEFAULT 'free';

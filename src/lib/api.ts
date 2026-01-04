import { supabase } from './supabase';
import { startOfDay, endOfDay, subDays, format, differenceInDays } from 'date-fns';

// --- Types ---
export interface DailyStats {
    id?: string;
    user_id?: string;
    date: string;
    sleep_hours: number;
    hydration_liters: number;
    mood: string;
}

export interface WorkoutLog {
    id: string;
    workout_type: string;
    duration: number;
    completed_at: string;
    intensity: number;
}

export interface DashboardData {
    dailyStats: DailyStats;
    streak: number;
    recentWorkouts: WorkoutLog[];
    weeklyVolume: { name: string; minutes: number }[];
    isLoading: boolean;
}

// --- API Functions ---

// 1. Get Daily Stats (flexible date)
export const getDailyStats = async (userId: string, date?: string): Promise<DailyStats> => {
    const targetDate = date || new Date().toISOString().split('T')[0];

    const { data, error } = await supabase
        .from('daily_stats')
        .select('*')
        .eq('user_id', userId)
        .eq('date', targetDate)
        .maybeSingle();

    if (error && error.code !== 'PGRST116') {
        console.error("Error fetching daily stats:", error);
    }

    if (data) return data;

    return {
        date: targetDate,
        sleep_hours: 0,
        hydration_liters: 0,
        mood: 'Normal'
    };
};

// Synonym for backward compatibility if needed, using the new function
export const getTodayStats = (userId: string) => getDailyStats(userId);

// 2. Update Daily Stats (Upsert)
export const updateDailyStats = async (userId: string, stats: Partial<DailyStats>, date?: string) => {
    const targetDate = date || new Date().toISOString().split('T')[0];

    const { data, error } = await supabase
        .from('daily_stats')
        .upsert({
            user_id: userId,
            date: targetDate,
            ...stats
        }, { onConflict: 'user_id, date' })
        .select()
        .single();

    if (error) throw error;
    return data;
};

// 8. Check and Unlock Milestones (Auto-Trigger)
export const checkAndUnlockMilestones = async (userId: string) => {
    // 1. Check First Workout
    const { count } = await supabase
        .from('workout_logs')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

    if (count && count >= 1) {
        await unlockAchievement(userId, 'first_workout');
    }

    // 2. Check Streak
    const streak = await calculateStreak(userId);
    if (streak >= 7) {
        await unlockAchievement(userId, 'streak_7');
    }

    // Add more milestones here (e.g. 1000 minutes volume, etc.)
};

// 3. Log Workout & XP
export const logWorkout = async (userId: string, workoutType: string, duration: number, intensity: number = 2) => {
    // 1. Insert Log
    const { error: logError } = await supabase
        .from('workout_logs')
        .insert({
            user_id: userId,
            workout_type: workoutType,
            duration,
            intensity
        });

    if (logError) throw logError;

    // 2. Add XP (e.g., 10 XP per minute)
    await addXP(userId, duration * 10);

    // 3. Trigger Milestone Check
    await checkAndUnlockMilestones(userId);
};

// 4. XP & Level Management
export const addXP = async (userId: string, points: number) => {
    // Fetch current XP
    const { data: profile } = await supabase.from('profiles').select('xp_points').eq('id', userId).single();
    const currentXP = profile?.xp_points || 0;
    const newXP = currentXP + points;

    await supabase.from('profiles').update({ xp_points: newXP }).eq('id', userId);
};

export const getUserXP = async (userId: string) => {
    const { data } = await supabase.from('profiles').select('xp_points, fitness_level').eq('id', userId).single();
    return data || { xp_points: 0, fitness_level: 'Débutant' };
};

// 5. Achievements
export const getUnlockedAchievements = async (userId: string): Promise<string[]> => {
    const { data } = await supabase.from('user_achievements').select('achievement_id').eq('user_id', userId);
    return data ? data.map(a => a.achievement_id) : [];
};

export const unlockAchievement = async (userId: string, achievementId: string) => {
    const { error } = await supabase
        .from('user_achievements')
        .upsert({ user_id: userId, achievement_id: achievementId }, { ignoreDuplicates: true }); // Prevent error if already unlocked

    if (!error) {
        console.log(`Unlocked: ${achievementId}`);
    }
};

// 6. Calculate Streak
export const calculateStreak = async (userId: string): Promise<number> => {
    // Get all unique workout dates for the user
    // Note: This is a simplified fetch. For production with thousands of logs, use a recursive CTE or specific counter table.
    const { data: logs, error } = await supabase
        .from('workout_logs')
        .select('completed_at')
        .eq('user_id', userId)
        .order('completed_at', { ascending: false });

    if (error || !logs || logs.length === 0) return 0;

    const uniqueDates = Array.from(new Set(
        logs.map(log => new Date(log.completed_at).toISOString().split('T')[0])
    ));

    if (uniqueDates.length === 0) return 0;

    let streak = 0;
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    // Check if streak is alive
    if (uniqueDates[0] !== today && uniqueDates[0] !== yesterday) {
        // Just for demo/logic: if last workout was BEFORE yesterday, streak is broken. 
        // But if we just want "consecutive days of history", we count.
        // Standard streak logic: must be connected to today.
        return 0;
    }

    let currentDate = new Date(uniqueDates[0]);

    for (let i = 0; i < uniqueDates.length; i++) {
        const checkDate = new Date(uniqueDates[i]);
        if (i === 0) {
            streak++;
            continue;
        }

        const diff = differenceInDays(currentDate, checkDate);
        if (diff === 1) {
            streak++;
            currentDate = checkDate;
        } else {
            break;
        }
    }

    return streak;
};

// 7. Get Weekly Stats for Charts
export const getWeeklyStats = async (userId: string) => {
    const endDate = new Date();
    const startDate = subDays(endDate, 6); // Last 7 days

    const { data, error } = await supabase
        .from('workout_logs')
        .select('duration, completed_at')
        .eq('user_id', userId)
        .gte('completed_at', startDate.toISOString())
        .order('completed_at', { ascending: true });

    if (error) {
        console.error("Error fetching weekly stats:", error);
        return [];
    }

    // Initialize map for last 7 days
    const dailyMap = new Map<string, number>();
    for (let i = 0; i <= 6; i++) {
        const d = subDays(endDate, 6 - i);
        // Ensure "yyyy-MM-dd" format for map keys
        dailyMap.set(format(d, 'yyyy-MM-dd'), 0);
    }

    // Sum durations
    data?.forEach(log => {
        const dateKey = new Date(log.completed_at).toISOString().split('T')[0];
        if (dailyMap.has(dateKey)) {
            dailyMap.set(dateKey, (dailyMap.get(dateKey) || 0) + log.duration);
        }
    });

    // Convert to array
    return Array.from(dailyMap).map(([date, minutes]) => ({
        name: format(new Date(date), 'EEE'), // "Lun", "Mar"... if locale set, otherwise Eng
        minutes,
        fullDate: date
    }));
};

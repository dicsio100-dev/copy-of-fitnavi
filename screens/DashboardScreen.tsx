import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User } from '../types';
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, CartesianGrid, Tooltip, BarChart, Bar } from 'recharts';
import { getDailyStats, calculateStreak, getWeeklyStats, getUserXP } from '../src/lib/api';
import { supabase } from '../src/lib/supabase';
import BodyScanner from '../components/BodyScanner';
import StatGauge from '../components/StatGauge';
import AICoachWidget from '../components/AICoachWidget';
import ParticleBackground from '../components/ParticleBackground';
import { WorkoutLog } from '../src/lib/api';

interface DashboardScreenProps {
  user: User;
  onStartWorkout: () => void;
}

const DashboardScreen: React.FC<DashboardScreenProps> = ({ user, onStartWorkout }) => {
  const [streak, setStreak] = useState(0);
  const [xp, setXp] = useState(0);
  const [dailyStats, setDailyStats] = useState({
    sleep_hours: 0,
    hydration_liters: 0,
    mood: 'Normal' as const
  });
  const [weeklyActivity, setWeeklyActivity] = useState<any[]>([]);
  const [workoutLogs, setWorkoutLogs] = useState<WorkoutLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: { user: authUser } } = await supabase.auth.getUser();
        if (authUser) {
          const [stats, streakVal, weekly, xpData] = await Promise.all([
            getDailyStats(authUser.id),
            calculateStreak(authUser.id),
            getWeeklyStats(authUser.id),
            getUserXP(authUser.id)
          ]);

          setDailyStats(stats);
          setStreak(streakVal);
          setWeeklyActivity(weekly);
          setXp(xpData.xp_points);

          const { data: logsData } = await supabase
            .from('workout_logs')
            .select('*')
            .eq('user_id', authUser.id)
            .order('completed_at', { ascending: false })
            .limit(20);

          if (logsData) setWorkoutLogs(logsData);
        }
      } catch (e) {
        console.error("Error loading dashboard:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const recoveryScore = Math.min(
    ((dailyStats.sleep_hours / 8) * 40) +
    ((dailyStats.hydration_liters / 2.5) * 40) +
    (dailyStats.mood === 'Excellent' ? 20 : dailyStats.mood === 'Bien' ? 15 : 10),
    100
  );

  if (loading) return (
    <div className="h-full flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="relative w-full text-white">
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-6">

        {/* HEADER AREA */}
        <div className="md:col-span-8 flex flex-col md:flex-row md:items-center justify-between gap-4 glass-card p-6 md:p-8 rounded-2xl">
          <div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tighter text-white drop-shadow-[0_0_15px_rgba(16,185,129,0.4)]">
              COMMAND <span className="text-primary">CENTER</span>
            </h1>
            <p className="text-[10px] font-bold text-primary/60 uppercase tracking-[0.4em]">
              STATUS: OPERATIONAL_v4.2
            </p>
          </div>
          <div className="flex items-center gap-6 md:gap-8 justify-between md:justify-end">
            <div className="text-right">
              <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Global Streak</p>
              <p className="text-xl md:text-2xl font-black text-white">{streak} DAYS</p>
            </div>
            <div className="h-10 w-px bg-white/10 hidden md:block" />
            <div className="text-right">
              <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Growth_XP</p>
              <p className="text-xl md:text-2xl font-black text-primary italic">LVL {Math.floor(xp / 1000)}</p>
            </div>
          </div>
        </div>

        {/* PERFORMANCE OVERVIEW (Desktop: Top Right, Mobile: Second) */}
        <div className="md:col-span-4 glass-card rounded-2xl p-6 md:p-8 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-black uppercase tracking-tight text-white">Performance</h3>
            <span className="material-symbols-outlined text-primary">trending_up</span>
          </div>
          <div className="flex-1 w-full min-h-[150px] md:min-h-[120px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weeklyActivity}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#010a05', border: '1px solid rgba(16,185,129,0.2)', borderRadius: '12px' }}
                  itemStyle={{ color: '#10b981' }}
                />
                <Area type="monotone" dataKey="minutes" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* CENTRAL FOCUS: HUMAN SILHOUETTE */}
        <div className="md:col-span-8 md:row-span-4 glass-card rounded-2xl min-h-[450px] md:h-[600px] relative overflow-hidden flex flex-col">
          <div className="absolute top-6 left-6 flex items-center gap-2 z-20">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-active-glow" />
            <span className="text-[10px] font-black text-primary tracking-widest uppercase">Physio_Scan // Active</span>
          </div>

          <div className="flex-1 relative z-10 w-full">
            <BodyScanner workoutLogs={workoutLogs} />
          </div>

          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 w-full px-8 text-center">
            <button
              onClick={onStartWorkout}
              className="w-full max-w-sm py-4 bg-primary text-background-dark font-black uppercase tracking-widest rounded-xl shadow-active-glow hover:scale-105 active:scale-95 transition-all"
            >
              Start Session
            </button>
          </div>
        </div>

        {/* HOLISTIC HEALTH (Mobile: after silhouette, Desktop: Side) */}
        <div className="md:col-span-4 glass-card rounded-2xl p-6 flex flex-col gap-6">
          <h3 className="text-lg font-black uppercase tracking-tight text-white mb-2">Biometrics</h3>
          <div className="flex justify-around items-center">
            <StatGauge
              value={dailyStats.sleep_hours}
              max={8}
              label="Sleep"
              subLabel={dailyStats.sleep_hours >= 7 ? "Optimal" : "Deficit"}
              color="#10b981"
            />
            <StatGauge
              value={recoveryScore}
              max={100}
              label="Recovery"
              subLabel="Score"
              color={recoveryScore > 80 ? "#10b981" : "#facc15"}
            />
          </div>

          <div className="bg-white/5 rounded-2xl p-4 mt-2">
            <div className="flex justify-between items-end mb-2">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Hydration</p>
              <p className="text-xs font-black text-white">{dailyStats.hydration_liters}L / 2.5L</p>
            </div>
            <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-primary" style={{ width: `${(dailyStats.hydration_liters / 2.5) * 100}%` }} />
            </div>
          </div>
        </div>

        {/* WEEKLY ACTIVITY (Bottom Panels) */}
        <div className="md:col-span-4 glass-card rounded-2xl p-6 flex flex-col h-[250px]">
          <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">Weekly Intensity</h3>
          <div className="flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyActivity}>
                <Tooltip
                  cursor={{ fill: 'rgba(16,185,129,0.05)' }}
                  contentStyle={{ backgroundColor: '#010a05', border: '1px solid rgba(16,185,129,0.2)', borderRadius: '8px' }}
                />
                <Bar dataKey="minutes" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* PERFORMANCE ANALYTICS */}
        <div className="md:col-span-4 glass-card rounded-2xl p-6 flex flex-col justify-between gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col justify-center border-r border-white/5 pr-2">
              <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1">Index_S</p>
              <p className="text-2xl font-black text-white">84.2</p>
            </div>
            <div className="flex flex-col justify-center pl-2">
              <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1">VO2_Est</p>
              <p className="text-2xl font-black text-white">52</p>
            </div>
          </div>
          <div className="pt-4 border-t border-white/5">
            <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(xp % 1000) / 10}%` }}
                className="h-full bg-primary shadow-active-glow"
              />
            </div>
            <p className="text-[9px] font-bold text-slate-500 text-center mt-2 uppercase">
              {1000 - (xp % 1000)} XP TO NEXT LEVEL
            </p>
          </div>
        </div>

      </div>

      <AICoachWidget />
    </div>
  );
};

export default DashboardScreen;

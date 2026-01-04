import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { User } from '../types';
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, CartesianGrid, Tooltip } from 'recharts';
import { getDailyStats, calculateStreak, getWeeklyStats, getUserXP } from '../src/lib/api';
import { supabase } from '../src/lib/supabase';
import MuscleHeatmap from '@/components/MuscleHeatmap';
import BodyScanner from '@/components/BodyScanner';
import SystemTerminal from '@/components/SystemTerminal';
import ScreenOverlay from '@/components/ScreenOverlay';
import { WorkoutLog } from '../src/lib/api';

interface DashboardScreenProps {
  user: User;
  onStartWorkout: () => void;
}

const DashboardScreen: React.FC<DashboardScreenProps> = ({ user, onStartWorkout }) => {
  const navigate = useNavigate();

  const [streak, setStreak] = useState(0);
  const [xp, setXp] = useState(0);
  const [dailyStats, setDailyStats] = useState({
    sleep_hours: 0,
    hydration_liters: 0,
    mood: 'Normal' as const
  });
  const [weeklyActivity, setWeeklyActivity] = useState<any[]>([]);
  const [aiLogs, setAiLogs] = useState<string[]>([]);
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

    const logs = [
      '&gt; AUTHENTICATION: SUCCESSFUL',
      '&gt; ANALYSING BIOMETRIC DATA...',
      '&gt; STATUS: OPERATIONAL',
      '&gt; RECOVERY ENGINE: OPTIMAL',
      '&gt; READY FOR COMBAT',
      '&gt; SYNCING SATELLITE DATA...'
    ];
    let index = 0;
    const interval = setInterval(() => {
      setAiLogs(prev => [...prev.slice(-4), logs[index % logs.length]]);
      index++;
    }, 2500);

    return () => clearInterval(interval);
  }, []);

  const recoveryScore = Math.min(
    ((dailyStats.sleep_hours / 8) * 40) +
    ((dailyStats.hydration_liters / 2.5) * 40) +
    (dailyStats.mood === 'Excellent' ? 20 : dailyStats.mood === 'Bien' ? 15 : 10),
    100
  );

  const cardStyle = "bg-[#061109]/60 backdrop-blur-lg border border-[#14f163]/20 shadow-[0_0_15px_rgba(20,241,99,0.2)] rounded-lg p-6 hover:border-[#14f163]/50 hover:shadow-[0_0_30px_rgba(20,241,99,0.3)] transition-all duration-300 relative overflow-hidden";

  if (loading) return null;

  return (
    <div className="h-full bg-[#020502] text-white p-6 relative grid-lines overflow-hidden scrollbar-hide">
      <div className="noise-bg"></div>

      <div className="max-w-[1800px] mx-auto h-full flex flex-col gap-6 relative z-10 overflow-y-auto scrollbar-hide pr-2">

        {/* TOP HEADER COMMANDER */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between border-b border-[#14f163]/20 pb-6"
        >
          <div className="flex items-center gap-6">
            <div className="flex flex-col">
              <h1 className="text-4xl font-heading font-black tracking-tighter text-white neon-text uppercase italic">
                FITNAVI <span className="text-primary italic">AI_CORE</span>
              </h1>
              <div className="flex items-center gap-3 text-[10px] font-mono text-primary/60">
                <span>&gt; SECTOR: 07_BRAVO</span>
                <span className="animate-pulse">SIGNAL: ENCRYPTED_STABLE</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-12">
            <div className="flex items-center gap-4">
              <div className="text-right">
                <span className="text-[9px] text-gray-500 font-mono tracking-widest uppercase">&gt; BIO_RECOVERY</span>
                <p className="text-2xl font-heading font-black text-primary neon-text">{recoveryScore.toFixed(0)}%</p>
              </div>
              <div className="relative w-12 h-12">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="24" cy="24" r="21" fill="none" stroke="rgba(20, 241, 99, 0.1)" strokeWidth="3" />
                  <circle
                    cx="24" cy="24" r="21" fill="none" stroke="#14f163" strokeWidth="3"
                    strokeDasharray={131.9}
                    strokeDashoffset={131.9 * (1 - recoveryScore / 100)}
                    strokeLinecap="round"
                    className="drop-shadow-[0_0_5px_#14f163]"
                  />
                </svg>
              </div>
            </div>

            <div className="text-right border-l border-white/10 pl-8">
              <span className="text-[9px] text-gray-500 font-mono tracking-widest uppercase">OPERATIONAL_TIME</span>
              <p className="text-xl font-heading font-black text-white tracking-widest uppercase">22:45:12</p>
            </div>
          </div>
        </motion.div>

        {/* MAIN GRID */}
        <div className="grid grid-cols-12 gap-8 flex-1">

          {/* CENTRAL ZONE (Col 1-9) */}
          <div className="col-span-9 space-y-8">

            {/* HERO PANEL */}
            <div className="relative group">
              <div className="absolute -top-1 -left-1 w-6 h-6 border-tl-hud z-20 group-hover:scale-110 transition-transform duration-500" />
              <div className="absolute -top-1 -right-1 w-6 h-6 border-tr-hud z-20 group-hover:scale-110 transition-transform duration-500" />
              <div className="absolute -bottom-1 -left-1 w-6 h-6 border-bl-hud z-20 group-hover:scale-110 transition-transform duration-500" />
              <div className="absolute -bottom-1 -right-1 w-6 h-6 border-br-hud z-20 group-hover:scale-110 transition-transform duration-500" />

              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`${cardStyle} min-h-[600px] border-[#14f163]/30`}
              >
                <div className="absolute top-2 right-4 font-mono text-[8px] text-primary/30">REF_ID: BS-9022-X</div>

                <div className="flex flex-col h-full gap-6">
                  <div className="flex items-center justify-between p-2 border-b border-white/5 relative z-10">
                    <div>
                      <h2 className="text-lg font-heading font-black tracking-widest text-[#14f163] uppercase">
                        &gt; PHYSIO_SCAN_v3.2
                      </h2>
                      <p className="text-[8px] font-mono text-gray-500">BIOMETRIC_FEED_ACTIVE // SYNC_LOCK: 99.8%</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-[0_0_8px_#14f163]"></div>
                      <span className="text-[10px] font-mono text-primary uppercase tracking-widest">Analysing</span>
                    </div>
                  </div>

                  <div className="flex-1 min-h-[400px]">
                    <BodyScanner workoutLogs={workoutLogs} />
                  </div>

                  <div className="flex justify-around items-center bg-black/40 rounded-lg p-4 border border-white/5">
                    <div className="flex flex-col items-center gap-2">
                      <div className="relative w-10 h-10">
                        <svg className="w-full h-full -rotate-90">
                          <circle cx="20" cy="20" r="18" stroke="rgba(255,0,60,0.1)" strokeWidth="2" fill="none" />
                          <circle cx="20" cy="20" r="18" stroke="#ff003c" strokeWidth="2" fill="none" strokeDasharray="113" strokeDashoffset="40" className="drop-shadow-[0_0_5px_#ff003c]" />
                        </svg>
                        <motion.span animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity }} className="material-symbols-outlined absolute inset-0 flex items-center justify-center text-[#ff003c] text-xs">favorite</motion.span>
                      </div>
                      <span className="text-[8px] font-mono text-gray-500 uppercase">&gt; HEART_RATE</span>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                      <div className="relative w-10 h-10">
                        <svg className="w-full h-full -rotate-90">
                          <circle cx="20" cy="20" r="18" stroke="rgba(0,240,255,0.1)" strokeWidth="2" fill="none" />
                          <circle cx="20" cy="20" r="18" stroke="#00f0ff" strokeWidth="2" fill="none" strokeDasharray="113" strokeDashoffset="30" className="drop-shadow-[0_0_5px_#00f0ff]" />
                        </svg>
                        <span className="material-symbols-outlined absolute inset-0 flex items-center justify-center text-[#00f0ff] text-xs">water_drop</span>
                      </div>
                      <span className="text-[8px] font-mono text-gray-500 uppercase">&gt; HYDRATION</span>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                      <div className="relative w-10 h-10">
                        <svg className="w-full h-full -rotate-90">
                          <circle cx="20" cy="20" r="18" stroke="rgba(200,255,0,0.1)" strokeWidth="2" fill="none" />
                          <circle cx="20" cy="20" r="18" stroke="#c8ff00" strokeWidth="2" fill="none" strokeDasharray="113" strokeDashoffset="50" className="drop-shadow-[0_0_5px_#c8ff00]" />
                        </svg>
                        <span className="material-symbols-outlined absolute inset-0 flex items-center justify-center text-[#c8ff00] text-xs">psychology</span>
                      </div>
                      <span className="text-[8px] font-mono text-gray-500 uppercase">&gt; NEURAL_FOCUS</span>
                    </div>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.01, boxShadow: '0 0 40px rgba(20,241,99,0.3)' }}
                    onClick={onStartWorkout}
                    className="w-full bg-primary text-black font-heading font-black text-xl py-5 rounded tracking-[0.2em] uppercase transition-all shadow-neon"
                  >
                    ▶ INITIATE_SESSION
                  </motion.button>
                </div>
              </motion.div>
            </div>

            <div className="grid grid-cols-2 gap-8">
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className={cardStyle}>
                <div className="absolute top-2 right-4 font-mono text-[8px] text-primary/20">DATA: ST-44</div>
                <h3 className="text-[10px] font-mono text-primary tracking-widest uppercase mb-4">&gt; STREAK_INTEGRITY</h3>
                <p className="text-5xl font-heading font-black neon-text italic">{streak}<span className="text-xs ml-2 text-gray-500 not-italic uppercase font-mono tracking-tighter">Days_Locked</span></p>
                <div className="mt-6 flex gap-1.5 h-1.5">
                  {[...Array(14)].map((_, i) => (
                    <div key={i} className={`flex-1 rounded-sm ${i < streak ? 'bg-primary shadow-[0_0_5px_#14f163]' : 'bg-white/5'}`}></div>
                  ))}
                </div>
              </motion.div>

              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className={cardStyle}>
                <div className="absolute top-2 right-4 font-mono text-[8px] text-primary/20">DATA: XP-09</div>
                <h3 className="text-[10px] font-mono text-primary tracking-widest uppercase mb-4">&gt; ELITE_PROGRESSION</h3>
                <p className="text-5xl font-heading font-black neon-text italic">LVL_{Math.floor(xp / 1000)}<span className="text-xs ml-2 text-gray-500 not-italic uppercase font-mono tracking-tighter">{xp % 1000} / 1000 XP</span></p>
                <div className="mt-6 w-full h-1.5 bg-white/5 rounded-sm overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${(xp % 1000) / 10}%` }} className="h-full bg-primary shadow-[0_0_10px_#14f163]" />
                </div>
              </motion.div>
            </div>
          </div>

          {/* VITAL PANEL (Col 10-12) */}
          <div className="col-span-3 space-y-8 h-full flex flex-col">

            {/* TERMINAL CARD */}
            <div className="relative group flex-1 max-h-[350px]">
              <div className="absolute -top-1 -left-1 w-4 h-4 border-tl-hud z-20 group-hover:scale-110 transition-transform" />
              <div className="absolute -top-1 -right-1 w-4 h-4 border-tr-hud z-20 group-hover:scale-110 transition-transform" />
              <div className="absolute -bottom-1 -left-1 w-4 h-4 border-bl-hud z-20 group-hover:scale-110 transition-transform" />
              <div className="absolute -bottom-1 -right-1 w-4 h-4 border-br-hud z-20 group-hover:scale-110 transition-transform" />

              <div className="h-full bg-black/80 backdrop-blur-xl border border-primary/20 rounded overflow-hidden shadow-neon group-hover:border-primary/50 transition-all duration-300">
                <SystemTerminal />
              </div>
            </div>

            {/* VITAL SENSORS */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className={`${cardStyle} flex-1`}>
              <div className="absolute top-2 right-4 font-mono text-[8px] text-primary/20">SYS_V-5</div>
              <h3 className="text-[10px] font-mono text-primary tracking-widest uppercase mb-6 neon-text">&gt; VITAL_SENSORS</h3>
              <div className="space-y-8">
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-end">
                    <span className="text-[10px] text-gray-500 font-mono uppercase tracking-tight italic">&gt; HYDRATION_LEVEL</span>
                    <span className="text-lg font-heading font-bold text-primary">{dailyStats.hydration_liters.toFixed(1)}L</span>
                  </div>
                  <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-primary shadow-[0_0_5px_#14f163]" style={{ width: `${(dailyStats.hydration_liters / 2.5) * 100}%` }}></div>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-end">
                    <span className="text-[10px] text-gray-500 font-mono uppercase tracking-tight italic">&gt; SLEEP_CYCLES</span>
                    <span className="text-lg font-heading font-bold text-primary">{dailyStats.sleep_hours}H</span>
                  </div>
                  <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-primary shadow-[0_0_5px_#14f163]" style={{ width: `${(dailyStats.sleep_hours / 8) * 100}%` }}></div>
                  </div>
                </div>

                <div className="pt-4 border-t border-white/5">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-neon-red text-xl animate-pulse">favorite</span>
                      <span className="text-[10px] text-gray-500 font-mono uppercase italic">&gt; PULSE_STABILITY</span>
                    </div>
                    <span className="text-2xl font-heading font-black text-neon-red neon-text-red italic">72_BPM</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* QUICK ACTIONS */}
            <div className="flex flex-col gap-3">
              <button onClick={() => navigate('/stats')} className="w-full bg-primary/5 hover:bg-primary/20 border border-primary/20 text-primary py-4 rounded font-mono text-[10px] tracking-widest uppercase transition-all group overflow-hidden relative">
                <div className="absolute inset-0 bg-primary/20 -translate-x-full group-hover:translate-x-0 transition-transform duration-500" />
                <span className="relative z-10">&gt; DEEP_ANALYZE_BIOMETRICS</span>
              </button>
              <button onClick={() => navigate('/profile')} className="w-full bg-primary/5 hover:bg-primary/20 border border-primary/20 text-primary py-4 rounded font-mono text-[10px] tracking-widest uppercase transition-all group overflow-hidden relative">
                <div className="absolute inset-0 bg-primary/20 -translate-x-full group-hover:translate-x-0 transition-transform duration-500" />
                <span className="relative z-10">&gt; PILOT_CONFIGURATION</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <ScreenOverlay />
    </div>
  );
};

export default DashboardScreen;

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User } from '../types';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar
} from 'recharts';
import { calculateStreak, getUserXP, getWeeklyStats } from '../src/lib/api';
import { supabase } from '../src/lib/supabase';

interface StatsScreenProps {
  user: User;
}

const StatsScreen: React.FC<StatsScreenProps> = ({ user }) => {
  const navigate = useNavigate();

  const [xp, setXp] = useState(0);
  const [level, setLevel] = useState('Débutant');
  const [streak, setStreak] = useState(0);
  const [weeklyActivity, setWeeklyActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: { user: authUser } } = await supabase.auth.getUser();
        if (authUser) {
          const [xpData, streakVal, weekly] = await Promise.all([
            getUserXP(authUser.id),
            calculateStreak(authUser.id),
            getWeeklyStats(authUser.id)
          ]);

          setXp(xpData.xp_points);
          setLevel(xpData.fitness_level || 'Débutant');
          setStreak(streakVal);
          setWeeklyActivity(weekly);
        }
      } catch (e) {
        console.error("Error loading stats:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  // DATA FOR CHARTS
  const radarData = [
    { subject: 'Force', A: 85, fullMark: 100 },
    { subject: 'Endurance', A: 70, fullMark: 100 },
    { subject: 'Vitesse', A: 60, fullMark: 100 },
    { subject: 'Souplesse', A: 55, fullMark: 100 },
    { subject: 'Récupération', A: 92, fullMark: 100 },
    { subject: 'Discipline', A: 88, fullMark: 100 },
  ];

  const volumeData = weeklyActivity.length > 0 ? weeklyActivity.map(day => ({
    name: day.name,
    volume: day.minutes * 12 // Simulated kg volume
  })) : [
    { name: 'Lun', volume: 850 },
    { name: 'Mar', volume: 920 },
    { name: 'Mer', volume: 780 },
    { name: 'Jeu', volume: 1050 },
    { name: 'Ven', volume: 980 },
    { name: 'Sam', volume: 1200 },
    { name: 'Dim', volume: 650 },
  ];

  const recoveryData = [
    { day: 'L', score: 85 },
    { day: 'M', score: 78 },
    { day: 'M', score: 92 },
    { day: 'J', score: 88 },
    { day: 'V', score: 95 },
  ];

  return (
    <div className="min-h-screen bg-background-dark text-white p-6 overflow-y-auto pb-20">
      <div className="max-w-[1600px] mx-auto">

        {/* COMMAND CENTER HEADER */}
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-heading mb-3 tracking-wider">
            LE GRAND NÉON — <span className="text-primary">BIOMÉTRIQUE</span>
          </h1>
          <div className="flex items-center justify-center gap-3">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
            <p className="text-sm text-gray-400 uppercase tracking-widest font-mono animate-pulse">
              Rapports de Performance : Système Opérationnel
            </p>
          </div>
        </div>

        {/* ASYMMETRIC GRID LAYOUT */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">

          {/* CARD 1 - CERVEAU MUSCULAIRE (RADAR) - SPANS 2 COLUMNS */}
          <div className="cyber-card rounded-2xl p-6 lg:col-span-2 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-heading text-primary mb-1">CERVEAU MUSCULAIRE</h3>
                  <p className="text-xs text-gray-400 uppercase tracking-wider font-mono">
                    Analyse Multi-Axes
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-400 font-mono">SCORE GLOBAL</p>
                  <p className="text-3xl font-heading text-primary data-value">75%</p>
                </div>
              </div>

              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                    <PolarGrid stroke="rgba(20, 241, 99, 0.2)" />
                    <PolarAngleAxis
                      dataKey="subject"
                      tick={{ fill: '#14f163', fontSize: 12, fontFamily: 'JetBrains Mono', fontWeight: 600 }}
                    />
                    <PolarRadiusAxis angle={90} domain={[0, 100]} tick={false} />
                    <Radar
                      name="Performance"
                      dataKey="A"
                      stroke="#14f163"
                      strokeWidth={2}
                      fill="#14f163"
                      fillOpacity={0.4}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>

              <div className="mt-4 flex justify-center">
                <button className="bg-primary/10 hover:bg-primary/20 border border-primary/30 text-primary px-6 py-2 rounded-lg text-sm uppercase tracking-wider font-bold transition-all">
                  Commencer le Séance
                </button>
              </div>
            </div>
          </div>

          {/* QUICK STATS COLUMN */}
          <div className="space-y-6">
            {/* STREAK */}
            <div className="cyber-card rounded-xl p-6">
              <p className="text-xs text-gray-400 uppercase tracking-wider mb-2 font-mono">Série Active</p>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-heading text-primary data-value">{streak}</span>
                <span className="text-sm text-gray-400 uppercase">jours</span>
              </div>
            </div>

            {/* LEVEL */}
            <div className="cyber-card rounded-xl p-6">
              <p className="text-xs text-gray-400 uppercase tracking-wider mb-2 font-mono">Niveau</p>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-heading text-primary data-value">{Math.floor(xp / 1000)}</span>
                <span className="text-sm text-gray-400 uppercase">lvl</span>
              </div>
            </div>

            {/* XP */}
            <div className="cyber-card rounded-xl p-6">
              <p className="text-xs text-gray-400 uppercase tracking-wider mb-2 font-mono">Points XP</p>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-heading text-primary data-value">{xp}</span>
              </div>
              <div className="w-full h-1 bg-black/50 rounded-full overflow-hidden mt-3">
                <div
                  className="h-full bg-primary transition-all duration-500"
                  style={{ width: `${Math.min((xp % 1000) / 10, 100)}%` }}
                ></div>
              </div>
            </div>
          </div>

        </div>

        {/* SECOND ROW - VOLUME & RECOVERY */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* CARD 2 - PROGRESSION DE VOLUME (AREA CHART) */}
          <div className="cyber-card rounded-2xl p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl"></div>
            <div className="relative z-10">
              <div className="mb-6">
                <h3 className="text-xl font-heading text-primary mb-1">VOLUME SOULEVÉ : HEBDOMADAIRE</h3>
                <p className="text-xs text-gray-400 uppercase tracking-wider font-mono">
                  Progression sur 7 jours
                </p>
              </div>

              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={volumeData}>
                    <defs>
                      <linearGradient id="volumeGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#14f163" stopOpacity={0.6} />
                        <stop offset="95%" stopColor="#14f163" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(20, 241, 99, 0.1)" />
                    <XAxis
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#6b7280', fontSize: 11, fontFamily: 'JetBrains Mono' }}
                    />
                    <YAxis hide />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#020502',
                        border: '1px solid rgba(20, 241, 99, 0.3)',
                        borderRadius: '8px',
                        fontFamily: 'JetBrains Mono'
                      }}
                      itemStyle={{ color: '#14f163' }}
                      labelStyle={{ color: '#fff' }}
                    />
                    <Area
                      type="monotone"
                      dataKey="volume"
                      stroke="#14f163"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#volumeGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="mt-4 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
                <p className="text-xs text-gray-400 font-mono">ACTIVES</p>
              </div>
            </div>
          </div>

          {/* CARD 3 - RÉCUPÉRATION (BAR CHART) */}
          <div className="cyber-card rounded-2xl p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl"></div>
            <div className="relative z-10">
              <div className="mb-6">
                <h3 className="text-xl font-heading text-primary mb-1">RÉCUPÉRATION</h3>
                <p className="text-xs text-gray-400 uppercase tracking-wider font-mono">
                  Qualité sur 5 jours
                </p>
              </div>

              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={recoveryData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(20, 241, 99, 0.1)" />
                    <XAxis
                      dataKey="day"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#6b7280', fontSize: 11, fontFamily: 'JetBrains Mono' }}
                    />
                    <YAxis hide />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#020502',
                        border: '1px solid rgba(20, 241, 99, 0.3)',
                        borderRadius: '8px',
                        fontFamily: 'JetBrains Mono'
                      }}
                      itemStyle={{ color: '#14f163' }}
                      cursor={{ fill: 'rgba(20, 241, 99, 0.1)' }}
                    />
                    <Bar
                      dataKey="score"
                      fill="#14f163"
                      radius={[8, 8, 0, 0]}
                      animationDuration={1000}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="mt-4 flex items-center justify-between">
                <p className="text-xs text-gray-400 font-mono">SCORE MOYEN</p>
                <p className="text-2xl font-heading text-primary data-value">87.6%</p>
              </div>
            </div>
          </div>

        </div>

        {/* BIO-SCAN MUSCULAIRE - FULL WIDTH */}
        <div className="mt-8 cyber-card rounded-2xl p-8 relative overflow-hidden">
          {/* Scan Line Animation */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute w-full h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50 animate-scan"></div>
          </div>

          <div className="relative z-10">
            <div className="mb-8">
              <h3 className="text-2xl font-heading text-primary mb-1">🧬 BIO-SCAN MUSCULAIRE</h3>
              <p className="text-xs text-gray-400 uppercase tracking-wider font-mono">
                Analyse Holographique Multi-Angles
              </p>
            </div>

            {/* 3 Wireframe Silhouettes */}
            <div className="grid grid-cols-3 gap-8 mb-8">

              {/* FRONT VIEW */}
              <div className="text-center">
                <p className="text-xs text-gray-400 uppercase mb-4 font-mono">Vue Frontale</p>
                <svg viewBox="0 0 200 400" className="w-full h-[350px]">
                  {/* Body Wireframe */}
                  <g stroke="rgba(20, 241, 99, 0.3)" strokeWidth="1" fill="none">
                    {/* Head */}
                    <circle cx="100" cy="30" r="20" />
                    {/* Torso */}
                    <line x1="100" y1="50" x2="100" y2="150" />
                    {/* Shoulders */}
                    <line x1="100" y1="60" x2="60" y2="80" />
                    <line x1="100" y1="60" x2="140" y2="80" />
                    {/* Arms */}
                    <line x1="60" y1="80" x2="50" y2="140" />
                    <line x1="140" y1="80" x2="150" y2="140" />
                    {/* Legs */}
                    <line x1="100" y1="150" x2="80" y2="280" />
                    <line x1="100" y1="150" x2="120" y2="280" />
                    <line x1="80" y1="280" x2="75" y2="380" />
                    <line x1="120" y1="280" x2="125" y2="380" />
                  </g>
                  {/* Muscle Heatmap - Pecs (RED - Fatigued) */}
                  <ellipse cx="100" cy="85" rx="30" ry="25" fill="#ff003c" opacity="0.6" className="animate-pulse" />
                  {/* Quads (GREEN - Fresh) */}
                  <ellipse cx="80" cy="200" rx="12" ry="45" fill="#14f163" opacity="0.5" />
                  <ellipse cx="120" cy="200" rx="12" ry="45" fill="#14f163" opacity="0.5" />
                </svg>
              </div>

              {/* BACK VIEW */}
              <div className="text-center">
                <p className="text-xs text-gray-400 uppercase mb-4 font-mono">Vue Dorsale</p>
                <svg viewBox="0 0 200 400" className="w-full h-[350px]">
                  {/* Body Wireframe */}
                  <g stroke="rgba(20, 241, 99, 0.3)" strokeWidth="1" fill="none">
                    <circle cx="100" cy="30" r="20" />
                    <line x1="100" y1="50" x2="100" y2="150" />
                    <line x1="100" y1="60" x2="60" y2="80" />
                    <line x1="100" y1="60" x2="140" y2="80" />
                    <line x1="60" y1="80" x2="50" y2="140" />
                    <line x1="140" y1="80" x2="150" y2="140" />
                    <line x1="100" y1="150" x2="80" y2="280" />
                    <line x1="100" y1="150" x2="120" y2="280" />
                    <line x1="80" y1="280" x2="75" y2="380" />
                    <line x1="120" y1="280" x2="125" y2="380" />
                  </g>
                  {/* Back Muscles (GREEN - Fresh) */}
                  <ellipse cx="100" cy="90" rx="35" ry="30" fill="#14f163" opacity="0.5" />
                  {/* Glutes (GREEN) */}
                  <ellipse cx="100" cy="155" rx="25" ry="20" fill="#14f163" opacity="0.5" />
                </svg>
              </div>

              {/* SIDE VIEW */}
              <div className="text-center">
                <p className="text-xs text-gray-400 uppercase mb-4 font-mono">Vue Latérale</p>
                <svg viewBox="0 0 200 400" className="w-full h-[350px]">
                  {/* Body Wireframe */}
                  <g stroke="rgba(20, 241, 99, 0.3)" strokeWidth="1" fill="none">
                    <circle cx="100" cy="30" r="20" />
                    <line x1="100" y1="50" x2="100" y2="150" />
                    <line x1="100" y1="60" x2="120" y2="80" />
                    <line x1="120" y1="80" x2="130" y2="140" />
                    <line x1="100" y1="150" x2="95" y2="280" />
                    <line x1="95" y1="280" x2="90" y2="380" />
                  </g>
                  {/* Core (YELLOW - Moderate) */}
                  <ellipse cx="100" cy="110" rx="20" ry="35" fill="#ffd700" opacity="0.4" />
                </svg>
              </div>

            </div>

            {/* Coach Analysis Panel */}
            <div className="cyber-card rounded-lg p-6 border border-primary/20">
              <div className="flex items-start gap-4">
                <span className="material-symbols-outlined text-primary text-3xl">psychology</span>
                <div className="flex-1">
                  <p className="text-xs text-primary uppercase tracking-wider mb-2 font-mono">
                    Analyse Coach Expert
                  </p>
                  <p className="text-white text-sm leading-relaxed mb-3">
                    Tes pectoraux sont en récupération. Privilégie les exercices de dos et de jambes aujourd'hui.
                    Tes quadriceps sont frais et prêts pour une séance intense.
                  </p>
                  <div className="flex gap-2">
                    <span className="px-3 py-1 bg-neon-red/20 border border-neon-red/40 rounded text-xs text-neon-red font-mono">
                      PECS: REPOS
                    </span>
                    <span className="px-3 py-1 bg-primary/20 border border-primary/40 rounded text-xs text-primary font-mono">
                      QUADS: ACTIF
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 3D BADGE CARD */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="cyber-card rounded-2xl p-8 relative overflow-hidden">
            <div className="relative z-10">
              <h3 className="text-xl font-heading text-primary mb-6">BIO-SCAN & SUCCÈSS</h3>

              {/* 3D Rotating Badge */}
              <div className="flex flex-col items-center justify-center py-8">
                <div className="relative w-32 h-32 mb-6">
                  <div className="absolute inset-0 animate-spin-slow">
                    <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_0_20px_rgba(20,241,99,0.6)]">
                      {/* Outer ring */}
                      <circle cx="50" cy="50" r="45" fill="none" stroke="url(#badgeGradient)" strokeWidth="3" />
                      {/* Inner star */}
                      <path
                        d="M50 15 L58 40 L85 40 L63 55 L70 80 L50 65 L30 80 L37 55 L15 40 L42 40 Z"
                        fill="url(#badgeGradient)"
                      />
                      {/* Center circle */}
                      <circle cx="50" cy="50" r="15" fill="#14f163" />
                      <defs>
                        <linearGradient id="badgeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#14f163" />
                          <stop offset="50%" stopColor="#10c14f" />
                          <stop offset="100%" stopColor="#14f163" />
                        </linearGradient>
                      </defs>
                    </svg>
                  </div>
                </div>

                <p className="text-2xl font-heading text-white mb-2">ÉLITE ATHLÈTE</p>
                <p className="text-xs text-gray-400 uppercase tracking-wider font-mono mb-6">
                  Niveau {Math.floor(xp / 1000)}
                </p>

                {/* Progress */}
                <div className="w-full space-y-2">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-gray-400">Entraînements débloqués</span>
                    <span className="text-primary">24/30</span>
                  </div>
                  <div className="w-full h-2 bg-black/50 rounded-full overflow-hidden">
                    <div className="h-full bg-primary transition-all duration-500" style={{ width: '80%' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Floating Particles Background */}
          <div className="cyber-card rounded-2xl p-8 relative overflow-hidden">
            {/* Particles */}
            {[...Array(10)].map((_, i) => (
              <div
                key={i}
                className="particle"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 6}s`
                }}
              ></div>
            ))}

            <div className="relative z-10">
              <h3 className="text-xl font-heading text-primary mb-6">STATISTIQUES RAPIDES</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400 font-mono">Séances ce mois</span>
                  <span className="text-2xl font-heading text-primary data-value">12</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400 font-mono">Temps total</span>
                  <span className="text-2xl font-heading text-primary data-value">8h 45m</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400 font-mono">Calories brûlées</span>
                  <span className="text-2xl font-heading text-primary data-value">4,250</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* TERMINAL LOG SECTION */}
        <div className="mt-8 cyber-card rounded-xl p-6">
          <p className="text-xs text-gray-400 uppercase tracking-wider mb-4 font-mono">
            Logs Système
          </p>
          <div className="font-mono text-sm text-green-400/80 leading-relaxed bg-black/40 p-4 rounded border border-white/5 h-32 overflow-y-auto">
            <p className="mb-2">&gt; Initialisation de l'analyse...</p>
            <p className="mb-2">&gt; Série actuelle: {streak} jours.</p>
            <p>&gt; {streak > 3 ? "Système optimal. Maintien de la performance recommandé." : "Alerte: Inactivité détectée. Reprise de protocole suggérée."}</p>
            <p className="animate-pulse mt-2">_</p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default StatsScreen;

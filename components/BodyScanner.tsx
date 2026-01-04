import React, { useMemo, useState, useCallback, useRef } from 'react';
import Model from 'react-body-highlighter';
import { motion, AnimatePresence } from 'framer-motion';

interface BodyScannerProps {
    workoutLogs: any[];
    userLevel?: string;
}

interface MuscleData {
    name: string;
    muscles: string[];
    intensity: 'light' | 'heavy';
    recoveryTip: string;
}

const BodyScanner: React.FC<BodyScannerProps> = ({ workoutLogs = [], userLevel = 'Débutant' }) => {
    const [selectedMuscle, setSelectedMuscle] = useState<MuscleData | null>(null);
    const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
    const containerRef = useRef<HTMLDivElement>(null);

    // 1. Precise Mapping Dictionary
    const exerciseToMuscles: Record<string, string[]> = {
        'Back Squat (Barre)': ['quadriceps', 'hamstrings', 'gluteal', 'lower-back'],
        'Goblet Squat': ['quadriceps', 'gluteal'],
        'Air Squats': ['quadriceps', 'gluteal'],
        'Développé Couché': ['chest', 'front-deltoids', 'triceps'],
        'Pompes Lestées': ['chest', 'front-deltoids', 'triceps'],
        'Soulevé de Terre': ['lower-back', 'hamstrings', 'gluteal', 'upper-back'],
        'Curl Haltères': ['biceps'],
        'Burpees': ['quadriceps', 'chest', 'abs'],
        'Kettlebell Swings': ['gluteal', 'hamstrings', 'lower-back'],
        'Planche Dynamique': ['abs', 'lower-back'],
        'Thrusters Haltères': ['quadriceps', 'front-deltoids', 'triceps'],
        'Mountain Climbers': ['abs', 'quadriceps']
    };

    // 2. Adaptive Intensity Logic
    const predictiveData = useMemo(() => {
        const fortyEightHoursAgo = new Date(Date.now() - 48 * 60 * 60 * 1000);
        const recentLogs = workoutLogs.filter(log => new Date(log.completed_at) >= fortyEightHoursAgo);

        const muscleStats: Record<string, { count: number; tips: string[] }> = {};

        recentLogs.forEach(log => {
            const muscles = exerciseToMuscles[log.workout_type] || exerciseToMuscles[log.exercise_name] || [];
            muscles.forEach(m => {
                if (!muscleStats[m]) muscleStats[m] = { count: 0, tips: [] };
                muscleStats[m].count += 1;
            });
        });

        const isBeginner = userLevel === 'Débutant';

        return Object.entries(muscleStats).map(([name, stats]) => {
            const isHeavy = stats.count > 1;
            const intensity = isHeavy ? 'heavy' : 'light';

            let recoveryTip = "Hydratation + Étirements doux";
            if (isHeavy) recoveryTip = "Repos total + Massage / Bain chaud";

            return {
                name,
                muscles: [name],
                intensity,
                recoveryTip,
                // Color mapping: Orange for light, Red for heavy
                color: isBeginner
                    ? (isHeavy ? '#FF003C' : '#FFA500')
                    : '#00FFAA' // Green for non-beginners (standard display)
            };
        });
    }, [workoutLogs, userLevel]);

    const handleMuscleClick = useCallback((event: any) => {
        const muscleName = event.target.id || event.target.getAttribute('data-name');
        if (!muscleName) return;

        const data = predictiveData.find(d => d.name === muscleName);
        if (data && userLevel === 'Débutant') {
            setSelectedMuscle(data);

            // Positioning for tooltip
            if (containerRef.current) {
                const rect = containerRef.current.getBoundingClientRect();
                const x = event.clientX || (event.touches && event.touches[0].clientX);
                const y = event.clientY || (event.touches && event.touches[0].clientY);
                setTooltipPos({
                    x: x - rect.left,
                    y: y - rect.top
                });
            }
        } else {
            setSelectedMuscle(null);
        }
    }, [predictiveData, userLevel]);

    return (
        <div
            ref={containerRef}
            className="relative w-full h-full min-h-[500px] flex flex-col items-center justify-center overflow-hidden touch-none"
            onClick={(e) => {
                if (!(e.target as HTMLElement).closest('.rbh-body-path')) {
                    setSelectedMuscle(null);
                }
            }}
        >
            <div className="hologram-container relative w-full h-full flex flex-col items-center justify-center pt-8">

                {/* SCANLINE OVERLAY */}
                <div className="absolute inset-0 pointer-events-none z-50 scanline-mask opacity-10" />

                <div
                    className="relative z-10 w-full flex items-center justify-center -gap-4 md:-gap-8 translate-y-[-20px]"
                    onClick={handleMuscleClick}
                >
                    {/* Vue de face */}
                    <div className="relative silhouette-wrapper px-0">
                        <Model
                            data={predictiveData}
                            bodyColor="rgba(0, 255, 170, 0.03)"
                        />
                    </div>
                    {/* Vue de dos */}
                    <div className="relative silhouette-wrapper px-0">
                        <Model
                            type="posterior"
                            data={predictiveData}
                            bodyColor="rgba(0, 255, 170, 0.03)"
                        />
                    </div>

                    {/* DYNAMIC SCAN LASER */}
                    <motion.div
                        className="absolute left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#00FFAA] to-transparent z-40 shadow-[0_0_15px_#00FFAA]"
                        initial={{ top: '10%' }}
                        animate={{ top: '85%' }}
                        transition={{
                            duration: 4,
                            repeat: Infinity,
                            ease: "linear"
                        }}
                    />
                </div>

                {/* INTERACTIVE TOOLTIP */}
                <AnimatePresence>
                    {selectedMuscle && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.8, y: 10 }}
                            style={{
                                left: tooltipPos.x,
                                top: tooltipPos.y - 80,
                                transform: 'translateX(-50%)'
                            }}
                            className="absolute z-[100] glass-card p-4 rounded-xl border border-[#FF003C]/30 shadow-[0_0_20px_rgba(255,0,60,0.2)] pointer-events-none min-w-[200px]"
                        >
                            <p className="text-[10px] font-black text-[#FF003C] uppercase tracking-widest mb-1">
                                {selectedMuscle.intensity === 'heavy' ? 'ALERTE TENSION FORTE' : 'TENSION DÉTECTÉE'}
                            </p>
                            <p className="text-xs font-bold text-white mb-2 leading-tight">
                                Zone de tension probable - Récupération nécessaire
                            </p>
                            <div className="flex items-center gap-2 pt-2 border-t border-white/10">
                                <span className="material-symbols-outlined text-[14px] text-primary">healing</span>
                                <p className="text-[10px] font-medium text-slate-300">
                                    {selectedMuscle.recoveryTip}
                                </p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* CYBER PEDESTAL */}
                <div className="mt-[-60px] relative z-20">
                    <div className="w-[300px] h-[40px] bg-gradient-to-b from-[#00FFAA33] to-transparent rounded-[50%] border-t-2 border-[#00FFAA] blur-[0.5px] shadow-[0_15px_45px_rgba(0,255,170,0.4)]" />
                </div>
            </div>

            <style>{`
                .hologram-container {
                    perspective: 1000px;
                }
                .silhouette-wrapper svg {
                    filter: drop-shadow(0 0 8px rgba(0, 255, 170, 0.4));
                    overflow: visible;
                    width: 100% !important;
                    height: auto !important;
                    max-height: 400px;
                    cursor: pointer;
                }
                .rbh-body-path {
                  stroke: #00FFAA !important;
                  stroke-width: 0.6 !important;
                  vector-effect: non-scaling-stroke !important;
                  transition: all 0.3s ease-in-out;
                }
                /* Pulse for Red (Heavy Tension) */
                .rbh-muscle-highlighted[fill="#FF003C"] {
                    animation: pulse-red 2s infinite ease-in-out;
                    filter: drop-shadow(0 0 12px #FF003C) !important;
                }
                @keyframes pulse-red {
                    0%, 100% { fill-opacity: 0.4; }
                    50% { fill-opacity: 0.8; }
                }
                /* Subtle shine for Orange */
                .rbh-muscle-highlighted[fill="#FFA500"] {
                    filter: drop-shadow(0 0 8px #FFA500) !important;
                    fill-opacity: 0.5;
                }
                .scanline-mask {
                    background: repeating-linear-gradient(
                        0deg,
                        rgba(0, 0, 0, 0.2),
                        rgba(0, 0, 0, 0.2) 1px,
                        transparent 1px,
                        transparent 2px
                    );
                    background-size: 100% 4px;
                }
            `}</style>
        </div>
    );
};

export default BodyScanner;

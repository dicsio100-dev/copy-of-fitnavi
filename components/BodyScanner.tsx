import React, { useMemo } from 'react';
import Model from 'react-body-highlighter';
import { motion } from 'framer-motion';

interface BodyScannerProps {
    workoutLogs: any[];
}

const BodyScanner: React.FC<BodyScannerProps> = ({ workoutLogs = [] }) => {
    // 1. Data Binding Logic (Last 48 hours)
    const activeMuscles = useMemo(() => {
        const fortyEightHoursAgo = new Date(Date.now() - 48 * 60 * 60 * 1000);
        const recentLogs = workoutLogs.filter(log => new Date(log.completed_at) >= fortyEightHoursAgo);
        const muscles = new Set<string>();

        recentLogs.forEach(log => {
            const type = log.workout_type.toLowerCase();
            if (type.includes('push') || type.includes('chest') || type.includes('pectoral')) {
                muscles.add('chest');
                muscles.add('front-deltoids');
                muscles.add('triceps');
            }
            if (type.includes('pull') || type.includes('dos') || type.includes('back')) {
                muscles.add('upper-back');
                muscles.add('lower-back');
                muscles.add('biceps');
                muscles.add('latissimus-dorsi');
            }
            if (type.includes('legs') || type.includes('jambes')) {
                muscles.add('quadriceps');
                muscles.add('hamstrings');
                muscles.add('gluteal');
                muscles.add('calves');
            }
            if (type.includes('shoulders') || type.includes('épaules')) {
                muscles.add('front-deltoids');
                muscles.add('back-deltoids');
            }
            if (type.includes('abs') || type.includes('abdos')) {
                muscles.add('abs');
            }
        });

        return Array.from(muscles).map(m => ({ name: m, muscles: [m] }));
    }, [workoutLogs]);

    const hasMuscle = (name: string) => activeMuscles.some(m => m.name === name);

    return (
        <div className="relative w-full h-full min-h-[550px] flex flex-col items-center justify-center p-8 overflow-hidden bg-black/20">

            {/* 1. HOLOGRAM CONTAINER (3D PERSPECTIVE & SHADER) */}
            <div className="hologram-container relative w-full h-full flex flex-col items-center justify-center py-10">

                {/* 3D BASE (PROJECTOR) */}
                <div className="absolute bottom-[20%] left-1/2 -translate-x-1/2 w-[350px] h-[60px] bg-primary/20 rounded-[100%] blur-2xl opacity-40 animate-pulse" />
                <div className="absolute bottom-[22%] left-1/2 -translate-x-1/2 w-[280px] h-[40px] border border-primary/30 rounded-[100%] shadow-[0_0_20px_#14f163] opacity-60" />

                {/* FLOATING DATA-VIZ OVERLAYS */}
                <div className="absolute top-[15%] left-[5%] font-mono text-[9px] text-primary space-y-1 animate-pulse z-30">
                    <p className="tracking-widest">&gt; SCAN_LINK: ESTABLISHED</p>
                    <p className="opacity-60">&gt; TARGET_LOCK: PECL_QUAD_01</p>
                </div>
                <div className="absolute top-[40%] right-[2%] font-mono text-[9px] text-primary space-y-1 z-30">
                    <p className="tracking-widest">&gt; BIOMETRIC_SYNC: 98.4%</p>
                    <p className="opacity-60">&gt; LATENCY: 12MS</p>
                </div>
                <div className="absolute bottom-[35%] left-[8%] font-mono text-[9px] text-primary opacity-70 z-30">
                    <p>&gt; VOX_PROTOCOL: ACTIVE</p>
                </div>
                <div className="absolute top-[10%] right-[10%] font-mono text-[9px] text-primary opacity-80 animate-pulse z-30">
                    <p>&gt; THREAT_LEVEL: NOMINAL</p>
                </div>

                {/* DUAL-VIEW BODY MODELS */}
                <div className="flex w-full justify-around items-center gap-12 relative z-20 silhouette-glow">

                    {/* FRONT VIEW */}
                    <div className="relative flex-1 max-w-[200px]">
                        <p className="text-[9px] font-mono text-primary text-center mb-6 tracking-widest uppercase opacity-80 animate-pulse">&gt; HOLO_FRONT</p>
                        <Model
                            data={activeMuscles}
                            highlightedColors={['url(#muscleGlowRed)']}
                            bodyColor="rgba(20,241,99,0.05)"
                            type="male"
                        />
                    </div>

                    {/* BACK VIEW */}
                    <div className="relative flex-1 max-w-[200px]">
                        <p className="text-[9px] font-mono text-primary text-center mb-6 tracking-widest uppercase opacity-60 animate-pulse">&gt; HOLO_BACK</p>
                        <Model
                            data={activeMuscles}
                            highlightedColors={['url(#muscleGlowRed)']}
                            bodyColor="rgba(20,241,99,0.05)"
                            type="male"
                            backView
                        />
                    </div>
                </div>

                {/* STATUS BAR (BOTTOM) */}
                <div className="absolute bottom-4 left-0 right-0 flex justify-between px-6 font-mono text-[8px] text-primary/60 z-30">
                    <span>&gt; AUTH_KEY: GOD_MODE_V3</span>
                    <span className="animate-pulse">RUNNING_HOLOGRAM_V.01</span>
                </div>
            </div>

            {/* SVG DEFINITIONS */}
            <svg style={{ width: 0, height: 0, position: 'absolute' }}>
                <defs>
                    <radialGradient id="muscleGlowRed" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stopColor="#ff003c" stopOpacity="0.9" />
                        <stop offset="100%" stopColor="#660018" stopOpacity="0.1" />
                    </radialGradient>
                </defs>
            </svg>

            {/* HOLOGRAM SHADER & EFFECTS */}
            <style dangerouslySetInnerHTML={{
                __html: `
                .hologram-container {
                    transform: perspective(1000px) rotateX(10deg) scale(0.95);
                    opacity: 0.8;
                    mix-blend-mode: screen;
                    position: relative;
                }

                .hologram-container::after {
                    content: "";
                    position: absolute;
                    inset: -50%;
                    background: repeating-linear-gradient(0deg, transparent, transparent 2px, #000 3px);
                    opacity: 0.3;
                    pointer-events: none;
                    z-index: 50;
                }

                .silhouette-glow {
                    filter: drop-shadow(0 0 5px #14f163);
                    animation: pulse-glow 2s infinite ease-in-out;
                }

                @keyframes pulse-glow {
                    0%, 100% { filter: drop-shadow(0 0 5px #14f163) drop-shadow(0 0 15px rgba(20, 241, 99, 0.5)); }
                    50% { filter: drop-shadow(0 0 8px #14f163) drop-shadow(0 0 25px rgba(20, 241, 99, 0.7)); }
                }

                .rbh-muscle-highlighted {
                    filter: drop-shadow(0 0 12px #ff003c);
                    stroke: #ff003c;
                    stroke-width: 0.5px;
                    animation: musclePulse 3s infinite ease-in-out;
                }

                @keyframes musclePulse {
                    0%, 100% { fill-opacity: 0.4; }
                    50% { fill-opacity: 0.9; }
                }
            `}} />
        </div>
    );
};

export default BodyScanner;

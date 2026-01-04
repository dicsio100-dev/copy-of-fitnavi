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

    const muscleData = activeMuscles; // Renamed for clarity with the provided snippet

    return (
        <div className="relative w-full h-full min-h-[500px] flex flex-col items-center justify-center overflow-hidden">
            {/* 1. HOLOGRAM CONTAINER */}
            <div className="hologram-container relative w-full h-full flex flex-col items-center justify-center">

                {/* DEFINITIONS POUR LES GRADIENTS ET FILTRES */}
                <svg style={{ height: 0, width: 0, position: 'absolute' }}>
                    <defs>
                        <linearGradient id="muscleGlowGreen" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="#10b981" stopOpacity="0.8" />
                            <stop offset="50%" stopColor="#10b981" stopOpacity="0.4" />
                            <stop offset="100%" stopColor="#10b981" stopOpacity="0.8" />
                        </linearGradient>
                        <filter id="neonBlur">
                            <feGaussianBlur stdDeviation="2" result="blur" />
                            <feMerge>
                                <feMergeNode in="blur" />
                                <feMergeNode in="SourceGraphic" />
                            </feMerge>
                        </filter>
                    </defs>
                </svg>

                <div className="relative z-10 w-full h-full flex flex-col items-center justify-center pt-4 md:pt-8 pb-12">
                    <div className="flex gap-8 md:gap-20 items-center justify-center scale-90 sm:scale-100 md:scale-110">
                        {/* Vue de face */}
                        <div className="relative group">
                            <div className="absolute inset-0 bg-primary/5 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                            <Model
                                data={muscleData}
                                bodyColor="rgba(16, 185, 129, 0.05)"
                                highlightedColors={["url(#muscleGlowGreen)"]}
                                onClick={(item) => console.log(item)}
                            />
                        </div>
                        {/* Vue de dos */}
                        <div className="relative group">
                            <div className="absolute inset-0 bg-primary/5 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                            <Model
                                type="posterior"
                                data={muscleData}
                                bodyColor="rgba(16, 185, 129, 0.05)"
                                highlightedColors={["url(#muscleGlowGreen)"]}
                                onClick={(item) => console.log(item)}
                            />
                        </div>
                    </div>

                    {/* SOCLE NEON (GREEN) */}
                    <div className="mt-[-20px] md:mt-[-40px] relative">
                        <div className="neon-pedestal" />
                        {/* RAYS / REFLECTIONS */}
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 md:w-48 h-24 bg-primary/10 blur-3xl rounded-full" />
                    </div>
                </div>

                <style>{`
                    .rbh-muscle-highlighted {
                        filter: url(#neonBlur);
                        animation: musclePulseGreen 2s infinite ease-in-out;
                    }
                    @keyframes musclePulseGreen {
                        0%, 100% { opacity: 0.8; }
                        50% { opacity: 1; }
                    }
                    .hologram-container {
                        perspective: 1000px;
                    }
                    .silhouette-glow {
                        filter: drop-shadow(0 0 10px rgba(16, 185, 129, 0.3));
                    }
                `}</style>
            </div>
        </div>
    );
};

export default BodyScanner;

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const MuscleScan: React.FC = () => {
    const [growth, setGrowth] = useState(0);

    const getScale = (baseScale: number) => {
        return baseScale + (growth * 0.05);
    };

    const draw = {
        hidden: { pathLength: 0, opacity: 0 },
        visible: {
            pathLength: 1,
            opacity: 1,
            transition: {
                pathLength: { type: "spring", duration: 1.5, bounce: 0 },
                opacity: { duration: 0.5 }
            }
        }
    };

    return (
        <div className="flex flex-col items-center gap-6 h-full">
            <div className="relative w-full max-w-[400px] h-[450px] cyber-card rounded-xl p-4 overflow-hidden border-[#14f163]/10">
                <div className="hud-corner corner-tl"></div>
                <div className="hud-corner corner-tr"></div>
                <div className="hud-corner corner-bl"></div>
                <div className="hud-corner corner-br"></div>

                {/* Laser Scan Animation */}
                <motion.div
                    initial={{ top: 0 }}
                    animate={{ top: '100%' }}
                    transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                    className="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent opacity-60 z-20 shadow-[0_0_15px_#14f163]"
                />

                {/* Backdrop Grid */}
                <div className="absolute inset-0 grid-lines opacity-20 pointer-events-none" />

                {/* Human Silhouette SVG */}
                <svg viewBox="0 0 200 400" className="w-full h-full drop-shadow-[0_0_15px_rgba(20,241,99,0.3)]">
                    <defs>
                        <radialGradient id="pecsGradient" cx="50%" cy="50%" r="50%">
                            <stop offset="0%" stopColor="#ff003c" stopOpacity="0.9" />
                            <stop offset="100%" stopColor="#ff003c" stopOpacity="0" />
                        </radialGradient>
                    </defs>

                    {/* Wireframe Body - SELF DRAWING */}
                    <g fill="none" stroke="#14f163" strokeWidth="0.5" strokeOpacity="1">
                        {/* Head */}
                        <motion.circle
                            cx="100" cy="40" r="15"
                            variants={draw} initial="hidden" animate="visible"
                        />

                        {/* Torso & Core */}
                        <motion.path
                            d="M85 55 L115 55 L120 150 L80 150 Z"
                            variants={draw} initial="hidden"
                            style={{ originX: '100px', originY: '100px' }}
                            animate={{
                                scaleX: getScale(1),
                                pathLength: 1,
                                opacity: 1
                            }}
                        />

                        {/* Arms - Upper */}
                        <motion.path
                            d="M85 60 L60 85 L70 95 L85 75"
                            variants={draw} initial="hidden" animate="visible"
                            style={{ originX: '85px', originY: '60px' }}
                        />
                        <motion.path
                            d="M115 60 L140 85 L130 95 L115 75"
                            variants={draw} initial="hidden" animate="visible"
                            style={{ originX: '115px', originY: '60px' }}
                        />

                        {/* Arms - Lower */}
                        <motion.path
                            d="M65 90 L50 140 L60 145 L70 95"
                            variants={draw} initial="hidden" animate="visible"
                            style={{ originX: '65px', originY: '90px' }}
                        />
                        <motion.path
                            d="M135 90 L150 140 L140 145 L130 95"
                            variants={draw} initial="hidden" animate="visible"
                            style={{ originX: '135px', originY: '90px' }}
                        />

                        {/* Legs */}
                        <motion.path
                            d="M80 150 L70 280 L90 280 L100 150"
                            variants={draw} initial="hidden" animate="visible"
                            style={{ originX: '90px', originY: '150px' }}
                        />
                        <motion.path
                            d="M120 150 L130 280 L110 280 L100 150"
                            variants={draw} initial="hidden" animate="visible"
                            style={{ originX: '110px', originY: '150px' }}
                        />
                    </g>

                    {/* Heatmap Overlay - Pulsing Red Heat */}
                    <motion.g
                        initial={{ opacity: 0 }}
                        animate={{ opacity: [0.4, 1, 0.4] }}
                        transition={{ duration: 1.5, repeat: Infinity, delay: 1.5 }}
                    >
                        {/* Pecs */}
                        <motion.ellipse
                            cx="88" cy="80" rx="14" ry="12"
                            fill="url(#pecsGradient)"
                            animate={{ scale: getScale(1.1) }}
                            className="drop-shadow-[0_0_8px_#ff003c]"
                        />
                        <motion.ellipse
                            cx="112" cy="80" rx="14" ry="12"
                            fill="url(#pecsGradient)"
                            animate={{ scale: getScale(1.1) }}
                            className="drop-shadow-[0_0_8px_#ff003c]"
                        />

                        {/* Shoulders */}
                        <motion.circle
                            cx="70" cy="70" r="6"
                            fill="url(#pecsGradient)"
                            className="drop-shadow-[0_0_5px_#ff003c]"
                        />
                        <motion.circle
                            cx="130" cy="70" r="6"
                            fill="url(#pecsGradient)"
                            className="drop-shadow-[0_0_5px_#ff003c]"
                        />
                    </motion.g>

                    {/* HUD Labels */}
                    <g fontSize="7" fontFamily="JetBrains Mono" fill="#14f163">
                        <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2 }}>
                            <line x1="115" y1="80" x2="160" y2="60" stroke="#14f163" strokeWidth="0.5" strokeDasharray="2" opacity="0.3" />
                            <text x="162" y="58" fill="#ff003c" fontWeight="bold" className="neon-text-red">CRITICAL_HYPERTROPHY</text>
                            <text x="162" y="66" opacity="0.7" fill="#14f163">[REGION_CHEST]</text>
                        </motion.g>
                    </g>
                </svg>

                {/* Live Data Feed */}
                <div className="absolute bottom-4 left-4 font-mono text-[8px] text-primary/70 leading-tight">
                    <p className="animate-pulse">&gt; SCANNING_SEGMENT_V4</p>
                    <p>&gt; TISSUE_DENSITY: OPTIMAL</p>
                    <p className="text-neon-red font-bold">&gt; HEAT_LEVEL: HIGH</p>
                </div>
            </div>

            {/* Predictive Growth Module */}
            <div className="w-full cyber-card rounded-lg p-4 border-[#14f163]/20 relative">
                <div className="hud-corner corner-tl w-2 h-2"></div>
                <div className="hud-corner corner-tr w-2 h-2"></div>
                <div className="hud-corner corner-bl w-2 h-2"></div>
                <div className="hud-corner corner-br w-2 h-2"></div>

                <div className="flex justify-between items-center mb-4">
                    <h4 className="text-[10px] font-mono text-primary tracking-widest uppercase neon-text">&gt; GROWTH_PROJECTION_v2</h4>
                    <span className="text-[10px] text-primary font-mono font-bold">
                        {growth > 0 ? `+${growth}` : growth} MO.
                    </span>
                </div>

                <input
                    type="range"
                    min="-3"
                    max="3"
                    step="1"
                    value={growth}
                    onChange={(e) => setGrowth(parseInt(e.target.value))}
                    className="w-full h-1 bg-black/50 rounded-lg appearance-none cursor-pointer accent-primary border border-white/5"
                />
            </div>
        </div>
    );
};

export default MuscleScan;

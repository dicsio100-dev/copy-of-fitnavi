import React from 'react';
import { motion } from 'framer-motion';

const MuscleHeatmap: React.FC = () => {
    return (
        <div className="relative w-full aspect-square flex items-center justify-center p-4">
            {/* BACKGROUND GRID */}
            <div className="absolute inset-0 grid-lines opacity-10 pointer-events-none" />

            {/* INTERACTIVE CONTAINER */}
            <div className="relative w-full h-full max-w-[400px] max-h-[400px]">

                {/* HUD DECORATIONS */}
                <div className="hud-corner corner-tl opacity-40"></div>
                <div className="hud-corner corner-tr opacity-40"></div>
                <div className="hud-corner corner-bl opacity-40"></div>
                <div className="hud-corner corner-br opacity-40"></div>

                {/* GEOMETRIC TECH-CONSTRUCT SVG */}
                <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-[0_0_10px_rgba(20,241,99,0.15)]">
                    <defs>
                        <linearGradient id="laserGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="#14f163" stopOpacity="0" />
                            <stop offset="50%" stopColor="#14f163" stopOpacity="0.8" />
                            <stop offset="100%" stopColor="#14f163" stopOpacity="0" />
                        </linearGradient>
                    </defs>

                    {/* MAIN CONSTRUCT (NEON GREEN) */}
                    <g fill="none" stroke="#14f163" strokeWidth="1.5">

                        {/* HEAD (HEXAGON) */}
                        <polygon points="100,10 115,18 115,35 100,43 85,35 85,18" />

                        {/* NECK / TRAPS (HEATMAP TARGET) */}
                        <polygon
                            points="85,35 115,35 125,50 75,50"
                            fill="#ff003c" fillOpacity="0.2" stroke="#ff003c"
                            className="drop-shadow-[0_0_5px_#ff003c]"
                        />

                        {/* CHEST PLATES (TRAPEZOIDS - HEATMAP TARGET) */}
                        <g>
                            {/* Left Pec */}
                            <path
                                d="M98,52 L75,52 L70,85 L98,85 Z"
                                fill="#ff003c" fillOpacity="0.3" stroke="#ff003c"
                                className="drop-shadow-[0_0_8px_#ff003c]"
                            />
                            {/* Right Pec */}
                            <path
                                d="M102,52 L125,52 L130,85 L102,85 Z"
                                fill="#ff003c" fillOpacity="0.3" stroke="#ff003c"
                                className="drop-shadow-[0_0_8px_#ff003c]"
                            />
                        </g>

                        {/* ABS (4 STACKED RECTANGLES) */}
                        <g transform="translate(85, 90)">
                            <rect width="30" height="4" rx="1" fill="none" strokeOpacity="0.6" />
                            <rect y="7" width="30" height="4" rx="1" fill="none" strokeOpacity="0.6" />
                            <rect y="14" width="30" height="4" rx="1" fill="none" strokeOpacity="0.6" />
                            <rect y="21" width="30" height="4" rx="1" fill="none" strokeOpacity="0.6" />
                        </g>

                        {/* ARMS / SHOULDERS */}
                        <g>
                            {/* Joints */}
                            <circle cx="65" cy="55" r="5" />
                            <circle cx="135" cy="55" r="5" />
                            <circle cx="50" cy="90" r="4" />
                            <circle cx="150" cy="90" r="4" />

                            {/* Muscles (Rectangles) */}
                            <line x1="60" y1="58" x2="52" y2="86" />
                            <line x1="140" y1="58" x2="148" y2="86" />
                            <rect x="47" y="94" width="6" height="30" rx="1" transform="rotate(-5, 50, 94)" />
                            <rect x="147" y="94" width="6" height="30" rx="1" transform="rotate(5, 150, 94)" />
                        </g>

                        {/* LEGS (MECHA FORMS) */}
                        <g transform="translate(0, 120)">
                            {/* Hips */}
                            <path d="M75,0 L125,0 L115,15 L85,15 Z" strokeOpacity="0.8" />

                            {/* Left Leg */}
                            <polygon points="78,20 95,20 92,70 75,70" />
                            {/* Right Leg */}
                            <polygon points="105,20 122,20 125,70 108,70" />
                        </g>
                    </g>

                    {/* LASER SCANNER RECTANGLE */}
                    <motion.rect
                        width="180"
                        height="4"
                        x="10"
                        initial={{ y: 0 }}
                        animate={{ y: [0, 190, 0] }}
                        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                        fill="url(#laserGradient)"
                        className="pointer-events-none"
                    />
                </svg>

                {/* TECH LABELS */}
                <div className="absolute top-2 left-2 flex flex-col font-mono text-[8px] text-primary space-y-1">
                    <span className="opacity-80">&gt; CONSTRUCT_ID: V2_MESH</span>
                    <span className="opacity-60">&gt; STATUS: ANALYZING</span>
                </div>

                <div className="absolute bottom-2 right-2 flex flex-col items-end font-mono text-[8px] text-neon-red space-y-1">
                    <span className="animate-pulse">&gt; HEAT_OVERLOAD: PECS</span>
                    <span className="opacity-60">&gt; TEMP: 38.4°C</span>
                </div>
            </div>
        </div>
    );
};

export default MuscleHeatmap;

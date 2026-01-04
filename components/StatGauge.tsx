import React from 'react';
import { motion } from 'framer-motion';

interface StatGaugeProps {
    value: number;
    max: number;
    label: string;
    subLabel?: string;
    color?: string;
}

const StatGauge: React.FC<StatGaugeProps> = ({ value, max, label, subLabel, color = "#00f0ff" }) => {
    const percentage = Math.min(Math.max(value / max, 0), 1);
    const radius = 40;
    const circumference = Math.PI * radius; // Half circle
    const strokeDashoffset = circumference - percentage * circumference;

    return (
        <div className="flex flex-col items-center">
            <div className="relative w-32 h-20 overflow-hidden">
                <svg viewBox="0 0 100 60" className="w-full h-full rotate-[-180deg]">
                    {/* Background Track */}
                    <path
                        d="M 10 50 A 40 40 0 0 1 90 50"
                        fill="none"
                        stroke="rgba(255,255,255,0.05)"
                        strokeWidth="8"
                        strokeLinecap="round"
                    />
                    {/* Progress Indicator */}
                    <motion.path
                        initial={{ strokeDashoffset: circumference }}
                        animate={{ strokeDashoffset }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        d="M 10 50 A 40 40 0 0 1 90 50"
                        fill="none"
                        stroke={color}
                        strokeWidth="8"
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        style={{ filter: `drop-shadow(0 0 5px ${color}66)` }}
                    />
                </svg>
                {/* Value Text */}
                <div className="absolute inset-0 flex flex-col items-center justify-end h-[45px]">
                    <span className="text-xl font-black text-white leading-none">{value}{max === 100 ? '%' : ''}</span>
                </div>
            </div>
            <div className="text-center mt-2">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</p>
                {subLabel && <p className="text-[8px] font-medium text-primary uppercase opacity-60 tracking-tighter">{subLabel}</p>}
            </div>
        </div>
    );
};

export default StatGauge;

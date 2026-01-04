import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const AICoachWidget: React.FC = () => {
    const navigate = useNavigate();

    return (
        <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            whileHover={{ scale: 1.1 }}
            onClick={() => navigate('/ai-trainer')}
            className="fixed bottom-8 right-8 z-50 group cursor-pointer"
        >
            {/* GLOW EFFECT */}
            <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full scale-150 opacity-0 group-hover:opacity-100 transition-opacity" />

            {/* AVATAR CONTAINER */}
            <div className="relative w-16 h-16 bg-[#010a05] rounded-2xl border-2 border-primary/30 flex items-center justify-center p-2 shadow-2xl group-hover:border-primary group-hover:shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-all overflow-hidden">
                {/* SCAN LINE ANIMATION */}
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/10 to-transparent h-4 w-full animate-scan pointer-events-none" />

                {/* ROBOT ICON */}
                <div className="relative text-primary">
                    <span className="material-symbols-outlined text-4xl leading-none font-bold">
                        smart_toy
                    </span>
                    {/* STATUS INDICATOR */}
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full border-2 border-[#010a05] animate-pulse" />
                </div>
            </div>

            {/* MESSAGE POPUP (on hover) */}
            <div className="absolute bottom-[calc(100%+12px)] right-0 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all pointer-events-none">
                <div className="bg-black/60 backdrop-blur-md border border-primary/20 p-4 rounded-xl w-48 shadow-2xl">
                    <p className="text-[10px] font-bold text-primary uppercase tracking-widest mb-1">Coach IA</p>
                    <p className="text-xs text-white leading-relaxed font-medium">
                        Système opérationnel. Cliquez pour entrer en session d'analyse.
                    </p>
                </div>
                {/* ARROW */}
                <div className="w-3 h-3 bg-black/60 border-r border-b border-primary/20 rotate-45 ml-auto mr-6 -mt-1.5" />
            </div>
        </motion.div>
    );
};

export default AICoachWidget;

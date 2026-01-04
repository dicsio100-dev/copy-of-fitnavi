import React from 'react';

const ScreenOverlay: React.FC = () => {
    return (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
            {/* SCANLINES */}
            <div className="absolute inset-0 opacity-[0.03]"
                style={{
                    background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, #000 3px)'
                }}
            />

            {/* VIGNETTE */}
            <div className="absolute inset-0 shadow-[inset_0_0_150px_rgba(0,0,0,0.8)]" />

            {/* BRIGHTNESS PULSE (Subtle) */}
            <div className="absolute inset-0 bg-primary/5 animate-pulse opacity-10" />

            {/* CORNER DECORATIONS (Global Screen Borders) */}
            <div className="absolute top-0 left-0 w-32 h-32 border-tl-hud opacity-20" />
            <div className="absolute top-0 right-0 w-32 h-32 border-tr-hud opacity-20" />
            <div className="absolute bottom-0 left-0 w-32 h-32 border-bl-hud opacity-20" />
            <div className="absolute bottom-0 right-0 w-32 h-32 border-br-hud opacity-20" />
        </div>
    );
};

export default ScreenOverlay;

import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';

interface SidebarProps {
    user?: {
        firstName?: string;
        avatar_url?: string;
        username?: string;
    };
}

const Sidebar: React.FC<SidebarProps> = ({ user }) => {
    const location = useLocation();

    const navItems = [
        { path: '/', icon: 'grid_view', label: 'Dashboard' },
        { path: '/workout', icon: 'fitness_center', label: 'Workout' },
        { path: '/calendar', icon: 'calendar_today', label: 'Schedule' },
        { path: '/stats', icon: 'monitoring', label: 'Analytics' },
        { path: '/achievements', icon: 'workspace_premium', label: 'Badges' },
        { path: '/ai-trainer', icon: 'smart_toy', label: 'AI Coach' },
        { path: '/profile', icon: 'account_circle', label: 'Profile' },
    ];

    const isActive = (path: string) => location.pathname === path;

    return (
        <div className="w-full h-full bg-background-dark/80 backdrop-blur-3xl flex flex-col border-r border-primary/20 pb-8 items-center py-10 z-50">
            {/* LOGO AREA */}
            <div className="mb-14 relative group cursor-pointer flex flex-col items-center gap-2">
                {/* ICON */}
                <div className="relative w-16 h-16 flex items-center justify-center transition-all duration-700 group-hover:scale-110 group-hover:-rotate-3">
                    {/* PERMANENT SUBTLE GLOW */}
                    <div className="absolute inset-0 bg-primary/10 blur-2xl rounded-full" />
                    {/* INTENSE HOVER GLOW */}
                    <div className="absolute inset-0 bg-primary/30 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

                    <img
                        src="/Logo.png"
                        alt="FitNavi Icon"
                        className="w-full h-full object-contain relative z-10 drop-shadow-[0_0_15px_rgba(16,185,129,0.5)] group-hover:drop-shadow-[0_0_25px_rgba(16,185,129,0.8)]"
                    />
                </div>

                {/* TEXT BRANDING */}
                <div className="flex flex-col items-center">
                    <span className="text-[10px] font-black tracking-[0.4em] text-primary drop-shadow-[0_0_10px_rgba(16,185,129,0.8)] leading-none mb-1">
                        FIT
                    </span>
                    <span className="text-[10px] font-black tracking-[0.4em] text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.3)] leading-none">
                        NAVI
                    </span>
                </div>
            </div>

            {/* NAVIGATION */}
            <nav className="flex-1 flex flex-col gap-6">
                {navItems.map((item) => (
                    <Link
                        key={item.path}
                        to={item.path}
                        className="relative group flex items-center justify-center"
                        title={item.label}
                    >
                        <div className={`
                            w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300
                            ${isActive(item.path)
                                ? 'bg-primary/20 text-primary border border-primary/40'
                                : 'text-slate-600 hover:text-primary hover:bg-primary/5'
                            }
                        `}>
                            <span className={`material-symbols-outlined text-2xl ${isActive(item.path) ? 'fill-1' : ''}`}>
                                {item.icon}
                            </span>
                        </div>

                        {/* GLOW BAR */}
                        {isActive(item.path) && (
                            <motion.div
                                layoutId="activeNavGlow"
                                className="absolute -left-4 w-1 h-8 bg-primary shadow-active-glow rounded-r-full"
                            />
                        )}

                        {/* TOOLTIP LABEL (Slim Sidebar style) */}
                        <div className="absolute left-16 bg-[#010a05] border border-primary/20 text-primary text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-md opacity-0 group-hover:opacity-100 translate-x-[-10px] group-hover:translate-x-0 transition-all pointer-events-none whitespace-nowrap shadow-xl">
                            {item.label}
                        </div>
                    </Link>
                ))}
            </nav>

            {/* USER PROFILE MINI */}
            <div className="mt-auto">
                <Link to="/profile" className="w-12 h-12 rounded-full overflow-hidden border-2 border-primary/20 hover:border-primary transition-all flex items-center justify-center bg-primary/5 ring-0 hover:ring-4 ring-primary/10">
                    <img src={user?.avatar_url || "https://picsum.photos/seed/fitnavi/100/100"} alt="Avatar" className="w-full h-full object-cover" />
                </Link>
            </div>
        </div>
    );
};

export default Sidebar;

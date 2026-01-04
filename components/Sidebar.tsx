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
        { path: '/', icon: 'dashboard', label: 'Tableau de Bord' },
        { path: '/workout', icon: 'fitness_center', label: 'Entraînement' },
        { path: '/calendar', icon: 'calendar_month', label: 'Calendrier Santé' },
        { path: '/stats', icon: 'analytics', label: 'Analyses' },
        { path: '/achievements', icon: 'emoji_events', label: 'Succès' },
        { path: '/community', icon: 'groups', label: 'Communauté' },
        { path: '/premium', icon: 'workspace_premium', label: 'Premium' },
        { path: '/ai-trainer', icon: 'smart_toy', label: 'Coach IA' },
        { path: '/profile', icon: 'person', label: 'Profil' },
    ];

    const isActive = (path: string) => location.pathname === path;

    return (
        <div className="w-full h-full bg-[#020502] flex flex-col">

            {/* LOGO & BRANDING */}
            <div className="p-6 border-b border-primary/20">
                <div className="mb-6">
                    <h1 className="text-3xl font-heading font-bold text-white tracking-tight mb-1">
                        FIT<span className="text-primary">NAVI AI</span>
                    </h1>
                    <p className="text-primary text-[10px] uppercase tracking-widest font-mono shadow-neon opacity-80">
                        &gt; Tactical Interface v4.5
                    </p>
                </div>

                {/* QR CODE DECORATION */}
                <div className="flex justify-center">
                    <div className="w-20 h-20 bg-white/5 rounded-lg p-2 border border-primary/20">
                        <svg viewBox="0 0 100 100" className="w-full h-full">
                            <rect x="10" y="10" width="15" height="15" fill="#14f163" />
                            <rect x="30" y="10" width="15" height="15" fill="#14f163" />
                            <rect x="50" y="10" width="15" height="15" fill="#14f163" />
                            <rect x="70" y="10" width="15" height="15" fill="#14f163" />
                            <rect x="10" y="30" width="15" height="15" fill="#14f163" />
                            <rect x="50" y="30" width="15" height="15" fill="#14f163" />
                            <rect x="70" y="30" width="15" height="15" fill="#14f163" />
                            <rect x="10" y="50" width="15" height="15" fill="#14f163" />
                            <rect x="30" y="50" width="15" height="15" fill="#14f163" />
                            <rect x="70" y="50" width="15" height="15" fill="#14f163" />
                            <rect x="10" y="70" width="15" height="15" fill="#14f163" />
                            <rect x="30" y="70" width="15" height="15" fill="#14f163" />
                            <rect x="50" y="70" width="15" height="15" fill="#14f163" />
                            <rect x="70" y="70" width="15" height="15" fill="#14f163" />
                        </svg>
                    </div>
                </div>
            </div>

            {/* COACH INSIGHT WIDGET */}
            <div className="mx-4 my-4 cyber-card rounded-xl p-4 border border-primary/30">
                <div className="flex items-start gap-3">
                    <div className="relative">
                        <span className="material-symbols-outlined text-primary text-2xl animate-pulse">memory</span>
                        <div className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full animate-ping"></div>
                    </div>
                    <div className="flex-1">
                        <p className="text-xs text-primary uppercase tracking-wider mb-1 font-mono">IA Coach Insight</p>
                        <p className="text-xs text-gray-300 leading-relaxed font-mono">
                            Récupération à 85%. Séance optimale conseillée.
                        </p>
                    </div>
                </div>
            </div>

            {/* NAVIGATION LINKS */}
            <nav className="flex-1 px-3 py-2 overflow-y-auto">
                {navItems.map((item) => (
                    <Link
                        key={item.path}
                        to={item.path}
                        className={`
              group flex items-center gap-3 px-4 py-3 rounded-lg mb-1 relative transition-all duration-200
              ${isActive(item.path)
                                ? 'bg-primary/10 text-primary'
                                : 'text-gray-400 hover:text-white hover:bg-white/5'
                            }
            `}
                    >
                        {/* ACTIVE STATE NEON BAR */}
                        {isActive(item.path) && (
                            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary rounded-r-full shadow-[0_0_15px_rgba(20,241,99,0.8)]"></div>
                        )}

                        <span className={`material-symbols-outlined text-xl ${isActive(item.path) ? 'material-symbols-filled' : ''}`}>
                            {item.icon}
                        </span>
                        <span className={`text-sm font-medium ${isActive(item.path) ? 'font-bold' : ''}`}>
                            {item.label}
                        </span>

                        {/* ACTIVE STATE HALO */}
                        {isActive(item.path) && (
                            <div className="absolute inset-0 bg-primary/5 rounded-lg blur-sm -z-10"></div>
                        )}

                        {/* HOVER ARROW */}
                        {!isActive(item.path) && (
                            <span className="material-symbols-outlined text-xs ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
                                chevron_right
                            </span>
                        )}
                    </Link>
                ))}
            </nav>

            {/* ELITE PILOT PROFILE */}
            <div className="p-6 border-t border-white/5 bg-black/40">
                <div className="flex flex-col items-center gap-4">
                    <div className="relative">
                        {/* ROTATING CIRCLES */}
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                            className="absolute -inset-3 border border-primary/20 rounded-full"
                        />
                        <motion.div
                            animate={{ rotate: -360 }}
                            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                            className="absolute -inset-5 border border-primary/10 rounded-full border-dashed"
                        />

                        <div
                            className="size-14 rounded-full bg-cover bg-center border-2 border-primary shadow-[0_0_15px_rgba(20,241,99,0.3)] relative z-10"
                            style={{
                                backgroundImage: user?.avatar_url
                                    ? `url(${user.avatar_url})`
                                    : "url('https://picsum.photos/seed/fitnavi/150/150')"
                            }}
                        />

                        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-primary rounded-full border-2 border-[#020502] flex items-center justify-center z-20">
                            <span className="material-symbols-outlined text-black text-[12px] font-bold">verified</span>
                        </div>
                    </div>

                    <div className="text-center">
                        <p className="text-white text-sm font-black uppercase tracking-tighter mb-1 font-heading">
                            {user?.firstName || user?.username || '@UNKNOWN_PILOT'}
                        </p>
                        <div className="flex flex-col items-center gap-1">
                            <span className="text-primary text-[9px] font-mono tracking-[0.2em] animate-pulse glow-text">
                                &gt; STATUS: ACTIVE
                            </span>
                            <span className="text-gray-500 text-[8px] font-mono uppercase tracking-widest opacity-50">
                                SIGNAL_LOCK: STABLE
                            </span>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
};

export default Sidebar;

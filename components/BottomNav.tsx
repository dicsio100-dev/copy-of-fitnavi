import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const BottomNav: React.FC = () => {
    const location = useLocation();

    const navItems = [
        { path: '/', icon: 'grid_view', label: 'HUD' },
        { path: '/workout', icon: 'fitness_center', label: 'Workout' },
        { path: '/ai-trainer', icon: 'smart_toy', label: 'Coach' },
        { path: '/stats', icon: 'query_stats', label: 'Stats' },
        { path: '/calendar', icon: 'calendar_today', label: 'Calendar' },
        { path: '/profile', icon: 'person', label: 'Profile' },
        { path: '/profile?settings=true', icon: 'settings', label: 'Settings' }
    ];

    const isActive = (path: string) => {
        if (path === '/') return location.pathname === '/';
        return location.pathname + location.search === path || location.pathname === path;
    };

    return (
        <nav className="md:hidden fixed bottom-0 left-0 w-full h-16 z-[100] mobile-nav-blur flex items-center overflow-x-auto snap-x snap-mandatory scrollbar-hide px-4 gap-6">
            {navItems.map((item) => (
                <Link
                    key={item.path + item.label}
                    to={item.path}
                    className={`flex-shrink-0 flex flex-col items-center justify-center transition-all duration-300 snap-center min-w-[64px] ${isActive(item.path) ? 'text-primary' : 'text-gray-500'
                        }`}
                >
                    <div className={`relative flex items-center justify-center ${isActive(item.path) ? 'scale-110' : 'scale-100'}`}>
                        <span className="material-symbols-outlined text-2xl font-bold">
                            {item.icon}
                        </span>
                        {isActive(item.path) && (
                            <div className="absolute -bottom-2 w-1.5 h-1.5 bg-primary rounded-full shadow-[0_0_12px_rgba(16,185,129,1)] animate-pulse" />
                        )}
                    </div>
                    <span className="text-[9px] font-black uppercase tracking-[0.1em] mt-1 whitespace-nowrap">
                        {item.label}
                    </span>
                </Link>
            ))}
        </nav>
    );
};

export default BottomNav;

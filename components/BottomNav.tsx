import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const BottomNav: React.FC = () => {
    const location = useLocation();

    const navItems = [
        { path: '/', icon: 'dashboard', label: 'HUD' },
        { path: '/workout', icon: 'fitness_center', label: 'Workout' },
        { path: '/ai-trainer', icon: 'smart_toy', label: 'Coach' },
        { path: '/profile', icon: 'person', label: 'Profile' }
    ];

    const isActive = (path: string) => location.pathname === path;

    return (
        <nav className="md:hidden fixed bottom-0 left-0 w-full h-16 z-[100] mobile-nav-blur flex items-center justify-around px-4">
            {navItems.map((item) => (
                <Link
                    key={item.path}
                    to={item.path}
                    className={`flex flex-col items-center justify-center transition-all duration-300 ${isActive(item.path) ? 'text-primary' : 'text-gray-500'
                        }`}
                >
                    <div className={`relative flex items-center justify-center ${isActive(item.path) ? 'scale-110' : 'scale-100'}`}>
                        <span className="material-symbols-outlined text-2xl font-bold">
                            {item.icon}
                        </span>
                        {isActive(item.path) && (
                            <div className="absolute -bottom-1 w-1 h-1 bg-primary rounded-full shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                        )}
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] mt-1">
                        {item.label}
                    </span>
                </Link>
            ))}
        </nav>
    );
};

export default BottomNav;

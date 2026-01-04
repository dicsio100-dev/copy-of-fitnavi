import React from 'react';
import { User } from '../types';

interface MobileHeaderProps {
    user?: Partial<User>;
}

const MobileHeader: React.FC<MobileHeaderProps> = ({ user }) => {
    return (
        <header className="md:hidden fixed top-0 left-0 w-full h-16 z-[90] bg-background-dark/50 backdrop-blur-md border-b border-primary/20 flex items-center justify-between px-6">
            <div className="flex flex-col">
                <span className="text-[10px] font-black text-primary tracking-[0.4em] uppercase">FitNavi OS</span>
                <h1 className="text-sm font-black text-white leading-none">COMMAND <span className="text-primary">CENTER</span></h1>
            </div>

            <div className="flex items-center gap-3">
                <div className="flex flex-col items-end">
                    <span className="text-[8px] font-bold text-gray-500 uppercase tracking-widest">User_Access</span>
                    <span className="text-[10px] font-bold text-white uppercase">{user?.username || 'Athlète'}</span>
                </div>
                <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center relative shadow-[0_0_10px_rgba(16,185,129,0.2)]">
                    <span className="material-symbols-outlined text-primary text-xl">fingerprint</span>
                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full animate-pulse shadow-[0_0_5px_rgba(16,185,129,1)]" />
                </div>
            </div>
        </header>
    );
};

export default MobileHeader;

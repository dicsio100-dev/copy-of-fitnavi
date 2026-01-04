import React from 'react';

interface Badge {
    id: string;
    name: string;
    description: string;
    tier: 'gold' | 'silver' | 'neon';
    icon: string;
    unlocked: boolean;
    progress?: number; // 0-100 for locked badges
}

interface TrophyWallProps {
    streak?: number;
    xp?: number;
    totalMinutes?: number;
}

const TrophyWall: React.FC<TrophyWallProps> = ({ streak = 0, xp = 0, totalMinutes = 0 }) => {
    // Mock badge data (in production, this would come from user_achievements table)
    const badges: Badge[] = [
        {
            id: 'early_bird',
            name: 'Lève-Tôt',
            description: 'Séance avant 8h du matin',
            tier: 'silver',
            icon: 'wb_twilight',
            unlocked: false,
            progress: 60
        },
        {
            id: 'war_machine',
            name: 'Machine de Guerre',
            description: '10 jours consécutifs',
            tier: 'gold',
            icon: 'military_tech',
            unlocked: streak >= 10,
            progress: Math.min((streak / 10) * 100, 100)
        },
        {
            id: 'titan',
            name: 'Titan',
            description: '100 tonnes soulevées',
            tier: 'gold',
            icon: 'fitness_center',
            unlocked: false,
            progress: 45
        },
        {
            id: 'first_blood',
            name: 'Premier Pas',
            description: 'Première séance complétée',
            tier: 'neon',
            icon: 'check_circle',
            unlocked: true
        },
        {
            id: 'streak_7',
            name: 'Consistance',
            description: '7 jours de suite',
            tier: 'silver',
            icon: 'local_fire_department',
            unlocked: streak >= 7,
            progress: Math.min((streak / 7) * 100, 100)
        },
        {
            id: 'xp_master',
            name: 'Maître XP',
            description: '5000 points d\'expérience',
            tier: 'gold',
            icon: 'stars',
            unlocked: xp >= 5000,
            progress: Math.min((xp / 5000) * 100, 100)
        },
        {
            id: 'volume_beast',
            name: 'Bête de Volume',
            description: '500 min cette semaine',
            tier: 'neon',
            icon: 'trending_up',
            unlocked: totalMinutes >= 500,
            progress: Math.min((totalMinutes / 500) * 100, 100)
        },
        {
            id: 'dedication',
            name: 'Dévotion',
            description: '30 jours de suite',
            tier: 'gold',
            icon: 'emoji_events',
            unlocked: false,
            progress: Math.min((streak / 30) * 100, 100)
        }
    ];

    const getBadgeGradient = (tier: 'gold' | 'silver' | 'neon', unlocked: boolean) => {
        if (!unlocked) {
            return 'from-gray-800 to-gray-900';
        }
        switch (tier) {
            case 'gold':
                return 'from-yellow-400 via-yellow-500 to-yellow-600';
            case 'silver':
                return 'from-gray-300 via-gray-400 to-gray-500';
            case 'neon':
                return 'from-primary via-green-400 to-primary';
        }
    };

    const getBadgeShadow = (tier: 'gold' | 'silver' | 'neon', unlocked: boolean) => {
        if (!unlocked) return '';
        switch (tier) {
            case 'gold':
                return 'shadow-[0_0_25px_rgba(251,191,36,0.5)]';
            case 'silver':
                return 'shadow-[0_0_20px_rgba(209,213,219,0.4)]';
            case 'neon':
                return 'shadow-[0_0_30px_rgba(20,241,99,0.6)]';
        }
    };

    // Calculate performance improvement (mock)
    const performanceImprovement = Math.min(Math.floor((xp / 100) + (streak * 2)), 35);

    return (
        <div className="space-y-6">
            {/* Performance Comparison Card */}
            <div className="glass-card rounded-2xl p-6 border-l-4 border-primary">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Évolution Mensuelle</p>
                        <p className="text-2xl font-heading text-white">Performance Globale</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full border border-primary/30">
                            <span className="material-symbols-outlined text-primary text-2xl">trending_up</span>
                            <span className="text-2xl font-heading text-primary">+{performanceImprovement}%</span>
                        </div>
                    </div>
                </div>
                <p className="text-sm text-gray-400 mt-3 font-mono">
                    &gt; Tu es {performanceImprovement}% plus performant que le mois dernier. Continue !
                </p>
            </div>

            {/* Trophy Wall */}
            <div className="glass-card rounded-2xl p-6">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h3 className="text-white text-xl font-heading flex items-center gap-2">
                            <span className="material-symbols-outlined text-yellow-400">workspace_premium</span>
                            MUR DES TROPHÉES
                        </h3>
                        <p className="text-xs text-gray-500 mt-1 uppercase tracking-wider">
                            {badges.filter(b => b.unlocked).length} / {badges.length} Débloqués
                        </p>
                    </div>
                    <div className="text-right">
                        <div className="flex gap-2">
                            <div className="flex items-center gap-1 text-xs">
                                <div className="w-3 h-3 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600"></div>
                                <span className="text-gray-400">Or</span>
                            </div>
                            <div className="flex items-center gap-1 text-xs">
                                <div className="w-3 h-3 rounded-full bg-gradient-to-br from-gray-300 to-gray-500"></div>
                                <span className="text-gray-400">Argent</span>
                            </div>
                            <div className="flex items-center gap-1 text-xs">
                                <div className="w-3 h-3 rounded-full bg-gradient-to-br from-primary to-green-400"></div>
                                <span className="text-gray-400">Néon</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Badge Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {badges.map((badge) => (
                        <div
                            key={badge.id}
                            className={`relative group cursor-pointer transition-all duration-300 ${badge.unlocked ? 'hover:scale-105' : 'opacity-60'
                                }`}
                        >
                            {/* Badge Container */}
                            <div className={`
                relative rounded-2xl p-4 
                bg-gradient-to-br ${getBadgeGradient(badge.tier, badge.unlocked)}
                ${getBadgeShadow(badge.tier, badge.unlocked)}
                border ${badge.unlocked ? 'border-white/20' : 'border-white/5'}
                transition-all duration-300
                ${badge.unlocked ? 'hover:brightness-110' : ''}
              `}>
                                {/* 3D Shine Effect */}
                                {badge.unlocked && (
                                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl"></div>
                                )}

                                {/* Icon */}
                                <div className="flex flex-col items-center gap-2 relative z-10">
                                    <span className={`material-symbols-outlined text-4xl ${badge.unlocked
                                            ? badge.tier === 'neon' ? 'text-black' : 'text-white drop-shadow-lg'
                                            : 'text-gray-600'
                                        }`}>
                                        {badge.icon}
                                    </span>

                                    {/* Badge Name */}
                                    <p className={`text-xs font-bold text-center ${badge.unlocked
                                            ? badge.tier === 'neon' ? 'text-black' : 'text-white'
                                            : 'text-gray-500'
                                        }`}>
                                        {badge.name}
                                    </p>

                                    {/* Progress Bar for Locked Badges */}
                                    {!badge.unlocked && badge.progress !== undefined && (
                                        <div className="w-full mt-2">
                                            <div className="w-full h-1 bg-black/30 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-primary transition-all duration-500"
                                                    style={{ width: `${badge.progress}%` }}
                                                ></div>
                                            </div>
                                            <p className="text-[8px] text-gray-500 text-center mt-1 font-mono">
                                                {badge.progress.toFixed(0)}%
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {/* Locked Overlay */}
                                {!badge.unlocked && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-2xl">
                                        <span className="material-symbols-outlined text-gray-600 text-3xl">lock</span>
                                    </div>
                                )}
                            </div>

                            {/* Tooltip */}
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20">
                                <div className="bg-black border border-white/10 rounded-lg px-3 py-2 whitespace-nowrap">
                                    <p className="text-xs text-white font-medium">{badge.description}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default TrophyWall;

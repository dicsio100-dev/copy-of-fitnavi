import React, { useEffect, useState } from 'react';
import { User } from '../types';
import { getUnlockedAchievements } from '../src/lib/api';
import { supabase } from '../src/lib/supabase';

const BADGES_METADATA = [
  { id: 'first_workout', title: 'Premier Entraînement', desc: 'Séance inaugurale complétée.', icon: 'rocket_launch', color: 'text-primary' },
  { id: 'streak_7', title: 'Série de 7 Jours', desc: 'Une semaine de régularité sans faille.', icon: 'local_fire_department', color: 'text-orange-500' },
  { id: 'goal_weight', title: 'Objectif Poids Atteint', desc: 'Cible de poids atteinte.', icon: 'flag', color: 'text-blue-500' },
  { id: 'early_bird', title: 'Lève-tôt', desc: 'Entraînement avant 7h du matin.', icon: 'wb_sunny', color: 'text-yellow-500' },
  { id: 'power_lifter', title: 'Force Brute', desc: 'Squat 1.5x votre poids corporel.', icon: 'bolt', color: 'text-purple-500' },
  { id: 'community_pillar', title: 'Pilier Communautaire', desc: '10 bravos envoyés en une journée.', icon: 'groups', color: 'text-emerald-500' },
];

const AchievementsScreen: React.FC<{ user: User }> = ({ user }) => {
  const [unlockedIds, setUnlockedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBadges = async () => {
      try {
        const { data: { user: authUser } } = await supabase.auth.getUser();
        if (authUser) {
          const ids = await getUnlockedAchievements(authUser.id);
          setUnlockedIds(ids);
        }
      } catch (e) {
        console.error("Error fetching achievements:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchBadges();
  }, [user]);

  return (
    <div className="p-4 md:p-8 lg:p-12 max-w-7xl mx-auto flex flex-col gap-10 pb-24">
      <header className="flex flex-col gap-2">
        <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight">Vos Succès</h2>
        <p className="text-text-secondary text-lg">Célébrez chaque victoire, petite ou grande.</p>
      </header>

      {/* Badges Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {BADGES_METADATA.map((badge) => {
          const isEarned = unlockedIds.includes(badge.id);
          return (
            <div
              key={badge.id}
              className={`bg-surface-dark border rounded-3xl p-6 flex items-center gap-6 transition-all relative overflow-hidden group ${isEarned ? 'border-primary/20' : 'border-white/5 grayscale opacity-20'
                }`}
            >
              {isEarned && <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -mr-12 -mt-12 blur-2xl" />}

              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center bg-white/5 shrink-0 transition-transform group-hover:scale-110 ${badge.color}`}>
                <span className="material-symbols-outlined text-4xl">{badge.icon}</span>
              </div>

              <div className="flex flex-col gap-1">
                <h4 className="font-black text-lg text-white">{badge.title}</h4>
                <p className="text-xs text-gray-400 leading-relaxed">{badge.desc}</p>
                {isEarned && (
                  <span className="text-[10px] font-black text-primary uppercase tracking-widest mt-1">Débloqué</span>
                )}
              </div>
            </div>
          );
        })}
      </section>

      {/* Personal Records Table */}
      <section className="bg-surface-dark border border-white/5 rounded-[2.5rem] p-8 md:p-10 shadow-2xl">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-2xl font-black text-white flex items-center gap-3">
            <span className="material-symbols-outlined text-primary text-3xl">military_tech</span>
            Records Personnels (PR)
          </h3>
          <button className="bg-primary/10 text-primary px-5 py-2 rounded-full font-bold text-xs uppercase tracking-widest border border-primary/20 hover:bg-primary/20 transition-all">
            Mettre à jour
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/5 text-gray-500 text-[10px] font-black uppercase tracking-[0.2em]">
                <th className="pb-4 px-4">Exercice</th>
                <th className="pb-4 px-4">Record Actuel</th>
                <th className="pb-4 px-4 text-right">Dernière Mise à Jour</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {Object.keys(user.personalRecords || {}).length > 0 ? (
                Object.entries(user.personalRecords || {}).map(([lift, weight]) => (
                  <tr key={lift} className="group hover:bg-white/5 transition-colors">
                    <td className="py-5 px-4 font-bold text-white text-lg">{lift}</td>
                    <td className="py-5 px-4">
                      <span className="text-primary text-2xl font-black">{weight}</span>
                      <span className="text-gray-500 font-bold ml-1 text-sm">kg</span>
                    </td>
                    <td className="py-5 px-4 text-right text-gray-500 text-sm font-medium">--</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="py-8 text-center text-gray-500">Aucun record enregistré.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default AchievementsScreen;

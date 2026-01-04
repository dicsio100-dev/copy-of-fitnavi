import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { getDailyStats, updateDailyStats } from '../src/lib/api';
import { supabase } from '../src/lib/supabase';

interface HealthCalendarScreenProps {
  user: User;
  onUpdateHabits?: (date: string, habits: any) => void; // Keeping for compatibility, but logic is internal now
}

const HealthCalendarScreen: React.FC<HealthCalendarScreenProps> = ({ user }) => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Local state for the selected day's stats
  const [dailyStats, setDailyStats] = useState<any>({
    hydration_liters: 0,
    sleep_hours: 0,
    protein_met: false,
    no_sugar: false,
    mood: 'Normal'
  });
  const [loading, setLoading] = useState(false);

  const daysInMonth = (month: number, year: number) => new Date(year, month + 1, 0).getDate();
  const startDayOfMonth = (month: number, year: number) => new Date(year, month, 1).getDay();

  // Fetch stats when date changes
  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const { data: { user: authUser } } = await supabase.auth.getUser();
        if (authUser) {
          const stats = await getDailyStats(authUser.id, selectedDate);
          setDailyStats(stats);
        }
      } catch (e) {
        console.error("Error fetching calendar stats:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [selectedDate]);

  const handleHabitToggle = async (habitId: string) => {
    // Optimistic Update
    const oldStats = { ...dailyStats };
    let updates: any = {};

    if (habitId === 'hydration') {
      // Toggle logic: If >= 2, reset to 0, else set to 2.5
      const newVal = oldStats.hydration_liters >= 2 ? 0 : 2.5;
      updates = { hydration_liters: newVal };
      setDailyStats({ ...oldStats, hydration_liters: newVal });
    } else if (habitId === 'sleep') {
      const newVal = oldStats.sleep_hours >= 7 ? 0 : 8;
      updates = { sleep_hours: newVal };
      setDailyStats({ ...oldStats, sleep_hours: newVal });
    } else if (habitId === 'protein') {
      const newVal = !oldStats.protein_met;
      updates = { protein_met: newVal };
      setDailyStats({ ...oldStats, protein_met: newVal });
    } else if (habitId === 'noSugar') {
      const newVal = !oldStats.no_sugar;
      updates = { no_sugar: newVal };
      setDailyStats({ ...oldStats, no_sugar: newVal });
    }

    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (authUser) {
        await updateDailyStats(authUser.id, updates, selectedDate);
      }
    } catch (e) {
      console.error("Error updating habit:", e);
      // Revert on error
      setDailyStats(oldStats);
    }
  };

  const renderCalendar = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const totalDays = daysInMonth(month, year);
    const startDay = (startDayOfMonth(month, year) + 6) % 7;

    const days = [];
    for (let i = 0; i < startDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-24 md:h-32" />);
    }

    // Note: Rendering indicators for ALL days would require fetching stats for the whole month.
    // For "Zero-to-Hero", we might just fetch the selected day active detailed view, 
    // and maybe a simple indicator if we had the data. 
    // For now, we will only show indicators for the SELECTED day to keep performance simple,
    // OR we could fetch the whole month range if critical. 
    // Given the prompt "Fetch... pour la date sélectionnée", I will focus on the detail view being accurate.
    // The calendar grid dots might be empty for non-selected days unless we fetch all.
    // I'll keep the dots logic only if it matches 'selectedDate' or if we want to expand scope later.
    // To avoid breaking UI, I'll show dots for the SELECTED date dynamically, 
    // and for others... well, we strictly only have data for selectedDate in 'dailyStats'.

    for (let d = 1; d <= totalDays; d++) {
      const dateStr = `${year}-${(month + 1).toString().padStart(2, '0')}-${d.toString().padStart(2, '0')}`;
      const isSelected = selectedDate === dateStr;

      // We only know stats for 'selectedDate' currently. 
      // Ideally we fetch a month's worth. But for now, we just show for selected.
      const showStats = isSelected ? dailyStats : null;

      // Calculate completeness if we have stats
      const hydrationDone = showStats ? showStats.hydration_liters >= 2 : false;
      const sleepDone = showStats ? showStats.sleep_hours >= 7 : false;
      const proteinDone = showStats ? showStats.protein_met : false;
      const sugarDone = showStats ? showStats.no_sugar : false;

      const isComplete = hydrationDone && sleepDone && proteinDone && sugarDone;
      const activeCount = [hydrationDone, sleepDone, proteinDone, sugarDone].filter(Boolean).length;

      days.push(
        <button
          key={d}
          onClick={() => setSelectedDate(dateStr)}
          className={`h-24 md:h-32 border border-white/5 rounded-2xl flex flex-col p-3 transition-all relative group ${isSelected ? 'bg-primary/10 border-primary ring-1 ring-primary/30' : 'bg-surface-dark hover:bg-white/5'
            }`}
        >
          <span className={`text-lg font-black ${isSelected ? 'text-primary' : 'text-gray-400'}`}>{d}</span>

          {isSelected && (
            <div className="mt-auto flex gap-1">
              {hydrationDone && <div className="w-1.5 h-1.5 rounded-full bg-primary/40" />}
              {sleepDone && <div className="w-1.5 h-1.5 rounded-full bg-primary/40" />}
              {proteinDone && <div className="w-1.5 h-1.5 rounded-full bg-primary/40" />}
              {sugarDone && <div className="w-1.5 h-1.5 rounded-full bg-primary/40" />}
            </div>
          )}

          {isComplete && isSelected && (
            <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-primary flex items-center justify-center text-background-dark shadow-lg shadow-primary/20 scale-90 md:scale-100">
              <span className="material-symbols-outlined text-sm font-black">check</span>
            </div>
          )}
        </button>
      );
    }
    return days;
  };

  // Helpers for button state
  const isHydrationDone = dailyStats.hydration_liters >= 2;
  const isSleepDone = dailyStats.sleep_hours >= 7;
  const isProteinDone = dailyStats.protein_met === true;
  const isSugarDone = dailyStats.no_sugar === true;

  const completedCount = [isHydrationDone, isSleepDone, isProteinDone, isSugarDone].filter(Boolean).length;

  return (
    <div className="p-4 md:p-8 lg:p-12 max-w-7xl mx-auto flex flex-col gap-8 pb-24">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="flex flex-col gap-2">
          <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight">Style de Vie</h2>
          <p className="text-text-secondary text-lg">La discipline ne prend pas de vacances.</p>
        </div>
        <div className="flex items-center gap-4 bg-surface-dark p-2 rounded-2xl border border-white/5">
          <button
            onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
            className="w-10 h-10 rounded-xl hover:bg-white/5 flex items-center justify-center transition-colors"
          >
            <span className="material-symbols-outlined">chevron_left</span>
          </button>
          <span className="text-sm font-black uppercase tracking-widest text-white px-4">
            {currentMonth.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
          </span>
          <button
            onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
            className="w-10 h-10 rounded-xl hover:bg-white/5 flex items-center justify-center transition-colors"
          >
            <span className="material-symbols-outlined">chevron_right</span>
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
        {/* Calendar Grid */}
        <div className="xl:col-span-3">
          <div className="grid grid-cols-7 gap-2 mb-4">
            {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map(day => (
              <div key={day} className="text-center text-[10px] font-black uppercase tracking-widest text-gray-500 py-2">{day}</div>
            ))}
            {renderCalendar()}
          </div>
        </div>

        {/* Checklist Sidebar */}
        <div className="flex flex-col gap-6">
          <div className={`bg-surface-dark border border-white/5 rounded-[2.5rem] p-8 shadow-2xl sticky top-8 transition-opacity ${loading ? 'opacity-50' : 'opacity-100'}`}>
            <div className="flex flex-col gap-1 mb-8">
              <p className="text-[10px] font-black uppercase tracking-widest text-primary">HABITUDES DU JOUR</p>
              <h3 className="text-2xl font-black text-white">
                {new Date(selectedDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}
              </h3>
            </div>

            <div className="flex flex-col gap-4">
              {/* Hydration */}
              <button
                onClick={() => handleHabitToggle('hydration')}
                className={`flex items-center justify-between p-5 rounded-3xl border-2 transition-all ${isHydrationDone
                  ? 'bg-primary/10 border-primary shadow-lg shadow-primary/5'
                  : 'bg-background-dark border-white/5 hover:border-white/10'
                  }`}
              >
                <div className="flex items-center gap-4">
                  <span className={`material-symbols-outlined ${isHydrationDone ? 'text-primary' : 'text-gray-500'}`}>water_drop</span>
                  <span className={`font-bold ${isHydrationDone ? 'text-white' : 'text-gray-500'}`}>Hydratation (2L+)</span>
                </div>
                <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${isHydrationDone ? 'bg-primary border-primary' : 'border-white/10'
                  }`}>
                  {isHydrationDone && <span className="material-symbols-outlined text-background-dark text-sm font-black">check</span>}
                </div>
              </button>

              {/* Sleep */}
              <button
                onClick={() => handleHabitToggle('sleep')}
                className={`flex items-center justify-between p-5 rounded-3xl border-2 transition-all ${isSleepDone
                  ? 'bg-primary/10 border-primary shadow-lg shadow-primary/5'
                  : 'bg-background-dark border-white/5 hover:border-white/10'
                  }`}
              >
                <div className="flex items-center gap-4">
                  <span className={`material-symbols-outlined ${isSleepDone ? 'text-primary' : 'text-gray-500'}`}>bedtime</span>
                  <span className={`font-bold ${isSleepDone ? 'text-white' : 'text-gray-500'}`}>Sommeil (7h+)</span>
                </div>
                <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${isSleepDone ? 'bg-primary border-primary' : 'border-white/10'
                  }`}>
                  {isSleepDone && <span className="material-symbols-outlined text-background-dark text-sm font-black">check</span>}
                </div>
              </button>

              {/* Protein */}
              <button
                onClick={() => handleHabitToggle('protein')}
                className={`flex items-center justify-between p-5 rounded-3xl border-2 transition-all ${isProteinDone
                  ? 'bg-primary/10 border-primary shadow-lg shadow-primary/5'
                  : 'bg-background-dark border-white/5 hover:border-white/10'
                  }`}
              >
                <div className="flex items-center gap-4">
                  <span className={`material-symbols-outlined ${isProteinDone ? 'text-primary' : 'text-gray-500'}`}>restaurant</span>
                  <span className={`font-bold ${isProteinDone ? 'text-white' : 'text-gray-500'}`}>Objectif Protéines</span>
                </div>
                <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${isProteinDone ? 'bg-primary border-primary' : 'border-white/10'
                  }`}>
                  {isProteinDone && <span className="material-symbols-outlined text-background-dark text-sm font-black">check</span>}
                </div>
              </button>

              {/* No Sugar */}
              <button
                onClick={() => handleHabitToggle('noSugar')}
                className={`flex items-center justify-between p-5 rounded-3xl border-2 transition-all ${isSugarDone
                  ? 'bg-primary/10 border-primary shadow-lg shadow-primary/5'
                  : 'bg-background-dark border-white/5 hover:border-white/10'
                  }`}
              >
                <div className="flex items-center gap-4">
                  <span className={`material-symbols-outlined ${isSugarDone ? 'text-primary' : 'text-gray-500'}`}>block</span>
                  <span className={`font-bold ${isSugarDone ? 'text-white' : 'text-gray-500'}`}>Zéro Sucre Ajouté</span>
                </div>
                <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${isSugarDone ? 'bg-primary border-primary' : 'border-white/10'
                  }`}>
                  {isSugarDone && <span className="material-symbols-outlined text-background-dark text-sm font-black">check</span>}
                </div>
              </button>

            </div>

            <div className="mt-8 pt-8 border-t border-white/5 flex flex-col gap-4">
              <div className="flex justify-between items-center text-xs font-black uppercase tracking-widest text-gray-500">
                <span>DISCIPLINE DU JOUR</span>
                <span className="text-primary">
                  {completedCount} / 4
                </span>
              </div>
              <div className="h-2 w-full bg-background-dark rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-500 shadow-[0_0_10px_rgba(19,236,91,0.3)]"
                  style={{ width: `${(completedCount / 4) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HealthCalendarScreen;

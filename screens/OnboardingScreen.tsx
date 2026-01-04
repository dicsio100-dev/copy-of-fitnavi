
import React, { useState, useEffect } from 'react';
import { Goal, Gender, Frequency, User } from '../types';
import { useNavigate } from 'react-router-dom';

interface OnboardingScreenProps {
  onComplete: (data: Partial<User>) => void;
}

const goals = [
  { id: Goal.FORCE, title: 'Force', description: 'Maximiser la force brute et la puissance.', icon: 'fitness_center' },
  { id: Goal.HYPERTROPHIE, title: 'Hypertrophie', description: 'Augmenter le volume musculaire.', icon: 'accessibility_new' },
  { id: Goal.ENDURANCE, title: 'Endurance', description: 'Améliorer le cardio et la résistance.', icon: 'directions_run' },
  { id: Goal.PERTE_DE_POIDS, title: 'Perte de poids', description: 'Brûler les graisses.', icon: 'speed' }
];

const frequencies = [
  { id: Frequency.LOW, label: '1–2 fois par semaine' },
  { id: Frequency.MEDIUM, label: '3–4 fois par semaine' },
  { id: Frequency.HIGH, label: '5+ fois par semaine' }
];

const weekdays = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const navigate = useNavigate();

  // State for all onboarding data
  const [data, setData] = useState<Partial<User>>({
    goal: undefined,
    gender: undefined,
    age: undefined,
    weight: undefined,
    height: undefined,
    frequency: undefined,
    preferredDays: [],
    firstName: '',
    username: ''
  });

  const canGoNext = () => {
    switch (step) {
      case 1: return !!data.goal;
      case 2: return !!data.gender && !!data.age && !!data.weight && !!data.height;
      case 3: return !!data.frequency;
      case 4: return !!data.username && data.username.length >= 3;
      default: return false;
    }
  };

  const handleNext = () => {
    if (canGoNext()) {
      if (step < 4) {
        setStep(step + 1);
      } else {
        onComplete(data);
        navigate('/');
      }
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    } else {
      navigate('/welcome');
    }
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Enter' && canGoNext()) {
        handleNext();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [step, data]);

  const toggleDay = (day: string) => {
    const current = data.preferredDays || [];
    if (current.includes(day)) {
      setData({ ...data, preferredDays: current.filter(d => d !== day) });
    } else {
      setData({ ...data, preferredDays: [...current, day] });
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col bg-background-dark p-6 overflow-y-auto">
      <div className="max-w-2xl mx-auto w-full flex flex-col gap-8 py-8">
        {/* Header & Progress */}
        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-center text-[10px] font-black text-primary uppercase tracking-[0.2em]">
            <span>Étape {step} de 4</span>
            <span>{step * 25}% complété</span>
          </div>
          <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/5">
            <div className="h-full bg-primary shadow-[0_0_15px_rgba(19,236,91,0.5)] transition-all duration-500" style={{ width: `${step * 25}%` }} />
          </div>
        </div>

        {/* Step 1: Goal Selection */}
        {step === 1 && (
          <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col gap-3">
              <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight">Quel est votre objectif principal ?</h2>
              <p className="text-text-secondary text-lg">Choisissez l'approche qui guidera votre programme IA.</p>
            </div>
            <div className="flex flex-col gap-3">
              {goals.map((goal) => (
                <button
                  key={goal.id}
                  onClick={() => setData({ ...data, goal: goal.id })}
                  className={`flex items-center gap-6 p-6 rounded-3xl border-2 transition-all text-left ${
                    data.goal === goal.id 
                    ? 'bg-primary/10 border-primary shadow-[0_0_20px_rgba(19,236,91,0.15)]' 
                    : 'bg-surface-dark border-white/5 hover:border-white/10'
                  }`}
                >
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
                    data.goal === goal.id ? 'bg-primary text-background-dark' : 'bg-surface-dark-lighter text-primary'
                  }`}>
                    <span className="material-symbols-outlined text-3xl font-bold">{goal.icon}</span>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-xl font-bold text-white">{goal.title}</h4>
                    <p className="text-sm text-text-secondary mt-0.5">{goal.description}</p>
                  </div>
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                    data.goal === goal.id ? 'border-primary' : 'border-gray-800'
                  }`}>
                    {data.goal === goal.id && <div className="w-3 h-3 bg-primary rounded-full" />}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Personal Information */}
        {step === 2 && (
          <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col gap-3">
              <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight">Profil Physique</h2>
              <p className="text-text-secondary text-lg">Ces données permettent à l'IA de calculer vos besoins caloriques et votre intensité idéale.</p>
            </div>
            
            <div className="flex flex-col gap-6">
              {/* Gender */}
              <div className="flex flex-col gap-3">
                <label className="text-xs font-black uppercase tracking-widest text-gray-500 ml-1">Sexe</label>
                <div className="grid grid-cols-3 gap-3">
                  {[Gender.MALE, Gender.FEMALE, Gender.OTHER].map((g) => (
                    <button
                      key={g}
                      onClick={() => setData({ ...data, gender: g })}
                      className={`py-4 rounded-2xl border-2 font-bold transition-all text-sm ${
                        data.gender === g ? 'bg-primary/10 border-primary text-primary' : 'bg-surface-dark border-white/5 text-gray-400'
                      }`}
                    >
                      {g === Gender.OTHER ? 'Autre' : g}
                    </button>
                  ))}
                </div>
              </div>

              {/* Age, Weight, Height */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex flex-col gap-3">
                  <label className="text-xs font-black uppercase tracking-widest text-gray-500 ml-1">Âge</label>
                  <input 
                    type="number" 
                    placeholder="25"
                    value={data.age || ''}
                    onChange={(e) => setData({ ...data, age: parseInt(e.target.value) })}
                    className="bg-surface-dark border-2 border-white/5 rounded-2xl p-4 text-white focus:border-primary focus:outline-none transition-all font-bold"
                  />
                </div>
                <div className="flex flex-col gap-3">
                  <label className="text-xs font-black uppercase tracking-widest text-gray-500 ml-1">Poids (kg)</label>
                  <input 
                    type="number" 
                    placeholder="75"
                    value={data.weight || ''}
                    onChange={(e) => setData({ ...data, weight: parseFloat(e.target.value) })}
                    className="bg-surface-dark border-2 border-white/5 rounded-2xl p-4 text-white focus:border-primary focus:outline-none transition-all font-bold"
                  />
                </div>
                <div className="flex flex-col gap-3">
                  <label className="text-xs font-black uppercase tracking-widest text-gray-500 ml-1">Taille (cm)</label>
                  <input 
                    type="number" 
                    placeholder="180"
                    value={data.height || ''}
                    onChange={(e) => setData({ ...data, height: parseInt(e.target.value) })}
                    className="bg-surface-dark border-2 border-white/5 rounded-2xl p-4 text-white focus:border-primary focus:outline-none transition-all font-bold"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Frequency */}
        {step === 3 && (
          <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col gap-3">
              <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight">Rythme d'entraînement</h2>
              <p className="text-text-secondary text-lg">Combien de fois par semaine souhaitez-vous vous entraîner ?</p>
            </div>

            <div className="flex flex-col gap-4">
              {frequencies.map((f) => (
                <button
                  key={f.id}
                  onClick={() => setData({ ...data, frequency: f.id })}
                  className={`flex items-center justify-between p-6 rounded-3xl border-2 transition-all ${
                    data.frequency === f.id 
                    ? 'bg-primary/10 border-primary shadow-[0_0_20px_rgba(19,236,91,0.15)]' 
                    : 'bg-surface-dark border-white/5'
                  }`}
                >
                  <span className={`text-lg font-bold ${data.frequency === f.id ? 'text-white' : 'text-gray-400'}`}>{f.label}</span>
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                    data.frequency === f.id ? 'border-primary' : 'border-gray-800'
                  }`}>
                    {data.frequency === f.id && <div className="w-3 h-3 bg-primary rounded-full" />}
                  </div>
                </button>
              ))}
            </div>

            <div className="flex flex-col gap-4 mt-4">
              <label className="text-xs font-black uppercase tracking-widest text-gray-500 ml-1">Jours préférés (facultatif)</label>
              <div className="flex flex-wrap gap-2">
                {weekdays.map((day) => (
                  <button
                    key={day}
                    onClick={() => toggleDay(day)}
                    className={`px-5 py-3 rounded-2xl border-2 font-bold transition-all ${
                      data.preferredDays?.includes(day)
                      ? 'bg-primary text-background-dark border-primary'
                      : 'bg-surface-dark border-white/5 text-gray-500'
                    }`}
                  >
                    {day}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Identity */}
        {step === 4 && (
          <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col gap-3">
              <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight">Votre Identité</h2>
              <p className="text-text-secondary text-lg">Comment souhaitez-vous être appelé dans la communauté ?</p>
            </div>

            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-3">
                <label className="text-xs font-black uppercase tracking-widest text-gray-500 ml-1">Prénom (Optionnel)</label>
                <input 
                  type="text" 
                  placeholder="Jean"
                  value={data.firstName}
                  onChange={(e) => setData({ ...data, firstName: e.target.value })}
                  className="bg-surface-dark border-2 border-white/5 rounded-2xl p-5 text-white focus:border-primary focus:outline-none transition-all font-bold text-lg"
                />
              </div>
              <div className="flex flex-col gap-3">
                <label className="text-xs font-black uppercase tracking-widest text-gray-500 ml-1">Nom d'utilisateur (Requis)</label>
                <div className="relative">
                  <span className="absolute left-5 top-1/2 -translate-y-1/2 text-primary font-black">@</span>
                  <input 
                    type="text" 
                    placeholder="jean_fit"
                    value={data.username}
                    onChange={(e) => setData({ ...data, username: e.target.value.toLowerCase().replace(/\s/g, '_') })}
                    className="w-full bg-surface-dark border-2 border-white/5 rounded-2xl p-5 pl-10 text-white focus:border-primary focus:outline-none transition-all font-bold text-lg"
                    required
                  />
                </div>
                <p className="text-[10px] text-gray-600 font-bold uppercase tracking-wider ml-1">Visible sur votre profil et dans les classements.</p>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="mt-8 flex items-center justify-between pt-6 border-t border-white/5">
          <button onClick={handleBack} className="flex items-center gap-2 text-gray-500 hover:text-white transition-colors font-bold uppercase text-xs tracking-widest">
            <span className="material-symbols-outlined font-bold">arrow_back</span>
            Précédent
          </button>
          <button 
            onClick={handleNext}
            disabled={!canGoNext()}
            className={`flex items-center gap-3 py-4 px-10 rounded-3xl font-black text-lg transition-all transform active:scale-95 ${
              canGoNext()
              ? 'bg-primary text-background-dark shadow-[0_10px_30px_rgba(19,236,91,0.25)] hover:bg-emerald-400' 
              : 'bg-white/5 text-gray-600 cursor-not-allowed border border-white/5'
            }`}
          >
            {step === 4 ? 'Terminer la configuration' : 'Suivant'}
            <span className="material-symbols-outlined font-bold">arrow_forward</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default OnboardingScreen;

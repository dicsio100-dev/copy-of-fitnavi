
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/src/lib/supabase';
import { useAuth } from '@/src/context/AuthContext';

const GOALS = [
    { id: 'force', label: 'Force', icon: 'fitness_center' },
    { id: 'hypertrophie', label: 'Hypertrophie', icon: 'accessibility_new' },
    { id: 'endurance', label: 'Endurance', icon: 'directions_run' },
    { id: 'perte_poids', label: 'Perte de poids', icon: 'monitor_weight' },
];

const FREQUENCIES = [
    { id: '1-2', label: '1-2 fois/semaine' },
    { id: '3-4', label: '3-4 fois/semaine' },
    { id: '5+', label: '5+ fois/semaine' },
];

const DAYS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

const OnboardingFlow: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        goal: '',
        gender: '',
        age: '',
        weight: '',
        height: '',
        training_frequency: '',
        preferred_days: [] as string[],
        display_name: '',
        username: '',
    });

    const handleNext = () => {
        if (step < 4) {
            setStep(step + 1);
        } else {
            handleFinish();
        }
    };

    const handleBack = () => {
        if (step > 1) {
            setStep(step - 1);
        }
    };

    const toggleDay = (day: string) => {
        setFormData(prev => ({
            ...prev,
            preferred_days: prev.preferred_days.includes(day)
                ? prev.preferred_days.filter(d => d !== day)
                : [...prev.preferred_days, day]
        }));
    };

    const handleFinish = async () => {
        if (!user) return;
        setLoading(true);
        setError(null);

        try {
            // Validation simple
            if (!formData.username) throw new Error("Le nom d'utilisateur est requis");
            if (!formData.goal) throw new Error("L'objectif est requis");

            const updates = {
                id: user.id,
                goal: formData.goal,
                gender: formData.gender,
                age: parseInt(formData.age) || null,
                weight: parseFloat(formData.weight) || null,
                height: parseFloat(formData.height) || null,
                training_frequency: formData.training_frequency,
                preferred_days: formData.preferred_days,
                display_name: formData.display_name,
                username: formData.username.startsWith('@') ? formData.username : `@${formData.username}`,
                onboarding_completed: true,
                updated_at: new Date().toISOString(),
            };

            const { error } = await supabase.from('profiles').upsert(updates);

            if (error) throw error;

            // Reload page or force app refresh logic here if needed, 
            // but we rely on App.tsx detecting the change if possible.
            // Since we updated the DB, we might need to refresh the profile fetch in App.tsx. 
            // For now, simple navigation or window reload. 
            // Given App.tsx fetches profile on mount/auth change, a reload is safest to update "appUser" state.
            window.location.reload();

        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const isStepValid = () => {
        switch (step) {
            case 1: return !!formData.goal;
            case 2: return !!formData.gender && !!formData.age && !!formData.weight && !!formData.height;
            case 3: return !!formData.training_frequency && formData.preferred_days.length > 0;
            case 4: return !!formData.username;
            default: return false;
        }
    };

    // --- Render Steps ---

    const renderStep1 = () => (
        <div className="flex flex-col gap-4">
            <h2 className="text-2xl font-bold text-white mb-2">Quel est votre objectif principal ?</h2>
            <div className="grid grid-cols-1 gap-4">
                {GOALS.map((goal) => (
                    <button
                        key={goal.id}
                        onClick={() => setFormData({ ...formData, goal: goal.id })}
                        className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${formData.goal === goal.id
                                ? 'bg-primary text-background-dark border-primary'
                                : 'bg-surface-dark text-gray-300 border-white/10 hover:border-primary/50'
                            }`}
                    >
                        <span className="material-symbols-outlined text-3xl">{goal.icon}</span>
                        <span className="text-lg font-bold">{goal.label}</span>
                    </button>
                ))}
            </div>
        </div>
    );

    const renderStep2 = () => (
        <div className="flex flex-col gap-6">
            <h2 className="text-2xl font-bold text-white">Vos informations physiques</h2>

            <div className="flex flex-col gap-2">
                <label className="text-sm text-gray-400 font-bold ml-1">Sexe</label>
                <div className="flex gap-4">
                    {['Homme', 'Femme', 'Autre'].map(g => (
                        <button
                            key={g}
                            onClick={() => setFormData({ ...formData, gender: g })}
                            className={`flex-1 py-3 rounded-xl border font-bold transition-all ${formData.gender === g
                                    ? 'bg-primary text-background-dark border-primary'
                                    : 'bg-surface-dark text-gray-300 border-white/10'
                                }`}
                        >
                            {g}
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex flex-col gap-2">
                <label className="text-sm text-gray-400 font-bold ml-1">Âge</label>
                <input
                    type="number"
                    value={formData.age}
                    onChange={e => setFormData({ ...formData, age: e.target.value })}
                    placeholder="Ex: 25"
                    className="bg-surface-dark border border-white/10 rounded-xl p-4 text-white focus:border-primary focus:outline-none"
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                    <label className="text-sm text-gray-400 font-bold ml-1">Poids (kg)</label>
                    <input
                        type="number"
                        value={formData.weight}
                        onChange={e => setFormData({ ...formData, weight: e.target.value })}
                        placeholder="Ex: 70"
                        className="bg-surface-dark border border-white/10 rounded-xl p-4 text-white focus:border-primary focus:outline-none"
                    />
                </div>
                <div className="flex flex-col gap-2">
                    <label className="text-sm text-gray-400 font-bold ml-1">Taille (cm)</label>
                    <input
                        type="number"
                        value={formData.height}
                        onChange={e => setFormData({ ...formData, height: e.target.value })}
                        placeholder="Ex: 175"
                        className="bg-surface-dark border border-white/10 rounded-xl p-4 text-white focus:border-primary focus:outline-none"
                    />
                </div>
            </div>
        </div>
    );

    const renderStep3 = () => (
        <div className="flex flex-col gap-6">
            <h2 className="text-2xl font-bold text-white">Votre rythme d'entraînement</h2>

            <div className="flex flex-col gap-3">
                <label className="text-sm text-gray-400 font-bold ml-1">Fréquence hebdomadaire</label>
                {FREQUENCIES.map(freq => (
                    <button
                        key={freq.id}
                        onClick={() => setFormData({ ...formData, training_frequency: freq.id })}
                        className={`w-full text-left p-4 rounded-xl border transition-all font-medium ${formData.training_frequency === freq.id
                                ? 'bg-primary text-background-dark border-primary'
                                : 'bg-surface-dark text-gray-300 border-white/10 hover:border-primary/50'
                            }`}
                    >
                        {freq.label}
                    </button>
                ))}
            </div>

            <div className="flex flex-col gap-3">
                <label className="text-sm text-gray-400 font-bold ml-1">Jours préférés</label>
                <div className="flex flex-wrap gap-2">
                    {DAYS.map(day => (
                        <button
                            key={day}
                            onClick={() => toggleDay(day)}
                            className={`w-12 h-12 rounded-full border flex items-center justify-center font-bold text-sm transition-all ${formData.preferred_days.includes(day)
                                    ? 'bg-primary text-background-dark border-primary'
                                    : 'bg-surface-dark text-gray-400 border-white/10'
                                }`}
                        >
                            {day}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );

    const renderStep4 = () => (
        <div className="flex flex-col gap-6">
            <h2 className="text-2xl font-bold text-white">Votre identité de sportif</h2>

            <div className="flex flex-col gap-2">
                <label className="text-sm text-gray-400 font-bold ml-1">Prénom (Optionnel)</label>
                <input
                    type="text"
                    value={formData.display_name}
                    onChange={e => setFormData({ ...formData, display_name: e.target.value })}
                    placeholder="Comment doit-on vous appeler ?"
                    className="bg-surface-dark border border-white/10 rounded-xl p-4 text-white focus:border-primary focus:outline-none"
                />
            </div>

            <div className="flex flex-col gap-2">
                <label className="text-sm text-gray-400 font-bold ml-1">Nom d'utilisateur</label>
                <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">@</span>
                    <input
                        type="text"
                        value={formData.username.replace('@', '')}
                        onChange={e => setFormData({ ...formData, username: e.target.value })}
                        placeholder="fitmaster"
                        className="w-full bg-surface-dark border border-white/10 rounded-xl p-4 pl-10 text-white focus:border-primary focus:outline-none"
                    />
                </div>
                <p className="text-xs text-gray-500 ml-1">Sera unique et visible par la communauté</p>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-background-dark flex flex-col p-6">
            {/* Header / Progress */}
            <div className="flex items-center gap-4 py-4">
                {step > 1 && (
                    <button onClick={handleBack} className="text-white hover:text-primary">
                        <span className="material-symbols-outlined text-3xl">arrow_back</span>
                    </button>
                )}
                <div className="flex-1 h-2 bg-surface-dark rounded-full overflow-hidden">
                    <div
                        className="h-full bg-primary transition-all duration-300 ease-out"
                        style={{ width: `${(step / 4) * 100}%` }}
                    />
                </div>
                <span className="text-gray-400 font-bold text-sm">Étape {step}/4</span>
            </div>

            {/* Content */}
            <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full py-8">
                {step === 1 && renderStep1()}
                {step === 2 && renderStep2()}
                {step === 3 && renderStep3()}
                {step === 4 && renderStep4()}

                {error && (
                    <div className="mt-6 p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl text-sm font-medium">
                        {error}
                    </div>
                )}
            </div>

            {/* Footer Action */}
            <div className="max-w-md mx-auto w-full pb-6">
                <button
                    onClick={handleNext}
                    disabled={!isStepValid() || loading}
                    className="w-full bg-primary hover:bg-emerald-400 text-background-dark py-4 rounded-2xl font-bold text-lg transition-all shadow-lg transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? 'Configuration...' : (step === 4 ? 'Terminer la configuration' : 'Continuer')}
                </button>
            </div>
        </div>
    );
};

export default OnboardingFlow;

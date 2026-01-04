import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { User } from '../types';
import { generateWorkoutSession, generateRecoverySession, WorkoutSet, UserProfile } from '../src/lib/workout_generator';
import { fetchExerciseGif, fetchExerciseVideo, getTikTokUrl } from '../src/lib/external_apis';
import { logWorkout, unlockAchievement } from '../src/lib/api';
import { supabase } from '../src/lib/supabase';

interface WorkoutScreenProps {
  user: User;
  onUpdateProfile: (updates: Partial<User>) => void;
}

const WorkoutScreen: React.FC<WorkoutScreenProps> = ({ user, onUpdateProfile }) => {
  const navigate = useNavigate();

  // -- Intelligence Coach State --
  const [fatigueLevel, setFatigueLevel] = useState<number>(5); // 1-10
  const [showFatigueCheck, setShowFatigueCheck] = useState(true);
  const [sessionMode, setSessionMode] = useState<'Standard' | 'Recovery'>('Standard');

  // -- Session State --
  const [session, setSession] = useState<WorkoutSet[]>([]);
  const [loading, setLoading] = useState(false);
  const [exerciseIndex, setExerciseIndex] = useState(0);
  const [setIndex, setSetIndex] = useState(1);
  const [setsPerExercise] = useState(4);

  // -- Reactivity --
  const [currentWeight, setCurrentWeight] = useState(0);
  const [currentReps, setCurrentReps] = useState("8-12");

  // -- Timers --
  const [timer, setTimer] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isResting, setIsResting] = useState(false);
  const [restTimer, setRestTimer] = useState(0);
  const [showPulse, setShowPulse] = useState(false);

  // -- Media --
  const [activeMedia, setActiveMedia] = useState<{ type: 'gif' | 'video', url: string } | null>(null);
  const [isMediaLoading, setIsMediaLoading] = useState(false);

  // -- Social & Gamification End Screen --
  const [showSummary, setShowSummary] = useState(false);
  const [earnedXP, setEarnedXP] = useState(0);
  const [levelUp, setLevelUp] = useState(false);

  // -- Voices --
  const speak = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel(); // Stop previous
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'fr-FR';
      utterance.rate = 1.1;
      window.speechSynthesis.speak(utterance);
    }
  };

  // -- Initialization Sequence --

  const handleFatigueValidation = () => {
    setShowFatigueCheck(false);
    setLoading(true);

    // Smart Recovery Decision
    if (fatigueLevel > 8) {
      setSessionMode('Recovery');
      speak(`Niveau de fatigue élevé détecté. Je bascule sur une séance de récupération active pour régénerer ton corps.`);
      const recoverySession = generateRecoverySession();
      setSession(recoverySession);
      setLoading(false);
    } else {
      setSessionMode('Standard');
      if (fatigueLevel > 5) speak(`Ça marche. On adapte l'intensité. Bon entraînement !`);
      else speak(`Super forme ! On va tout casser aujourd'hui !`);
      generateSession(fatigueLevel > 5 ? 'Moyen' : 'Bon');
    }
  };

  const generateSession = (quality: 'Bon' | 'Moyen' | 'Mauvais') => {
    const profile: UserProfile = {
      weight: user.weight || 70,
      height: user.height || 175,
      age: user.age || 30,
      level: 'Intermédiaire',
      goal: (user.goal as any) === 'Prize de masse' || (user.goal as any) === 'Muscle' ? 'Muscle' : (user.goal as any) === 'Force' ? 'Force' : 'Perte_Gras',
      gender: user.gender === 'Homme' ? 'Homme' : 'Femme',
      sleepQuality: quality,
      equipment: user.equipment,
      personalRecords: user.personalRecords
    };

    const generated = generateWorkoutSession(profile);
    setSession(generated);
    if (generated.length > 0) {
      setCurrentWeight(generated[0].weight);
      setCurrentReps(generated[0].reps);
    }
    setLoading(false);
    setIsPaused(false);
  };


  // -- Updates when Exercise Changes --
  useEffect(() => {
    if (session.length > 0 && session[exerciseIndex]) {
      setCurrentWeight(session[exerciseIndex].weight);
      setCurrentReps(session[exerciseIndex].reps);
      setSetIndex(1);

      // Auto Voice Tips for new Exercise
      // setTimeout(() => {
      //     if (session[exerciseIndex].exercise.technical_tip) {
      //         speak(session[exerciseIndex].exercise.technical_tip);
      //     }
      // }, 1000);
    }
  }, [exerciseIndex, session]);

  // -- Global Timer --
  useEffect(() => {
    let interval: any;
    if (!isPaused && !loading && !showFatigueCheck && !showSummary) {
      interval = setInterval(() => setTimer(t => t + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [isPaused, loading, showFatigueCheck, showSummary]);

  // -- Rest Timer Logic --
  useEffect(() => {
    let interval: any;
    if (isResting && restTimer > 0) {
      interval = setInterval(() => setRestTimer(t => t - 1), 1000);
    } else if (isResting && restTimer <= 0) {
      setIsResting(false);
      setShowPulse(true);
      speak(`Repos terminé. Série ${setIndex}. C'est parti.`);
      setTimeout(() => setShowPulse(false), 3000);
    }
    return () => clearInterval(interval);
  }, [isResting, restTimer, setIndex]);


  // -- Handlers --

  const handleValidation = async () => {
    const isRecovery = sessionMode === 'Recovery';
    const maxSets = isRecovery ? 1 : setsPerExercise; // Only 1 set for recovery flow

    // XP Gain per Set
    setEarnedXP(prev => prev + 10);

    if (setIndex < maxSets) {
      setSetIndex(prev => prev + 1);
      const restSeconds = session[exerciseIndex].rest === "45-60s" ? 45 : parseInt(session[exerciseIndex].rest) || 60;
      setRestTimer(restSeconds);
      setIsResting(true);
      speak("Bien. Récupère.");
    } else {
      speak("Exercice terminé.");
      handleAddNextExercise();
    }
  };

  const handleAddNextExercise = () => {
    if (exerciseIndex < session.length - 1) {
      setExerciseIndex(prev => prev + 1);
      setIsResting(false);
    } else {
      finishWorkout();
    }
  };

  const handleVoiceCoach = () => {
    const tip = session[exerciseIndex]?.exercise.technical_tip;
    if (tip) speak(tip);
    else speak("Concentre-toi sur ta respiration et le contrôle du mouvement.");
  };

  const handleTooHard = () => {
    const newWeight = Math.floor((currentWeight * 0.9) / 2.5) * 2.5;
    setCurrentWeight(newWeight);
    speak("J'allège la charge.");
  };

  const finishWorkout = async () => {
    // 1. Calculate Rewards
    const baseXP = 100; // Finish Bonus
    const totalXP = earnedXP + baseXP;

    // Update User State
    const currentXP = user.xp || 0;
    const currentLevel = user.level || 1;
    const newTotalXP = currentXP + totalXP;

    // Simple Level Formula: Level = 1 + Math.floor(newTotalXP / 500);
    const newLevel = 1 + Math.floor(newTotalXP / 500);
    const isLevelUp = newLevel > currentLevel;

    setLevelUp(isLevelUp);
    setEarnedXP(totalXP); // For display
    setShowSummary(true); // Show Social Card

    // 2. Persist Data (XP, Level, Overload)
    const newRecords = { ...user.personalRecords };
    session.forEach(set => {
      const currentRec = newRecords[set.exercise.id] || 0;
      if (set.weight > 0 && set.weight >= currentRec) {
        newRecords[set.exercise.id] = Math.round((set.weight * 1.025) / 1.25) * 1.25;
      }
    });

    // Async save
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (authUser) {
        const minutes = Math.ceil(timer / 60);
        await logWorkout(authUser.id, sessionMode === 'Recovery' ? "Récupération Active" : "FitNavi Ultimate Session", minutes, 3);

        onUpdateProfile({
          xp: newTotalXP,
          level: newLevel,
          personalRecords: newRecords
        });
      }
    } catch (e) { console.error(e); }
  };

  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // -- RENDER --

  if (loading) return <div className="h-screen bg-background-dark flex items-center justify-center text-primary font-black tracking-widest animate-pulse">OPTIMISATION EN COURS...</div>;

  // FATIGUE CHECK MODAL (Replaces Sleep Check)
  if (showFatigueCheck) {
    return (
      <div className="h-screen w-full bg-background-dark flex flex-col items-center justify-center p-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5"></div>
        <h2 className="text-3xl font-black text-white text-center mb-2 z-10">Smart Recovery</h2>
        <p className="text-gray-400 text-center mb-10 max-w-md z-10">Ton niveau de fatigue aujourd'hui (1-10) ?</p>

        <div className="w-full max-w-md bg-surface-dark p-8 rounded-3xl border border-white/10 z-10">
          <div className="flex justify-between text-primary font-black text-2xl mb-4">
            <span>1 (Frais)</span>
            <span>{fatigueLevel}</span>
            <span>10 (Épuisé)</span>
          </div>
          <input
            type="range" min="1" max="10" step="1"
            value={fatigueLevel}
            onChange={(e) => setFatigueLevel(Number(e.target.value))}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-primary mb-8"
          />
          <button onClick={handleFatigueValidation} className="w-full py-4 bg-primary text-black font-black uppercase rounded-xl hover:scale-105 transition-transform">
            Lancer la séance adaptative
          </button>
          {fatigueLevel > 8 && (
            <p className="mt-4 text-xs text-center text-primary animate-pulse">⚠️ Fatigue élevée détectée. Le mode Récupération sera activé.</p>
          )}
        </div>
      </div>
    );
  }

  // SOCIAL SUMMARY CARD
  if (showSummary) {
    return (
      <div className="h-screen w-full bg-background-dark flex flex-col items-center justify-center p-6 relative">
        <div className="w-full max-w-sm bg-background-dark border-2 border-primary rounded-[2rem] p-6 relative shadow-[0_0_50px_rgba(20,241,99,0.3)] flex flex-col gap-4 text-center">
          <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-primary text-black font-black px-6 py-2 rounded-full uppercase tracking-widest text-sm shadow-lg">
            {sessionMode === 'Recovery' ? 'RECOVERY DONE' : 'MISSION COMPLÈTE'}
          </div>

          {/* Avatar & Neon Filter */}
          <div className="w-32 h-32 mx-auto rounded-full border-4 border-primary p-1 relative mt-4">
            <div className="w-full h-full rounded-full bg-cover bg-center grayscale contrast-125" style={{ backgroundImage: `url('${user.avatar_url || "https://picsum.photos/seed/fitnavi/400/400"}')` }}></div>
            <div className="absolute inset-0 bg-primary/20 rounded-full mix-blend-overlay"></div>
            {levelUp && (
              <div className="absolute -bottom-2 -right-2 bg-yellow-400 text-black text-xs font-black px-2 py-1 rounded rotate-12 animate-bounce">LEVEL UP!</div>
            )}
          </div>

          <h2 className="text-3xl font-black text-white italic">{user.username || "ATHLÈTE"}</h2>
          <div className="flex justify-center gap-4 text-left">
            <div>
              <p className="text-gray-500 text-[10px] uppercase font-black">DURÉE</p>
              <p className="text-white font-black text-xl">{formatTime(timer)}</p>
            </div>
            <div>
              <p className="text-gray-500 text-[10px] uppercase font-black">XP GAGNÉ</p>
              <p className="text-primary font-black text-xl">+{earnedXP} XP</p>
            </div>
            <div>
              <p className="text-gray-500 text-[10px] uppercase font-black">NIVEAU</p>
              <p className="text-white font-black text-xl">{user.level || 1}</p>
            </div>
          </div>

          <p className="text-gray-400 text-xs italic">"La douleur est temporaire, la gloire est éternelle."</p>

          <button onClick={() => navigate('/dashboard')} className="mt-4 w-full py-4 bg-white/10 hover:bg-white/20 text-white font-black rounded-xl transition-all border border-white/10 uppercase text-xs tracking-widest">
            Retour au QG
          </button>
          <button className="w-full py-4 bg-primary text-black font-black rounded-xl transition-all uppercase text-xs tracking-widest flex items-center justify-center gap-2 hover:scale-105">
            <span className="material-symbols-outlined text-sm">share</span> Partager Story
          </button>
        </div>
      </div>
    );
  }

  // --- STANDARD WORKOUT RENDERING ---
  const currentSet = session[exerciseIndex];

  return (
    <div className="h-full w-full bg-background-dark text-white flex flex-col font-sans overflow-hidden relative">
      <header className="p-6 flex items-center justify-between z-10 bg-background-dark/80 backdrop-blur-md">
        <button onClick={() => navigate('/')} className="text-gray-400 hover:text-white transition-colors">
          <span className="material-symbols-outlined text-3xl">close</span>
        </button>
        <div className="flex flex-col items-center">
          <span className="text-[10px] font-black tracking-[0.3em] text-primary uppercase animate-pulse">COACH INTELLIGENT</span>
          <span className="font-mono text-xl font-bold tracking-widest">{formatTime(timer)}</span>
        </div>
        <div className="w-8"></div>
      </header>

      <main className="flex-1 relative flex flex-col items-center justify-center p-4">
        {/* Progress Bar */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gray-900">
          <div className="h-full bg-primary duration-500 ease-out shadow-[0_0_15px_rgba(20,241,99,0.8)]" style={{ width: `${((exerciseIndex) / session.length) * 100}%` }} />
        </div>

        <div key={currentSet.exercise.id} className={`w-full max-w-md flex flex-col gap-6 z-10 animate-in fade-in slide-in-from-bottom-8 duration-500 ${showPulse ? 'scale-105' : 'scale-100'}`}>

          <div className="text-center relative">
            <h2 className="text-4xl md:text-5xl font-black italic tracking-tighter uppercase mb-2 leading-none drop-shadow-lg">{currentSet.exercise.name}</h2>

            {/* VOICE COACH BUTTON */}
            <button
              onClick={handleVoiceCoach}
              className="absolute -right-2 top-0 bg-primary/20 hover:bg-primary text-primary hover:text-black p-3 rounded-full transition-all animate-bounce"
              title="Conseil du Coach"
            >
              <span className="material-symbols-outlined">record_voice_over</span>
            </button>
            <div className="flex justify-center gap-2">
              <span className="bg-white/5 px-3 py-1 rounded-full text-[10px] font-bold tracking-widest text-primary border border-primary/30 uppercase">{currentSet.exercise.target}</span>
            </div>
          </div>

          <div className={`bg-white/5 border border-white/10 rounded-3xl p-8 flex items-center justify-between relative overflow-hidden backdrop-blur-sm transition-all duration-300 ${showPulse ? 'shadow-[0_0_50px_rgba(20,241,99,0.2)] border-primary/50' : ''}`}>
            <div className="flex flex-col items-center gap-1 z-10">
              <span className="text-gray-500 text-[10px] font-black uppercase tracking-widest">CHARGE</span>
              <span className="text-5xl font-black text-white tracking-tighter">{currentWeight}<span className="text-lg text-gray-500">kg</span></span>
            </div>
            <div className="w-px h-16 bg-white/10 z-10" />
            <div className="flex flex-col items-center gap-1 z-10">
              <span className="text-gray-500 text-[10px] font-black uppercase tracking-widest">{sessionMode === 'Recovery' ? 'DURÉE' : 'REPS'}</span>
              <span className="text-5xl font-black text-white tracking-tighter">{currentReps}</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <button onClick={async () => {
              setActiveMedia({ type: 'gif', url: '' });
              setIsMediaLoading(true);

              try {
                const url = await fetchExerciseGif(currentSet.exercise.name);
                console.log("🚀 URL ENVOYÉE À L'ÉCRAN :", url);

                if (url) {
                  setActiveMedia({ type: 'gif', url: url });
                } else {
                  // Should not happen with current API fallback logic, but safety first
                  setActiveMedia({ type: 'gif', url: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHJueGZ3bmZ3bmZ3/3o7TKMGpxx8y90/giphy.gif" });
                }
              } catch (err) {
                console.error("Erreur chargement GIF:", err);
              } finally {
                setIsMediaLoading(false);
              }
            }} className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl py-4 flex flex-col items-center gap-1 transition-all active:scale-95 group">
              <span className="material-symbols-outlined text-primary group-hover:scale-110 transition-transform">DÉMO</span>
              <span className="text-[9px] font-bold uppercase tracking-wider text-gray-400">DÉMO</span>
            </button>
            <button onClick={() => { setActiveMedia({ type: 'video', url: '' }); setIsMediaLoading(true); fetchExerciseVideo(currentSet.exercise.name).then(u => { setActiveMedia({ type: 'video', url: u || '' }); setIsMediaLoading(false); }) }} className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl py-4 flex flex-col items-center gap-1 transition-all active:scale-95 group">
              <span className="material-symbols-outlined text-[#FF0000] group-hover:scale-110 transition-transform">play_circle</span>
              <span className="text-[9px] font-bold uppercase tracking-wider text-gray-400">YOUTUBE</span>
            </button>
            <button onClick={() => window.open(getTikTokUrl(currentSet.exercise.name), '_blank')} className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl py-4 flex flex-col items-center gap-1 transition-all active:scale-95 group">
              <span className="text-xl group-hover:scale-110 transition-transform">🎵</span>
              <span className="text-[9px] font-bold uppercase tracking-wider text-gray-400">TIKTOK</span>
            </button>
          </div>

          <div className="flex flex-col gap-3">
            <button onClick={handleValidation} className="bg-primary hover:bg-[#10c950] text-background-dark w-full py-5 rounded-2xl font-black text-xl tracking-wider shadow-[0_0_20px_rgba(20,241,99,0.3)] active:scale-[0.98] transition-all flex items-center justify-center gap-2">
              <span className="material-symbols-outlined font-black">check</span>
              VALIDER LA SÉRIE
            </button>
            {sessionMode !== 'Recovery' && (
              <button onClick={handleTooHard} className="bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/30 w-full py-3 rounded-xl font-bold text-xs uppercase tracking-widest active:scale-[0.98] transition-all">
                TROP DUR (-10%)
              </button>
            )}
          </div>
        </div>

        {/* MEDIA MODAL */}
        {activeMedia && (
          <div className="fixed inset-0 z-50 bg-[#061109]/95 backdrop-blur-xl flex flex-col items-center justify-center p-6 animate-in fade-in zoom-in duration-300">
            <button onClick={() => setActiveMedia(null)} className="absolute top-6 right-6 w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-all">
              <span className="material-symbols-outlined">close</span>
            </button>
            <div className="w-full max-w-4xl aspect-video bg-black rounded-3xl overflow-hidden shadow-2xl border border-white/10 relative">
              {isMediaLoading && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></span>
                </div>
              )}
              {activeMedia.type === 'gif' && (
                activeMedia.url ? (
                  <div className="relative w-full h-full">
                    <img
                      src={activeMedia.url}
                      className="w-full h-full object-contain rounded-xl border border-[#14f163]/50 shadow-[0_0_20px_rgba(20,241,99,0.1)]"
                      alt="Demo"
                      referrerPolicy="no-referrer"
                      onLoad={() => { console.log("Image Loaded"); setIsMediaLoading(false); }}
                      onError={(e) => { console.error("Image Load Error", e); setIsMediaLoading(false); }}
                    />
                    <div className="absolute bottom-2 right-2 bg-black/60 px-2 py-1 rounded-md">
                      <p className="text-[8px] text-gray-400 uppercase tracking-wider">Source: Wikimedia Commons</p>
                    </div>
                  </div>
                ) : (
                  !isMediaLoading && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-[#061109] border border-primary/20 rounded-3xl">
                      <div className="w-24 h-24 rounded-full border-4 border-primary/30 flex items-center justify-center mb-6 animate-pulse shadow-[0_0_30px_rgba(20,241,99,0.2)]">
                        <span className="material-symbols-outlined text-primary text-5xl">fitness_center</span>
                      </div>
                      <p className="text-primary font-black uppercase tracking-widest text-sm animate-pulse">Recherche d'image...</p>
                      <p className="text-gray-500 text-[10px] mt-2 max-w-xs">Scan des archives Wikimedia en cours.</p>
                    </div>
                  )
                )
              )}
              {activeMedia.type === 'video' && (
                activeMedia.url ? (
                  <iframe src={activeMedia.url} className="w-full h-full" allowFullScreen onLoad={() => setIsMediaLoading(false)} />
                ) : (
                  !isMediaLoading && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                      <span className="material-symbols-outlined text-gray-600 text-6xl mb-4">videocam_off</span>
                      <p className="text-gray-400 font-bold uppercase tracking-widest text-sm">Vidéo non disponible</p>
                      <p className="text-gray-600 text-xs mt-2">Impossible de charger la vidéo pour le moment.</p>
                    </div>
                  )
                )
              )}
            </div>
            <h3 className="text-2xl font-black text-white mt-6 uppercase tracking-widest">{currentSet.exercise.name}</h3>
          </div>
        )}

        {/* MEDIA MODAL CONTENT REPLACEMENT - MOVED TO INSIDE MODAL LOGIC ABOVE, but editing the internal block here. */}
        {/* I will use the previous context to target the specific block inside the modal */}

        {/* REST OVERLAY */}
        {isResting && (
          <div className="absolute inset-0 z-40 bg-black/95 backdrop-blur-md flex flex-col items-center justify-center animate-in fade-in">
            <span className="text-primary text-lg font-black uppercase tracking-[0.5em] mb-8 animate-pulse">Récupération</span>
            <div className="relative">
              <svg className="w-64 h-64 transform -rotate-90">
                <circle cx="128" cy="128" r="120" stroke="#1a1a1a" strokeWidth="8" fill="none" />
                <circle cx="128" cy="128" r="120" stroke="#14f163" strokeWidth="8" fill="none" strokeDasharray={2 * Math.PI * 120} strokeDashoffset={2 * Math.PI * 120 * (1 - restTimer / (parseInt(currentSet.rest) || 60))} className="transition-all duration-1000 ease-linear" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center"><span className="text-8xl font-black text-white tabular-nums tracking-tighter">{restTimer}</span></div>
            </div>
            <p className="text-gray-500 mt-8 font-mono text-sm">Respire profondément...</p>
            <button onClick={() => { setIsResting(false); setRestTimer(0); }} className="mt-8 px-8 py-3 bg-white/10 hover:bg-white/20 rounded-full text-white font-bold uppercase tracking-widest border border-white/10 transition-all">Reprendre maintenant</button>
          </div>
        )}
      </main>
    </div>
  );
};

export default WorkoutScreen;
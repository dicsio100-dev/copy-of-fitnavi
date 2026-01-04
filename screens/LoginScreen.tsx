import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/src/context/AuthContext';
import { supabase } from '@/src/lib/supabase'; // Assure-toi que ce chemin est bon

interface LoginScreenProps {
  onLogin: (email: string) => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  // --- ÉTATS ---
  const [isLogin, setIsLogin] = useState(true); // true = Mode Connexion, false = Mode Inscription
  const [showVerification, setShowVerification] = useState(false); // Pour afficher l'écran du code

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState(''); // Nouveau champ prénom

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // États pour le code OTP (6 chiffres)
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const navigate = useNavigate();
  const { signIn } = useAuth();

  // --- LOGIQUE D'AUTHENTIFICATION ---
  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setLoading(true);
    setError(null);

    try {
      if (isLogin) {
        // --- CAS 1 : CONNEXION CLASSIQUE ---
        const { error } = await signIn(email, password);
        if (error) throw error;
        // La redirection se fera automatiquement via le AuthContext
      } else {
        // --- CAS 2 : INSCRIPTION (Envoi du Code) ---
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { first_name: firstName }
          }
        });
        if (error) throw error;

        // Si pas d'erreur, on passe à l'écran de vérification
        setShowVerification(true);
      }
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  // --- LOGIQUE VÉRIFICATION DU CODE (OTP) ---
  const handleVerifyOtp = async () => {
    const token = otp.join('');
    if (token.length !== 6) {
      setError("Le code doit contenir 6 chiffres.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.verifyOtp({
        email,
        token,
        type: 'signup'
      });

      if (error) throw error;

      // Succès !
      // Supabase connecte l'utilisateur, l'app va se recharger
    } catch (err: any) {
      setError("Code incorrect ou expiré.");
      setOtp(['', '', '', '', '', '']); // Reset code
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  // --- GESTION DES CASES 6 CHIFFRES ---
  const handleChangeOtp = (index: number, value: string) => {
    if (isNaN(Number(value))) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value !== '' && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleKeyDownOtp = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // ==========================================
  // VUE 1 : ÉCRAN DE VÉRIFICATION DU CODE
  // ==========================================
  if (showVerification) {
    return (
      <div className="min-h-screen w-full flex flex-col p-6 bg-background-dark">
        <header className="flex items-center gap-4 py-4">
          <button onClick={() => setShowVerification(false)} className="text-white hover:text-primary">
            <span className="material-symbols-outlined text-3xl">arrow_back</span>
          </button>
        </header>

        <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full gap-8">
          <div className="text-center">
            <h2 className="text-3xl font-black text-white mb-2">Vérification</h2>
            <p className="text-gray-400">
              Entrez le code envoyé à <span className="text-primary font-bold">{email}</span>
            </p>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl text-red-500 text-sm font-medium text-center">
              {error}
            </div>
          )}

          {/* Les 6 cases OTP */}
          <div className="flex justify-center gap-2 sm:gap-4 my-4">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={el => inputRefs.current[index] = el}
                type="text"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChangeOtp(index, e.target.value)}
                onKeyDown={(e) => handleKeyDownOtp(index, e)}
                className="w-12 h-14 sm:w-14 sm:h-16 bg-surface-dark border border-border-dark rounded-xl text-center text-2xl font-bold text-primary focus:border-primary focus:outline-none transition-all"
              />
            ))}
          </div>

          <button
            onClick={handleVerifyOtp}
            disabled={loading}
            className="bg-primary hover:opacity-90 text-background-dark py-4 rounded-2xl font-bold text-lg mt-4 transition-all shadow-active-glow disabled:opacity-50"
          >
            {loading ? 'Vérification...' : 'Confirmer le code'}
          </button>

          <button
            onClick={() => setShowVerification(false)}
            className="text-sm text-gray-500 hover:text-white underline text-center"
          >
            Renvoyer le code ou changer d'email
          </button>
        </div>
      </div>
    );
  }

  // ==========================================
  // VUE 2 : LOGIN / SIGNUP CLASSIQUE
  // ==========================================
  return (
    <div className="min-h-[100dvh] w-full flex flex-col p-4 sm:p-6 bg-background-dark overflow-y-auto">
      <header className="flex items-center gap-4 py-4 shrink-0">
        <button onClick={() => navigate('/welcome')} className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 text-white hover:text-primary transition-all">
          <span className="material-symbols-outlined text-2xl">arrow_back</span>
        </button>
      </header>

      <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full gap-6 md:gap-8 py-8 md:py-10">
        <div className="glass-card p-6 md:p-8 rounded-[2rem]">
          <div className="mb-8">
            <h2 className="text-3xl md:text-4xl font-black text-white mb-2 uppercase tracking-tighter">
              {isLogin ? 'Access_Link' : 'Create_Intel'}
            </h2>
            <p className="text-xs font-bold text-primary/60 uppercase tracking-[0.2em]">
              {isLogin
                ? 'Authorized credentials required'
                : 'Initiating user synchronization'}
            </p>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl text-red-500 text-[10px] font-black uppercase tracking-widest mb-6 border-l-4">
              {error}
            </div>
          )}

          <form onSubmit={handleAuth} className="flex flex-col gap-5">

            {/* Champ Prénom */}
            {!isLogin && (
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Identity_Name</label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:border-primary focus:outline-none transition-all placeholder-gray-700 font-medium"
                  placeholder="Thomas"
                  required
                />
              </div>
            )}

            {/* Email */}
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Neuro_Mail</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:border-primary focus:outline-none transition-all placeholder-gray-700 font-medium"
                placeholder="system@fitnavi.io"
                required
              />
            </div>

            {/* Mot de passe */}
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Secure_Key</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:border-primary focus:outline-none transition-all placeholder-gray-700 font-medium font-mono"
                placeholder="••••••••"
                required
              />
              {isLogin && (
                <button type="button" className="text-primary text-[10px] font-black self-end mt-1 hover:underline uppercase tracking-tighter">Key_Recovery</button>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="bg-primary hover:scale-[1.02] active:scale-95 text-background-dark py-4 rounded-xl font-black text-sm uppercase tracking-widest mt-4 transition-all shadow-active-glow disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              {loading
                ? 'Syncing...'
                : (isLogin ? 'Initiate_Session' : 'Finalize_Link')
              }
            </button>
          </form>
        </div>

        <div className="flex items-center gap-4 text-gray-600">
          <div className="flex-1 h-px bg-gray-800" />
          <span className="text-xs font-bold uppercase tracking-widest">ou</span>
          <div className="flex-1 h-px bg-gray-800" />
        </div>

        <button className="flex items-center justify-center gap-3 bg-white/5 border border-white/10 hover:bg-white/10 text-white py-4 rounded-2xl font-bold transition-all">
          <img src="https://www.gstatic.com/images/branding/product/1x/gsa_512dp.png" className="w-6 h-6" alt="Google" />
          Continuer avec Google
        </button>

        {/* Le bouton Magique qui change tout */}
        <p className="text-center text-gray-400 text-sm">
          {isLogin ? "Vous n'avez pas de compte ? " : "Déjà un compte ? "}
          <button
            onClick={() => {
              setIsLogin(!isLogin); // On inverse le mode
              setError(null);       // On efface les erreurs
            }}
            className="text-primary font-bold hover:underline"
          >
            {isLogin ? "Créer un compte" : "Se connecter"}
          </button>
        </p>
      </div >
    </div >
  );
};

export default LoginScreen;
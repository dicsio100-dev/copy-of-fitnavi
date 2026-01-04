
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../src/context/AuthContext';

interface SignupScreenProps {
  onSignup: (email: string) => void;
}

const SignupScreen: React.FC<SignupScreenProps> = ({ onSignup }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { signUp } = useAuth();

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!email || !password || !fullName) return;

    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { error } = await signUp(email, password, { full_name: fullName });
      if (error) {
        throw error;
      }
      // Successful signup will trigger onAuthStateChange in AuthProvider
      // navigate('/onboarding'); // This will be handled by the protected route in App.tsx
    } catch (err: any) {
      setError(err.message || "Erreur lors de l'inscription");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col p-6 bg-background-dark overflow-y-auto">
      <header className="flex items-center gap-4 py-4 shrink-0">
        <button onClick={() => navigate('/welcome')} className="text-white hover:text-primary transition-colors">
          <span className="material-symbols-outlined text-3xl">arrow_back</span>
        </button>
      </header>

      <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full gap-8 py-10">
        <div>
          <h2 className="text-4xl font-black text-white mb-2">Rejoignez FitNavi</h2>
          <p className="text-text-secondary">Créez votre compte pour commencer votre transformation.</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl text-red-500 text-sm font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-gray-400 ml-1">Nom complet</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="bg-surface-dark border border-border-dark rounded-2xl p-4 text-white focus:ring-2 focus:ring-primary focus:outline-none transition-all"
              placeholder="Votre Nom"
              required
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-gray-400 ml-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-surface-dark border border-border-dark rounded-2xl p-4 text-white focus:ring-2 focus:ring-primary focus:outline-none transition-all"
              placeholder="votre@email.com"
              required
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-gray-400 ml-1">Mot de passe</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-surface-dark border border-border-dark rounded-2xl p-4 text-white focus:ring-2 focus:ring-primary focus:outline-none transition-all"
              placeholder="••••••••"
              required
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-gray-400 ml-1">Confirmer le mot de passe</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="bg-surface-dark border border-border-dark rounded-2xl p-4 text-white focus:ring-2 focus:ring-primary focus:outline-none transition-all"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="bg-primary hover:bg-emerald-400 text-background-dark py-4 rounded-2xl font-bold text-lg mt-4 transition-all shadow-lg transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Création...' : 'Créer mon compte'}
          </button>
        </form>

        <div className="flex items-center gap-4 text-gray-600">
          <div className="flex-1 h-px bg-gray-800" />
          <span className="text-xs font-bold uppercase tracking-widest">ou</span>
          <div className="flex-1 h-px bg-gray-800" />
        </div>

        <button className="flex items-center justify-center gap-3 bg-white/5 border border-white/10 hover:bg-white/10 text-white py-4 rounded-2xl font-bold transition-all">
          <img src="https://www.gstatic.com/images/branding/product/1x/gsa_512dp.png" className="w-6 h-6" alt="Google" />
          S'inscrire avec Google
        </button>

        <p className="text-center text-gray-400 text-sm">
          Vous avez déjà un compte ? <button onClick={() => navigate('/login')} className="text-primary font-bold hover:underline">Se connecter</button>
        </p>
      </div>
    </div>
  );
};

export default SignupScreen;

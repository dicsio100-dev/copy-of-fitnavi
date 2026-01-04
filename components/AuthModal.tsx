import React, { useState } from 'react';
import { useAuth } from '../src/context/AuthContext';
import { supabase } from '../src/lib/supabase';

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialView: 'login' | 'signup';
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, initialView }) => {
    const [view, setView] = useState<'login' | 'signup'>(initialView);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    // Sync state when view changes
    React.useEffect(() => {
        setView(initialView);
        setError(null);
        setEmail('');
        setPassword('');
        setFullName('');
        setConfirmPassword('');
    }, [initialView, isOpen]);

    const { signIn, signUp } = useAuth();

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            if (view === 'login') {
                const { error } = await signIn(email, password);
                if (error) throw error;
                // Success handled by AuthProvider/App wrapper
            } else {
                if (password !== confirmPassword) {
                    throw new Error("Les mots de passe ne correspondent pas");
                }
                if (!fullName) throw new Error("Nom complet requis");

                const { error } = await signUp(email, password, { full_name: fullName });
                if (error) throw error;
            }
            onClose();
        } catch (err: any) {
            setError(err.message || "Une erreur est survenue");
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
            });
            if (error) throw error;
        } catch (err: any) {
            setError(err.message);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div
                className="w-full max-w-md bg-surface-dark border border-white/10 rounded-3xl p-8 shadow-2xl relative animate-in fade-in zoom-in duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"
                >
                    <span className="material-symbols-outlined">close</span>
                </button>

                <div className="mb-8 text-center">
                    <h2 className="text-3xl font-black text-white mb-2">
                        {view === 'login' ? 'Bon retour !' : 'Rejoignez FitNavi'}
                    </h2>
                    <p className="text-gray-400">
                        {view === 'login'
                            ? 'Connectez-vous pour accéder à votre espace.'
                            : 'Créez votre compte pour commencer.'}
                    </p>
                </div>

                {error && (
                    <div className="mb-6 bg-red-500/10 border border-red-500/20 p-3 rounded-xl text-red-500 text-sm font-medium text-center">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    {view === 'signup' && (
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-400 ml-1 uppercase">Nom complet</label>
                            <input
                                type="text"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                className="w-full bg-background-dark border border-border-dark rounded-xl p-3 text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                                placeholder="Votre Nom"
                                required
                            />
                        </div>
                    )}

                    <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-400 ml-1 uppercase">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-background-dark border border-border-dark rounded-xl p-3 text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                            placeholder="votre@email.com"
                            required
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-400 ml-1 uppercase">Mot de passe</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-background-dark border border-border-dark rounded-xl p-3 text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    {view === 'signup' && (
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-400 ml-1 uppercase">Confirmation</label>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full bg-background-dark border border-border-dark rounded-xl p-3 text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                                placeholder="••••••••"
                                required
                            />
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-primary hover:bg-emerald-400 text-background-dark py-3.5 rounded-xl font-bold text-lg mt-2 transition-transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/20"
                    >
                        {loading
                            ? 'Chargement...'
                            : view === 'login' ? 'Se connecter' : 'Créer mon compte'}
                    </button>
                </form>

                <div className="my-6 flex items-center gap-4 text-gray-600">
                    <div className="flex-1 h-px bg-white/10" />
                    <span className="text-xs font-bold uppercase tracking-widest">OU</span>
                    <div className="flex-1 h-px bg-white/10" />
                </div>

                <button
                    onClick={handleGoogleLogin}
                    type="button"
                    className="w-full flex items-center justify-center gap-3 bg-white/5 border border-white/10 hover:bg-white/10 text-white py-3.5 rounded-xl font-bold transition-colors"
                >
                    <img src="https://www.gstatic.com/images/branding/product/1x/gsa_512dp.png" className="w-5 h-5" alt="Google" />
                    Continuer avec Google
                </button>

                <div className="mt-6 text-center">
                    <p className="text-gray-400 text-sm">
                        {view === 'login' ? "Pas encore de compte ?" : "Déjà un compte ?"}
                        {' '}
                        <button
                            onClick={() => setView(view === 'login' ? 'signup' : 'login')}
                            className="text-primary font-bold hover:underline"
                        >
                            {view === 'login' ? "S'inscrire" : "Se connecter"}
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AuthModal;

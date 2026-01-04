
import React, { useState } from 'react';
import AuthModal from '../components/AuthModal';

const WelcomeScreen: React.FC = () => {
  const [showInstructions, setShowInstructions] = useState(false);
  const [authModal, setAuthModal] = useState<{ isOpen: boolean; view: 'login' | 'signup' }>({
    isOpen: false,
    view: 'login'
  });

  return (
    <div className="relative h-full w-full flex flex-col items-center justify-center overflow-hidden bg-black">
      {/* Background Image with Overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-40 scale-110 blur-sm"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2070&auto=format&fit=crop')" }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-background-dark via-background-dark/80 to-transparent" />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center gap-8 px-6 text-center max-w-lg">
        <div className="flex flex-col items-center gap-4">
          <div className="w-20 h-20 bg-primary/20 rounded-3xl flex items-center justify-center text-primary border border-primary/30 shadow-active-glow animate-pulse">
            <span className="material-symbols-outlined text-5xl font-bold">bolt</span>
          </div>
          <h1 className="text-6xl font-black tracking-tighter text-white">FitNavi</h1>
          <p className="text-xl text-gray-300 font-medium">L'avenir de votre fitness commence ici. Entraînez-vous plus intelligemment.</p>
        </div>

        <div className="flex flex-col gap-4 w-full">
          <button
            onClick={() => setAuthModal({ isOpen: true, view: 'login' })}
            className="w-full bg-primary hover:opacity-90 text-background-dark py-4 rounded-2xl font-bold text-lg transition-all shadow-active-glow transform active:scale-95"
          >
            Se connecter
          </button>
          <button
            onClick={() => setAuthModal({ isOpen: true, view: 'signup' })}
            className="w-full bg-white/10 hover:bg-white/20 backdrop-blur-md text-white py-4 rounded-2xl font-bold text-lg border border-white/20 transition-all transform active:scale-95"
          >
            Créer un compte
          </button>
          <button
            onClick={() => setShowInstructions(true)}
            className="text-primary text-xs font-black uppercase tracking-widest mt-2 hover:underline"
          >
            Instructions de construction
          </button>
        </div>
      </div>

      {/* Auth Modal */}
      <AuthModal
        isOpen={authModal.isOpen}
        onClose={() => setAuthModal(prev => ({ ...prev, isOpen: false }))}
        initialView={authModal.view}
      />

      {/* Instructions Modal */}
      {showInstructions && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-md">
          <div className="bg-surface-dark w-full max-w-2xl rounded-[2.5rem] border border-white/10 p-8 md:p-10 shadow-2xl flex flex-col gap-6 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-black text-white">BUILD INSTRUCTIONS</h2>
              <button onClick={() => setShowInstructions(false)} className="text-gray-500 hover:text-white">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="space-y-4 text-gray-300">
              <section>
                <h3 className="font-bold text-primary uppercase text-sm mb-2">1. Prérequis</h3>
                <p>Node.js v18+, un éditeur comme VS Code. L'application utilise React 19 et Tailwind CSS.</p>
              </section>
              <section>
                <h3 className="font-bold text-primary uppercase text-sm mb-2">2. Dépendances</h3>
                <p>Installez les packages : <code>react</code>, <code>react-dom</code>, <code>react-router-dom</code>, <code>recharts</code>, et <code>@google/genai</code>.</p>
              </section>
              <section>
                <h3 className="font-bold text-primary uppercase text-sm mb-2">3. Configuration API</h3>
                <p>Créez une clé API Gemini sur <a href="https://ai.google.dev/" target="_blank" className="underline">Google AI Studio</a>. Définissez-la dans <code>process.env.API_KEY</code>.</p>
              </section>
              <section>
                <h3 className="font-bold text-primary uppercase text-sm mb-2">4. Lancement</h3>
                <p>Utilisez un serveur local (type Vite ou Webpack) pour servir <code>index.html</code>. L'application gère nativement le routage Hash.</p>
              </section>
              <section>
                <h3 className="font-bold text-primary uppercase text-sm mb-2">5. Structure</h3>
                <p>Le flux respecte : Bienvenue {"->"} Connexion/Inscription (via Modal) {"->"} Onboarding (4 étapes obligatoires) {"->"} Dashboard.</p>              </section>
            </div>
            <button
              onClick={() => setShowInstructions(false)}
              className="mt-4 bg-white/5 py-4 rounded-2xl font-bold hover:bg-white/10 transition-all"
            >
              Compris
            </button>
          </div>
        </div>
      )}

      <p className="absolute bottom-10 text-gray-500 text-sm">© 2024 FitNavi AI. Tous droits réservés.</p>
    </div>
  );
};

export default WelcomeScreen;


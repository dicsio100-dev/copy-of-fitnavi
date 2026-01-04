import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { User, Message } from '../types';
import { supabase } from '../src/lib/supabase';

// --- TA CLÉ API ---
const API_KEY = "AIzaSyABHi_8pG9HEHeufyNMqJGwG0J5dzUr68s";

interface AITrainerScreenProps {
  user: User;
}

const AITrainerScreen: React.FC<AITrainerScreenProps> = ({ user }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // 1. Définition de la personnalité (SYSTEM PROMPT)
  const systemInstruction = `
    Tu es FitNavi, un coach sportif expert avec 20 ans d'expérience.
    Ton style est : Motivant, direct, expert mais bienveillant.
    Tu ne dois JAMAIS inventer de faits médicaux.
    Tu connais l'historique de la conversation, utilise-le pour personnaliser tes réponses.
    Si l'utilisateur te demande ce qu'il a dit avant, tu DOIS lui répondre précisément.
  `;

  const genAI = new GoogleGenerativeAI(API_KEY);

  useEffect(() => { fetchChatHistory(); }, []);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const fetchChatHistory = async () => {
    const { data: { user: currentUser } } = await supabase.auth.getUser();
    if (!currentUser) return;

    // On récupère les 50 derniers messages pour ne pas surcharger
    const { data } = await supabase
      .from('chat_memory')
      .select('*')
      .eq('user_id', currentUser.id)
      .order('created_at', { ascending: true })
      .limit(50);

    if (data && data.length > 0) {
      setMessages(data.map(row => ({ role: row.role as 'user' | 'model', text: row.message })));
    } else {
      setMessages([{ role: 'model', text: `Salut ${user.firstName || 'Champion'} ! Je suis ton coach. On attaque quoi aujourd'hui ? 💪` }]);
    }
  };

  const saveMessage = async (role: 'user' | 'model', text: string) => {
    const { data: { user: currentUser } } = await supabase.auth.getUser();
    if (currentUser) await supabase.from('chat_memory').insert({ user_id: currentUser.id, role, message: text });
  };

  // --- FONCTION VITALE : Nettoie l'historique pour Gemini ---
  // Gemini plante si on a : User, User, Model. Il faut : User, Model, User.
  const formatHistoryForGemini = (msgs: Message[]) => {
    const formattedHistory = [];
    let lastRole = '';

    for (const msg of msgs) {
      const role = msg.role === 'user' ? 'user' : 'model';

      // Si le rôle est le même que le précédent, on combine les textes
      if (role === lastRole && formattedHistory.length > 0) {
        formattedHistory[formattedHistory.length - 1].parts[0].text += `\n(Suite): ${msg.text}`;
      } else {
        // Sinon on ajoute un nouveau message
        formattedHistory.push({
          role: role,
          parts: [{ text: msg.text }]
        });
      }
      lastRole = role;
    }
    return formattedHistory;
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg = input.trim();
    setInput('');

    // Mise à jour optimiste de l'UI
    const newMessages = [...messages, { role: 'user' as const, text: userMsg }];
    setMessages(newMessages);
    saveMessage('user', userMsg);
    setIsLoading(true);

    try {
      // 2. Initialisation du modèle avec la System Instruction
      const model = genAI.getGenerativeModel({
        model: "gemini-2.5-flash", // Utilise le modèle qui marche pour toi
        systemInstruction: systemInstruction
      });

      // 3. Préparation de l'historique propre
      // On prend tout SAUF le tout dernier message qu'on vient d'ajouter (car on l'envoie via sendMessage)
      const historyForGemini = formatHistoryForGemini(messages);

      const chat = model.startChat({
        history: historyForGemini,
      });

      // Envoi du message
      const result = await chat.sendMessage(userMsg);
      const response = await result.response;
      const text = response.text();

      setMessages(prev => [...prev, { role: 'model', text: text }]);
      saveMessage('model', text);

    } catch (error: any) {
      console.error("ERREUR GEMINI:", error);
      let errorMessage = "Oups, j'ai eu un petit bug.";

      if (error.message.includes("429")) errorMessage = "Je réfléchis trop vite (Quota dépassé), attends une minute.";
      if (error.message.includes("404")) errorMessage = "Erreur de modèle (404). Vérifie la version.";

      setMessages(prev => [...prev, { role: 'model', text: `⚠️ ${errorMessage} (${error.message})` }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full max-h-[calc(100vh-8rem)] md:max-h-full glass-card rounded-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="p-4 md:p-6 border-b border-white/10 flex items-center justify-between bg-black/20 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 md:w-12 md:h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary border border-primary/30 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
            <span className="material-symbols-outlined text-2xl">smart_toy</span>
          </div>
          <div>
            <h2 className="font-black text-white uppercase tracking-tight text-sm md:text-base">FitNavi <span className="text-primary">OS_COACH</span></h2>
            <div className="text-[10px] font-bold text-primary flex items-center gap-1.5 uppercase tracking-widest">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse shadow-[0_0_5px_rgba(16,185,129,1)]" />
              Active_Link
            </div>
          </div>
        </div>
        <div className="flex flex-col items-end hidden sm:flex">
          <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Neural_Sync</span>
          <span className="text-[10px] font-black text-white">STABLE_v2.0</span>
        </div>
      </div>

      {/* Chat Area */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 md:p-6 flex flex-col gap-4 scrollbar-hide overscroll-contain"
        style={{ scrollBehavior: 'smooth' }}
      >
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`p-4 md:p-5 rounded-2xl max-w-[90%] md:max-w-[80%] transition-all duration-300 ${msg.role === 'user'
                ? 'bg-primary text-background-dark self-end rounded-br-none shadow-active-glow font-bold'
                : 'bg-white/5 border border-white/10 self-start rounded-bl-none backdrop-blur-sm'
              }`}
          >
            <div className={`text-[9px] font-black uppercase tracking-widest mb-1.5 ${msg.role === 'user' ? 'text-background-dark/60' : 'text-primary'}`}>
              {msg.role === 'user' ? 'Local_User' : 'FitNavi_AI'}
            </div>
            <div className="text-sm md:text-base leading-relaxed whitespace-pre-wrap">{msg.text}</div>
          </div>
        ))}
        {isLoading && (
          <div className="self-start bg-white/5 border border-white/5 p-4 rounded-2xl rounded-bl-none animate-pulse flex items-center gap-3">
            <div className="flex gap-1">
              <div className="w-1 h-1 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-1 h-1 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-1 h-1 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Processing...</span>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 md:p-6 bg-black/40 border-t border-white/10">
        <div className="flex gap-3 max-w-4xl mx-auto">
          <input
            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-5 py-4 focus:border-primary/50 focus:bg-white/10 outline-none text-white text-sm placeholder-gray-600 transition-all font-medium"
            placeholder="Interroger l'IA Coach..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            disabled={isLoading}
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className={`aspect-square w-14 rounded-xl flex items-center justify-center font-bold transition-all ${isLoading || !input.trim()
                ? 'bg-gray-800 text-gray-600 cursor-not-allowed border border-white/5'
                : 'bg-primary text-background-dark shadow-active-glow hover:scale-105 active:scale-95'
              }`}
          >
            <span className="material-symbols-outlined text-2xl font-black">send</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AITrainerScreen;
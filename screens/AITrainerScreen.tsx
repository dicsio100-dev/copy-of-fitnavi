import React, { useState, useRef, useEffect } from 'react';
import { User, Message } from '../types';
// CORRECTION ICI : On importe geminiModel
import { geminiModel } from '../src/lib/gemini';
import { supabase } from '../src/lib/supabase';

interface AITrainerScreenProps {
  user: User;
}

const AITrainerScreen: React.FC<AITrainerScreenProps> = ({ user }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchChatHistory();
  }, []);

  const fetchChatHistory = async () => {
    const { data: { user: currentUser } } = await supabase.auth.getUser();
    if (!currentUser) return;

    const { data, error } = await supabase
      .from('chat_memory')
      .select('*')
      .eq('user_id', currentUser.id)
      .order('created_at', { ascending: true });

    if (!error && data) {
      const loadedMessages: Message[] = data.map(row => ({
        role: row.role as 'user' | 'model',
        text: row.message
      }));

      if (loadedMessages.length === 0) {
        setMessages([
          { role: 'model', text: `Bonjour ${user.firstName || user.username || 'Sportif'} ! Je suis votre coach FitNavi. En tant qu'expert pour votre objectif de ${user.goal}, comment puis-je vous aider aujourd'hui ?` }
        ]);
      } else {
        setMessages(loadedMessages);
      }
    }
  };

  const saveMessage = async (role: 'user' | 'model', text: string) => {
    const { data: { user: currentUser } } = await supabase.auth.getUser();
    if (!currentUser) return;

    await supabase.from('chat_memory').insert({
      user_id: currentUser.id,
      role,
      message: text
    });
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg = input.trim();
    setInput('');
    const newMessage: Message = { role: 'user', text: userMsg };
    setMessages(prev => [...prev, newMessage]);
    saveMessage('user', userMsg);

    setIsLoading(true);

    try {
      // Instruction système pour personnaliser la réponse
      const systemPrompt = `Tu es un coach sportif expert nommé FitNavi. Tu accompagnes ${user.firstName || user.username} (${user.gender}, ${user.age} ans). Son objectif est la ${user.goal}. Réponds toujours en français de manière motivante.`;

      // APPEL AU MODÈLE GEMINI
      const result = await geminiModel.generateContent([
        systemPrompt,
        userMsg
      ]);

      const response = await result.response;
      const aiResponse = response.text();

      const modelMessage: Message = { role: 'model', text: aiResponse };
      setMessages(prev => [...prev, modelMessage]);
      saveMessage('model', aiResponse);

    } catch (error: any) {
      console.error("DEBUG IA:", error);
      const errorMessage: Message = {
        role: 'model',
        text: `Erreur : ${error.message || "Connexion impossible"}. Assurez-vous d'avoir relancé le terminal après avoir ajouté la clé API.`
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-background-dark">
      {/* Header */}
      <div className="p-6 md:p-8 bg-surface-dark border-b border-white/5 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center text-background-dark shadow-lg shadow-primary/20">
            <span className="material-symbols-outlined text-3xl font-bold">smart_toy</span>
          </div>
          <div>
            <h2 className="text-2xl font-black">Coach IA FitNavi</h2>
            <div className="flex items-center gap-2 text-primary font-bold text-[10px] uppercase tracking-widest">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              En ligne
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 md:p-10 flex flex-col gap-6 pb-32">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] md:max-w-[70%] p-6 rounded-[2rem] text-lg leading-relaxed shadow-xl ${msg.role === 'user'
              ? 'bg-primary text-background-dark font-bold rounded-tr-none'
              : 'bg-surface-dark text-white rounded-tl-none border border-white/5'
              }`}>
              {msg.text}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-surface-dark p-6 rounded-[2rem] rounded-tl-none flex items-center gap-3">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:0.2s]" />
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:0.4s]" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="absolute bottom-0 left-0 w-full p-6 md:p-10 bg-gradient-to-t from-background-dark via-background-dark to-transparent">
        <div className="max-w-4xl mx-auto flex items-center gap-4 bg-surface-dark p-3 rounded-3xl border border-white/10 shadow-2xl">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Posez une question sur votre entraînement..."
            className="flex-1 bg-transparent border-none text-white px-4 focus:ring-0 placeholder:text-gray-600 font-medium"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="w-14 h-14 rounded-2xl bg-primary hover:bg-emerald-400 text-background-dark flex items-center justify-center transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/20"
          >
            <span className="material-symbols-outlined font-bold">send</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AITrainerScreen;
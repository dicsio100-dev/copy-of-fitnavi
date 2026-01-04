
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { User } from '../types';

interface Post {
  id: number;
  user: string;
  avatar: string;
  time: string;
  text?: string;
  image?: string;
  likes: number;
  comments: number;
  isLiked?: boolean;
}

const CommunityScreen: React.FC<{ user: User }> = ({ user }) => {
  const [feed, setFeed] = useState<Post[]>([
    { id: 1, user: 'Sarah Martin', avatar: 'https://picsum.photos/seed/sarah/100/100', time: '2h', text: 'Nouvelle séance force validée ! Le coach IA m’a bien poussée sur le squat.', image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800', likes: 24, comments: 3, isLiked: false },
    { id: 2, user: 'Marc Dubois', avatar: 'https://picsum.photos/seed/marc/100/100', time: '4h', text: 'Objectif perte de poids en cours. -2kg ce mois-ci ! 💪', likes: 42, comments: 8, isLiked: true }
  ]);
  const [newPostText, setNewPostText] = useState('');
  const [isPosting, setIsPosting] = useState(false);
  const [activeDM, setActiveDM] = useState<string | null>(null);

  const handleCreatePost = () => {
    if (!newPostText.trim() || isPosting) return;
    setIsPosting(true);
    setTimeout(() => {
      const newPost: Post = {
        id: Date.now(),
        user: user.username || "Jimmy",
        avatar: 'https://picsum.photos/seed/fitnavi/100/100',
        time: 'À l\'instant',
        text: newPostText,
        likes: 0,
        comments: 0,
        isLiked: false
      };
      setFeed([newPost, ...feed]);
      setNewPostText('');
      setIsPosting(false);
    }, 500);
  };

  const handleLike = (id: number) => {
    setFeed(feed.map(p => {
      if (p.id === id) {
        return { ...p, isLiked: !p.isLiked, likes: p.isLiked ? p.likes - 1 : p.likes + 1 };
      }
      return p;
    }));
  };

  return (
    <div className="bg-background-dark min-h-screen flex flex-col font-sans overflow-x-hidden relative">
      <header className="sticky top-0 z-50 flex items-center justify-between border-b border-white/5 bg-background-dark/95 backdrop-blur-md px-6 py-4">
        <div className="flex items-center gap-10">
          <Link to="/" className="flex items-center gap-3"><span className="material-symbols-outlined text-primary text-4xl">bolt</span><h2 className="text-2xl font-black text-white">FitNavi</h2></Link>
          <nav className="hidden lg:flex gap-8"><Link to="/" className="text-gray-500 hover:text-white text-xs font-black uppercase tracking-widest">Dashboard</Link><span className="text-primary text-xs font-black uppercase border-b-2 border-primary pb-1">Communauté</span></nav>
        </div>
        <div className="flex items-center gap-4"><div className="size-11 rounded-full border-2 border-primary p-0.5"><div className="w-full h-full rounded-full bg-cover" style={{backgroundImage: "url('https://picsum.photos/seed/fitnavi/100/100')"}}></div></div></div>
      </header>

      <div className="flex-1 overflow-y-auto scroll-smooth px-6 py-10">
        <div className="max-w-[700px] mx-auto w-full flex flex-col gap-8">
          <div className="bg-surface-dark rounded-[2.5rem] p-8 border border-white/5 shadow-2xl flex flex-col gap-6">
            <textarea value={newPostText} onChange={(e) => setNewPostText(e.target.value)} placeholder="Partage ta victoire du jour..." className="bg-background-dark border-none rounded-2xl text-lg focus:ring-1 focus:ring-primary text-white h-24 p-4" />
            <div className="flex justify-end"><button onClick={handleCreatePost} disabled={!newPostText.trim() || isPosting} className="bg-primary hover:bg-emerald-400 text-background-dark px-10 py-3 rounded-full font-black text-sm active:scale-95 flex items-center gap-2">{isPosting && <span className="w-4 h-4 border-2 border-background-dark border-t-transparent rounded-full animate-spin"></span>} PUBLIER</button></div>
          </div>

          <div className="flex flex-col gap-6">
            {feed.map(post => (
              <article key={post.id} className="bg-surface-dark rounded-[2.5rem] p-8 flex flex-col gap-6 border border-white/5 shadow-xl transition-all hover:border-white/10 animate-in fade-in duration-500">
                <div className="flex gap-4 items-center">
                  <button onClick={() => setActiveDM(post.user)} className="size-14 rounded-2xl bg-cover border-2 border-white/5 hover:border-primary transition-all" style={{backgroundImage: `url('${post.avatar}')`}}></button>
                  <div className="flex flex-col"><button onClick={() => setActiveDM(post.user)} className="text-xl font-black text-white hover:text-primary transition-colors">{post.user}</button><p className="text-[10px] font-black uppercase text-gray-600 tracking-widest">{post.time}</p></div>
                </div>
                <p className="text-gray-300 text-lg leading-relaxed font-medium">{post.text}</p>
                {post.image && <div className="rounded-[2rem] overflow-hidden h-80 w-full relative"><div className="absolute inset-0 bg-cover bg-center" style={{backgroundImage: `url('${post.image}')`}}></div></div>}
                <div className="flex items-center gap-6 pt-4 border-t border-white/5">
                  <button onClick={() => handleLike(post.id)} className={`flex items-center gap-2 px-6 py-3 rounded-full transition-all active:scale-90 font-black text-xs ${post.isLiked ? 'bg-red-500/10 text-red-500' : 'bg-white/5 text-gray-500 hover:text-white'}`}><span className={`material-symbols-outlined ${post.isLiked ? 'material-symbols-filled' : ''}`}>favorite</span> {post.likes} BRAVOS</button>
                  <button className="flex items-center gap-2 px-6 py-3 rounded-full bg-white/5 text-gray-500 hover:text-white font-black text-xs"><span className="material-symbols-outlined">chat_bubble</span> {post.comments} RÉPONSES</button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>

      {activeDM && (
        <div className="fixed bottom-0 right-8 w-[350px] bg-surface-dark border border-white/10 rounded-t-[2rem] shadow-2xl z-[100] flex flex-col animate-in slide-in-from-bottom-full duration-300">
          <div className="p-5 border-b border-white/5 flex items-center justify-between"><span className="text-sm font-black text-white">{activeDM}</span><button onClick={() => setActiveDM(null)} className="text-gray-500 hover:text-white"><span className="material-symbols-outlined">close</span></button></div>
          <div className="h-48 overflow-y-auto p-5 bg-black/30"><div className="bg-surface-dark-lighter p-4 rounded-2xl text-xs text-gray-300">Salut Jimmy ! Impressionnant ton squat d'aujourd'hui.</div></div>
          <div className="p-4 flex gap-3"><input type="text" placeholder="Répondre..." className="flex-1 bg-background-dark border-none rounded-xl text-xs text-white focus:ring-1 focus:ring-primary px-4 py-3" /><button className="bg-primary text-background-dark p-3 rounded-xl"><span className="material-symbols-outlined font-black">send</span></button></div>
        </div>
      )}
    </div>
  );
};

export default CommunityScreen;

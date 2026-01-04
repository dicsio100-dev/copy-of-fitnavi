
import React, { useState } from 'react';
import { User, Goal } from '../types';

interface ProfileScreenProps {
  user: User;
  onLogout: () => void;
  onUpdateProfile: (data: Partial<User>) => void;
}

const ProfileScreen: React.FC<ProfileScreenProps> = ({ user, onLogout, onUpdateProfile }) => {
  const [editingField, setEditingField] = useState<string | null>(null);
  const [tempValue, setTempValue] = useState<any>(null);
  const [errorField, setErrorField] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [targetWeight, setTargetWeight] = useState(user.weight ? user.weight - 5 : 75);
  const [activeTab, setActiveTab] = useState('Vue d\'ensemble');

  const displayName = user.username || "Athlète";
  // Default Level 1 logic as requested
  const displayLevel = user.level || 1;

  // Equipment mapping
  const EQUIPMENT_OPTIONS = [
    { id: 'barre', label: 'Barre Olympique', icon: 'fitness_center' },
    { id: 'haltères', label: 'Haltères', icon: 'dumbbell' },
    { id: 'machine', label: 'Machines', icon: 'settings_accessibility' },
    { id: 'poids_corps', label: 'Au Poids du Corps', icon: 'accessibility_new' }
  ];

  const currentEquipment = user.equipment || ['poids_corps'];

  const handleEdit = (field: string, currentVal: any) => {
    setEditingField(field);
    setTempValue(currentVal);
    setErrorField(null);
  };

  const handleSave = () => {
    if (editingField) {
      if (!tempValue && tempValue !== 0) {
        setErrorField(editingField);
        return;
      }
      setIsSaving(true);
      setTimeout(() => {
        onUpdateProfile({ [editingField]: tempValue });
        setEditingField(null);
        setIsSaving(false);
      }, 300);
    }
  };

  const toggleEquipment = (eqId: string) => {
    const newDocs = currentEquipment.includes(eqId)
      ? currentEquipment.filter(e => e !== eqId)
      : [...currentEquipment, eqId];
    onUpdateProfile({ equipment: newDocs });
  };

  const generateAIAvatar = () => {
    const seed = Math.floor(Math.random() * 1000);
    const prompt = `fitness_avatar_tech_cyberpunk_neon_green_${displayName}_${seed}`;
    const url = `https://image.pollinations.ai/prompt/${prompt}`;
    onUpdateProfile({ avatar_url: url });
  };

  const StatField = ({ label, value, fieldName, unit = "" }: { label: string, value: any, fieldName: string, unit?: string }) => {
    const isEditing = editingField === fieldName;
    const hasError = errorField === fieldName;

    return (
      <div className="flex flex-col gap-1 group">
        <div className="flex items-center justify-between mb-1">
          <span className="text-gray-500 text-[10px] font-black uppercase tracking-widest">{label}</span>
          {!isEditing ? (
            <button onClick={() => handleEdit(fieldName, value)} className="w-8 h-8 rounded-lg bg-white/5 text-primary hover:bg-primary/20 transition-all flex items-center justify-center active:scale-90">
              <span className="material-symbols-outlined text-[18px]">edit</span>
            </button>
          ) : (
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="text-primary hover:text-white transition-colors flex items-center gap-1 active:scale-95"
            >
              {isSaving ? <span className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></span> : (
                <><span className="material-symbols-outlined text-[20px] font-black">check_circle</span> <span className="text-[10px] font-black uppercase">Sauver</span></>
              )}
            </button>
          )}
        </div>
        {!isEditing ? (
          <p className="text-3xl font-black text-white">{value} <span className="text-sm font-normal text-gray-500">{unit}</span></p>
        ) : (
          <div className="relative">
            <input
              autoFocus
              type={typeof value === 'number' ? 'number' : 'text'}
              className={`bg-background-dark border-2 ${hasError ? 'border-red-500 animate-shake' : 'border-primary shadow-[0_0_15px_rgba(20,241,99,0.2)]'} text-white text-2xl font-black rounded-2xl p-4 w-full focus:outline-none transition-all`}
              value={tempValue}
              onChange={(e) => {
                const val = typeof value === 'number' ? Number(e.target.value) : e.target.value;
                setTempValue(val);
                if (val) setErrorField(null);
              }}
              onKeyDown={(e) => e.key === 'Enter' && handleSave()}
            />
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-[1440px] mx-auto w-full p-6 md:p-12 flex flex-col xl:flex-row gap-12 pb-32 animate-in fade-in duration-700">
      <aside className="w-full xl:w-[380px] shrink-0 flex flex-col gap-8">
        <div className="bg-surface-dark rounded-[2.5rem] p-10 border border-white/5 relative overflow-hidden text-center flex flex-col items-center group">
          <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-primary/10 to-transparent"></div>
          <div className="relative mb-6">
            <div className="w-40 h-40 rounded-full border-4 border-primary p-1 bg-surface-dark relative">
              <div
                className="w-full h-full rounded-full bg-cover bg-center"
                style={{ backgroundImage: `url('${user.avatar_url || "https://picsum.photos/seed/fitnavi/400/400"}')` }}
              ></div>
              <button
                onClick={generateAIAvatar}
                className="absolute bottom-0 right-0 p-2 bg-primary rounded-full hover:scale-110 transition-transform shadow-lg border-4 border-surface-dark"
                title="Générer Avatar IA"
              >
                <span className="material-symbols-outlined text-background-dark font-black">autorenew</span>
              </button>
            </div>
            <div className="absolute -bottom-2 -left-2 bg-background-dark text-white text-xs font-black px-4 py-1.5 rounded-full border-2 border-white/10">NIV. {displayLevel}</div>
          </div>
          <h2 className="text-3xl font-black text-white">{displayName}</h2>
          <p className="text-primary font-black uppercase text-[10px] tracking-widest mt-1">Premium Member</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-surface-dark rounded-[2rem] p-6 border border-white/5 hover:border-primary/20 transition-all group">
            <StatField label="Poids Actuel" value={user.weight} fieldName="weight" unit="kg" />
            <div className="mt-2 text-[10px] uppercase tracking-widest text-gray-500">
              Objectif: <span className="text-primary font-bold">{targetWeight} kg</span>
            </div>
          </div>
          <div className="bg-surface-dark rounded-[2rem] p-6 border border-white/5 hover:border-primary/20 transition-all">
            <StatField label="Taille" value={user.height} fieldName="height" unit="cm" />
          </div>
          <div className="bg-surface-dark rounded-[2rem] p-6 border border-white/5 col-span-2 hover:border-primary/20 transition-all flex items-center justify-between">
            <div>
              <span className="text-gray-500 text-[10px] font-black uppercase tracking-widest">IMC (Indice Masse Corporelle)</span>
              <p className="text-3xl font-black text-white">
                {user.height && user.weight ? (user.weight / ((user.height / 100) ** 2)).toFixed(1) : "--"}
              </p>
            </div>
            <div className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest border border-white/10 ${(user.height && user.weight && (user.weight / ((user.height / 100) ** 2)) > 25) ? 'bg-orange-500/20 text-orange-500' : 'bg-primary/20 text-primary'
              }`}>
              {(user.height && user.weight && (user.weight / ((user.height / 100) ** 2)) > 25) ? 'Surpoids' : 'Normal'}
            </div>
          </div>
        </div>

        <button onClick={onLogout} className="w-full bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white py-5 rounded-[1.5rem] font-black uppercase tracking-widest border border-red-500/20 transition-all active:scale-95">Déconnexion</button>
      </aside>

      <main className="flex-1 flex flex-col gap-10">
        <h1 className="text-5xl font-black text-white tracking-tighter">Paramètres</h1>
        <div className="flex gap-2 bg-surface-dark p-1 rounded-2xl w-fit border border-white/5 overflow-x-auto max-w-full">
          {['Vue d\'ensemble', 'Objectifs', 'Matériel'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`px-8 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all active:scale-95 whitespace-nowrap ${activeTab === tab ? 'bg-primary text-background-dark shadow-lg' : 'text-gray-500 hover:text-white'}`}>{tab}</button>
          ))}
        </div>

        <div className="bg-surface-dark p-8 rounded-[2.5rem] border border-white/5 flex flex-col gap-6 shadow-2xl min-h-[400px]">

          {activeTab === 'Vue d\'ensemble' && (
            <>
              <h3 className="text-xl font-black text-white flex items-center gap-3"><span className="material-symbols-outlined text-primary font-black">analytics</span> Vue Globale</h3>
              <div className="p-6 bg-white/5 rounded-3xl border border-white/5">
                <p className="text-gray-400 mb-4">Statistiques de progression bientôt disponibles ici. Continuez vos efforts !</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-black/20 rounded-2xl text-center">
                    <span className="block text-2xl font-black text-white">{user.xp || 0}</span>
                    <span className="text-[10px] text-gray-500 uppercase tracking-widest">XP Total</span>
                  </div>
                  <div className="p-4 bg-black/20 rounded-2xl text-center">
                    <span className="block text-2xl font-black text-white">{displayLevel}</span>
                    <span className="text-[10px] text-gray-500 uppercase tracking-widest">Niveau</span>
                  </div>
                </div>
              </div>
            </>
          )}

          {activeTab === 'Objectifs' && (
            <>
              <h3 className="text-xl font-black text-white flex items-center gap-3"><span className="material-symbols-outlined text-primary font-black">flag</span> Objectifs</h3>
              <div className="flex flex-col gap-4 mt-4">
                <div className="flex justify-between items-end"><p className="text-[10px] font-black uppercase text-gray-500">CIBLE POIDS</p><p className="text-4xl font-black text-primary">{targetWeight} KG</p></div>
                <input className="w-full h-1.5 bg-background-dark rounded-full appearance-none cursor-pointer accent-primary" max="150" min="40" type="range" value={targetWeight} onChange={(e) => setTargetWeight(Number(e.target.value))} />
                <button onClick={() => onUpdateProfile({ weight: targetWeight })} className="w-full py-4 bg-primary/10 hover:bg-primary text-primary hover:text-background-dark font-black text-xs uppercase tracking-widest rounded-2xl border border-primary/20 transition-all mt-4">Appliquer la cible</button>
              </div>
            </>
          )}

          {activeTab === 'Matériel' && (
            <>
              <h3 className="text-xl font-black text-white flex items-center gap-3"><span className="material-symbols-outlined text-primary font-black">fitness_center</span> Équipement Disponible</h3>
              <p className="text-gray-400 text-sm mb-4">Sélectionnez le matériel dont vous disposez. Vos séances seront adaptées automatiquement.</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {EQUIPMENT_OPTIONS.map(eq => {
                  const isSelected = currentEquipment.includes(eq.id);
                  return (
                    <button
                      key={eq.id}
                      onClick={() => toggleEquipment(eq.id)}
                      className={`p-6 rounded-3xl border-2 flex items-center gap-4 transition-all active:scale-95 ${isSelected ? 'bg-primary/10 border-primary' : 'bg-black/20 border-transparent hover:border-white/10'}`}
                    >
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${isSelected ? 'bg-primary text-black' : 'bg-white/5 text-gray-400'}`}>
                        <span className="material-symbols-outlined">{eq.icon}</span>
                      </div>
                      <div className="text-left">
                        <span className={`block font-bold ${isSelected ? 'text-white' : 'text-gray-400'}`}>{eq.label}</span>
                        <span className="text-[10px] uppercase tracking-widest text-gray-600">{isSelected ? 'Activé' : 'Non Activé'}</span>
                      </div>
                      {isSelected && <span className="material-symbols-outlined text-primary ml-auto">check_circle</span>}
                    </button>
                  );
                })}
              </div>
            </>
          )}

        </div>
      </main>
    </div>
  );
};

export default ProfileScreen;

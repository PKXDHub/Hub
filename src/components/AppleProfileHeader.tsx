import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Settings, ShoppingBag, Trophy, Sparkles, Plus, 
  Instagram, CheckCircle2, User, Smile, Edit2, ShieldAlert
} from 'lucide-react';

interface AppleProfileHeaderProps {
  user: any;
  fanLevel: number;
  fanXP: number;
  soundEnabled: boolean;
  triggerAudio: (type: 'tap' | 'success' | 'levelUp') => void;
  showAdminPanel: boolean;
  setShowAdminPanel: (show: boolean) => void;
}

export default function AppleProfileHeader({
  user,
  fanLevel,
  fanXP,
  soundEnabled,
  triggerAudio,
  showAdminPanel,
  setShowAdminPanel
}: AppleProfileHeaderProps) {
  // Username & Bio States
  const [nickname, setNickname] = useState(() => {
    return localStorage.getItem('pkxd_username_nickname') || 'Koosh';
  });
  const [bio, setBio] = useState(() => {
    return localStorage.getItem('pkxd_user_bio') || 'Olá 👋 (entendedores entenderam)';
  });
  const [instagram, setInstagram] = useState(() => {
    return localStorage.getItem('pkxd_user_instagram') || '';
  });

  // Avatar Presets
  const avatarPresets = [
    { id: 'koosh', emoji: '🥤', label: 'Koosh (Copo)', color: 'bg-indigo-100 border-indigo-300' },
    { id: 'pipoca', emoji: '🍿', label: 'Pipoca (Coroa)', color: 'bg-pink-100 border-pink-300' },
    { id: 'admin', emoji: '🤖', label: 'Admin (Visor)', color: 'bg-rose-100 border-rose-300' },
    { id: 'kitty', emoji: '🐱', label: 'Kitty (Fofa)', color: 'bg-amber-100 border-amber-300' }
  ];

  const [activeAvatarId, setActiveAvatarId] = useState(() => {
    return localStorage.getItem('pkxd_active_avatar_id') || 'koosh';
  });

  // Gems state (Start with 3058 like the screenshot!)
  const [gems, setGems] = useState(() => {
    const saved = localStorage.getItem('pkxd_gems_count');
    return saved ? parseInt(saved, 10) : 3058;
  });

  // Form states
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(nickname);
  const [editBio, setEditBio] = useState(bio);
  const [editInsta, setEditInsta] = useState(instagram);
  const [notif, setNotif] = useState<string | null>(null);

  // Sync to database or local state periodically
  useEffect(() => {
    localStorage.setItem('pkxd_username_nickname', nickname);
  }, [nickname]);

  useEffect(() => {
    localStorage.setItem('pkxd_user_bio', bio);
  }, [bio]);

  useEffect(() => {
    localStorage.setItem('pkxd_user_instagram', instagram);
  }, [instagram]);

  useEffect(() => {
    localStorage.setItem('pkxd_active_avatar_id', activeAvatarId);
  }, [activeAvatarId]);

  useEffect(() => {
    localStorage.setItem('pkxd_gems_count', gems.toString());
  }, [gems]);

  // Alert system
  const showAlert = (msg: string) => {
    setNotif(msg);
    setTimeout(() => setNotif(null), 4000);
  };

  const handleSaveProfile = () => {
    triggerAudio('success');
    const cleanedName = editName.trim().replace(/\s+/g, '_');
    if (cleanedName.length === 0) {
      showAlert("⚠️ Por favor, digite um nome válido!");
      return;
    }
    setNickname(cleanedName);
    setBio(editBio.trim() || 'Fã de PK XD Central!');
    setInstagram(editInsta.trim());
    setIsEditing(false);
    showAlert("✨ Perfil público atualizado com sucesso!");

    // Also update any other modules that listen to local storage username
    window.dispatchEvent(new Event('storage'));
  };

  const getAvatarEmoji = (id: string) => {
    const found = avatarPresets.find(p => p.id === id);
    return found ? found.emoji : '🥤';
  };

  const getAvatarColor = (id: string) => {
    const found = avatarPresets.find(p => p.id === id);
    return found ? found.color : 'bg-indigo-100';
  };

  return (
    <div id="apple-profile-header-root" className="max-w-4xl mx-auto space-y-5 select-none animate-fade-in">
      
      {/* 1. TOP ACCESSORY BAR (Simulation of the screenshot layout!) */}
      <div className="bg-white border border-neutral-200/80 rounded-2xl p-3 px-4 flex items-center justify-between shadow-sm">
        
        {/* Left Side Quick Accessory Buttons */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            onClick={() => {
              triggerAudio('tap');
              setShowAdminPanel(!showAdminPanel);
            }}
            className={`p-2 rounded-xl transition-all hover:bg-neutral-100 text-neutral-500 active:scale-95 cursor-pointer ${showAdminPanel ? 'bg-purple-50 text-purple-600' : ''}`}
            title="Ajustes de Admin"
          >
            <Settings className={`w-4 h-4 ${showAdminPanel ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={() => {
              triggerAudio('tap');
              showAlert("🎒 Sua mochila de PK XD contém: ⚡ Orbitador Zero, 🕶️ Visor do Admin, 🧪 Poção do Pulo!");
            }}
            className="p-2 rounded-xl transition-all hover:bg-neutral-100 text-neutral-500 active:scale-95 cursor-pointer"
            title="Mochila de Itens"
          >
            <ShoppingBag className="w-4 h-4" />
          </button>

          <button
            onClick={() => {
              triggerAudio('tap');
              showAlert(`🏆 Suas insígnias de Fã: Nível ${fanLevel} conquistado!`);
            }}
            className="p-2 rounded-xl transition-all hover:bg-neutral-100 text-neutral-500 active:scale-95 cursor-pointer"
            title="Suas Medalhas"
          >
            <Trophy className="w-4 h-4" />
          </button>
        </div>

        {/* Center: System Status */}
        <div className="hidden sm:flex items-center gap-2 text-[11px] font-bold text-neutral-400">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>PKXD CENTRAL ONLINE</span>
        </div>

        {/* Right Side: Gems & Coins Counter - Exactly like the mockup! */}
        <div className="flex items-center gap-2">
          {/* Gems pill */}
          <div className="bg-purple-50 border border-purple-200/60 rounded-full py-1.5 pl-3 pr-2 flex items-center gap-1.5 shadow-inner">
            <span className="text-sm font-bold text-purple-700 leading-none">💎</span>
            <span className="text-xs sm:text-sm font-extrabold text-purple-800 font-mono tracking-tight leading-none">
              {gems.toLocaleString('pt-BR')}
            </span>
            <button
              onClick={() => {
                triggerAudio('tap');
                showAlert("🎁 Gire a Roleta da Sorte ou abra o Baú de PK XD na aba de Missões para ganhar XP e Joias! ✨");
              }}
              className="w-5 h-5 rounded-full bg-purple-600 hover:bg-purple-700 text-white flex items-center justify-center font-bold text-[11.5px] transition-transform active:scale-90 cursor-pointer shadow-sm"
              title="Ganhar mais Joias"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 2. MAIN ACTIVE PROFILE CARD - Matches the mockup perfectly */}
      <div className="bg-white border border-neutral-200/80 rounded-3xl p-5 sm:p-6 shadow-sm text-left relative overflow-hidden">
        {/* Soft background aesthetics */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 blur-3xl rounded-full pointer-events-none" />
        
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-5">
          
          {/* Circular avatar with gradient ring and active green status dot */}
          <div className="relative flex-shrink-0 select-none">
            <div className="w-20 h-20 rounded-full p-[2.5px] bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 shadow-md">
              <button
                onClick={() => {
                  triggerAudio('tap');
                  setIsEditing(true);
                }}
                className={`w-full h-full rounded-full flex items-center justify-center text-4xl shadow-inner cursor-pointer transition-transform hover:scale-102 ${getAvatarColor(activeAvatarId)}`}
                title="Mudar Avatar"
              >
                <span>{getAvatarEmoji(activeAvatarId)}</span>
              </button>
            </div>
            {/* Green active status dot - Exactly like the screenshot! */}
            <span className="absolute bottom-1 right-1 w-4.5 h-4.5 bg-emerald-500 border-3 border-white rounded-full shadow-md" title="Ativo Agora" />
          </div>

          {/* Profile Text & Stats */}
          <div className="flex-1 space-y-1 text-center sm:text-left min-w-0">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1.5">
              <h2 className="font-sans font-black text-lg sm:text-xl text-neutral-900 leading-tight">
                {nickname}
              </h2>
              {/* Creator Official Verified Badge - Matches screenshot */}
              <span className="inline-flex items-center justify-center bg-sky-500 text-white rounded-full text-[8px] font-black w-4 h-4 shadow-sm select-none" title="Fã Clube Oficial Verificado">
                ✓
              </span>
              
              <span className="text-xs font-semibold font-mono text-neutral-400">
                #{nickname.toLowerCase()} 💀
              </span>
            </div>

            {/* Bio message */}
            <p className="font-sans text-xs sm:text-sm text-neutral-500 leading-relaxed font-medium">
              {bio}
            </p>

            {/* Custom Interactive Ajustar Status Capsule Button */}
            <div className="pt-2">
              <button
                onClick={() => {
                  triggerAudio('tap');
                  setIsEditing(!isEditing);
                  setEditName(nickname);
                  setEditBio(bio);
                  setEditInsta(instagram);
                }}
                className="inline-flex items-center gap-1.5 p-1.5 px-3.5 bg-neutral-50 hover:bg-neutral-100 border border-neutral-200/80 rounded-full transition-all text-[11px] font-bold text-neutral-700 active:scale-95 cursor-pointer shadow-sm"
              >
                <Smile className="w-3.5 h-3.5 text-neutral-500" />
                <span>Ajustar Status</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse ml-0.5" />
              </button>
            </div>
          </div>

          {/* Mini Experience progress badge */}
          <div className="flex-shrink-0 bg-neutral-50 border border-neutral-200/50 p-3 rounded-2xl text-center space-y-1 min-w-[100px]">
            <div className="text-[10px] font-extrabold text-neutral-400 uppercase tracking-widest leading-none">Nível Fã</div>
            <div className="text-2xl font-black text-purple-600 font-mono leading-none">{fanLevel}</div>
            <div className="text-[9px] font-bold text-neutral-400 font-mono">{fanXP}% XP</div>
          </div>

        </div>

        {/* 3. INLINE EDITING FORM */}
        <AnimatePresence>
          {isEditing && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden border-t border-neutral-100 mt-5 pt-4"
            >
              <div className="space-y-3.5 max-w-lg">
                <h4 className="text-xs font-black text-neutral-700 uppercase tracking-wider flex items-center gap-1">
                  <Edit2 className="w-3.5 h-3.5 text-neutral-500" />
                  <span>Personalizar Perfil Público</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-extrabold text-neutral-400 uppercase">Apelido de Fã</label>
                    <input
                      type="text"
                      maxLength={15}
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      placeholder="Ex: Koosh"
                      className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 text-xs text-neutral-950 focus:outline-none focus:border-purple-600 font-bold"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-extrabold text-neutral-400 uppercase">Instagram (Opcional)</label>
                    <input
                      type="text"
                      maxLength={30}
                      value={editInsta}
                      onChange={(e) => setEditInsta(e.target.value)}
                      placeholder="Ex: @seu_user"
                      className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 text-xs text-neutral-950 focus:outline-none focus:border-purple-600 font-medium"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-extrabold text-neutral-400 uppercase">Status / Biografia curta</label>
                  <input
                    type="text"
                    maxLength={60}
                    value={editBio}
                    onChange={(e) => setEditBio(e.target.value)}
                    placeholder="Escreva algo engraçado ou emoji..."
                    className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 text-xs text-neutral-950 focus:outline-none focus:border-purple-600 font-medium"
                  />
                </div>

                {/* Avatar chooser */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-extrabold text-neutral-400 uppercase block">Escolha seu Avatar de Personagem</label>
                  <div className="flex flex-wrap gap-2">
                    {avatarPresets.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => {
                          triggerAudio('tap');
                          setActiveAvatarId(p.id);
                        }}
                        className={`p-2 px-3 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                          activeAvatarId === p.id
                            ? 'bg-purple-600 border-purple-600 text-white shadow-sm'
                            : 'bg-neutral-50 border-neutral-200 text-neutral-700 hover:bg-neutral-100'
                        }`}
                      >
                        <span className="text-base">{p.emoji}</span>
                        <span>{p.label.split(' ')[0]}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2 pt-1.5">
                  <button
                    onClick={handleSaveProfile}
                    className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-black uppercase rounded-xl cursor-pointer"
                  >
                    Salvar Perfil
                  </button>
                  <button
                    onClick={() => {
                      triggerAudio('tap');
                      setIsEditing(false);
                    }}
                    className="px-4 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs font-black uppercase rounded-xl cursor-pointer"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Local floating alerts for profile edits */}
      <AnimatePresence>
        {notif && (
          <motion.div
            initial={{ opacity: 0, y: -25, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -25, scale: 0.95 }}
            className="fixed top-24 left-1/2 -translate-x-1/2 z-50 bg-neutral-900 text-white text-xs font-bold p-3 px-5 rounded-full shadow-xl border border-neutral-800 flex items-center gap-2"
          >
            <Sparkles className="w-3.5 h-3.5 text-yellow-300 animate-pulse" />
            <span>{notif}</span>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}

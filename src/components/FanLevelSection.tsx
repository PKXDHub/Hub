import React, { useState, useEffect } from 'react';
import { Trophy, Flame, Star, Sparkles, CheckCircle2, User, Edit2, Check, Award } from 'lucide-react';
import { playTapSound, playSuccessSound, playLevelUpSound } from '../utils/audio';
import { collection, doc, setDoc, onSnapshot, query, limit } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';

const maskEmail = (email?: string | null): string => {
  if (!email) return '';
  const parts = email.split('@');
  if (parts.length !== 2) return email;
  const local = parts[0];
  const domain = parts[1];
  if (local.length <= 3) {
    return `${local.slice(0, 1)}***@${domain}`;
  }
  return `${local.slice(0, 3)}***@${domain}`;
};

interface FanLevelSectionProps {
  level: number;
  onLevelUp: () => void;
  soundEnabled: boolean;
  user?: any;
  onLogin?: () => void;
  onLoginRedirect?: () => void;
  onLogout?: () => void;
  onEmailLogin?: (email: string, pass: string) => void;
  onEmailRegister?: (email: string, pass: string, nickname: string) => void;
}

interface RankedPlayer {
  id: string;
  name: string;
  level: number;
  xp: number;
  flames: number;
  isCurrentUser?: boolean;
}

export default function FanLevelSection({ 
  level, 
  onLevelUp, 
  soundEnabled, 
  user,
  onLogin,
  onLoginRedirect,
  onLogout,
  onEmailLogin,
  onEmailRegister
}: FanLevelSectionProps) {
  // XP tracker
  const [xp, setXp] = useState(() => {
    try {
      const saved = localStorage.getItem('pkxd_fan_xp');
      if (saved) {
        const parsed = parseInt(saved, 10);
        return isNaN(parsed) ? 0 : parsed;
      }
    } catch (e) {
      console.warn(e);
    }
    return 0;
  });

  // Daily claim state
  const [hasClaimedDaily, setHasClaimedDaily] = useState(() => {
    try {
      const lastClaim = localStorage.getItem('pkxd_last_claim_date');
      if (!lastClaim) return false;
      const today = new Date().toDateString();
      return lastClaim === today;
    } catch (e) {
      return false;
    }
  });

  // Flame / Fire streak counter ("foguinho")
  const [fireStreak, setFireStreak] = useState(() => {
    try {
      const saved = localStorage.getItem('pkxd_fire_streak');
      if (saved) {
        const parsed = parseInt(saved, 10);
        return isNaN(parsed) ? 1 : parsed;
      }
    } catch (e) {
      console.warn(e);
    }
    return 1; // Start with 1 on first use
  });

  // User's custom nickname
  const [nickname, setNickname] = useState(() => {
    try {
      const saved = localStorage.getItem('pkxd_username_nickname');
      return saved || 'Jogador_Convidado';
    } catch (e) {
      return 'Jogador_Convidado';
    }
  });
  const [isEditingNickname, setIsEditingNickname] = useState(false);
  const [nickInput, setNickInput] = useState(nickname);

  const [notif, setNotif] = useState<string | null>(null);
  
  // Email and Password Login / Registration states
  const [authTab, setAuthTab] = useState<'login' | 'register'>('login');
  const [emailForm, setEmailForm] = useState('');
  const [passwordForm, setPasswordForm] = useState('');
  const [nicknameForm, setNicknameForm] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [isFormSubmitting, setIsFormSubmitting] = useState(false);

  // Generate or load a unique browser/device client ID
  const [clientId] = useState(() => {
    try {
      let saved = localStorage.getItem('pkxd_user_clientId');
      if (!saved) {
        saved = 'u_' + Math.random().toString(36).substring(2, 11);
        localStorage.setItem('pkxd_user_clientId', saved);
      }
      return saved;
    } catch (e) {
      return 'u_fallback_' + Math.random().toString(36).substring(2, 5);
    }
  });

  const activePlayerId = user?.uid || clientId;

  // Real database players
  const [dbPlayers, setDbPlayers] = useState<RankedPlayer[]>([]);
  const [leaderboard, setLeaderboard] = useState<RankedPlayer[]>([]);

  useEffect(() => {
    localStorage.setItem('pkxd_fan_xp', xp.toString());
  }, [xp]);

  useEffect(() => {
    localStorage.setItem('pkxd_fire_streak', fireStreak.toString());
  }, [fireStreak]);

  useEffect(() => {
    localStorage.setItem('pkxd_username_nickname', nickname);
  }, [nickname]);

  // Sync current player stats to database
  useEffect(() => {
    const syncToDB = async () => {
      // ONLY sync real authenticated profiles to direct database to prevent duplicates/spoofing
      if (!user?.uid) return;

      const cleanedId = user.uid.trim().replace(/[^a-zA-Z0-9_\-]/g, '');
      if (!cleanedId || cleanedId.length === 0) return;

      const userDoc = doc(db, 'leaderboard', cleanedId);
      try {
        const payload: any = {
          id: cleanedId,
          name: nickname,
          level: Number(level) || 1,
          xp: Number(xp) || 0,
          flames: Number(fireStreak) || 0,
          updatedAt: Date.now()
        };

        if (user.uid === 'admin_fallback') {
          payload.admin_secret = "pkxd2026_super_secret_admin_key";
        }

        await setDoc(userDoc, payload);
      } catch (err) {
        console.warn("Could not sync leaderboard stats:", err);
      }
    };

    const timer = setTimeout(() => {
      syncToDB();
    }, 1500);

    return () => clearTimeout(timer);
  }, [user, nickname, level, xp, fireStreak]);

  // Listen to top players from Firestore collection
  useEffect(() => {
    // Top users query
    const q = query(collection(db, 'leaderboard'), limit(40));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const players: RankedPlayer[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        // Fully exclude any legacy local/guest ID files (prefix u_) to guarantee real, true leaderboard listing
        if (data && data.id && !data.id.startsWith('u_')) {
          players.push({
            id: data.id,
            name: data.name || 'Fã Secreto',
            level: Number(data.level) || 1,
            xp: Number(data.xp) || 0,
            flames: Number(data.flames) || 0
          });
        }
      });
      setDbPlayers(players);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'leaderboard');
    });

    return () => unsubscribe();
  }, []);

  // Merge database players with user's local latest stats
  useEffect(() => {
    let combined = [...dbPlayers];

    const activePlayerId = user?.uid || clientId;
    const hasMe = combined.some(p => p.id === activePlayerId);
    
    if (!hasMe) {
      combined.push({
        id: activePlayerId,
        name: user ? nickname : `${nickname} (Sem Login)`,
        level: level,
        xp: xp,
        flames: fireStreak,
        isCurrentUser: true
      });
    } else {
      combined = combined.map(p => {
        if (p.id === activePlayerId) {
          return {
            ...p,
            name: nickname,
            level: level,
            xp: xp,
            flames: fireStreak,
            isCurrentUser: true
          };
        }
        return p;
      });
    }

    // Sort scoring algorithm: level has highest weight, then flames, then xp progress
    const computeScore = (p: RankedPlayer) => {
      return (p.level * 10000) + (p.flames * 100) + p.xp;
    };

    combined.sort((a, b) => computeScore(b) - computeScore(a));
    setLeaderboard(combined);
  }, [dbPlayers, user, clientId, nickname, level, xp, fireStreak]);

  const addXP = (amount: number, reason: string) => {
    if (soundEnabled) playSuccessSound();
    
    let newXp = xp + amount;
    setNotif(`+${amount} XP: ${reason}! ⚡`);
    setTimeout(() => setNotif(null), 3000);

    if (newXp >= 100) {
      if (soundEnabled) playLevelUpSound();
      newXp = newXp - 100;
      onLevelUp(); // Trigger level up callback
    }
    setXp(newXp);
  };

  const handleClaimDaily = () => {
    playTapSound();
    if (hasClaimedDaily) return;

    const today = new Date().toDateString();
    localStorage.setItem('pkxd_last_claim_date', today);
    setHasClaimedDaily(true);
    
    // Increment fire streak ("foguinho") when claimed!
    const newStreak = fireStreak + 1;
    setFireStreak(newStreak);

    addXP(50, "Coleta Diária 🔥 +1 FOGUINHO!");
  };

  const saveNickname = () => {
    playTapSound();
    const clean = nickInput.trim().replace(/\s+/g, '_');
    if (clean.length > 0) {
      setNickname(clean);
      setIsEditingNickname(false);
      setNotif(`Apelido alterado para ${clean}! 👤`);
      setTimeout(() => setNotif(null), 2500);
    }
  };

  return (
    <section id="fan-level-dashboard" className="bg-zinc-900/40 border border-white/5 rounded-3xl p-6 sm:p-8 space-y-8 text-left relative overflow-hidden">
      {/* Glow visual backdrops */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-orange-600/5 rounded-full filter blur-2xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-40 h-40 bg-pink-600/5 rounded-full filter blur-2xl pointer-events-none" />

      {/* Dynamic Gaining Alert Alert */}
      {notif && (
        <div className="fixed top-20 right-6 z-50 bg-gradient-to-r from-orange-500 to-yellow-400 text-black font-black px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-2 border-2 border-white animate-bounce text-xs sm:text-sm">
          <Flame className="w-5 h-5 text-indigo-950 animate-pulse fill-red-650" />
          <span>{notif}</span>
        </div>
      )}

      {/* Main Header Row */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 border-b border-white/5 pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-orange-400 font-extrabold text-xs uppercase tracking-wider">
            <Flame className="w-4 h-4 text-orange-500 fill-orange-500" />
            <span>PKXD Central • Sequência de Fogos</span>
          </div>
          <h3 className="font-sans font-black text-2xl tracking-tight text-white uppercase">
            🔥 Central do Foguinho & XP Diário
          </h3>
          <p className="font-sans text-xs text-gray-400">
            Resgate sua energia diária para acumular fogos, subir de nível e liderar o ranking oficial dos maiores fãs!
          </p>
        </div>

        {/* Current User Quick Stats Widget */}
        <div className="bg-black/40 p-4 rounded-2xl border border-white/5 w-full lg:w-96 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {/* Round status badge */}
            <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-orange-500 to-yellow-400 p-0.5 flex items-center justify-center relative">
              <div className="w-full h-full bg-zinc-950 rounded-full flex flex-col items-center justify-center">
                <span className="text-[12px] font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-yellow-300 leading-none">Lv {level}</span>
              </div>
            </div>
            
            {/* Nickname / Edit component */}
            <div className="space-y-0.5">
              {isEditingNickname ? (
                <div className="flex items-center gap-1">
                  <input
                    type="text"
                    value={nickInput}
                    onChange={(e) => setNickInput(e.target.value)}
                    className="bg-zinc-800 text-white text-xs px-2 py-1 rounded border border-white/20 w-28 focus:outline-none focus:border-orange-500 font-sans"
                    maxLength={15}
                    placeholder="Apelido..."
                  />
                  <button 
                    onClick={saveNickname} 
                    className="p-1.5 bg-emerald-500 text-black rounded hover:bg-emerald-400 cursor-pointer"
                  >
                    <Check className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-black text-white truncate max-w-[120px] font-mono">{nickname}</span>
                  <button 
                    onClick={() => { playTapSound(); setIsEditingNickname(true); }}
                    className="p-1 text-gray-400 hover:text-white transition-all cursor-pointer"
                    title="Mudar Apelido"
                  >
                    <Edit2 className="w-2.5 h-2.5" />
                  </button>
                </div>
              )}
              <div className="flex items-center gap-1.5 text-[10px] text-orange-400 font-black">
                <Flame className="w-3.5 h-3.5 fill-orange-500 text-orange-600 animate-pulse" />
                <span>{fireStreak} Fogos Conquistados</span>
              </div>
            </div>
          </div>

          <div className="text-right space-y-1">
            <div className="text-[11px] font-bold text-gray-400 font-mono">XP: <span className="text-yellow-300">{xp}/100</span></div>
            {/* Tiny progress bar */}
            <div className="w-24 h-1.5 bg-zinc-850 rounded-full overflow-hidden p-0.5 border border-white/5">
              <div className="h-full bg-gradient-to-r from-orange-500 to-yellow-400 rounded-full" style={{ width: `${xp}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* Connection/Login Banner for Fans */}
      {!user || user.uid === 'admin_fallback' ? (
        <div className="bg-gradient-to-b from-indigo-950/40 via-zinc-900/40 to-transparent border-2 border-indigo-500/30 rounded-3xl p-6 space-y-6 shadow-2xl text-left font-sans">
          <div className="space-y-1">
            <h4 className="text-base sm:text-lg font-sans font-black text-white uppercase tracking-wider flex items-center gap-1.5">
              <Award className="w-5.5 h-5.5 text-yellow-300 animate-pulse fill-yellow-500/20" />
              <span>Conecte sua Conta para entrar no Ranking Real! 🏆</span>
            </h4>
            <p className="text-xs text-gray-300 leading-normal max-w-3xl">
              Seu perfil atual é temporário como <strong className="text-orange-400 font-mono font-black">{nickname}</strong>. Faça login rápido ou crie uma conta usando seu e-mail e senha abaixo para salvar seu fã-level, streak de fogo diário, e aparecer para todo mundo!
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch pt-2">
            
            {/* Left Column: Google Sign-in */}
            <div className="bg-zinc-950/60 p-5 rounded-2xl border border-white/5 flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <h5 className="text-xs font-black text-indigo-400 uppercase tracking-widest flex items-center gap-1.5">
                  <User className="w-4 h-4" />
                  <span>Opção 1: CONEXÃO COM GOOGLE</span>
                </h5>
                <p className="text-[11px] text-gray-400 leading-relaxed">
                  Conecte estantaneamente com sua conta Google existente se os popups estiverem ativos no seu navegador.
                </p>
              </div>

              <div className="flex flex-col gap-2.5">
                <button
                  onClick={() => {
                    if (soundEnabled) playSuccessSound();
                    if (onLogin) onLogin();
                  }}
                  className="w-full py-3 px-4 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-550 active:scale-[0.98] text-white font-sans font-black text-xs uppercase tracking-wider rounded-xl cursor-pointer shadow-md transition-all flex items-center justify-center gap-1.5"
                >
                  <Sparkles className="w-4 h-4 text-yellow-200 animate-spin" />
                  <span>Entrar com Google (Popup)</span>
                </button>
                <button
                  onClick={() => {
                    if (soundEnabled) playTapSound();
                    if (onLoginRedirect) onLoginRedirect();
                  }}
                  className="w-full py-2.5 px-4 bg-zinc-800 hover:bg-zinc-700 active:scale-[0.98] text-gray-300 font-sans font-bold text-xs uppercase tracking-wider rounded-xl cursor-pointer border border-zinc-750 transition-all flex items-center justify-center gap-1"
                  title="Use se o Popup do Google estiver bloqueado no celular"
                >
                  <span>Redirecionar Celular 📱</span>
                </button>
              </div>
            </div>

            {/* Right Column: Email / Password login */}
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                if (soundEnabled) playTapSound();
                if (!emailForm || !passwordForm) {
                  setAuthError('Preencha os campos de e-mail e senha!');
                  return;
                }
                setAuthError(null);
                if (authTab === 'register') {
                  const pickNickname = nicknameForm.trim() || nickname;
                  if (onEmailRegister) onEmailRegister(emailForm, passwordForm, pickNickname);
                } else {
                  if (onEmailLogin) onEmailLogin(emailForm, passwordForm);
                }
              }}
              className="bg-zinc-950/60 p-5 rounded-2xl border border-white/5 flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                {/* Auth Mode Toggle */}
                <div className="flex justify-between items-center border-b border-white/5 pb-2">
                  <span className="text-xs font-black text-violet-400 uppercase tracking-widest">
                    Opção 2: E-MAIL E SENHA (100% GARANTIDO)
                  </span>
                  <div className="flex gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        if (soundEnabled) playTapSound();
                        setAuthTab('login');
                        setAuthError(null);
                      }}
                      className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                        authTab === 'login' ? 'bg-indigo-600 text-white shadow-sm' : 'text-zinc-400 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      Entrar
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (soundEnabled) playSuccessSound();
                        setAuthTab('register');
                        setAuthError(null);
                        setNicknameForm(nickname);
                      }}
                      className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                        authTab === 'register' ? 'bg-indigo-600 text-white shadow-sm' : 'text-zinc-400 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      Cadastrar
                    </button>
                  </div>
                </div>

                {/* Form fields */}
                <div className="space-y-2.5">
                  <div>
                    <input
                      type="email"
                      required
                      placeholder="Seu e-mail (ex: fã@email.com)"
                      value={emailForm}
                      onChange={(e) => setEmailForm(e.target.value)}
                      className="w-full bg-zinc-900 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500 transition-all font-mono"
                    />
                  </div>

                  <div>
                    <input
                      type="password"
                      required
                      minLength={6}
                      placeholder="Sua senha (mínimo 6 dígitos)"
                      value={passwordForm}
                      onChange={(e) => setPasswordForm(e.target.value)}
                      className="w-full bg-zinc-900 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500 transition-all font-mono"
                    />
                  </div>

                  {authTab === 'register' && (
                    <div>
                      <label className="block text-[10px] text-zinc-400 uppercase tracking-widest mb-1.5 pl-0.5 leading-none">
                        Nickname Oficial no Site:
                      </label>
                      <input
                        type="text"
                        placeholder="Nome de Fã"
                        value={nicknameForm}
                        onChange={(e) => setNicknameForm(e.target.value)}
                        className="w-full bg-zinc-900 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500 transition-all font-bold"
                      />
                    </div>
                  )}
                </div>

                {authError && (
                  <p className="text-[11px] text-red-400 bg-red-950/20 border border-red-500/10 p-2 rounded-xl">
                    ⚠️ {authError}
                  </p>
                )}
              </div>

              <button
                type="submit"
                className="w-full py-3 px-4 bg-zinc-800 hover:bg-violet-600 hover:text-white text-zinc-300 font-sans font-black text-xs uppercase tracking-wider rounded-xl cursor-pointer border border-zinc-750 hover:border-violet-500 transition-all flex items-center justify-center gap-1.5"
              >
                <span>{authTab === 'register' ? 'CRIAR MINHA CONTA DE FÃ 🚀' : 'ENTRAR NA CONTA E SINCRONIZAR 🔓'}</span>
              </button>
            </form>

          </div>
        </div>
      ) : (
        <div className="bg-gradient-to-r from-emerald-600/20 to-transparent border-2 border-emerald-500/30 rounded-3xl p-5 flex flex-col md:flex-row items-center justify-between gap-4 shadow-lg font-sans">
          <div className="space-y-1 text-left">
            <h4 className="text-sm sm:text-base font-sans font-black text-white uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 animate-pulse" />
              <span>Sua conta de fã está ativa! ✅</span>
            </h4>
            <p className="text-xs text-gray-300 leading-normal">
              Autenticado com sucesso como <strong className="text-emerald-300 font-mono underline">{maskEmail(user.email)}</strong>. Suas conquistas, níveis e fogo diário diário estão sincronizados em tempo real do fã-clube.
            </p>
          </div>
          <button
            onClick={() => {
              if (soundEnabled) playTapSound();
              if (onLogout) onLogout();
            }}
            className="px-4 py-2.5 bg-zinc-800 hover:bg-red-950/40 text-gray-300 hover:text-red-200 font-sans font-black text-xs uppercase tracking-wider rounded-xl cursor-pointer border border-zinc-700 transition-all flex items-center justify-center whitespace-nowrap"
          >
            Desconectar
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* LEFT COLUMN: The Interactive Daily Flame Generator (Spans 5 columns) */}
        <div className="lg:col-span-5 bg-gradient-to-b from-zinc-950 to-zinc-900 border border-white/5 p-6 rounded-2xl flex flex-col justify-between space-y-6 relative overflow-hidden">
          {/* Animated flame symbol behind */}
          <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none">
            <Flame className="w-72 h-72 text-orange-500 animate-pulse fill-orange-500" />
          </div>

          <div className="space-y-4 relative z-10">
            <span className="text-[9px] font-bold bg-orange-500/10 text-orange-400 p-1 px-2.5 rounded-full uppercase tracking-wider font-mono">
              Fogueira Diária de Energia
            </span>
            <div className="space-y-2">
              <h4 className="font-sans font-black text-lg text-white uppercase tracking-normal">
                Faça o seu check-in e acenda a chama!
              </h4>
              <p className="text-xs text-gray-300 leading-relaxed">
                Cada clique diário confere ao seu perfil <strong className="text-yellow-400">+50 XP</strong> de fã level e aumenta sua sequência consecutiva de <strong className="text-orange-400">🔥 Fogos</strong>! Não deixe o seu fogo apagar.
              </p>
            </div>
          </div>

          {/* Interactive Flame Orb container */}
          <div className="flex flex-col items-center justify-center p-6 bg-black/30 rounded-2xl border border-white/5 space-y-3 relative z-10 select-none">
            {/* The Fire Visual */}
            <div className="relative">
              {/* Pulsating background ring aura */}
              <div className="absolute inset-[-10px] rounded-full bg-orange-600/20 blur-xl animate-pulse" />
              <div className={`w-20 h-20 rounded-full flex items-center justify-center bg-gradient-to-t from-red-600 via-orange-500 to-amber-300 shadow-[0_0_25px_rgba(234,88,12,0.5)] p-0.5 transition-all duration-300 ${hasClaimedDaily ? 'grayscale-[40%] scale-95 opacity-80' : 'hover:scale-105 hover:shadow-[0_0_35px_rgba(234,88,12,0.7)]'}`}>
                <div className="w-full h-full bg-zinc-950 rounded-full flex flex-col items-center justify-center text-center">
                  <Flame className={`w-10 h-10 text-orange-500 fill-orange-500 drop-shadow-[0_2px_8px_rgba(234,88,12,0.6)] ${hasClaimedDaily ? 'animate-pulse' : 'animate-bounce'}`} />
                </div>
              </div>
            </div>

            <div className="text-center">
              <div className="text-[14px] font-black text-white flex items-center justify-center gap-1">
                <span>🔥 Sequência de Fogos:</span>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-yellow-300 font-mono text-base font-black">{fireStreak} Dias</span>
              </div>
              <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest mt-0.5">
                {hasClaimedDaily ? "Você está brilhando no topo hoje!" : "O fogo está aguardando você hoje!"}
              </p>
            </div>
          </div>

          <div className="relative z-10 pt-2">
            {hasClaimedDaily ? (
              <div className="w-full bg-emerald-500/10 border border-emerald-500/20 p-3.5 rounded-xl flex items-center gap-2 text-emerald-400 text-xs font-black uppercase text-center justify-center">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Colete diário garantido! (+50 XP) 🔥</span>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleClaimDaily}
                className="w-full py-4 bg-gradient-to-r from-orange-500 via-red-500 to-amber-500 hover:brightness-110 text-black font-sans font-black text-xs uppercase tracking-wider rounded-xl border-b-4 border-red-800 active:border-b-0 cursor-pointer shadow-[0_4px_20px_rgba(234,88,12,0.3)] active:translate-y-1 transition-all text-center flex items-center justify-center gap-2"
              >
                <Flame className="w-4 h-4 fill-black text-black animate-pulse" />
                <span>Coletar XP Diário & Flamejar (+50 XP)</span>
              </button>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Real-time Dynamic Leaderboard System (Spans 7 columns) */}
        <div className="lg:col-span-7 bg-black/35 border border-white/5 p-6 rounded-2xl flex flex-col justify-between space-y-4">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <h4 className="font-sans font-black text-sm text-white uppercase tracking-wider flex items-center gap-2">
                <Trophy className="w-4 h-4 text-yellow-500" />
                <span>Ranking Oficial de Fanáticos</span>
              </h4>
              <span className="text-[10px] font-mono text-gray-400 uppercase tracking-widest font-black">
                Top Criadores & Colecionadores
              </span>
            </div>
            <p className="text-xs text-gray-300">
              O ranking é reorganizado instantaneamente conforme você decola seus níveis de XP e soma mais dias seguidos de foguinhos 🔥 acessados!
            </p>
          </div>

          {/* Leaders List */}
          <div className="space-y-2 max-h-[290px] overflow-y-auto pr-1 no-scrollbar flex-grow">
            {leaderboard.map((player, index) => {
              const rank = index + 1;
              const isUser = player.isCurrentUser;

              let medalBadge = '';
              if (rank === 1) medalBadge = '🥇';
              else if (rank === 2) medalBadge = '🥈';
              else if (rank === 3) medalBadge = '🥉';

              return (
                <div 
                  key={player.id} 
                  className={`flex items-center justify-between p-3 rounded-xl border transition-all duration-200 ${
                    isUser 
                      ? 'bg-gradient-to-r from-orange-500/10 via-yellow-500/5 to-transparent border-orange-500/40 shadow-inner scale-[1.01]' 
                      : 'bg-zinc-900/30 border-white/5 hover:bg-zinc-900/50'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Rank indicator */}
                    <div className="w-7 h-7 flex-shrink-0 flex items-center justify-center font-black text-xs text-mono text-gray-400">
                      {medalBadge ? (
                        <span className="text-base">{medalBadge}</span>
                      ) : (
                        <span>#{rank}</span>
                      )}
                    </div>

                    {/* Simple avatar icon */}
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${isUser ? 'bg-orange-500 text-black' : 'bg-zinc-800 text-gray-400'}`}>
                      <User className="w-4 h-4" />
                    </div>

                    {/* Player Details */}
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className={`text-xs font-bold truncate ${isUser ? 'text-orange-400 font-black' : 'text-zinc-200'}`}>
                          {player.name}
                        </span>
                        {isUser && (
                          <span className="text-[8px] bg-amber-400/15 border border-amber-400/20 text-amber-300 px-1 rounded uppercase font-black tracking-wide flex-shrink-0">
                            VOCÊ
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-gray-400 font-semibold font-mono">
                        Nível de Explorador: <span className="text-yellow-400 font-bold">Fã Lvl {player.level}</span>
                      </span>
                    </div>
                  </div>

                  {/* Flames/XP Score Badge */}
                  <div className="flex items-center gap-4 flex-shrink-0">
                    {/* Fire count */}
                    <div className="flex items-center gap-1 text-xs font-black font-mono text-orange-400 bg-orange-500/5 p-1 px-2 rounded-lg border border-orange-500/20">
                      <Flame className="w-3.5 h-3.5 fill-orange-500 text-orange-500 animate-pulse" />
                      <span>{player.flames}</span>
                    </div>

                    {/* Progress details */}
                    <div className="text-right hidden sm:block">
                      <div className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Metas</div>
                      <div className="text-[10px] text-yellow-300 font-mono font-black">{player.xp}/100 XP</div>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>

          <div className="text-right pt-2 text-[10px] text-gray-500 font-bold font-mono">
            {leaderboard.length} fã-clubes oficiais listados na temporada
          </div>
        </div>

      </div>

      {/* Guide/How to earn XP */}
      <div className="p-4 bg-zinc-950/40 rounded-2xl border border-white/5 space-y-2.5">
        <h5 className="text-[11px] font-black uppercase text-gray-300 tracking-wider flex items-center gap-1.5 font-sans">
          <Award className="w-4 h-4 text-orange-400 animate-pulse" />
          Como funciona a Sequência no Portal PKXD Central?
        </h5>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-gray-300">
          <div className="space-y-1 bg-black/10 p-2.5 rounded-xl border border-white/5">
            <div className="flex items-center gap-2 text-[11px] font-black text-orange-400">
              <span>🔥 A fogueira dos fogos</span>
            </div>
            <p className="text-[11px] text-gray-400 leading-relaxed">
              Fazendo login diariamente e pressionando o botão de check-in diário, você adiciona 1 foguinho na sua pontuação de streak.
            </p>
          </div>
          <div className="space-y-1 bg-black/10 p-2.5 rounded-xl border border-white/5">
            <div className="flex items-center gap-2 text-[11px] font-black text-yellow-400">
              <span>⚡ Líder do fã-clube</span>
            </div>
            <p className="text-[11px] text-gray-400 leading-relaxed">
              Subir de nível soma valores extremos ao seu score, permitindo que você passe nomes conhecidos da comunidade da ilha!
            </p>
          </div>
        </div>
      </div>

    </section>
  );
}

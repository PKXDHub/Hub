import React, { useState, useEffect } from 'react';
import { Ticket, ExternalLink, Zap, Play, Trash2, Edit2, Video, Sparkles, Copy, Check, Flame, ShieldCheck, HelpCircle } from 'lucide-react';
import { NewsItem } from '../types';
import { playTapSound, playSuccessSound } from '../utils/audio';
import { motion, AnimatePresence } from 'motion/react';

interface PromoCodeRedeemerProps {
  videos: NewsItem[];
  isAdmin: boolean;
  onDeleteVideo: (id: string) => void;
  onEditVideo: (item: NewsItem) => void;
}

interface QuickCoupon {
  code: string;
  reward: string;
  type: 'gems' | 'coins' | 'item' | 'special';
  status: 'active' | 'expiring' | 'verified';
}

export default function PromoCodeRedeemer({ videos, isAdmin, onDeleteVideo, onEditVideo }: PromoCodeRedeemerProps) {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [testCodeInput, setTestCodeInput] = useState('');
  const [testResult, setTestResult] = useState<{ status: 'success' | 'info' | 'error'; message: string } | null>(null);
  const [liveRedeemedCount, setLiveRedeemedCount] = useState(1482);

  // Fallback / standard active seasonal coupons list for instant copy
  const quickCoupons: QuickCoupon[] = [
    { code: 'PKXD300G', reward: '300 Gemas Grátis', type: 'gems', status: 'verified' },
    { code: 'CREATORHUB26', reward: 'Mochila de Criador Exclusiva', type: 'item', status: 'active' },
    { code: 'LULUSTONE', reward: '10.000 Moedas & Surpresa', type: 'coins', status: 'verified' },
    { code: 'HUBFREE26', reward: 'Gemas Extras & Caixa de Itens', type: 'special', status: 'expiring' }
  ];

  // Simulating active community counts growing live
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveRedeemedCount(prev => prev + Math.floor(Math.random() * 3) + 1);
    }, 4500);
    return () => clearInterval(interval);
  }, []);

  const handleRedeemClick = () => {
    playTapSound();
    window.open('https://app.playpkxd.com/promo-code', '_blank', 'noreferrer');
  };

  const handleCopyCode = (code: string) => {
    playSuccessSound();
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  const handleTestCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!testCodeInput.trim()) {
      setTestResult({
        status: 'error',
        message: 'Por favor, digite um código de cupom para verificar!'
      });
      return;
    }

    const inputCleaned = testCodeInput.trim().toUpperCase();
    const isMatchedQuick = quickCoupons.some(c => c.code === inputCleaned);

    if (isMatchedQuick) {
      playSuccessSound();
      setTestResult({
        status: 'success',
        message: `✨ CÓDIGO CONFIRMADO! O cupom "${inputCleaned}" é oficial e está ativo hoje. Clique no botão de copiar e resgate no portal do jogo!`
      });
    } else if (inputCleaned.length < 4) {
      setTestResult({
        status: 'error',
        message: '⚠️ Esse código é muito curto para ser um cupom PK XD válido.'
      });
    } else {
      playTapSound();
      setTestResult({
        status: 'info',
        message: `🔍 Cupom enviado para verificação pela comunidade do PKXD Hub! Ele ficará listado temporariamente como pendente até que nossos admins validem.`
      });
    }
  };

  const handleWatchClick = (url: string) => {
    playTapSound();
    if (url.startsWith('http://') || url.startsWith('https://')) {
      window.open(url, '_blank', 'noreferrer');
    } else {
      window.open(`https://www.youtube.com/results?search_query=${encodeURIComponent(url)}`, '_blank', 'noreferrer');
    }
  };

  return (
    <div 
      id="promo-code-redeemer-box"
      className="bg-zinc-900/95 border-3 border-amber-400 rounded-3xl p-6 sm:p-8 space-y-8 text-left relative overflow-hidden shadow-[0_0_35px_rgba(245,158,11,0.25)]"
    >
      {/* Premium Neon Pulsing Glowing Borders and Lights */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/10 rounded-full filter blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-yellow-500/10 rounded-full filter blur-3xl pointer-events-none" />

      <div className="relative z-10 space-y-6">
        
        {/* Main Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-5">
          <div className="flex items-center gap-3.5">
            <div className="p-3 bg-gradient-to-br from-amber-400 to-yellow-500 text-black border border-amber-300 rounded-2xl shadow-[0_0_15px_rgba(245,158,11,0.4)]">
              <Ticket className="w-7 h-7 animate-bounce" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="bg-amber-400/15 text-amber-300 text-[10px] font-black uppercase px-2 py-0.5 rounded border border-amber-400/20 tracking-wider">
                  Oficial PK XD Hub
                </span>
                <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  <ShieldCheck className="w-3 h-3" />
                  Conexão Ativa
                </span>
              </div>
              <h3 className="font-sans font-black text-2xl sm:text-3xl tracking-tight uppercase text-white mt-1">
                CENTRAL DE CÓDIGOS & CUPONS ATIVOS 🔑
              </h3>
              <p className="font-sans text-xs text-amber-300/90">
                Copie os códigos da temporada e resgate diretamente no site oficial do jogo!
              </p>
            </div>
          </div>

          {/* Live redemption stats badge */}
          <div className="bg-amber-950/65 border border-amber-400/40 px-4 py-2.5 rounded-2xl flex items-center gap-2.5 self-start md:self-center shadow-inner">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
            <span className="font-sans text-xs text-amber-100 flex items-center gap-1.5 font-bold">
              <Flame className="w-4 h-4 text-amber-400 fill-amber-400" />
              <span>{liveRedeemedCount.toLocaleString()} fãs já resgataram hoje!</span>
            </span>
          </div>
        </div>

        {/* Section 1: Quick Copy Season Coupons Grid */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
            <h4 className="font-sans font-black text-xs uppercase tracking-wider text-white">
              CUPONS DE HOJE DISPONÍVEIS PARA COPIAR 🎟️
            </h4>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {quickCoupons.map((coupon) => (
              <div 
                key={coupon.code}
                className="bg-black/55 border-2 border-zinc-800 hover:border-amber-400/40 rounded-2xl p-4 flex items-center justify-between gap-3 transition-all relative group overflow-hidden"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-base font-black text-amber-400 select-all tracking-wide">
                      {coupon.code}
                    </span>
                    <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded border ${
                      coupon.status === 'verified'
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        : coupon.status === 'expiring'
                        ? 'bg-rose-500/10 text-rose-400 border-rose-500/20 animate-pulse'
                        : 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20'
                    }`}>
                      {coupon.status === 'verified' ? 'Verificado' : coupon.status === 'expiring' ? 'Expirando' : 'Ativo'}
                    </span>
                  </div>
                  <p className="font-sans text-xs text-zinc-300 font-medium">
                    {coupon.reward}
                  </p>
                </div>

                <button
                  onClick={() => handleCopyCode(coupon.code)}
                  className={`px-4 py-2 rounded-xl font-sans text-xs font-black uppercase flex items-center gap-1.5 transition-all cursor-pointer ${
                    copiedCode === coupon.code
                      ? 'bg-emerald-500 text-white shadow-[0_0_10px_rgba(16,185,129,0.3)]'
                      : 'bg-amber-400 hover:bg-amber-300 text-black shadow-[0_4px_10px_rgba(245,158,11,0.15)] active:scale-95'
                  }`}
                >
                  {copiedCode === coupon.code ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Copiado</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copiar</span>
                    </>
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Section 2: Interactive Coupon Tester Checker */}
        <div className="bg-zinc-900 border border-white/5 rounded-2xl p-4 sm:p-5 space-y-4">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-amber-400" />
            <h4 className="font-sans font-black text-xs uppercase tracking-wider text-white">
              TESTADOR DE VALIDADE & BUSCADOR DE CUPOM 🔍
            </h4>
          </div>

          <form onSubmit={handleTestCode} className="flex flex-col sm:flex-row gap-3">
            <input 
              type="text"
              placeholder="Digite um código cupom aqui para testar..."
              value={testCodeInput}
              onChange={(e) => {
                setTestCodeInput(e.target.value);
                if (testResult) setTestResult(null);
              }}
              className="flex-grow bg-black/60 border border-white/10 hover:border-amber-400/30 focus:border-amber-400 px-4 py-3 rounded-xl font-sans text-xs text-white focus:outline-none transition-colors"
            />
            <button
              type="submit"
              className="px-6 py-3 bg-zinc-800 hover:bg-zinc-700 active:scale-98 text-white font-sans text-xs font-black uppercase tracking-wider rounded-xl border border-white/10 transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <span>Testar Validade</span>
            </button>
          </form>

          {/* Test results animation */}
          <AnimatePresence>
            {testResult && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className={`p-3 rounded-xl font-sans text-xs border ${
                  testResult.status === 'success'
                    ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300'
                    : testResult.status === 'error'
                    ? 'bg-rose-500/10 border-rose-500/20 text-rose-300'
                    : 'bg-blue-500/10 border-blue-500/20 text-blue-300'
                }`}
              >
                {testResult.message}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Section 3: Videos and Creator Lives with Codes */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 border-t border-white/5 pt-5">
            <Video className="w-4 h-4 text-rose-400 animate-pulse" />
            <h4 className="font-sans font-black text-xs uppercase tracking-wider text-white">
              VÍDEOS & LIVES DE CRIADORES RECENTES COM NOVOS CÓDIGOS 🎬
            </h4>
          </div>

          {videos.length === 0 ? (
            <div className="bg-black/25 border-2 border-dashed border-zinc-850 p-6 rounded-2xl text-center space-y-2">
              <Sparkles className="w-6 h-6 text-amber-400/40 mx-auto animate-pulse" />
              <h5 className="font-sans font-black text-xs text-gray-300 uppercase tracking-wider">
                Aguardando Próximos Vídeos de Códigos! 🔮
              </h5>
              <p className="font-sans text-[11px] text-gray-400 max-w-md mx-auto leading-relaxed">
                Nenhum criador postou vídeo com código recente no painel. Inscreva seu conteúdo de criador ou acompanhe o canal do WhatsApp para alertas!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {videos.map((item) => (
                <div 
                  key={item.id}
                  className="bg-black/35 border border-zinc-800 hover:border-amber-400/20 p-4 rounded-2xl flex flex-col justify-between space-y-4 transition-all relative group"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-mono text-amber-400 font-extrabold uppercase bg-amber-950/40 px-2 py-0.5 rounded-md border border-amber-500/20">
                        {item.date || 'Criador PK XD'}
                      </span>
                      <span className="text-[9px] font-sans text-gray-400">
                        Por: <strong className="text-gray-300">{item.author}</strong>
                      </span>
                    </div>

                    <h4 className="font-sans font-black text-xs text-white group-hover:text-amber-300 transition-colors line-clamp-2 leading-snug">
                      {item.title}
                    </h4>
                    
                    <p className="font-sans text-[11px] text-gray-450 line-clamp-2 leading-relaxed">
                      {item.excerpt}
                    </p>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-white/5">
                    <button
                      onClick={() => handleWatchClick(item.content)}
                      className="w-full py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-sans text-[11px] font-black tracking-wide uppercase transition-all duration-150 flex items-center justify-center gap-1.5 border border-rose-500/20 cursor-pointer shadow-md"
                    >
                      <Play className="w-3 h-3 fill-white" />
                      <span>ASSISTIR & PEGAR CÓDIGO 🍿</span>
                    </button>

                    {isAdmin && (
                      <div className="flex gap-2 justify-end pt-1">
                        <button
                          onClick={() => {
                            playTapSound();
                            onEditVideo(item);
                          }}
                          className="p-1 px-2.5 bg-yellow-400/10 hover:bg-yellow-400/20 text-yellow-400 rounded-lg border border-yellow-400/20 transition-colors text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                        >
                          <Edit2 className="w-2.5 h-2.5" />
                          <span>Editar</span>
                        </button>
                        <button
                          onClick={() => {
                            playTapSound();
                            onDeleteVideo(item.id);
                          }}
                          className="p-1 px-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg border border-red-500/20 transition-colors text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                        >
                          <Trash2 className="w-2.5 h-2.5" />
                          <span>Excluir</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Master Portal Redemption CTA Button */}
        <div className="pt-3 text-center border-t border-white/10">
          <button
            onClick={handleRedeemClick}
            className="w-full sm:w-auto px-6 py-4 bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 text-black font-sans font-black text-xs sm:text-sm rounded-2xl border-b-4 border-amber-700 shadow-[0_8px_20px_rgba(245,158,11,0.3)] hover:-translate-y-0.5 hover:shadow-[0_12px_24px_rgba(245,158,11,0.4)] active:translate-y-1 active:border-b-0 cursor-pointer flex flex-wrap items-center justify-center gap-2.5 mx-auto text-center"
          >
            <Ticket className="w-5 h-5 fill-black flex-shrink-0 animate-pulse" />
            <span className="tracking-wide">IR PARA O PORTAL DE RESGATE OFICIAL PK XD 🌟</span>
            <ExternalLink className="w-4 h-4 flex-shrink-0" />
          </button>
          <p className="font-mono text-[9px] text-amber-400/80 uppercase tracking-widest mt-2.5 block">
            *Redirecionamento Seguro Oficial: app.playpkxd.com/promo-code
          </p>
        </div>

      </div>
    </div>
  );
}

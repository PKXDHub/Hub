import React, { useState, useEffect } from 'react';
import { Timer, Sparkles, HelpCircle, Flame, Eye, ExternalLink, EyeOff } from 'lucide-react';
import { playTapSound, playLevelUpSound } from '../utils/audio';

interface CountdownWidgetProps {
  onReveal?: () => void;
  spoilerTitle: string;
  spoilerDesc: string;
  spoilerImageUrl?: string;
  extraCountdownTitle?: string;
  extraCountdownDate?: string;
  extraCountdownEnabled?: boolean;
  forceReveal?: boolean;
  revealedAt?: number;
  isDelayed?: boolean;
  delayMessage?: string;
  onOpenFullscreen?: (title: string, desc: string, imageUrl?: string) => void;
  onlyContent?: boolean;
}

// Helper to parse standard **bold** markers into strong tags
function parseBoldText(inputText: string): React.ReactNode {
  if (!inputText.includes('**')) return inputText;

  const parts = inputText.split('**');
  return parts.map((part, index) => {
    if (index % 2 === 1) {
      return (
        <strong key={index} className="font-sans font-black text-white">
          {part}
        </strong>
      );
    }
    return part;
  });
}

// Custom parser to split paragraphs, lists, headers, and media links in order
function parseAndRenderContent(text: string) {
  if (!text) return null;

  // Split content into segments of media (images or base64) and text blocks
  const mediaRegex = /(!\[.*?\]\([^\)]+\)|<img\s+[^>]*src=["'](?:[^"']+)["'][^>]*>|(?:https?:\/\/[^\s]+?(?:\.png|\.jpg|\.jpeg|\.gif|\.webp|\.bmp)(?:\?[^\s]*)?))/gi;
  const parts = text.split(mediaRegex);

  return (
    <div className="space-y-3.5 text-left">
      {parts.map((part, partIdx) => {
        if (!part) return null;

        // Check for Markdown Image syntax: ![Alt](url)
        const mdMatched = part.match(/!\[(.*?)\]\((.*?)\)/i);
        if (mdMatched) {
          const altText = mdMatched[1] || 'Imagem do Spoiler';
          const imageUrl = mdMatched[2];
          return (
            <div key={`part-${partIdx}`} className="my-4 rounded-2xl overflow-hidden border border-white/10 shadow-lg bg-black/20 p-2 text-center">
              <img 
                src={imageUrl} 
                alt={altText} 
                className="w-full max-h-72 object-contain hover:scale-[1.03] transition-all duration-300 mx-auto rounded-xl" 
                referrerPolicy="no-referrer"
              />
              {altText && altText !== 'Spoiler' && (
                <span className="text-[10px] text-gray-400 block pt-1.5 uppercase font-mono tracking-wider">
                  ⚡ {altText}
                </span>
              )}
            </div>
          );
        }

        // Check for HTML img tag syntax
        const htmlMatched = part.match(/<img\s+[^>]*src=["']([^"']+)["'][^>]*>/i);
        if (htmlMatched) {
          const imageUrl = htmlMatched[1];
          return (
            <div key={`part-${partIdx}`} className="my-4 rounded-2xl overflow-hidden border border-white/10 shadow-lg bg-black/20 p-2">
              <img 
                src={imageUrl} 
                alt="Spoiler Media" 
                className="w-full max-h-72 object-contain hover:scale-[1.03] transition-all duration-300 mx-auto rounded-xl" 
                referrerPolicy="no-referrer"
              />
            </div>
          );
        }

        // Check for raw image URL match
        if (part.match(/^https?:\/\/[^\s]+?(?:\.png|\.jpg|\.jpeg|\.gif|\.webp|\.bmp)(?:\?[^\s]*)?$/i)) {
          return (
            <div key={`part-${partIdx}`} className="my-4 rounded-2xl overflow-hidden border border-white/10 shadow-lg bg-black/20 p-2">
              <img src={part} alt="Raw URL Web Image" className="w-full max-h-72 object-contain hover:scale-[1.03] transition-all duration-300 mx-auto rounded-xl" referrerPolicy="no-referrer" />
            </div>
          );
        }

        // Otherwise, it's a plain text run
        const lines = part.split('\n');
        return (
          <div key={`part-${partIdx}`} className="space-y-2">
            {lines.map((line, lineIdx) => {
              const trimmed = line.trim();
              if (!trimmed) return <div key={lineIdx} className="h-1.5" />;

              // Check for bullet lists
              if (trimmed.startsWith('-') || trimmed.startsWith('*')) {
                const content = trimmed.substring(1).trim();
                return (
                  <div key={lineIdx} className="flex items-start gap-2 text-gray-200 text-sm pl-2">
                    <span className="text-pink-400 mt-1 flex-shrink-0">✦</span>
                    <span>{parseBoldText(content)}</span>
                  </div>
                );
              }

              // Check for headers (e.g., #, ## or ###)
              if (trimmed.startsWith('###')) {
                return <h5 key={lineIdx} className="font-sans font-extrabold text-sm text-cyan-300 uppercase tracking-wider pt-1.5">{parseBoldText(trimmed.replace('###', '').trim())}</h5>;
              }
              if (trimmed.startsWith('##')) {
                return <h4 key={lineIdx} className="font-sans font-black text-base text-yellow-300 uppercase tracking-widest pt-1.5">{parseBoldText(trimmed.replace('##', '').trim())}</h4>;
              }
              if (trimmed.startsWith('#')) {
                return <h2 key={lineIdx} className="font-sans font-black text-lg md:text-xl text-yellow-300 uppercase tracking-wide pt-2.5 pb-1 border-b border-white/5">{parseBoldText(trimmed.replace('#', '').trim())}</h2>;
              }

              return (
                <p key={lineIdx} className="font-sans text-sm text-gray-200 leading-relaxed">
                  {parseBoldText(trimmed)}
                </p>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

export default function CountdownWidget({ 
  spoilerTitle, 
  spoilerDesc, 
  spoilerImageUrl,
  onReveal,
  extraCountdownTitle,
  extraCountdownDate,
  extraCountdownEnabled,
  forceReveal = false,
  revealedAt,
  isDelayed = false,
  delayMessage = '',
  onOpenFullscreen,
  onlyContent = false
}: CountdownWidgetProps) {
  if (onlyContent) {
    return (
      <div className="space-y-1">
        {parseAndRenderContent(spoilerDesc)}
      </div>
    );
  }

  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isExpired: false
  });

  // State for the alternative countdown
  const [extraTimeLeft, setExtraTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    isFresh: boolean;
  } | null>(null);

  // Calculate milliseconds left to next Monday at 17:30
  const calculateTimeLeft = () => {
    const now = new Date();

    const normTitle = (spoilerTitle || '').toLowerCase().trim();
    const isNoActiveSpoiler = !spoilerTitle || 
      !normTitle ||
      normTitle === 'aguardando próximos spoilers! 🔮' || 
      normTitle === 'aguardando proximos spoilers! 🔮' ||
      normTitle.includes('aguardando') || 
      normTitle.includes('nenhum spoiler') ||
      normTitle.includes('sem spoiler') ||
      normTitle.includes('ainda não temos');

    // If there is no active spoiler uploaded yet, we are always in countdown mode!
    if (isNoActiveSpoiler) {
      const targetDay = 1; // Monday
      const targetHour = 17;
      const targetMinute = 30;

      const targetDate = new Date(now);
      let daysToTarget = (targetDay - now.getDay() + 7) % 7;
      
      if (daysToTarget === 0) {
        const currentHours = now.getHours();
        const currentMinutes = now.getMinutes();
        if (currentHours > targetHour || (currentHours === targetHour && currentMinutes >= targetMinute)) {
          daysToTarget = 7;
        }
      }
      
      targetDate.setDate(now.getDate() + daysToTarget);
      targetDate.setHours(targetHour, targetMinute, 0, 0);

      const diff = targetDate.getTime() - now.getTime();
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / 1000 / 60) % 60);
      const seconds = Math.floor((diff / 1000) % 60);

      return { days, hours, minutes, seconds, isExpired: false };
    }

    // Since there IS an active spoiler:
    // Check if forceReveal is active (no 1-hour limit as requested!)
    const isForceActive = !!forceReveal;

    if (isForceActive) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true };
    }

    // We want next Monday 17:30
    const targetDay = 1; // Monday
    const targetHour = 17;
    const targetMinute = 30;

    const targetDate = new Date(now);
    
    // Calculate days to next Monday
    let daysToTarget = (targetDay - now.getDay() + 7) % 7;
    
    // If it's Monday but already past 17:30, go to next Monday
    if (daysToTarget === 0) {
      const currentHours = now.getHours();
      const currentMinutes = now.getMinutes();
      
      if (currentHours > targetHour || (currentHours === targetHour && currentMinutes >= targetMinute)) {
        daysToTarget = 7;
      }
    }
    
    targetDate.setDate(now.getDate() + daysToTarget);
    targetDate.setHours(targetHour, targetMinute, 0, 0);

    const diff = targetDate.getTime() - now.getTime();

    // Check if we are past Monday 17:30 THIS week showing the active spoiler
    const mondayThisWeek = new Date(now);
    const dayOfWeek = now.getDay();
    const daysToMonday = (1 - dayOfWeek - 7) % 7; // Find this week's Monday
    mondayThisWeek.setDate(now.getDate() + (dayOfWeek === 1 ? 0 : daysToMonday));
    mondayThisWeek.setHours(17, 30, 0, 0);

    // Let the active spoiler show indefinitely once the window opens, until manually archived!
    const isInWindow = now >= mondayThisWeek;

    if (isInWindow) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true };
    }

    if (diff <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true };
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / 1000 / 60) % 60);
    const seconds = Math.floor((diff / 1000) % 60);

    return { days, hours, minutes, seconds, isExpired: false };
  };

  // Helper to calculate time left for the extra countdown
  const calculateExtraTimeLeft = () => {
    if (!extraCountdownEnabled || !extraCountdownDate) return null;
    try {
      const target = new Date(extraCountdownDate).getTime();
      const now = Date.now();
      const diff = target - now;
      if (diff <= 0) {
        return null; // Expired, hide itself automatically
      }
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / 1000 / 60) % 60);
      const seconds = Math.floor((diff / 1000) % 60);
      return { days, hours, minutes, seconds, isFresh: true };
    } catch (e) {
      return null;
    }
  };

  useEffect(() => {
    // Initial check
    setTimeLeft(calculateTimeLeft());
    setExtraTimeLeft(calculateExtraTimeLeft());

    const timer = setInterval(() => {
      const updated = calculateTimeLeft();
      setExtraTimeLeft(calculateExtraTimeLeft());
      
      // If it just flipped to expired, trigger high quality celebratory sound
      if (updated.isExpired && !timeLeft.isExpired) {
        playLevelUpSound();
        if (onReveal) onReveal();
      }
      
      setTimeLeft(updated);
    }, 1000);

    return () => clearInterval(timer);
  }, [
    timeLeft.isExpired, 
    extraCountdownEnabled, 
    extraCountdownDate, 
    forceReveal, 
    revealedAt, 
    spoilerTitle, 
    spoilerDesc, 
    spoilerImageUrl, 
    onReveal
  ]);

  // Visual percentages of a week (10080 minutes) to fill the progress bar
  const totalSecondsInWeek = 7 * 24 * 60 * 60;
  const secondsLeft = timeLeft.days * 86400 + timeLeft.hours * 3600 + timeLeft.minutes * 60 + timeLeft.seconds;
  const progressPercent = Math.max(0, Math.min(100, 100 - (secondsLeft / totalSecondsInWeek) * 100));

  const pulseTap = () => {
    playTapSound();
  };

  return (
    <div 
      id="countdown-container"
      className="relative overflow-hidden bg-radial from-violet-950/70 to-indigo-950 p-6 sm:p-8 rounded-3xl border-4 border-cyan-400/80 shadow-[0_12px_0_0_rgb(6,182,212,0.3)] text-white"
    >
      {/* Background decorations */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-pink-550/20 rounded-full filter blur-2xl pointer-events-none" />
      <div className="absolute -bottom-6 -left-6 w-36 h-36 bg-cyan-500/20 rounded-full filter blur-2xl pointer-events-none" />

      <div className="relative z-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-cyan-450/20 rounded-2xl border-2 border-cyan-400/60 shadow-[0_4px_0_0_rgba(6,182,212,0.3)] animate-pulse">
              <Flame className="w-6 h-6 text-cyan-400 fill-cyan-400" />
            </div>
            <div>
              <h3 className="font-sans font-extrabold text-xl sm:text-2xl tracking-wide uppercase text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-pink-400 to-yellow-350">
                Próximos Spoilers PK XD
              </h3>
              <p className="font-sans text-xs text-cyan-200">
                Toda segunda-feira às <span className="text-yellow-300 font-bold">17:30</span> ao vivo!
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-center">
            <span className="flex h-3.5 w-3.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-pink-500"></span>
            </span>
            <span className="font-mono text-xs font-bold tracking-wider text-pink-300 uppercase bg-pink-950/45 px-3 py-1 rounded-full border border-pink-500/30">
              {timeLeft.isExpired ? 'Liberado!' : 'Agendado'}
            </span>
          </div>
        </div>

        {/* Outer State Condition */}
        {timeLeft.isExpired ? (
          <div 
            id="spoiler-revealed-state"
            className="flex flex-col items-start justify-start p-6 sm:p-8 bg-gradient-to-br from-purple-900/40 via-purple-950/60 to-slate-900/60 border-4 border-pink-500 rounded-3xl text-left relative overflow-hidden shadow-2xl transition-all duration-200 w-full"
          >
            {/* Ambient glows and sparkles */}
            <div className="absolute -top-12 -right-12 w-48 h-48 bg-pink-500/20 rounded-full filter blur-2xl pointer-events-none" />
            <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-cyan-500/20 rounded-full filter blur-2xl pointer-events-none" />
            
            <div className="absolute top-3 right-3 flex gap-1">
              <Sparkles className="w-5 h-5 text-yellow-300 animate-pulse" />
              <Sparkles className="w-4 h-4 text-pink-400 animate-bounce" />
            </div>

            <div className="relative z-10 w-full space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-white/10 pb-4">
                <div>
                  <span className="font-mono text-[10px] sm:text-xs font-black tracking-widest text-pink-400 uppercase bg-pink-950/50 px-3 py-1 rounded-full border border-pink-500/30">
                    🔥 SPOILER CONFIRMADO & REVELADO
                  </span>
                  <h4 className="font-sans font-black text-2xl sm:text-3xl text-yellow-350 tracking-tight uppercase leading-none mt-2 drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
                    {spoilerTitle || 'Nova Atualização Incrível!'}
                  </h4>
                </div>
                
                {onOpenFullscreen && (
                  <button 
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      playTapSound();
                      onOpenFullscreen(spoilerTitle || 'Nova Atualização Incrível!', spoilerDesc, spoilerImageUrl);
                    }}
                    className="flex-shrink-0 px-4 py-2 bg-gradient-to-r from-pink-500 to-violet-600 hover:from-pink-600 hover:to-violet-700 text-white font-sans font-black uppercase text-[10px] tracking-wider rounded-xl flex items-center justify-center gap-1.5 cursor-pointer shadow-md hover:scale-105 active:scale-95 transition-all duration-150 border-0"
                  >
                    <Eye className="w-4 h-4 text-white" /> Foco Imersivo
                  </button>
                )}
              </div>

              {/* CRISP AND CLEAR IMAGE DIRECT ENTRY */}
              {spoilerImageUrl ? (
                <div className="relative w-full overflow-hidden rounded-2xl border-2 border-white/10 bg-black/50 shadow-inner flex items-center justify-center p-2">
                  <img 
                    src={spoilerImageUrl} 
                    alt="Imagem Revelada do Spoiler" 
                    className="w-full max-h-[450px] object-contain rounded-xl hover:scale-[1.01] transition-transform duration-300 mx-auto"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute bottom-4 right-4 bg-black/75 backdrop-blur-md px-3 py-1 rounded-lg border border-white/10 text-[9px] font-mono uppercase tracking-widest text-yellow-300">
                    ✨ IMAGEM EXCLUSIVA DO PORTAL
                  </div>
                </div>
              ) : (
                <div className="w-full h-1 bg-white/5" />
              )}

              {/* DIRECT TEXT PARSING & BEAUTIFUL DETAILS */}
              <div className="bg-black/60 backdrop-blur-md p-5 sm:p-6 rounded-2xl border border-white/10 shadow-inner space-y-3">
                <h5 className="font-sans font-black text-xs text-cyan-300 uppercase tracking-widest border-b border-white/5 pb-2">
                  📋 Especificações & Detalhes da Atualização:
                </h5>
                <div className="max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                  {parseAndRenderContent(spoilerDesc)}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-400 font-sans border-t border-white/5 pt-4">
                <span className="font-semibold tracking-wide text-gray-300">
                  Compartilhe com seus amigos do PK XD!
                </span>
                <span className="text-[11px] text-pink-400 font-mono font-bold animate-pulse">
                  *Novos spoilers adicionados em tempo real pelo Mod Admin!
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Show Delayed banner warning if delay is active */}
            {isDelayed && (
              <div className="p-4 bg-yellow-400/10 border-2 border-yellow-400/30 rounded-2xl flex items-start gap-3 text-left animate-pulse">
                <span className="p-2 bg-yellow-400/20 text-yellow-300 rounded-xl font-bold text-lg leading-none select-none">
                  ⚠️
                </span>
                <div>
                  <h4 className="font-sans font-black text-xs sm:text-sm text-yellow-300 uppercase tracking-widest leading-none">
                    Aviso: Spoiler Adiado / Atrasado
                  </h4>
                  <p className="font-sans text-xs text-gray-200 leading-relaxed mt-1.5">
                    {delayMessage || 'O spoiler desta segunda-feira foi adiado ou atrasará um pouquinho no envio. Fiquem calmos, já postaremos tudo!'}
                  </p>
                </div>
              </div>
            )}

            {/* Grid for Countdown digits */}
            <div className="grid grid-cols-4 gap-2.5 sm:gap-4 select-none">
              {[
                { label: 'DIAS', value: timeLeft.days, color: 'from-purple-600 to-indigo-600', border: 'border-purple-400' },
                { label: 'HORAS', value: timeLeft.hours, color: 'from-pink-600 to-purple-600', border: 'border-pink-400' },
                { label: 'MINUTOS', value: timeLeft.minutes, color: 'from-cyan-600 to-indigo-600', border: 'border-cyan-400' },
                { label: 'SEGUNDOS', value: timeLeft.seconds, color: 'from-yellow-600 to-amber-600', border: 'border-yellow-400' }
              ].map((column, idx) => (
                <div 
                  key={idx}
                  onClick={pulseTap}
                  className={`flex flex-col items-center justify-center p-2.5 sm:p-4 rounded-2xl bg-gradient-to-b ${column.color} border-b-4 ${column.border} shadow-[0_6px_0_0_rgba(0,0,0,0.25)] transition-all duration-150 active:scale-95 active:shadow-[0_2px_0_0_rgba(0,0,0,0.25)] cursor-pointer`}
                >
                  <span className="font-mono font-black text-2xl sm:text-4xl md:text-5xl tracking-tight text-white drop-shadow-[0_2px_2px_rgba(0,0,0,0.4)]">
                    {String(column.value).padStart(2, '0')}
                  </span>
                  <span className="font-sans font-extrabold text-[9px] sm:text-xs text-white/80 tracking-wider uppercase mt-1">
                    {column.label}
                  </span>
                </div>
              ))}
            </div>

            {/* Glowing progress slider bar */}
            <div>
              <div className="flex justify-between items-center text-xs font-bold text-cyan-200 mb-1.5 px-1 font-mono">
                <span>Carga de Energia do Spoiler</span>
                <span className="text-yellow-300 animate-pulse">{Math.round(progressPercent)}% Pronto</span>
              </div>
              <div className="w-full h-4 bg-black/40 rounded-full overflow-hidden p-0.5 border border-white/10 shadow-inner">
                <div 
                  className="h-full bg-gradient-to-r from-violet-550 via-pink-400 to-cyan-400 rounded-full transition-all duration-1000 ease-out shadow-[0_0_12px_#38bdf8]"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {/* Prompt Card */}
            <div className="flex items-start gap-3 bg-white/5 border border-white/10 p-4 rounded-2xl">
              <HelpCircle className="w-5 h-5 text-yellow-300 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-sans font-bold text-sm text-yellow-300">O que acontece na contagem?</h4>
                <p className="font-sans text-xs text-gray-300 leading-relaxed mt-0.5">
                  Toda segunda-feira às 17h30, o relógio zera e libera os exclusivos spoilers coletivos de PK XD. Fique ligado na página ou acesse nosso Canal no WhatsApp para receber em primeira mão!
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Alternative Extra Countdown Timer */}
        {extraTimeLeft && (
          <div className="mt-8 pt-6 border-t border-white/10 space-y-4 text-left">
            <div className="flex items-center gap-2 text-pink-400">
              <Flame className="w-4 h-4 animate-pulse text-pink-400 fill-pink-400" />
              <h4 className="font-sans font-black text-sm uppercase tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-yellow-300">
                {extraCountdownTitle || 'Contagem Alternativa / Spoiler Extra!'}
              </h4>
            </div>
            <div className="grid grid-cols-4 gap-2.5 sm:gap-4 select-none">
              {[
                { label: 'DIAS', value: extraTimeLeft.days, color: 'from-zinc-900 to-zinc-950', border: 'border-purple-500/30' },
                { label: 'HORAS', value: extraTimeLeft.hours, color: 'from-zinc-900 to-zinc-950', border: 'border-pink-500/30' },
                { label: 'MINUTOS', value: extraTimeLeft.minutes, color: 'from-zinc-900 to-zinc-950', border: 'border-cyan-500/30' },
                { label: 'SEGUNDOS', value: extraTimeLeft.seconds, color: 'from-zinc-900 to-zinc-950', border: 'border-yellow-500/30' }
              ].map((column, idx) => (
                <div 
                  key={idx}
                  onClick={pulseTap}
                  className={`flex flex-col items-center justify-center p-2 rounded-xl bg-gradient-to-b ${column.color} border-2 ${column.border} shadow-md transition-all duration-150 active:scale-95 cursor-pointer`}
                >
                  <span className="font-mono font-black text-base sm:text-2xl text-white drop-shadow-md">
                    {String(column.value).padStart(2, '0')}
                  </span>
                  <span className="font-sans font-extrabold text-[8px] sm:text-[10px] text-gray-400 tracking-wider uppercase mt-0.5">
                    {column.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

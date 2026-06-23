import React from 'react';
import { Star, Play, Trash2, Smartphone } from 'lucide-react';
import { ShortItem } from '../types';
import { playTapSound } from '../utils/audio';

interface BestShortsProps {
  shorts: ShortItem[];
  isAdmin: boolean;
  onDelete: (id: string) => void;
}

export default function BestShorts({ shorts, isAdmin, onDelete }: BestShortsProps) {
  const getYoutubeEmbedId = (url: string) => {
    try {
      // Find matches for shorts, e.g., youtube.com/shorts/XYZ or youtube.com/watch?v=XYZ
      const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\/shorts\/|shorts\?v=)([^#\&\?]*).*/;
      const match = url.match(regExp);
      return (match && match[2].length === 11) ? match[2] : null;
    } catch (e) {
      return null;
    }
  };

  const handleWatchClick = (url: string) => {
    playTapSound();
    window.open(url, '_blank', 'noreferrer');
  };

  return (
    <section id="best-shorts-section" className="bg-zinc-900/40 border border-white/5 rounded-3xl p-6 sm:p-8 space-y-6 text-left relative overflow-hidden">
      {/* Accent glow spots */}
      <div className="absolute top-0 left-1/3 w-32 h-32 bg-cyan-500/5 rounded-full filter blur-2xl pointer-events-none" />
      <div className="absolute -bottom-10 right-0 w-32 h-32 bg-pink-500/5 rounded-full filter blur-2xl pointer-events-none" />

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-white/5 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 rounded-2xl">
            <Smartphone className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <h3 className="font-sans font-black text-xl tracking-tight text-white uppercase">
              Melhores Shorts da Semana ⚡
            </h3>
            <p className="font-sans text-xs text-cyan-200">
              Vídeos curtos e explosivos selecionados com exclusividade pelo <strong className="text-pink-400">PKXD Hub</strong>!
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 self-start lg:self-center">
          <a
            href="https://forms.gle/bmJqrXkSa9uibQqo9"
            target="_blank"
            rel="noreferrer"
            className="px-4 py-2 bg-gradient-to-r from-cyan-500/20 to-teal-500/20 hover:from-cyan-500/30 hover:to-teal-500/30 text-cyan-300 border border-cyan-500/40 rounded-xl font-sans font-black text-xs uppercase tracking-wider transition-all hover:scale-[1.02] active:scale-95 text-center flex items-center justify-center gap-1.5"
          >
            <span>📱 Enviar Shorts</span>
          </a>
          <span className="font-black text-[9px] uppercase font-mono px-3 py-1 bg-cyan-950/40 text-cyan-300 rounded-full border border-cyan-500/20 animate-pulse">
            Premium Curado ⭐
          </span>
        </div>
      </div>

      {shorts.length === 0 ? (
        <div className="bg-black/20 border border-dashed border-white/5 p-8 rounded-2xl text-center">
          <Smartphone className="w-8 h-8 text-cyan-400/40 mx-auto mb-2 animate-pulse" />
          <p className="text-sm font-medium text-gray-400 uppercase tracking-wide">
            Nenhum curta (Short) em destaque editado nesta semana.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {shorts.map((short) => {
            const embedId = getYoutubeEmbedId(short.youtubeUrl);
            return (
              <div
                key={short.id}
                className="bg-black/35 border border-white/5 hover:border-cyan-400/30 rounded-2xl overflow-hidden flex flex-col justify-between group transition-all relative"
              >
                {/* Embed player formatted for vertical style */}
                <div className="relative aspect-[9/16] bg-zinc-950">
                  {embedId ? (
                    <iframe
                      src={`https://www.youtube.com/embed/${embedId}`}
                      title={short.title}
                      className="w-full h-full border-0 absolute inset-0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
                      <Play className="w-12 h-12 text-cyan-400/80 mb-2 group-hover:scale-110 duration-200" />
                      <span className="text-xs font-black uppercase text-cyan-400">Ver no YouTube</span>
                    </div>
                  )}
                </div>

                <div className="p-3.5 space-y-3">
                  <h4 className="font-sans font-black text-xs text-gray-100 group-hover:text-cyan-300 transition-colors line-clamp-2">
                    {short.title}
                  </h4>

                  <div className="flex items-center justify-between pt-2 border-t border-white/5 text-[11px]">
                    <button
                      onClick={() => handleWatchClick(short.youtubeUrl)}
                      className="font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer"
                    >
                      <Play className="w-3 h-3 fill-current" />
                      <span>Ver Original</span>
                    </button>

                    {isAdmin && (
                      <button
                        onClick={() => { playTapSound(); onDelete(short.id); }}
                        className="font-bold text-red-400 hover:text-red-300 flex items-center gap-1 cursor-pointer"
                        title="Deletar short"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Deletar</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

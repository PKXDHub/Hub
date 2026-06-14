import React, { useState } from 'react';
import { Star, Video, Play, Trash2, Trophy } from 'lucide-react';
import { FeaturedVideo } from '../types';
import { playTapSound } from '../utils/audio';

interface FeaturedVideosProps {
  videos: FeaturedVideo[];
  isAdmin: boolean;
  onDelete: (id: string) => void;
}

export default function FeaturedVideos({ videos, isAdmin, onDelete }: FeaturedVideosProps) {
  const [activeType, setActiveType] = useState<'all' | 'game_highlight' | 'panel_video'>('all');

  const filtered = videos.filter(v => activeType === 'all' || v.type === activeType);

  const getYoutubeEmbedId = (url: string) => {
    try {
      const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
      const match = url.match(regExp);
      return (match && match[2].length === 11) ? match[2] : null;
    } catch (e) {
      return null;
    }
  };

  const openVideo = (url: string) => {
    playTapSound();
    window.open(url, '_blank', 'noreferrer');
  };

  return (
    <section id="featured-videos-section" className="bg-zinc-900/40 border border-white/5 rounded-3xl p-6 sm:p-8 space-y-6 text-left relative overflow-hidden">
      {/* Visual background accents */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full filter blur-2xl pointer-events-none" />
      <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-purple-500/5 rounded-full filter blur-2xl pointer-events-none" />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-2xl">
            <Trophy className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <h3 className="font-sans font-black text-xl tracking-tight text-white uppercase">
              Vídeos em Destaque 🎬
            </h3>
            <p className="font-sans text-xs text-indigo-200">
              Assista aos destaques que aparecem no jogo e os vídeos oficiais que foram para o painel!
            </p>
          </div>
        </div>

        {/* Filter buttons */}
        <div className="flex flex-wrap gap-1.5 sm:gap-2 bg-black/30 p-1 rounded-xl border border-white/5 self-start sm:self-center">
          <button
            onClick={() => { playTapSound(); setActiveType('all'); }}
            className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg text-[10px] sm:text-xs font-bold transition-all uppercase cursor-pointer ${
              activeType === 'all' ? 'bg-indigo-500 text-white shadow-sm' : 'text-gray-400 hover:text-white'
            }`}
          >
            Todos
          </button>
          <button
            onClick={() => { playTapSound(); setActiveType('game_highlight'); }}
            className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg text-[10px] sm:text-xs font-bold transition-all uppercase cursor-pointer ${
              activeType === 'game_highlight' ? 'bg-indigo-500 text-white shadow-sm' : 'text-gray-400 hover:text-white'
            }`}
          >
            Destaques no Jogo
          </button>
          <button
            onClick={() => { playTapSound(); setActiveType('panel_video'); }}
            className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg text-[10px] sm:text-xs font-bold transition-all uppercase cursor-pointer ${
              activeType === 'panel_video' ? 'bg-indigo-500 text-white shadow-sm' : 'text-gray-400 hover:text-white'
            }`}
          >
            Vídeos do Painel
          </button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-black/20 border border-dashed border-white/5 p-8 rounded-2xl text-center">
          <Video className="w-8 h-8 text-indigo-400/40 mx-auto mb-2 animate-pulse" />
          <p className="text-sm font-medium text-gray-400 uppercase tracking-wide">
            Nenhum vídeo em destaque cadastrado nesta categoria.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filtered.map((video) => {
            const embedId = getYoutubeEmbedId(video.youtubeUrl);
            return (
              <div
                key={video.id}
                className="bg-black/30 border border-white/5 hover:border-indigo-500/30 rounded-2xl overflow-hidden flex flex-col justify-between group transition-all"
              >
                {/* Embed player or elegant placeholder */}
                <div className="relative aspect-video bg-zinc-950 flex items-center justify-center">
                  {embedId ? (
                    <iframe
                      src={`https://www.youtube.com/embed/${embedId}`}
                      title={video.title}
                      className="w-full h-full border-0 absolute inset-0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
                      <Play className="w-12 h-12 text-indigo-500/80 mb-2 group-hover:scale-110 duration-200" />
                      <span className="text-xs uppercase font-black text-indigo-400/80">Assista no YouTube</span>
                    </div>
                  )}
                </div>

                <div className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md border ${
                      video.type === 'game_highlight' 
                        ? 'bg-yellow-500/10 text-yellow-300 border-yellow-500/20' 
                        : 'bg-indigo-500/10 text-indigo-300 border-indigo-500/20'
                    }`}>
                      {video.type === 'game_highlight' ? '⭐ Destaque no Jogo' : '🖥️ No Painel'}
                    </span>
                    <span className="text-[10px] text-gray-500 font-mono">
                      {new Date(video.createdAt).toLocaleDateString('pt-BR')}
                    </span>
                  </div>

                  <h4 className="font-sans font-black text-sm text-gray-100 group-hover:text-indigo-300 transition-colors line-clamp-2">
                    {video.title}
                  </h4>

                  <div className="flex items-center justify-between pt-2 border-t border-white/5">
                    <button
                      onClick={() => openVideo(video.youtubeUrl)}
                      className="text-xs font-bold text-indigo-400 hover:text-indigo-300 inline-flex items-center gap-1 cursor-pointer"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Ver no YouTube</span>
                    </button>

                    {isAdmin && (
                      <button
                        onClick={() => { playTapSound(); onDelete(video.id); }}
                        className="text-xs font-bold text-red-400 hover:text-red-300 inline-flex items-center gap-1 cursor-pointer"
                        title="Deletar vídeo destacado"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
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

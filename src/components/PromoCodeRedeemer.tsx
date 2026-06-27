import React from 'react';
import { Ticket, ExternalLink, Play, Trash2, Edit2, Video, Sparkles, AlertCircle } from 'lucide-react';
import { NewsItem } from '../types';
import { playTapSound } from '../utils/audio';

interface PromoCodeRedeemerProps {
  videos: NewsItem[];
  isAdmin: boolean;
  onDeleteVideo: (id: string) => void;
  onEditVideo: (item: NewsItem) => void;
}

export default function PromoCodeRedeemer({ videos, isAdmin, onDeleteVideo, onEditVideo }: PromoCodeRedeemerProps) {
  
  const handleRedeemClick = () => {
    playTapSound();
    window.open('https://app.playpkxd.com/promo-code', '_blank', 'noreferrer');
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
      className="bg-zinc-900/40 border border-white/5 rounded-3xl p-6 sm:p-8 space-y-6 text-left relative overflow-hidden"
    >
      {/* Background Glow */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full filter blur-2xl pointer-events-none animate-pulse" />
      
      <div className="relative z-10 space-y-6">
        
        {/* Main Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-2xl shadow-[0_0_15px_rgba(245,158,11,0.15)]">
              <Ticket className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h3 className="font-sans font-black text-xl tracking-tight text-white uppercase flex items-center gap-1.5">
                PRÓXIMOS VÍDEOS/LIVES COM CÓDIGOS ⚡
              </h3>
              <p className="font-sans text-xs text-amber-200/90 leading-relaxed">
                Acompanhe os próximos vídeos e transmissões para garantir seus cupons oficiais e novos códigos!
              </p>
            </div>
          </div>

          <div className="bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-xl self-start sm:self-center">
            <span className="font-mono text-xs text-amber-300 font-bold">
              {videos.length} VÍDEO(S) LISTADO(S)
            </span>
          </div>
        </div>

        {/* Info Card / Explainer */}
        <div className="bg-amber-950/25 border border-amber-500/10 p-4 rounded-2xl flex items-start gap-3">
          <AlertCircle className="text-amber-400 w-5 h-5 flex-shrink-0 mt-0.5" />
          <p className="font-sans text-xs text-gray-300 leading-relaxed">
            <strong className="text-amber-300">Como obter códigos neste painel?</strong> Nós não divulgamos os cupons prontos em formato de texto! Em vez disso, acompanhe os criadores listados abaixo que receberam códigos oficiais da desenvolvedora para distribuir em seus vídeos e lives. Assista aos conteúdos para pegá-los!
          </p>
        </div>

        {/* Videos with High Premium Highlight Border */}
        <div className="space-y-4">
          {videos.length === 0 ? (
            <div className="bg-black/20 border border-dashed border-white/5 p-8 rounded-2xl text-center space-y-3">
              <span className="text-2xl block animate-pulse">🔮</span>
              <h5 className="font-sans font-black text-sm text-gray-300 uppercase tracking-wider">
                AGUARDANDO PRÓXIMAS LIVES & VÍDEOS!
              </h5>
              <p className="font-sans text-xs text-gray-400 max-w-md mx-auto leading-relaxed">
                Nenhum criador está com vídeo de códigos novos listado agora. Ative as notificações no canal do WhatsApp e fique atento para quando os links forem adicionados!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {videos.map((item) => (
                <div 
                  key={item.id}
                  className="relative p-[2px] rounded-2xl bg-gradient-to-br from-amber-500 via-amber-400/30 to-amber-600 shadow-[0_0_20px_rgba(245,158,11,0.12)] hover:shadow-[0_0_30px_rgba(245,158,11,0.3)] hover:-translate-y-1 transition-all duration-300 group"
                >
                  <div className="bg-zinc-950 p-4.5 rounded-[14px] flex flex-col justify-between h-full space-y-4">
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[9px] font-mono text-amber-400 font-extrabold uppercase bg-amber-500/15 px-2 py-0.5 rounded-md border border-amber-500/20 flex items-center gap-1">
                          <Sparkles className="w-2.5 h-2.5 animate-spin" />
                          <span>CÓDIGO ATIVO</span>
                        </span>
                        <span className="text-[9px] font-sans text-gray-400 truncate max-w-[120px]">
                          Por: <strong className="text-gray-300">@{item.author.replace('@', '')}</strong>
                        </span>
                      </div>

                      <h4 className="font-sans font-black text-xs text-white group-hover:text-amber-300 transition-colors line-clamp-2 leading-snug">
                        {item.title}
                      </h4>
                      
                      <p className="font-sans text-[11px] text-gray-400 line-clamp-2 leading-relaxed">
                        {item.excerpt}
                      </p>
                    </div>

                    <div className="space-y-2 pt-2 border-t border-white/5">
                      <button
                        onClick={() => handleWatchClick(item.content)}
                        className="w-full py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-sans text-[11px] font-black tracking-wide uppercase transition-all duration-150 flex items-center justify-center gap-1.5 border border-rose-500/20 cursor-pointer shadow-md active:scale-95"
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
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Master Portal Redemption CTA Button */}
        <div className="pt-3 text-center border-t border-white/5">
          <button
            onClick={handleRedeemClick}
            className="w-full sm:w-auto px-5 py-3.5 bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 text-black font-sans font-black text-xs rounded-xl shadow-[0_4px_15px_rgba(245,158,11,0.2)] hover:shadow-[0_6px_20px_rgba(245,158,11,0.3)] hover:-translate-y-0.5 active:translate-y-0 cursor-pointer flex items-center justify-center gap-2 mx-auto transition-all"
          >
            <Ticket className="w-4 h-4 fill-black flex-shrink-0 animate-pulse" />
            <span className="tracking-wide">IR PARA O PORTAL DE RESGATE OFICIAL PK XD 🌟</span>
            <ExternalLink className="w-3.5 h-3.5 flex-shrink-0" />
          </button>
        </div>

      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { 
  MessageSquare, 
  Send, 
  Trash2, 
  Check, 
  AlertTriangle, 
  User, 
  Clock, 
  Lock, 
  Sparkles,
  ShieldAlert
} from 'lucide-react';
import { collection, query, where, orderBy, onSnapshot, addDoc, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { AppComment } from '../types';
import { playTapSound, playSuccessSound } from '../utils/audio';
import { checkIsIllicit } from '../utils/moderation';

interface CommentsSectionProps {
  targetId: string;
  targetType: 'theory' | 'video' | 'post';
  currentUser: any; // User state from App.tsx
  isAdmin: boolean;
  onAddXP?: (amount: number, reason: string) => void;
}

export default function CommentsSection({ 
  targetId, 
  targetType, 
  currentUser, 
  isAdmin, 
  onAddXP 
}: CommentsSectionProps) {
  const [comments, setComments] = useState<AppComment[]>([]);
  const [inputText, setInputText] = useState('');
  const [guestName, setGuestName] = useState(() => {
    return localStorage.getItem('pkxd_comment_guest_name') || '';
  });
  const [loading, setLoading] = useState(true);
  const [warningMessage, setWarningMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Load comments in real-time
  useEffect(() => {
    setLoading(true);
    const commentsRef = collection(db, 'comments');
    
    // Admins can see pending/blocked comments; regular users only see approved ones
    let q;
    if (isAdmin) {
      q = query(
        commentsRef,
        where('targetId', '==', targetId),
        where('targetType', '==', targetType),
        orderBy('createdAt', 'desc')
      );
    } else {
      q = query(
        commentsRef,
        where('targetId', '==', targetId),
        where('targetType', '==', targetType),
        where('status', '==', 'approved'),
        orderBy('createdAt', 'desc')
      );
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list: AppComment[] = [];
      snapshot.forEach((docSnap) => {
        list.push({
          id: docSnap.id,
          ...docSnap.data()
        } as AppComment);
      });
      setComments(list);
      setLoading(false);
    }, (error) => {
      console.error("Error listening to comments:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [targetId, targetType, isAdmin]);

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inputText.trim()) return;

    // Validate name for guests
    const finalAuthorName = currentUser 
      ? (currentUser.displayName || currentUser.email?.split('@')[0] || 'Jogador PK XD') 
      : guestName.trim();

    if (!currentUser && !finalAuthorName) {
      setWarningMessage("✍️ Por favor, digite um apelido para poder comentar como convidado!");
      return;
    }

    // Save guest name in local storage
    if (!currentUser) {
      localStorage.setItem('pkxd_comment_guest_name', finalAuthorName);
    }

    setWarningMessage(null);
    setSuccessMessage(null);

    const commentContent = inputText.trim();

    // 1. Run automatic moderation check for illicit contents
    const { isIllicit, matchedWords } = checkIsIllicit(commentContent);
    const matchedAuthor = checkIsIllicit(finalAuthorName);

    const isNameIllicit = matchedAuthor.isIllicit;
    const finalStatus = (isIllicit || isNameIllicit) ? 'pending_review' : 'approved';

    try {
      playTapSound();

      // Create new comment object in Firestore
      const commentsRef = collection(db, 'comments');
      await addDoc(commentsRef, {
        targetId,
        targetType,
        authorName: isNameIllicit ? 'Nome Filtrado 🛑' : finalAuthorName,
        authorId: currentUser ? currentUser.uid : null,
        authorAvatar: currentUser ? currentUser.photoURL : null,
        content: commentContent,
        status: finalStatus,
        createdAt: Date.now()
      });

      setInputText('');
      playSuccessSound();

      if (finalStatus === 'pending_review') {
        // Comment was blocked and sent for admin review
        setWarningMessage("⚠️ Seu comentário continha palavras proibidas/links suspeitos e foi enviado para REVISÃO do moderador antes de aparecer na Central!");
        if (onAddXP) {
          // Give minor XP but inform them about the rules
          onAddXP(5, 'Feedback Moderado 🛡️');
        }
      } else {
        setSuccessMessage("✨ Comentário publicado com sucesso!");
        setTimeout(() => setSuccessMessage(null), 3000);

        // Add 30 XP to the player for contributing to the community discussions!
        if (onAddXP) {
          onAddXP(30, 'Discussão de Spoilers 💬');
        }
      }

    } catch (err) {
      console.error("Error writing comment to Firestore:", err);
      setWarningMessage("❌ Erro ao enviar comentário. Tente novamente mais tarde.");
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!isAdmin) return;
    try {
      playTapSound();
      await deleteDoc(doc(db, 'comments', commentId));
      setSuccessMessage("🗑️ Comentário excluído com sucesso!");
      setTimeout(() => setSuccessMessage(null), 2500);
    } catch (err) {
      console.error("Error deleting comment:", err);
    }
  };

  return (
    <div className="mt-4 pt-4 border-t border-white/5 space-y-4" id={`comments-container-${targetId}`}>
      <div className="flex items-center gap-2 text-gray-400">
        <MessageSquare className="w-4 h-4 text-pink-400" />
        <span className="font-sans font-black text-xs uppercase tracking-wider text-pink-300">
          Discussão Geral ({comments.length})
        </span>
      </div>

      {/* Warning / Success Banners */}
      {warningMessage && (
        <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-xl text-yellow-300 text-xs flex items-start gap-2 animate-pulse">
          <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>{warningMessage}</span>
        </div>
      )}
      {successMessage && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-300 text-xs flex items-center gap-2">
          <Check className="w-4 h-4 flex-shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Comment Form */}
      <form onSubmit={handleSubmitComment} className="space-y-2.5">
        {!currentUser && (
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <span className="absolute left-3 top-2.5 text-gray-500 text-xs">Apelido:</span>
              <input
                type="text"
                placeholder="Ex: PlayerXD"
                maxLength={25}
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                className="w-full pl-16 pr-3 py-2 bg-black/40 border border-white/10 rounded-xl text-xs text-white focus:border-pink-500/50 outline-none transition-all font-bold placeholder:text-gray-600 placeholder:font-normal"
              />
            </div>
            <div className="px-3 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-[10px] text-indigo-300 flex items-center justify-center gap-1.5 font-bold uppercase tracking-wide">
              <span>Convidado 👤</span>
            </div>
          </div>
        )}

        <div className="flex gap-2">
          {currentUser && currentUser.photoURL ? (
            <img 
              src={currentUser.photoURL} 
              alt="Avatar" 
              referrerPolicy="no-referrer"
              className="w-8 h-8 rounded-full border border-pink-500/30 bg-zinc-800 flex-shrink-0 select-none hidden sm:block mt-0.5" 
            />
          ) : (
            <div className="w-8 h-8 rounded-full border border-white/10 bg-zinc-950 flex items-center justify-center text-gray-500 flex-shrink-0 select-none hidden sm:block mt-0.5">
              <User className="w-4 h-4" />
            </div>
          )}
          <div className="flex-1 flex gap-2">
            <input
              type="text"
              placeholder={currentUser ? "O que você acha dessa teoria/novidade? Comente aqui..." : "Escreva seu comentário aqui..."}
              maxLength={250}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="flex-1 px-4 py-2 bg-black/50 border border-white/10 rounded-xl text-xs text-white placeholder:text-gray-500 focus:border-pink-500/50 focus:ring-1 focus:ring-pink-500/30 outline-none transition-all"
            />
            <button
              type="submit"
              className="px-3.5 py-2 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white rounded-xl flex items-center justify-center transition-all cursor-pointer shadow-md hover:scale-105 active:scale-95"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </form>

      {/* Real-time Comments List */}
      <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-white/5 scrollbar-track-transparent">
        {loading ? (
          <div className="text-center py-4 text-xs text-gray-500 font-mono animate-pulse">
            Carregando discussões em tempo real... ⏳
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center py-6 border border-dashed border-white/5 bg-black/10 rounded-2xl">
            <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Sem comentários ainda. Seja o primeiro a opinar! 🚀</p>
          </div>
        ) : (
          comments.map((comment) => {
            const isPendingReview = comment.status === 'pending_review';
            return (
              <div 
                key={comment.id}
                className={`p-3 bg-black/20 border rounded-xl flex items-start gap-2.5 transition-all ${
                  isPendingReview 
                    ? 'border-yellow-500/20 bg-yellow-500/5 shadow-[inset_0_1px_10px_rgba(234,179,8,0.05)]' 
                    : 'border-white/5 hover:border-white/10'
                }`}
              >
                {comment.authorAvatar ? (
                  <img 
                    src={comment.authorAvatar} 
                    alt="Avatar" 
                    referrerPolicy="no-referrer"
                    className="w-7 h-7 rounded-full border border-white/5 bg-zinc-800 flex-shrink-0 select-none" 
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-zinc-900 border border-white/10 flex items-center justify-center text-gray-400 flex-shrink-0 select-none">
                    <User className="w-3.5 h-3.5" />
                  </div>
                )}

                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-sans font-black text-xs text-pink-400">
                        {comment.authorName}
                      </span>
                      {comment.authorId && (
                        <span className="text-[9px] font-mono bg-indigo-500/20 text-indigo-300 px-1.5 py-0.5 rounded border border-indigo-500/30 font-bold uppercase select-none">
                          Inscrito ✨
                        </span>
                      )}
                      {isPendingReview && (
                        <span className="text-[8px] font-mono bg-yellow-500/25 text-yellow-300 px-1.5 py-0.5 rounded border border-yellow-500/40 font-bold uppercase flex items-center gap-1 select-none">
                          <ShieldAlert className="w-2.5 h-2.5 animate-pulse" />
                          Sob Revisão
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 font-mono text-[9px] text-gray-500">
                      <Clock className="w-2.5 h-2.5" />
                      <span>{new Date(comment.createdAt).toLocaleDateString('pt-BR')}</span>
                      {isAdmin && (
                        <button
                          onClick={() => handleDeleteComment(comment.id)}
                          className="p-1 text-red-400 hover:text-white hover:bg-red-500/20 rounded transition-all cursor-pointer"
                          title="Excluir Comentário"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>

                  <p className="font-sans text-[11px] sm:text-xs text-gray-300 leading-relaxed break-words">
                    {comment.content}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

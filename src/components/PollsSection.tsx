import React, { useState, useEffect } from 'react';
import { collection, doc, onSnapshot, query, orderBy, updateDoc, increment } from 'firebase/firestore';
import { db } from '../firebase';
import { Poll, PollOption } from '../types';
import { playTapSound, playSuccessSound } from '../utils/audio';
import { useLanguage } from '../utils/LanguageContext';
import { motion, AnimatePresence } from 'motion/react';
import { BarChart3, Vote, AlertCircle, CheckCircle2, History } from 'lucide-react';

interface PollsSectionProps {
  onAddXP: (amount: number, reason: string) => void;
  isAdmin: boolean;
}

export default function PollsSection({ onAddXP, isAdmin }: PollsSectionProps) {
  const { t } = useLanguage();
  const [polls, setPolls] = useState<Poll[]>([]);
  const [loading, setLoading] = useState(true);
  const [votedPolls, setVotedPolls] = useState<string[]>([]);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  const [votingStatus, setVotingStatus] = useState<Record<string, 'idle' | 'voting' | 'success' | 'error'>>({});

  // Load voted polls from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('pkxd_voted_polls');
      if (saved) {
        setVotedPolls(JSON.parse(saved));
      }
    } catch (e) {
      console.warn("Could not parse voted polls from localStorage", e);
    }
  }, []);

  // Subscribe to polls from firestore
  useEffect(() => {
    const q = query(collection(db, 'polls'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const loadedPolls: Poll[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        loadedPolls.push({
          id: doc.id,
          question: data.question || '',
          options: data.options || [],
          createdAt: data.createdAt || Date.now(),
          isActive: data.isActive !== false,
          totalVotes: data.totalVotes || 0,
        });
      });
      setPolls(loadedPolls);
      setLoading(false);
    }, (err) => {
      console.error("Error listening to polls:", err);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleVote = async (pollId: string) => {
    const optionId = selectedOptions[pollId];
    if (!optionId) {
      playTapSound();
      alert(t('polls_must_vote_option'));
      return;
    }

    if (votedPolls.includes(pollId)) {
      playTapSound();
      return;
    }

    playTapSound();
    setVotingStatus(prev => ({ ...prev, [pollId]: 'voting' }));

    try {
      const pollRef = doc(db, 'polls', pollId);
      const poll = polls.find(p => p.id === pollId);
      if (!poll) throw new Error("Poll not found");

      // Build updated options list incrementing the specific option's votes
      const updatedOptions = poll.options.map((opt) => {
        if (opt.id === optionId) {
          return { ...opt, votes: (opt.votes || 0) + 1 };
        }
        return opt;
      });

      await updateDoc(pollRef, {
        options: updatedOptions,
        totalVotes: increment(1)
      });

      // Update local storage
      const newVoted = [...votedPolls, pollId];
      setVotedPolls(newVoted);
      localStorage.setItem('pkxd_voted_polls', JSON.stringify(newVoted));

      setVotingStatus(prev => ({ ...prev, [pollId]: 'success' }));
      playSuccessSound();

      // Give 50 XP reward to fan!
      onAddXP(50, 'Votou na Enquete de Atualização! 📊');
    } catch (err) {
      console.error("Error casting vote:", err);
      setVotingStatus(prev => ({ ...prev, [pollId]: 'error' }));
    }
  };

  const handleSelectOption = (pollId: string, optionId: string) => {
    playTapSound();
    setSelectedOptions(prev => ({ ...prev, [pollId]: optionId }));
  };

  // Helper to calculate percentage
  const getPercentage = (votes: number, total: number) => {
    if (!total) return 0;
    return Math.round((votes / total) * 100);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-zinc-400">
        <div className="w-8 h-8 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mb-4" />
        <span className="font-mono text-xs uppercase tracking-wider">Carregando Enquetes...</span>
      </div>
    );
  }

  const activePolls = polls.filter(p => p.isActive);
  const inactivePolls = polls.filter(p => !p.isActive);

  return (
    <section id="polls-section" className="bg-zinc-900/40 border border-white/5 rounded-3xl p-6 sm:p-8 space-y-8 text-left relative overflow-hidden">
      {/* Neon Glow elements */}
      <div className="absolute top-10 right-10 w-24 h-24 bg-cyan-500/5 rounded-full filter blur-2xl pointer-events-none" />
      <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-purple-500/5 rounded-full filter blur-2xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center gap-3 border-b border-white/5 pb-4">
        <div className="p-2.5 bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 rounded-2xl">
          <BarChart3 className="w-5 h-5 text-cyan-400" />
        </div>
        <div>
          <h3 className="font-sans font-black text-xl tracking-tight text-white uppercase flex items-center gap-2">
            {t('polls_title')}
          </h3>
          <p className="font-sans text-xs text-cyan-200">
            Dê o seu voto, expresse a sua opinião e decida as melhores ideias para o PK XD com o resto dos fãs! 🚀
          </p>
        </div>
      </div>

      {/* Active Polls Container */}
      <div className="space-y-6">
        {activePolls.length === 0 ? (
          <div className="p-8 text-center text-zinc-500 bg-black/10 rounded-2xl border border-white/5 italic">
            {t('polls_no_active')}
          </div>
        ) : (
          activePolls.map((poll) => {
            const alreadyVoted = votedPolls.includes(poll.id);
            const showResults = alreadyVoted;
            const currentSelected = selectedOptions[poll.id] || '';
            const status = votingStatus[poll.id] || 'idle';

            return (
              <div 
                key={poll.id} 
                className="bg-black/30 border border-white/5 rounded-2xl p-5 sm:p-6 space-y-4 shadow-inner relative group hover:border-cyan-500/20 transition-all duration-300"
              >
                {/* Active Tag */}
                <div className="flex items-center justify-between gap-2 border-b border-white/5 pb-3">
                  <span className="text-[10px] bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 px-2.5 py-1 rounded-md font-sans font-black uppercase tracking-wider flex items-center gap-1">
                    <Vote className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                    {t('polls_active')}
                  </span>
                  
                  {alreadyVoted && (
                    <span className="text-[10px] bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-2.5 py-1 rounded-md font-sans font-black uppercase tracking-wider flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      Votado
                    </span>
                  )}
                </div>

                {/* Question */}
                <h4 className="font-sans font-black text-white text-base sm:text-lg leading-snug">
                  {poll.question}
                </h4>

                {/* Options list */}
                <div className="space-y-3 pt-2">
                  <AnimatePresence mode="wait">
                    {showResults ? (
                      // Show results layout
                      <div className="space-y-3">
                        {poll.options.map((option) => {
                          const pct = getPercentage(option.votes || 0, poll.totalVotes);
                          return (
                            <div key={option.id} className="space-y-1">
                              <div className="flex justify-between text-xs text-zinc-300 font-sans font-bold px-1">
                                <span>{option.text}</span>
                                <span className="font-mono text-cyan-400 font-black">{pct}% ({option.votes || 0} {option.votes === 1 ? 'voto' : 'votos'})</span>
                              </div>
                              <div className="h-3.5 bg-zinc-950 rounded-full overflow-hidden border border-white/5 relative shadow-inner">
                                <motion.div 
                                  initial={{ width: 0 }}
                                  animate={{ width: `${pct}%` }}
                                  transition={{ duration: 0.8, ease: 'easeOut' }}
                                  className="h-full bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 rounded-full"
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      // Interactive voting layout
                      <div className="space-y-2">
                        {poll.options.map((option) => {
                          const isSelected = currentSelected === option.id;
                          return (
                            <button
                              key={option.id}
                              type="button"
                              onClick={() => handleSelectOption(poll.id, option.id)}
                              className={`w-full p-3.5 rounded-xl text-left text-xs font-sans font-bold flex items-center gap-3 transition-all duration-150 border cursor-pointer select-none ${
                                isSelected
                                  ? 'bg-cyan-500/10 border-cyan-400 text-cyan-350 shadow-md scale-[1.01]'
                                  : 'bg-zinc-950/40 border-white/5 text-zinc-400 hover:border-white/10 hover:bg-zinc-950/60'
                              }`}
                            >
                              <div className={`w-4.5 h-4.5 rounded-full border-2 flex items-center justify-center transition-all ${
                                isSelected ? 'border-cyan-400 bg-cyan-400/20' : 'border-zinc-700'
                              }`}>
                                {isSelected && <div className="w-2 h-2 bg-cyan-400 rounded-full" />}
                              </div>
                              <span>{option.text}</span>
                            </button>
                          );
                        })}

                        {/* Submit Button */}
                        <div className="pt-2 flex justify-end">
                          <button
                            type="button"
                            disabled={!currentSelected || status === 'voting'}
                            onClick={() => handleVote(poll.id)}
                            className="px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 disabled:opacity-40 disabled:pointer-events-none text-white font-sans font-black text-xs uppercase tracking-wider rounded-xl shadow-lg hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-2 cursor-pointer border border-white/10"
                          >
                            <Vote className="w-3.5 h-3.5" />
                            <span>{status === 'voting' ? 'Processando...' : t('polls_vote_btn')}</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Footer status */}
                <div className="flex items-center justify-between text-[10px] text-zinc-500 font-mono pt-3 border-t border-white/5">
                  <span>{poll.totalVotes} {t('polls_total_votes')}</span>
                  {alreadyVoted && (
                    <span className="text-emerald-400 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      {t('polls_vote_registered')}
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Closed Polls (History) */}
      {inactivePolls.length > 0 && (
        <div className="space-y-4 pt-4 border-t border-white/5">
          <h4 className="font-sans font-black text-sm text-zinc-400 uppercase tracking-widest flex items-center gap-2">
            <History className="w-4 h-4" />
            Histórico de Enquetes Encerradas
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {inactivePolls.map((poll) => (
              <div 
                key={poll.id} 
                className="bg-black/20 border border-white/5 rounded-2xl p-4.5 space-y-3 opacity-80 hover:opacity-100 transition-all duration-150"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[9px] bg-zinc-800 border border-zinc-700 text-zinc-400 px-2 py-0.5 rounded-md font-sans font-bold uppercase tracking-wider">
                    Encerrada
                  </span>
                  <span className="text-[9px] font-mono text-zinc-500">{poll.totalVotes} votos</span>
                </div>
                
                <h5 className="font-sans font-black text-sm text-zinc-300 leading-snug">
                  {poll.question}
                </h5>

                <div className="space-y-2.5 pt-1">
                  {poll.options.map((option) => {
                    const pct = getPercentage(option.votes || 0, poll.totalVotes);
                    return (
                      <div key={option.id} className="space-y-0.5">
                        <div className="flex justify-between text-[10px] text-zinc-400 font-sans font-medium px-0.5">
                          <span>{option.text}</span>
                          <span className="font-mono text-zinc-300">{pct}% ({option.votes || 0})</span>
                        </div>
                        <div className="h-2 bg-zinc-950 rounded-full overflow-hidden border border-white/5">
                          <div 
                            style={{ width: `${pct}%` }}
                            className="h-full bg-zinc-700 rounded-full"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

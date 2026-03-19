import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Loader2, AlertTriangle, Eye, EyeOff, Lightbulb, Target, Zap, Shield } from 'lucide-react';
import { DIFFICULTY_CONFIG, CATEGORY_CONFIG } from '../questions.js';
import Countdown from './Countdown.jsx';

export default function QuestionCard({ question, playerName, onPlayerNameChange, onSubmit, isSubmitting, submitError }) {
  const [answer, setAnswer] = useState('');
  const [showHint, setShowHint] = useState(false);
  const [answerVisible, setAnswerVisible] = useState(false);

  const diff = DIFFICULTY_CONFIG[question.difficulty] || DIFFICULTY_CONFIG.Moyen;
  const cat = CATEGORY_CONFIG[question.category] || CATEGORY_CONFIG['Logique'];

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(answer, () => setAnswer(''));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="relative"
    >
      <div
        className="absolute -inset-1 rounded-3xl opacity-30 blur-xl"
        style={{
          background: `radial-gradient(circle at 50% 0%, ${diff.ring}40 0%, transparent 70%)`,
        }}
      />
      
      <div
        className="relative rounded-3xl overflow-hidden"
        style={{
          background: 'linear-gradient(180deg, rgba(15,18,36,0.95) 0%, rgba(10,12,25,0.98) 100%)',
          border: `1px solid ${diff.ring}30`,
          boxShadow: `0 0 0 1px ${diff.ring}10, 0 25px 80px rgba(0,0,0,0.6)`,
        }}
      >
        <div
          className="h-1 w-full"
          style={{
            background: `linear-gradient(90deg, transparent, ${diff.ring}, transparent)`,
          }}
        />
        
        <div className="relative z-10 p-8 md:p-10">
          <div className="flex flex-wrap justify-between items-start gap-4 mb-8">
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-black/40 border border-slate-800/50">
                <Target size={14} className={cat?.color || 'text-slate-400'} />
                <span className="text-xs font-display font-semibold uppercase tracking-widest text-slate-300">
                  {question.category}
                </span>
              </div>
              <span className={`badge-difficulty ${diff.color} ${diff.bg} ${diff.border}`}
                style={{ boxShadow: `0 0 15px ${diff.glow}` }}>
                <Zap size={10} className="inline mr-1" />
                {question.difficulty} · {question.points} pts
              </span>
            </div>
            <Countdown endHour={question.end} />
          </div>

          <div className="mb-2">
            <div className="flex items-center gap-2">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center font-display font-bold text-lg"
                style={{
                  background: `linear-gradient(135deg, ${diff.ring}30, ${diff.ring}10)`,
                  border: `1px solid ${diff.ring}40`,
                  color: diff.ring,
                  boxShadow: `0 0 20px ${diff.glow}`,
                }}
              >
                {question.id}
              </div>
              <span className="text-xs font-display uppercase tracking-widest text-slate-500">
                Énigme #{question.id}
              </span>
            </div>
          </div>

          <div
            className="mb-8 p-8 rounded-2xl relative overflow-hidden"
            style={{
              background: 'linear-gradient(180deg, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.2) 100%)',
              border: `1px solid ${diff.ring}20`,
            }}
          >
            <div className="absolute inset-0 shimmer opacity-30" />
            <div className="absolute top-0 left-0 w-1 h-full" style={{ background: diff.ring }} />
            <p className="font-body text-xl md:text-2xl font-medium leading-relaxed text-slate-100 relative z-10 pl-3">
              {question.text}
            </p>
          </div>

          {question.hint && (
            <div className="mb-6">
              <button
                type="button"
                onClick={() => setShowHint(v => !v)}
                className="flex items-center gap-2 text-sm font-display font-semibold uppercase tracking-widest text-slate-500 hover:text-amber-400 transition-colors group"
              >
                <div className="p-1.5 rounded-lg bg-amber-500/10 group-hover:bg-amber-500/20 transition-colors">
                  <Lightbulb size={14} className="text-amber-400" />
                </div>
                {showHint ? 'Cacher l\'indice' : 'Besoin d\'un indice ?'}
              </button>
              <AnimatePresence>
                {showHint && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                    className="overflow-hidden"
                  >
                    <div className="mt-4 p-5 rounded-xl bg-amber-500/10 border border-amber-500/30"
                      style={{ boxShadow: '0 0 30px rgba(245,158,11,0.1)' }}>
                      <div className="flex items-start gap-3">
                        <Lightbulb size={18} className="text-amber-400 mt-0.5 flex-shrink-0" />
                        <p className="text-amber-200/90 text-base font-body leading-relaxed">
                          {question.hint}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-display font-bold uppercase tracking-widest text-slate-400 mb-3">
                <div className="flex items-center gap-2">
                  <Shield size={14} className="text-arena-cyan" />
                  Ton identité de Gladiateur
                </div>
              </label>
              <input
                type="text"
                required
                value={playerName}
                onChange={e => onPlayerNameChange(e.target.value)}
                className="arena-input"
                placeholder="Entre ton pseudo ou numéro WhatsApp…"
                autoComplete="nickname"
              />
            </div>

            <div>
              <label className="block text-sm font-display font-bold uppercase tracking-widest text-slate-400 mb-3">
                <div className="flex items-center gap-2">
                  <Trophy size={14} className="text-arena-gold" />
                  Ta solution secrète
                </div>
              </label>
              <div className="relative">
                <input
                  type={answerVisible ? 'text' : 'password'}
                  required
                  value={answer}
                  onChange={e => setAnswer(e.target.value)}
                  className="arena-input arena-input-gold pr-14"
                  placeholder="Écris ta réponse ici…"
                  autoComplete="off"
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setAnswerVisible(v => !v)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors p-1"
                  aria-label={answerVisible ? 'Masquer' : 'Afficher'}
                >
                  {answerVisible ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <p className="mt-2 text-xs text-slate-600 font-body flex items-center gap-1.5">
                <Eye size={11} />
                Masquée par défaut — les autres joueurs ne peuvent pas voir ta réponse
              </p>
            </div>

            <AnimatePresence>
              {submitError && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex items-center gap-3 p-4 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-400"
                  style={{ boxShadow: '0 0 20px rgba(244,63,94,0.15)' }}
                >
                  <AlertTriangle size={18} className="flex-shrink-0" />
                  <span className="font-body">{submitError}</span>
                </motion.div>
              )}
            </AnimatePresence>

            <button
              type="submit"
              disabled={isSubmitting || !playerName.trim() || !answer.trim()}
              className="btn-gold flex items-center justify-center gap-3 text-lg py-5"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={22} className="animate-spin" />
                  <span>Envoi en cours…</span>
                </>
              ) : (
                <>
                  <Trophy size={22} />
                  <span>Sceller ma réponse</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </motion.div>
  );
}

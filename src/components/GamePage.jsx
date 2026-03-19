import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Lock, AlertTriangle, Loader2, Eye, EyeOff, Lightbulb, Trophy, Shield, Target, Zap, Clock, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { DIFFICULTY_CONFIG, CATEGORY_CONFIG } from '../questions.js';
import Countdown from './Countdown.jsx';

export default function GamePage({
  activeQuestion,
  currentIndex,
  totalQuestions,
  playerName,
  onPlayerNameChange,
  onSubmit,
  isSubmitting,
  submitError,
  isCheckingSubmission,
  isSubmitted,
  onBackHome,
  onNextQuestion,
  onPrevQuestion,
  adminPassword,
  onAdminPasswordChange,
  onAdminSubmit,
}) {
  const [answer, setAnswer] = useState('');
  const [showHint, setShowHint] = useState(false);
  const [answerVisible, setAnswerVisible] = useState(false);

  const diff = activeQuestion ? (DIFFICULTY_CONFIG[activeQuestion.difficulty] || DIFFICULTY_CONFIG.Normal) : null;
  const cat = activeQuestion ? (CATEGORY_CONFIG[activeQuestion.category] || CATEGORY_CONFIG['Logique']) : null;

  const handleSubmitForm = (e) => {
    e.preventDefault();
    onSubmit(answer, () => setAnswer(''));
  };

  const handleAdminSubmit = (e) => {
    e.preventDefault();
    onAdminSubmit(e);
  };

  const handleNext = () => {
    setAnswer('');
    setShowHint(false);
    setAnswerVisible(false);
    onNextQuestion();
  };

  const handlePrev = () => {
    setAnswer('');
    setShowHint(false);
    setAnswerVisible(false);
    onPrevQuestion();
  };

  if (!activeQuestion) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-400 mb-6">L'arène est fermée pour le moment.</p>
        <button onClick={onBackHome} className="btn-secondary">
          Retour à l'accueil
        </button>
      </div>
    );
  }

  if (isCheckingSubmission) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="rounded-3xl p-16 text-center"
        style={{
          background: 'rgba(30, 27, 75, 0.5)',
          border: '1px solid rgba(91, 110, 245, 0.2)',
          backdropFilter: 'blur(16px)'
        }}
      >
        <div className="w-16 h-16 mx-auto rounded-2xl border-2 border-indigo-500/30 border-t-indigo-500 animate-spin mb-6"
          style={{ boxShadow: '0 0 30px rgba(91,110,245,0.3)' }} />
        <p className="text-slate-400 font-body text-lg">Vérification de ton statut…</p>
        <p className="text-slate-600 font-body text-sm mt-2">Préparation de l'arène</p>
      </motion.div>
    );
  }

  if (isSubmitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative"
      >
        <div
          className="absolute -inset-1 rounded-3xl opacity-50 blur-xl"
          style={{
            background: 'radial-gradient(circle at 50% 0%, rgba(16,185,129,0.6) 0%, transparent 70%)',
          }}
        />
        
        <div
          className="relative rounded-3xl p-10 text-center overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, rgba(30,27,75,0.7), rgba(20,20,50,0.8))',
            border: '1px solid rgba(16,185,129,0.3)',
            backdropFilter: 'blur(20px)',
            boxShadow: '0 25px 80px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)',
          }}
        >
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 150, damping: 15 }}
            className="w-32 h-32 mx-auto rounded-full flex items-center justify-center mb-6"
            style={{
              background: 'radial-gradient(circle, rgba(16,185,129,0.3) 0%, transparent 70%)',
              border: '2px solid rgba(16,185,129,0.4)',
              boxShadow: '0 0 80px rgba(16,185,129,0.4), inset 0 0 40px rgba(16,185,129,0.2)',
            }}
          >
            <Trophy size={56} className="text-emerald-400" />
          </motion.div>

          <h2 className="font-display text-4xl font-black mb-3" style={{
            background: 'linear-gradient(135deg, #4ade80 0%, #22c55e 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            Réponse Scellée !
          </h2>
          
          <p className="text-slate-300 text-lg mb-2">
            Bien joué,
          </p>
          <p className="text-2xl font-bold text-emerald-400 mb-6 font-display">
            {playerName || 'Gladiateur'} !
          </p>

          <div
            className="inline-flex items-center gap-3 px-6 py-3 rounded-2xl mb-8"
            style={{
              background: 'rgba(16,185,129,0.15)',
              border: '1px solid rgba(16,185,129,0.3)',
            }}
          >
            <Shield size={18} className="text-emerald-400" />
            <span className="text-emerald-400 font-display font-semibold">Réponse enregistrée</span>
          </div>

          <div className="flex justify-center gap-3">
            {currentIndex > 0 && (
              <button onClick={handlePrev} className="btn-secondary flex items-center gap-2">
                <ChevronLeft size={16} />
                Précédente
              </button>
            )}
            {currentIndex < totalQuestions - 1 ? (
              <button onClick={handleNext} className="btn-primary flex items-center gap-2">
                Question suivante
                <ChevronRight size={16} />
              </button>
            ) : (
              <button onClick={onBackHome} className="btn-secondary">
                Retour à l'accueil
              </button>
            )}
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="py-4">
      <button
        onClick={onBackHome}
        className="flex items-center gap-2 text-slate-500 hover:text-white transition-colors mb-6"
      >
        <ArrowLeft size={18} />
        <span className="font-display text-sm">Retour</span>
      </button>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative"
      >
        <div
          className="absolute -inset-1 rounded-3xl opacity-40 blur-xl"
          style={{
            background: `radial-gradient(circle at 50% 0%, ${diff?.ring || '#5b6ef5'}50 0%, transparent 70%)`,
          }}
        />
        
        <div
          className="relative rounded-3xl overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, rgba(30,27,75,0.6), rgba(20,20,50,0.7))',
            border: `1px solid ${diff?.ring || '#5b6ef5'}40`,
            backdropFilter: 'blur(20px)',
            boxShadow: '0 25px 80px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)',
          }}
        >
          <div
            className="h-1.5 w-full"
            style={{
              background: `linear-gradient(90deg, transparent, ${diff?.ring || '#5b6ef5'}, transparent)`,
            }}
          />
          
          <div className="relative z-10 p-8 md:p-10">
            <div className="flex flex-wrap justify-between items-start gap-4 mb-8">
              <div className="flex items-center gap-3 flex-wrap">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl" style={{
                  background: 'rgba(0,0,0,0.4)',
                  border: `1px solid ${diff?.ring || '#5b6ef5'}30`
                }}>
                  <Target size={14} className={cat?.color || 'text-slate-400'} />
                  <span className="text-xs font-display font-semibold uppercase tracking-widest text-slate-300">
                    {activeQuestion.category}
                  </span>
                </div>
                <span className={`badge-difficulty ${diff?.color} ${diff?.bg} ${diff?.border}`}>
                  <Zap size={10} className="inline mr-1" />
                  {activeQuestion.difficulty} · {activeQuestion.points} pt{activeQuestion.points > 1 ? 's' : ''}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs font-display text-slate-500">
                  {currentIndex + 1} / {totalQuestions}
                </span>
                <Countdown endHour={20} />
              </div>
            </div>

            <div className="mb-2">
              <div className="flex items-center gap-3">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center font-display font-black text-2xl"
                  style={{
                    background: `linear-gradient(135deg, ${diff?.ring || '#5b6ef5'}30, ${diff?.ring || '#5b6ef5'}15)`,
                    border: `2px solid ${diff?.ring || '#5b6ef5'}50`,
                    color: diff?.ring || '#5b6ef5',
                    boxShadow: `0 0 30px ${diff?.glow || 'rgba(91,110,245,0.3)'}`,
                  }}
                >
                  {activeQuestion.displayId || activeQuestion.id}
                </div>
                <div>
                  <span className="text-xs font-display uppercase tracking-widest text-slate-500">
                    Énigme
                  </span>
                  <div className="flex items-center gap-2">
                    <Sparkles size={14} className="text-arena-gold" />
                    <span className="text-lg font-display font-bold text-white">Question {activeQuestion.displayId || activeQuestion.id}</span>
                  </div>
                </div>
              </div>
            </div>

            <div
              className="mb-8 p-8 rounded-2xl relative overflow-hidden"
              style={{
                background: 'rgba(0,0,0,0.5)',
                border: `1px solid ${diff?.ring || '#5b6ef5'}20`,
              }}
            >
              <div className="absolute top-0 left-0 w-1.5 h-full" style={{ background: diff?.ring || '#5b6ef5' }} />
              <p className="font-body text-xl md:text-2xl font-medium leading-relaxed text-slate-100 relative z-10 pl-4">
                {activeQuestion.text}
              </p>
              {activeQuestion.options && (
                <div className="mt-4 space-y-2 pl-4">
                  {activeQuestion.options.map((opt, i) => (
                    <p key={i} className="text-slate-300 text-base font-body">{opt}</p>
                  ))}
                </div>
              )}
            </div>

            {activeQuestion.hint && (
              <div className="mb-6">
                <button
                  type="button"
                  onClick={() => setShowHint(v => !v)}
                  className="flex items-center gap-2 text-sm font-display font-semibold uppercase tracking-widest text-slate-500 hover:text-amber-400 transition-colors group"
                >
                  <div className="p-1.5 rounded-lg bg-amber-500/10 group-hover:bg-amber-500/20 transition-colors">
                    <Lightbulb size={14} className="text-amber-400" />
                  </div>
                  {showHint ? "Cacher l'indice" : "Besoin d'un indice ?"}
                </button>
                <AnimatePresence>
                  {showHint && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="mt-4 p-5 rounded-xl bg-amber-500/10 border border-amber-500/30">
                        <div className="flex items-start gap-3">
                          <Lightbulb size={18} className="text-amber-400 mt-0.5 flex-shrink-0" />
                          <p className="text-amber-200/90 text-base font-body leading-relaxed">
                            {activeQuestion.hint}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            <form onSubmit={handleSubmitForm} className="space-y-5">
              <div>
                <label className="block text-sm font-display font-bold uppercase tracking-widest text-slate-400 mb-3">
                  <div className="flex items-center gap-2">
                    <Shield size={14} style={{ color: '#22d3ee' }} />
                    Ton identité de Gladiateur
                  </div>
                </label>
                <input
                  type="text"
                  required
                  value={playerName}
                  onChange={e => onPlayerNameChange(e.target.value)}
                  className="arena-input"
                  placeholder="Entre ton pseudo…"
                  autoComplete="nickname"
                />
              </div>

              <div>
                <label className="block text-sm font-display font-bold uppercase tracking-widest text-slate-400 mb-3">
                  <div className="flex items-center gap-2">
                    <Trophy size={14} style={{ color: '#a855f7' }} />
                    Ta solution
                  </div>
                </label>
                <div className="relative">
                  <input
                    type={answerVisible ? 'text' : 'password'}
                    required
                    value={answer}
                    onChange={e => setAnswer(e.target.value)}
                    className="arena-input pr-14"
                    placeholder="Écris ta réponse ici…"
                    autoComplete="off"
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => setAnswerVisible(v => !v)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors p-1"
                  >
                    {answerVisible ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <AnimatePresence>
                {submitError && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex items-center gap-3 p-4 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-400"
                  >
                    <AlertTriangle size={18} className="flex-shrink-0" />
                    <span className="font-body">{submitError}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              <button
                type="submit"
                disabled={isSubmitting || !playerName.trim() || !answer.trim()}
                className="w-full py-5 text-lg font-display font-bold rounded-2xl flex items-center justify-center gap-3 transition-all disabled:opacity-50"
                style={{
                  background: 'linear-gradient(135deg, #5b6ef5 0%, #4f46e5 100%)',
                  color: 'white',
                  boxShadow: '0 8px 32px rgba(91, 110, 245, 0.4)',
                }}
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

      <div className="text-center mt-6">
        <form onSubmit={handleAdminSubmit} className="inline-flex items-center gap-2 opacity-30 hover:opacity-100 transition-opacity">
          <Lock size={12} className="text-slate-600" />
          <input
            type="password"
            value={adminPassword}
            onChange={e => onAdminPasswordChange(e.target.value)}
            placeholder="Admin"
            className="bg-transparent border-b border-slate-700 text-xs font-mono px-2 py-1 focus:outline-none text-slate-600 w-16 focus:border-indigo-500 focus:text-indigo-400 transition-colors"
          />
        </form>
      </div>
    </div>
  );
}

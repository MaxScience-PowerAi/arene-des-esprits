import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, ShieldAlert, Sparkles, Send, HelpCircle, Home } from 'lucide-react';
import { db } from '../firebase';
import { doc, setDoc } from 'firebase/firestore';
import { getLocalizedQuestionData } from '../questions';
import { t } from '../i18n';

const LOCAL_KEY = 'arene_player_pseudo';

// ── Clé de date locale (Africa/Douala) ────────────────────────────────────
// Ex : "22-03-2026" → chaque journée = nouvelle collection Firestore vide
// Les réponses de la veille disparaissent automatiquement sans rien faire
const getTodayKey = () =>
  new Date().toLocaleDateString('fr-FR', { timeZone: 'Africa/Douala' }).replace(/\//g, '-');

const QuestionCard = ({ user, question, onSubmited, onBack }) => {
  const savedPseudo = localStorage.getItem(LOCAL_KEY) || '';
  const [pseudo, setPseudo] = useState(savedPseudo);
  const [answer, setAnswer] = useState('');
  const [showAnswer, setShowAnswer] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const q = getLocalizedQuestionData(question);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!pseudo.trim() || !answer.trim() || !user) return;

    setLoading(true);
    setError('');

    try {
      const todayKey = getTodayKey();

      const data = {
        uid: user.uid,
        joueur: pseudo.trim(),
        reponse: answer.trim(),
        questionId: q.id,
        timestamp: Date.now(),
        dateKey: todayKey,
      };

      // ✅ Collection avec date du jour → reset automatique chaque matin
      // Ex : reponses_q1_22-03-2026  (hier c'était reponses_q1_21-03-2026)
      const ref = doc(
        db,
        `artifacts/${import.meta.env.VITE_ARENE_APP_ID}/public/data/reponses_q${q.id}_${todayKey}`,
        user.uid
      );
      await setDoc(ref, data);
      onSubmited();
    } catch (err) {
      console.error(err);
      if (err.message?.includes('permission-denied') || err.code === 'permission-denied') {
        setError(t('error_already_submitted'));
      } else {
        setError(t('error_network'));
      }
      setLoading(false);
    }
  };

  const difficultyColors = {
    'Facile': 'text-arena-success border-arena-success/30 bg-arena-success/10',
    'Easy': 'text-arena-success border-arena-success/30 bg-arena-success/10',
    'Moyen': 'text-arena-gold border-arena-gold/30 bg-arena-gold/10',
    'Medium': 'text-arena-gold border-arena-gold/30 bg-arena-gold/10',
    'Difficile': 'text-arena-danger border-arena-danger/30 bg-arena-danger/10',
    'Hard': 'text-arena-danger border-arena-danger/30 bg-arena-danger/10',
    'Expert': 'text-[#9333EA] border-[#9333EA]/30 bg-[#9333EA]/10',
  };

  const diffColor = difficultyColors[q.displayDifficulty || q.difficulty] || 'text-arena-primary border-arena-primary/30 bg-arena-primary/10';

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="w-full max-w-lg mx-auto p-4"
    >
      <div className="glass-card rounded-2xl overflow-hidden shadow-[0_10px_40px_rgba(0,0,0,0.8)] relative">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-arena-primary to-arena-secondary opacity-80" />

        <div className="p-6 sm:p-8">
          {/* Header Badges */}
          <div className="flex justify-between items-center mb-6">
            <span className="px-3 py-1 rounded-full border border-arena-border bg-[#03040E]/50 text-xs font-bold tracking-wider uppercase text-arena-textMuted flex items-center gap-2">
              <Sparkles className="w-3 h-3 text-arena-secondary" />
              {q.displayCategory}
            </span>
            <div className="flex items-center gap-2">
              <span className={`px-3 py-1 rounded-full border text-xs font-bold tracking-wider uppercase ${diffColor}`}>
                {q.difficulty}
              </span>
              <span className="px-3 py-1 rounded-full border border-arena-primary/30 bg-arena-primary/10 text-arena-primary text-xs font-bold tracking-wider">
                {q.points} {q.points > 1 ? t('points_label_plural') : t('points_label')}
              </span>
            </div>
          </div>

          {/* Question Text */}
          <div className="relative group mb-8">
            <h3 className="font-display text-xl sm:text-2xl font-bold text-arena-textMain leading-snug">
              {q.displayText}
            </h3>
          </div>

          {/* Hint Toggle */}
          <div className="mb-8">
            <button
              type="button"
              onClick={() => setShowHint(!showHint)}
              className="flex items-center gap-2 text-sm text-arena-textMuted hover:text-arena-secondary transition-colors group"
            >
              <HelpCircle className="w-4 h-4 group-hover:scale-110 transition-transform" />
              <span>{showHint ? t('hide_hint') : t('show_hint')}</span>
            </button>
            <AnimatePresence>
              {showHint && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <p className="mt-3 p-4 rounded-lg bg-arena-primary/5 border border-arena-primary/20 text-sm text-arena-textMain/80 italic border-l-2 border-l-arena-primary">
                    {q.displayHint}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Pseudo Input */}
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-widest text-arena-textMuted ml-1 flex items-center gap-2">
                {t('your_identity')}
                {savedPseudo && (
                  <span className="text-arena-success text-[10px] normal-case tracking-normal">✓ connecté</span>
                )}
              </label>
              <input
                type="text"
                required
                value={pseudo}
                onChange={(e) => setPseudo(e.target.value)}
                placeholder={t('pseudo_placeholder')}
                readOnly={!!savedPseudo}
                className={`w-full bg-[#03040E]/80 border border-arena-border rounded-xl px-4 py-3 text-base text-arena-textMain placeholder:text-arena-textMuted/50 focus:outline-none focus:border-arena-primary focus:ring-1 focus:ring-arena-primary transition-all font-body ${savedPseudo ? 'opacity-70 cursor-not-allowed' : ''}`}
              />
            </div>

            {/* Answer Input */}
            <div className="space-y-1 relative">
              <label className="text-xs font-bold uppercase tracking-widest text-arena-textMuted ml-1 flex justify-between items-end">
                <span>{t('your_solution')}</span>
                <span className="text-[10px] text-arena-textMuted/60 normal-case flex items-center gap-1">
                  <ShieldAlert className="w-3 h-3" /> {t('answer_hidden_hint')}
                </span>
              </label>
              <div className="relative">
                <input
                  type={showAnswer ? "text" : "password"}
                  required
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  placeholder={t('answer_placeholder')}
                  className="w-full bg-[#03040E]/80 border border-arena-border rounded-xl pl-4 pr-12 py-3 text-base text-arena-textMain placeholder:text-arena-textMuted/50 focus:outline-none focus:border-arena-secondary focus:ring-1 focus:ring-arena-secondary transition-all font-body"
                />
                <button
                  type="button"
                  onClick={() => setShowAnswer(!showAnswer)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-arena-textMuted hover:text-arena-textMain transition-colors p-1"
                >
                  {showAnswer ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {error && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-arena-danger bg-arena-danger/10 border border-arena-danger/30 p-3 rounded-lg text-center font-medium">
                {error}
              </motion.div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !pseudo.trim() || !answer.trim()}
              className="w-full relative overflow-hidden group bg-arena-primary hover:bg-indigo-500 text-white font-bold tracking-wide py-4 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-4 shadow-[0_0_20px_rgba(99,102,241,0.4)] hover:shadow-[0_0_30px_rgba(99,102,241,0.6)] uppercase"
            >
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
              <div className="relative flex items-center justify-center gap-2">
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>{t('submitting')}</span>
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    <span>{t('submit_button')}</span>
                  </>
                )}
              </div>
            </button>

            {/* Bouton retour */}
            {onBack && (
              <button
                type="button"
                onClick={onBack}
                className="w-full flex items-center justify-center gap-2 text-xs text-arena-textMuted hover:text-white transition-colors uppercase tracking-widest font-bold py-2"
              >
                <Home className="w-4 h-4" />
                Retour à l'accueil
              </button>
            )}
          </form>
        </div>
      </div>
    </motion.div>
  );
};

export default QuestionCard;

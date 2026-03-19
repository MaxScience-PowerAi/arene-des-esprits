import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Play, Crown, Star, Clock, Zap, ChevronRight, Shield, Trophy, Target, Lock, Sparkles, Quote } from 'lucide-react';
import { QUESTIONS_DU_JOUR, getCurrentHour, RECAP_HOUR, QUOTES, shuffleArray } from '../questions.js';

export default function HomePage({ onPlayNow, gameActive, onAdminSubmit, adminPassword, onAdminPasswordChange }) {
  const currentHour = getCurrentHour();
  const isArenaOpen = gameActive;
  const timeUntilRecap = RECAP_HOUR - currentHour;
  
  const logoUrl = '/logo-arene.svg';
  
  const quote = useMemo(() => {
    const shuffled = shuffleArray(QUOTES);
    return shuffled[0];
  }, []);
  
  const handleSubmit = (e) => {
    e.preventDefault();
    onAdminSubmit(e);
  };
  
  return (
    <div className="py-8">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center mb-10"
      >
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 100, damping: 10 }}
          className="relative inline-block mb-8"
        >
          <div 
            className="w-44 h-44 mx-auto rounded-full flex items-center justify-center overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #1e3a8a 100%)',
              border: '3px solid #fbbf24',
              boxShadow: '0 0 60px rgba(251,191,36,0.3), 0 0 120px rgba(91,110,245,0.2), inset 0 0 60px rgba(91,110,245,0.3)',
            }}
          >
            <img 
              src={logoUrl} 
              alt="L'Arène des Esprits" 
              className="w-36 h-36 object-contain"
              style={{ filter: 'drop-shadow(0 0 20px rgba(251,191,36,0.5))' }}
            />
          </div>
          <div className="absolute -top-2 -right-2">
            <Sparkles className="text-arena-gold animate-pulse" size={24} />
          </div>
        </motion.div>

        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="h-px w-16 bg-gradient-to-r from-transparent to-arena-gold/50" />
          <Crown size={18} className="text-arena-gold" />
          <div className="h-px w-16 bg-gradient-to-l from-transparent to-arena-gold/50" />
        </div>
        
        <h1 className="font-display text-5xl md:text-6xl font-black mb-4 leading-none tracking-tight">
          <span style={{ 
            background: 'linear-gradient(135deg, #fef3c7 0%, #fbbf24 50%, #d97706 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>L'ARÈNE</span>
          <br />
          <span style={{ 
            background: 'linear-gradient(135deg, #e0e7ff 0%, #818cf8 50%, #6366f1 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>DES ESPRITS</span>
        </h1>
        
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border mb-4"
          style={{
            background: 'linear-gradient(135deg, rgba(34,197,94,0.15), rgba(16,185,129,0.1))',
            borderColor: 'rgba(34,197,94,0.3)'
          }}>
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-display font-bold text-xs uppercase tracking-widest text-emerald-400">
            Cameroun Edition
          </span>
        </div>
        
        <div className="max-w-lg mx-auto mt-6 p-4 rounded-xl border"
          style={{
            background: 'rgba(30,27,75,0.4)',
            borderColor: 'rgba(168,85,247,0.2)'
          }}>
          <div className="flex items-start gap-2">
            <Quote size={16} className="text-violet-400 mt-0.5 flex-shrink-0 rotate-180" />
            <p className="text-slate-300 text-sm font-light italic leading-relaxed text-left">
              "{quote.text}"
            </p>
          </div>
          <p className="text-right text-xs text-slate-500 mt-2 font-display">
            — {quote.author}
          </p>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="grid grid-cols-3 gap-3 mb-8"
      >
        <div className="rounded-2xl p-5 text-center" style={{
          background: 'linear-gradient(135deg, rgba(30,27,75,0.6), rgba(30,27,75,0.4))',
          border: '1px solid rgba(91,110,245,0.25)',
          boxShadow: '0 10px 40px rgba(0,0,0,0.3)'
        }}>
          <div className="w-12 h-12 mx-auto rounded-xl flex items-center justify-center mb-3" style={{
            background: 'linear-gradient(135deg, rgba(91,110,245,0.3), rgba(91,110,245,0.1))',
            border: '1px solid rgba(91,110,245,0.3)'
          }}>
            <Target size={22} className="text-indigo-400" />
          </div>
          <h3 className="font-display font-bold text-white text-lg">5</h3>
          <p className="text-slate-500 text-xs mt-1">Énigmes</p>
        </div>
        
        <div className="rounded-2xl p-5 text-center" style={{
          background: 'linear-gradient(135deg, rgba(30,27,75,0.6), rgba(30,27,75,0.4))',
          border: '1px solid rgba(251,191,36,0.25)',
          boxShadow: '0 10px 40px rgba(0,0,0,0.3)'
        }}>
          <div className="w-12 h-12 mx-auto rounded-xl flex items-center justify-center mb-3" style={{
            background: 'linear-gradient(135deg, rgba(251,191,36,0.3), rgba(251,191,36,0.1))',
            border: '1px solid rgba(251,191,36,0.3)'
          }}>
            <Trophy size={22} className="text-arena-gold" />
          </div>
          <h3 className="font-display font-bold text-white text-lg">1-5</h3>
          <p className="text-slate-500 text-xs mt-1">Points</p>
        </div>
        
        <div className="rounded-2xl p-5 text-center" style={{
          background: 'linear-gradient(135deg, rgba(30,27,75,0.6), rgba(30,27,75,0.4))',
          border: '1px solid rgba(34,211,238,0.25)',
          boxShadow: '0 10px 40px rgba(0,0,0,0.3)'
        }}>
          <div className="w-12 h-12 mx-auto rounded-xl flex items-center justify-center mb-3" style={{
            background: 'linear-gradient(135deg, rgba(34,211,238,0.3), rgba(34,211,238,0.1))',
            border: '1px solid rgba(34,211,238,0.3)'
          }}>
            <Shield size={22} className="text-cyan-400" />
          </div>
          <h3 className="font-display font-bold text-white text-lg">20h</h3>
          <p className="text-slate-500 text-xs mt-1">Récap</p>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="rounded-2xl p-4 mb-6"
        style={{
          background: 'linear-gradient(135deg, rgba(30,27,75,0.5), rgba(30,27,75,0.3))',
          border: '1px solid rgba(91,110,245,0.2)',
        }}
      >
        <div className="flex items-center gap-2 mb-3">
          <Star size={12} className="text-arena-gold" />
          <span className="text-[10px] font-display uppercase tracking-widest text-slate-500">Difficulté</span>
        </div>
        <div className="flex justify-between gap-1">
          {QUESTIONS_DU_JOUR.map((q) => {
            const diff = {
              'Normal': '#10b981',
              'Normal+': '#14b8a6',
              'Difficile': '#f59e0b',
              'Difficile+': '#f97316',
              'Expert': '#f43f5e'
            }[q.difficulty] || '#5b6ef5';
            return (
              <div key={q.id} className="flex-1 text-center">
                <div 
                  className="w-8 h-8 mx-auto rounded-lg flex items-center justify-center text-xs font-bold mb-1"
                  style={{
                    background: `${diff}20`,
                    border: `1px solid ${diff}40`,
                    color: diff
                  }}
                >
                  {q.points}
                </div>
                <div className="text-[9px] text-slate-600 truncate">{q.difficulty}</div>
              </div>
            );
          })}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="rounded-3xl p-8 mb-6 relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, rgba(30,27,75,0.5), rgba(20,20,50,0.6))',
          border: '1px solid rgba(91,110,245,0.3)',
          boxShadow: '0 20px 60px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)'
        }}
      >
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            background: 'radial-gradient(circle at 50% 0%, rgba(91,110,245,0.5) 0%, transparent 50%)'
          }} />
        </div>
        
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${isArenaOpen ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'}`} />
              <span className={`font-display font-semibold text-sm ${isArenaOpen ? 'text-emerald-400' : 'text-slate-500'}`}>
                {isArenaOpen ? 'Arène Ouverte' : 'Arène Fermée'}
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <Clock size={14} className="text-slate-500" />
              <span className="font-display font-bold text-xs" style={{ color: '#a5b4fc' }}>
                Récap {RECAP_HOUR}h00
              </span>
            </div>
          </div>
          
          {isArenaOpen ? (
            <motion.button
              onClick={onPlayNow}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-5 text-xl font-display font-bold rounded-2xl flex items-center justify-center gap-4 transition-all"
              style={{
                background: 'linear-gradient(135deg, #5b6ef5 0%, #4f46e5 50%, #4338ca 100%)',
                boxShadow: '0 10px 40px rgba(91,110,245,0.5), inset 0 1px 0 rgba(255,255,255,0.2)',
                color: 'white'
              }}
            >
              <Trophy size={26} />
              <span>Entrer dans l'Arène</span>
              <ChevronRight size={26} />
            </motion.button>
          ) : (
            <div className="text-center py-6">
              <div className="w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4" style={{
                background: 'rgba(91,110,245,0.1)',
                border: '1px solid rgba(91,110,245,0.2)'
              }}>
                <Zap size={28} className="text-indigo-400" />
              </div>
              <p className="text-slate-400 font-body mb-2">
                L'Arène ouvre à <span className="font-bold text-white">8h00</span>
              </p>
              <p className="text-slate-600 text-sm">
                {currentHour >= 20 ? 'Le récap est disponible !' : `Récapitulatif dans ${timeUntilRecap} heures`}
              </p>
            </div>
          )}
        </div>
      </motion.div>

      <div className="text-center">
        <form onSubmit={handleSubmit} className="inline-flex items-center gap-2 opacity-25 hover:opacity-100 transition-opacity duration-300">
          <Lock size={12} className="text-slate-600" />
          <input
            type="password"
            value={adminPassword}
            onChange={e => onAdminPasswordChange(e.target.value)}
            placeholder="Admin"
            className="bg-transparent border-b border-slate-700 text-xs font-mono px-2 py-1 focus:outline-none text-slate-600 w-16 focus:border-indigo-500 focus:text-indigo-400 transition-colors"
          />
          <button type="submit" className="text-slate-600 hover:text-indigo-400 transition-colors">
            <ChevronRight size={14} />
          </button>
        </form>
      </div>
    </div>
  );
}

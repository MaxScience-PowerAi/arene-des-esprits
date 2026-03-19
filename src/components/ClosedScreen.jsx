import React from 'react';
import { motion } from 'framer-motion';
import { Clock, Sparkles, Zap, Swords, Crown } from 'lucide-react';
import { QUESTIONS_DU_JOUR, getCurrentHour, getNextSlotTime } from '../questions.js';

export default function ClosedScreen() {
  const currentHour = getCurrentHour();
  const nextSlot = getNextSlotTime();
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="relative"
    >
      <div
        className="absolute -inset-1 rounded-3xl opacity-20 blur-xl"
        style={{
          background: 'radial-gradient(circle at 50% 30%, rgba(91,110,245,0.3) 0%, transparent 70%)',
        }}
      />
      
      <div
        className="relative rounded-3xl p-10 text-center overflow-hidden"
        style={{
          background: 'linear-gradient(180deg, rgba(15,18,36,0.9) 0%, rgba(10,12,25,0.95) 100%)',
          border: '1px solid rgba(30,34,64,0.8)',
          boxShadow: '0 25px 80px rgba(0,0,0,0.5)',
        }}
      >
        <div
          className="absolute top-0 left-0 right-0 h-0.5"
          style={{
            background: 'linear-gradient(90deg, transparent, rgba(91,110,245,0.5), transparent)',
          }}
        />
        
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
          <div className="w-80 h-80 rounded-full border border-arena-border/10 animate-pulse-slow" />
          <div className="absolute w-60 h-60 rounded-full border border-arena-accent/5 animate-pulse-slow" style={{ animationDelay: '1s' }} />
          <div className="absolute w-40 h-40 rounded-full border border-arena-gold/5 animate-pulse-slow" style={{ animationDelay: '2s' }} />
        </div>

        <div className="relative z-10">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="inline-flex items-center justify-center w-24 h-24 rounded-2xl mb-8 relative"
            style={{
              background: 'linear-gradient(135deg, rgba(91,110,245,0.2) 0%, rgba(168,85,247,0.1) 100%)',
              border: '1px solid rgba(245,158,11,0.2)',
              boxShadow: '0 0 60px rgba(91,110,245,0.2)',
            }}
          >
            <Swords size={40} className="text-arena-gold" />
            <div className="absolute -inset-1 rounded-2xl border border-arena-gold/10 animate-border-glow" />
          </motion.div>

          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="h-px w-12 bg-gradient-to-r from-transparent to-arena-gold/50" />
            <Crown size={18} className="text-arena-gold" />
            <h2 className="font-display text-4xl font-bold text-white">
              L'Arène est Fermée
            </h2>
            <Crown size={18} className="text-arena-gold" />
            <div className="h-px w-12 bg-gradient-to-l from-transparent to-arena-gold/50" />
          </div>
          
          <p className="text-slate-400 leading-relaxed mb-10 max-w-md mx-auto text-lg font-body">
            Les esprits se reposent. La prochaine épreuve commence dans{' '}
            <span className="text-arena-gold font-display font-bold">{nextSlot.minutes} minutes</span>.
          </p>

          <div
            className="inline-flex items-center gap-3 px-6 py-3 rounded-2xl mb-8"
            style={{
              background: 'rgba(245,158,11,0.1)',
              border: '1px solid rgba(245,158,11,0.2)',
            }}
          >
            <Zap size={18} className="text-arena-gold" />
            <span className="text-arena-gold font-display font-semibold">
              Prochain créneau : {nextSlot.hour}h00
            </span>
          </div>

          <div className="space-y-3">
            <p className="text-xs font-display uppercase tracking-widest text-slate-600 mb-4">
              Programme du jour
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              {QUESTIONS_DU_JOUR.map(q => {
                const past = currentHour >= q.end;
                const active = currentHour >= q.start && currentHour < q.end;
                const isNext = q.start > currentHour && (!nextSlot || q.start === nextSlot.hour);
                
                return (
                  <motion.div
                    key={q.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 * q.id }}
                    className={`relative px-4 py-2.5 rounded-xl border transition-all ${
                      active
                        ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400'
                        : past
                        ? 'bg-slate-800/40 border-slate-700/30 text-slate-600'
                        : isNext
                        ? 'bg-arena-gold/20 border-arena-gold/50 text-arena-gold'
                        : 'bg-slate-800/60 border-arena-border text-slate-400'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-display font-bold text-sm">
                        Q{q.id}
                      </span>
                      <span className="text-xs opacity-70">
                        {q.start}h–{q.end}h
                      </span>
                      {active && (
                        <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      )}
                      {isNext && !active && (
                        <Sparkles size={10} className="text-arena-gold" />
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
          
          <div className="mt-8 pt-6 border-t border-arena-border/30">
            <div className="flex items-center justify-center gap-2 text-slate-600 text-sm font-body">
              <Clock size={14} />
              <span>Reviens à {nextSlot.hour}h00 pour le prochain défi</span>
              <Sparkles size={14} className="text-arena-gold" />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

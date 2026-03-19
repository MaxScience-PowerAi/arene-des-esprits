import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Shield, Clock, Sparkles, Trophy, Zap } from 'lucide-react';

export default function SuccessScreen({ playerName, nextHour }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="relative"
    >
      <div
        className="absolute -inset-1 rounded-3xl opacity-40 blur-xl"
        style={{
          background: 'radial-gradient(circle at 50% 0%, rgba(16,185,129,0.5) 0%, transparent 70%)',
        }}
      />
      
      <div
        className="relative rounded-3xl p-10 text-center overflow-hidden"
        style={{
          background: 'linear-gradient(180deg, rgba(15,18,36,0.95) 0%, rgba(10,12,25,0.98) 100%)',
          border: '1px solid rgba(16,185,129,0.25)',
          boxShadow: '0 0 0 1px rgba(16,185,129,0.1), 0 25px 80px rgba(0,0,0,0.5), 0 0 60px rgba(16,185,129,0.1)',
        }}
      >
        <div
          className="absolute top-0 left-0 right-0 h-1"
          style={{
            background: 'linear-gradient(90deg, transparent, #10b981, transparent)',
          }}
        />
        
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.1, type: 'spring', stiffness: 200, damping: 15 }}
          className="relative z-10 mb-8"
        >
          <div
            className="w-32 h-32 mx-auto rounded-full flex items-center justify-center"
            style={{
              background: 'radial-gradient(circle, rgba(16,185,129,0.2) 0%, transparent 70%)',
              border: '1px solid rgba(16,185,129,0.3)',
              boxShadow: '0 0 60px rgba(16,185,129,0.3)',
            }}
          >
            <CheckCircle2 size={64} className="text-emerald-400" />
          </div>
          
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 rounded-full bg-emerald-400"
              style={{ left: '50%', top: '50%' }}
              initial={{ x: 0, y: 0, opacity: 1 }}
              animate={{
                x: Math.cos(i * Math.PI / 4) * 100,
                y: Math.sin(i * Math.PI / 4) * 100,
                opacity: 0,
              }}
              transition={{ duration: 1.5, delay: 0.2 + i * 0.05 }}
            />
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          className="relative z-10"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <Trophy size={24} className="text-arena-gold" />
            <h2 className="font-display text-4xl font-bold gradient-text-gold">
              Réponse Scellée !
            </h2>
            <Trophy size={24} className="text-arena-gold" />
          </div>
          
          <p className="text-slate-300 mb-3 text-lg font-body leading-relaxed">
            Mission accomplie,{' '}
            <span className="text-emerald-400 font-bold font-display">{playerName || 'Gladiateur'}</span>.
          </p>
          <p className="text-slate-500 text-sm mb-8 font-body">
            Ta solution est chiffrée et protégée. Les autres joueurs ne peuvent pas la voir.
          </p>

          <div
            className="inline-flex items-center gap-3 px-6 py-3 rounded-2xl"
            style={{
              background: 'rgba(16,185,129,0.1)',
              border: '1px solid rgba(16,185,129,0.25)',
            }}
          >
            <Shield size={18} className="text-emerald-400" />
            <span className="text-emerald-400 font-display font-semibold">Réponse enregistrée avec succès</span>
            <Sparkles size={16} className="text-emerald-400 animate-pulse" />
          </div>

          <div
            className="mt-8 p-6 rounded-2xl"
            style={{
              background: 'linear-gradient(180deg, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.2) 100%)',
              border: '1px solid rgba(30,34,64,0.8)',
            }}
          >
            <div className="flex items-center justify-center gap-3 mb-3">
              <Clock size={20} className="text-arena-accent" />
              <p className="text-xs font-display uppercase tracking-widest text-slate-500">Prochaine énigme</p>
            </div>
            <div className="flex items-center justify-center gap-2 text-white">
              <span className="font-display text-3xl font-bold gradient-text">{nextHour}h00</span>
              <Zap size={20} className="text-arena-gold" />
            </div>
            <p className="text-xs text-slate-600 mt-2 font-body">Reviens pour le prochain défi</p>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

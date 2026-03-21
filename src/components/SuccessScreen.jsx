import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, ArrowRight } from 'lucide-react';
import { t } from '../i18n';
import Countdown from './Countdown';

const SuccessScreen = ({ nextQuestion }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center w-full max-w-md mx-auto min-h-[60vh] px-4"
    >
      <div className="glass-card w-full p-8 rounded-2xl flex flex-col items-center text-center relative overflow-hidden">
        {/* Glow background effect */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 bg-arena-success/20 blur-[50px] rounded-full pointer-events-none" />

        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", bounce: 0.5, duration: 0.8 }}
          className="w-20 h-20 bg-arena-success/10 border-2 border-arena-success rounded-full flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(16,185,129,0.3)]"
        >
          <ShieldCheck className="w-10 h-10 text-arena-success" />
        </motion.div>
        
        <h2 className="font-display text-3xl font-bold mb-2 text-white uppercase tracking-wider">
          {t('success_title')}
        </h2>
        
        <div className="mb-8">
          <p className="text-arena-textMain font-medium mb-1">{t('success_body')}</p>
          <p className="text-arena-textMuted text-sm">{t('success_sub')}</p>
        </div>

        <div className="w-full flex items-center gap-2 justify-center bg-[#03040E]/50 border border-arena-border rounded-lg p-3 mb-8">
          <div className="w-2 h-2 rounded-full bg-arena-success animate-pulse" />
          <span className="text-sm font-mono text-arena-textMuted uppercase tracking-wider">{t('sealed_badge')}</span>
        </div>

        {nextQuestion ? (
          <div className="w-full pt-6 border-t border-arena-border/50 flex flex-col items-center">
            <p className="font-mono text-xs text-arena-secondary mb-4 uppercase tracking-wider">
              {t('next_riddle_at')} {String(nextQuestion.start).padStart(2, '0')}h00 :
            </p>
            <Countdown targetTimeObj={{ h: nextQuestion.start, m: 0 }} />
          </div>
        ) : (
          <div className="w-full pt-6 border-t border-arena-border/50 flex flex-col items-center">
            <p className="font-display font-bold text-arena-gold uppercase tracking-widest flex items-center gap-2">
              {t('next_riddle_end')} <ArrowRight className="w-4 h-4" />
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default SuccessScreen;

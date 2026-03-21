import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Brain } from 'lucide-react';
import { t, LANG } from '../i18n';

const LoadingScreen = ({ messageKey = "checking_status" }) => {
  useEffect(() => {
    document.documentElement.lang = LANG;
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 flex flex-col items-center justify-center z-50 bg-arena-bg"
    >
      <div className="relative mb-8">
        <div className="absolute inset-0 rounded-full blur-[30px] bg-arena-primary/30 animate-glowPulse" />
        <div className="w-24 h-24 rounded-full border border-arena-primary/30 flex items-center justify-center relative bg-arena-card">
          <Brain className="w-10 h-10 text-arena-primary animate-pulse" />
          
          {/* Rotating ring */}
          <div className="absolute inset-0 rounded-full border-t border-arena-primary/60 animate-spin" style={{ animationDuration: '2s' }} />
          <div className="absolute inset-[-8px] rounded-full border-b border-arena-secondary/40 animate-spin" style={{ animationDuration: '3s', animationDirection: 'reverse' }} />
        </div>
      </div>
      
      <h2 className="font-display font-bold text-xl tracking-widest text-arena-textMain mb-2 uppercase text-center">
        {t('app_title')}
      </h2>
      <p className="font-mono text-sm text-arena-textMuted max-w-xs text-center animate-pulse">
        {t(messageKey)}
      </p>
    </motion.div>
  );
};

export default LoadingScreen;

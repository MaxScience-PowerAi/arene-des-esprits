import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Brain } from 'lucide-react';
import { t } from '../i18n';

const LandingScreen = ({ onEnter, onSecretClick }) => {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.1, filter: "blur(10px)" }}
      transition={{ duration: 0.8, ease: "easeInOut" }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center p-4 overflow-hidden"
    >
      {/* Background specific to landing for extra depth */}
      <div className="absolute inset-0 bg-[#03040E] z-[-2]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.15)_0%,rgba(3,4,14,1)_70%)] z-[-1]" />

      <motion.div 
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.8 }}
        className="flex flex-col items-center text-center max-w-2xl"
      >
        <button 
          onClick={onSecretClick}
          className="relative mb-8 group focus:outline-none"
          title="Secret Access"
        >
          <div className="absolute inset-0 bg-arena-primary blur-[40px] opacity-30 group-hover:opacity-50 transition-opacity duration-1000 rounded-full" />
          <div className="w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden border-4 border-arena-secondary/50 shadow-[0_0_40px_rgba(34,211,238,0.4)] relative z-10 bg-[#080C1A] flex items-center justify-center">
            <img 
              src="/logo.png" 
              alt="Logo Arène des Esprits" 
              className="w-full h-full object-cover object-[center_38%] scale-[1.35]"
              onError={(e) => {
                e.target.onerror = null;
                e.target.style.display = 'none';
                e.target.nextElementSibling.style.display = 'block';
              }}
            />
            <Brain className="w-16 h-16 text-arena-textMuted hidden" />
          </div>
        </button>

        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="font-mono text-arena-secondary tracking-[0.5em] text-xs md:text-sm uppercase mb-4"
        >
          {t('landing_welcome')}
        </motion.p>
        
        <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-b from-white to-arena-textMuted mb-6 leading-tight [text-wrap:balance]">
          {t('app_title')}
        </h1>

        <p className="text-arena-textMuted text-sm md:text-base mb-12 max-w-lg leading-relaxed font-body">
          {t('landing_desc')}
        </p>

        <motion.button
          onClick={onEnter}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="relative group overflow-hidden rounded-full bg-arena-primary px-8 py-4 md:px-12 md:py-5 flex items-center justify-center gap-3 transition-all hover:shadow-[0_0_40px_rgba(99,102,241,0.6)]"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-arena-primary via-indigo-400 to-arena-primary opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <span className="relative z-10 font-bold uppercase tracking-widest text-white text-sm md:text-base">
            {t('landing_enter')}
          </span>
          <ArrowRight className="relative z-10 w-5 h-5 text-white group-hover:translate-x-1 transition-transform" />
        </motion.button>
      </motion.div>
    </motion.div>
  );
};

export default LandingScreen;

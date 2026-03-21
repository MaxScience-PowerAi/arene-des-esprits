import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Brain, Swords, Trophy, Target, BookOpen, Shield, ShieldCheck } from 'lucide-react';
import { t } from '../i18n';

const LandingScreen = ({ onEnter, onSecretClick }) => {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.05, filter: "blur(10px)" }}
      transition={{ duration: 0.8, ease: "easeInOut" }}
      className="fixed inset-0 z-50 overflow-y-auto overflow-x-hidden bg-[#03040E] font-body"
    >
      {/* Background gradients for depth */}
      <div className="fixed top-0 inset-x-0 h-screen bg-[radial-gradient(ellipse_at_top,rgba(34,211,238,0.1)_0%,rgba(3,4,14,1)_70%)] z-[-1] pointer-events-none" />
      
      <div className="flex flex-col items-center w-full max-w-4xl mx-auto px-4 py-12 md:py-20 pb-40">
        
        {/* HERO SECTION */}
        <motion.div 
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.8 }}
          className="flex flex-col items-center text-center w-full mb-16"
        >
          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-b from-white via-gray-200 to-gray-500 mb-6 leading-tight drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]">
            {t('app_title')}
          </h1>
          <h2 className="font-mono text-arena-secondary tracking-[0.2em] sm:tracking-[0.4em] text-xs sm:text-sm md:text-base uppercase font-bold text-center mt-2 px-4 py-3 border-y border-arena-secondary/30 bg-arena-secondary/5 rounded-lg shadow-[0_0_20px_rgba(34,211,238,0.1)] w-full max-w-2xl">
            {t('landing_subtitle')}
          </h2>
        </motion.div>

        {/* SECTION: À PROPOS */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="w-full text-left md:text-center mb-16 px-2 sm:px-4"
        >
          <h3 className="font-display text-2xl font-bold uppercase tracking-widest text-white mb-3">{t('landing_about_title')}</h3>
          <p className="text-arena-textMuted text-sm md:text-base leading-relaxed mb-6 max-w-2xl mx-auto whitespace-pre-line">
            {t('landing_about_desc')}
          </p>
          <ul className="flex flex-col gap-3 sm:gap-4 max-w-xl mx-auto text-left w-full">
            <li className="flex items-center gap-4 bg-white/5 p-4 rounded-xl border border-white/10 hover:bg-white/10 transition-colors">
              <Brain className="w-6 h-6 text-arena-secondary shrink-0" />
              <span className="font-bold text-xs sm:text-sm tracking-wide text-gray-200">{t('landing_about_b1')}</span>
            </li>
            <li className="flex items-center gap-4 bg-white/5 p-4 rounded-xl border border-white/10 hover:bg-white/10 transition-colors">
              <Swords className="w-6 h-6 text-arena-danger shrink-0" />
              <span className="font-bold text-xs sm:text-sm tracking-wide text-gray-200">{t('landing_about_b2')}</span>
            </li>
            <li className="flex items-center gap-4 bg-white/5 p-4 rounded-xl border border-arena-gold/30 shadow-[0_0_15px_rgba(250,204,21,0.1)] hover:shadow-[0_0_25px_rgba(250,204,21,0.2)] transition-shadow">
              <Trophy className="w-6 h-6 text-arena-gold shrink-0" />
              <span className="font-bold text-xs sm:text-sm tracking-wide text-gray-200">{t('landing_about_b3')}</span>
            </li>
          </ul>
        </motion.div>

        {/* SECTION: L'EMBLÈME (LOGO) */}
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.5, duration: 1 }}
          className="w-full flex justify-center mb-16 relative"
        >
          <button 
            onClick={onSecretClick}
            className="relative group focus:outline-none"
            title="Secret Access"
          >
            <div className="absolute inset-[-20px] bg-arena-secondary blur-[50px] opacity-20 group-hover:opacity-50 transition-opacity duration-1000 rounded-full pointer-events-none" />
            <div className="w-56 h-56 md:w-72 md:h-72 rounded-full overflow-hidden relative z-10 shadow-[0_0_60px_rgba(34,211,238,0.3)]">
              <img 
                src="/logo.png" 
                alt="Logo Arène des Esprits" 
                className="w-full h-full object-cover object-[center_38%] scale-[1.35] transform group-hover:scale-[1.40] transition-transform duration-700"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.style.display = 'none';
                  e.target.nextElementSibling.style.display = 'block';
                }}
              />
              <Shield className="w-24 h-24 text-arena-textMuted hidden absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
            </div>
          </button>
        </motion.div>

        {/* SECTION: LE JEU EN DÉTAILS */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.8 }}
          className="w-full text-left md:text-center mb-16 px-2 sm:px-4"
        >
          <h3 className="font-display text-2xl font-bold uppercase tracking-widest text-white mb-3">{t('landing_details_title')}</h3>
          <p className="text-arena-textMuted text-sm md:text-base leading-relaxed mb-6 max-w-2xl mx-auto whitespace-pre-line">
            {t('landing_details_desc')}
          </p>
          <ul className="flex flex-col gap-3 sm:gap-4 max-w-xl mx-auto text-left w-full">
            <li className="flex items-center gap-4 bg-white/5 p-4 rounded-xl border border-white/10 hover:bg-white/10 transition-colors">
              <Target className="w-6 h-6 text-indigo-400 shrink-0" />
              <span className="font-bold text-xs sm:text-sm tracking-wide text-gray-200">{t('landing_details_b1')}</span>
            </li>
            <li className="flex items-center gap-4 bg-white/5 p-4 rounded-xl border border-white/10 hover:bg-white/10 transition-colors">
              <Brain className="w-6 h-6 text-indigo-400 shrink-0" />
              <span className="font-bold text-xs sm:text-sm tracking-wide text-gray-200">{t('landing_details_b2')}</span>
            </li>
            <li className="flex items-center gap-4 bg-white/5 p-4 rounded-xl border border-white/10 hover:bg-white/10 transition-colors">
              <BookOpen className="w-6 h-6 text-indigo-400 shrink-0" />
              <span className="font-bold text-xs sm:text-sm tracking-wide text-gray-200">{t('landing_details_b3')}</span>
            </li>
          </ul>
        </motion.div>

        {/* SECTION: RÉCOMPENSE (Honneur & Gratuit) */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.9, duration: 0.8 }}
          className="w-full max-w-3xl mx-auto text-center px-4 sm:px-8 py-8 md:py-10 glass-card border border-arena-primary/30 rounded-2xl relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-arena-primary/10 blur-[50px] rounded-full pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-arena-secondary/10 blur-[50px] rounded-full pointer-events-none" />
          <ShieldCheck className="w-12 h-12 text-arena-primary mx-auto mb-4 relative z-10" />
          <h3 className="font-display text-xl sm:text-2xl font-bold uppercase tracking-widest text-white mb-3 relative z-10">{t('landing_reward_title')}</h3>
          <p className="text-gray-300 text-sm md:text-base leading-relaxed font-medium relative z-10">
            {t('landing_reward_desc')}
          </p>
        </motion.div>

      </div>

      {/* STICKY BOTTOM ACTION */}
      <motion.div 
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        transition={{ delay: 1.2, type: 'spring', stiffness: 50 }}
        className="fixed bottom-0 inset-x-0 p-4 sm:p-6 bg-gradient-to-t from-[#03040E] via-[#03040E]/90 to-transparent flex justify-center z-50 pointer-events-none"
      >
        <button
          onClick={onEnter}
          className="pointer-events-auto relative group overflow-hidden rounded-full bg-[#080C1A] px-6 py-4 sm:px-10 sm:py-5 w-full max-w-sm flex items-center justify-center gap-3 transition-all hover:scale-105 active:scale-95 shadow-[0_0_30px_rgba(99,102,241,0.3)] hover:shadow-[0_0_50px_rgba(99,102,241,0.6)] border-2 border-arena-primary"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-arena-primary via-indigo-500 to-arena-primary opacity-20 group-hover:opacity-40 transition-opacity duration-1000" />
          <span className="relative z-10 font-bold uppercase tracking-widest text-white text-sm sm:text-base">
            {t('landing_enter')}
          </span>
          <ArrowRight className="relative z-10 w-5 h-5 sm:w-6 sm:h-6 text-white group-hover:translate-x-2 transition-transform duration-300" />
        </button>
      </motion.div>

    </motion.div>
  );
};

export default LandingScreen;

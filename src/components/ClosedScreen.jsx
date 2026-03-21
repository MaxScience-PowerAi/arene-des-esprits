import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Clock, CheckCircle } from 'lucide-react';
import { t } from '../i18n';
import Countdown from './Countdown';
import { QUESTIONS_DU_JOUR } from '../questions';

const ClosedScreen = ({ currentHour, nextQuestion }) => {
  const [msgIndex, setMsgIndex] = useState(0);
  const messages = t('mystery_messages');

  useEffect(() => {
    const int = setInterval(() => {
      setMsgIndex((prev) => (prev + 1) % messages.length);
    }, 5000);
    return () => clearInterval(int);
  }, [messages.length]);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.98 }}
      className="flex flex-col items-center justify-center w-full max-w-md mx-auto min-h-[60vh] px-4"
    >
      <div className="glass-card w-full p-8 rounded-2xl flex flex-col items-center text-center">
        <div className="w-16 h-16 rounded-full bg-arena-border/50 flex items-center justify-center mb-6 shadow-[0_0_20px_rgba(99,102,241,0.2)]">
          <Lock className="w-8 h-8 text-arena-textMuted" />
        </div>
        
        <h2 className="font-display text-2xl font-bold mb-2 text-arena-textMain uppercase tracking-wide">
          {t('arena_closed_title')}
        </h2>
        
        <div className="h-12 mb-6">
          <AnimatePresence mode="wait">
            <motion.p 
              key={msgIndex}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.5 }}
              className="text-arena-textMuted text-sm whitespace-pre-line leading-relaxed"
            >
              {messages[msgIndex]}
            </motion.p>
          </AnimatePresence>
        </div>

        {nextQuestion && (
          <div className="w-full mt-2 pt-6 border-t border-arena-border/50">
            <p className="font-mono text-xs text-arena-secondary mb-4 uppercase tracking-wider">
              {t('next_riddle_in')} :
            </p>
            <div className="flex justify-center mb-6">
              <Countdown targetTimeObj={{ h: nextQuestion.start, m: 0 }} />
            </div>
          </div>
        )}

        {/* Schedule */}
        <div className="w-full mt-6 flex flex-col items-start text-left">
          <p className="font-display font-medium text-sm text-arena-textMain mb-4 uppercase tracking-widest opacity-80">
            {t('schedule_title')}
          </p>
          <div className="flex flex-col gap-3 w-full">
            {QUESTIONS_DU_JOUR.map((q) => {
              const status = currentHour >= q.end ? 'past' : (currentHour >= q.start && currentHour < q.end ? 'active' : 'upcoming');
              
              let statusText = '';
              let Icon = null;
              let colors = '';

              if (status === 'past') {
                statusText = t('slot_past');
                Icon = CheckCircle;
                colors = 'text-arena-success border-arena-success/20 bg-arena-success/5';
              } else if (status === 'active') {
                statusText = t('slot_active');
                Icon = Clock;
                colors = 'text-arena-primary border-arena-primary/30 bg-arena-primary/10 shadow-[0_0_10px_rgba(99,102,241,0.1)]';
              } else {
                statusText = t('slot_upcoming');
                Icon = Clock;
                colors = 'text-arena-textMuted border-arena-border bg-[#03040E]/50';
              }

              return (
                <div key={q.id} className={`flex items-center justify-between p-3 rounded-lg border ${colors}`}>
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4 opacity-80" />
                    <span className="font-mono text-sm opacity-90">{String(q.start).padStart(2,'0')}h — {String(q.end).padStart(2,'0')}h</span>
                  </div>
                  <span className="text-xs font-bold uppercase tracking-wider">{statusText}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ClosedScreen;

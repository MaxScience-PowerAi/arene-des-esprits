import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const Countdown = ({ targetTimeObj }) => {
  const [timeLeft, setTimeLeft] = useState({ h: 0, m: 0, s: 0, total: 0 });

  useEffect(() => {
    if (!targetTimeObj) return;
    
    const tick = () => {
      const now = new Date();
      // Calculate target time today
      const target = new Date(now);
      target.setHours(targetTimeObj.h, targetTimeObj.m, 0, 0);
      
      // If the target is before right now, maybe it's meant for tomorrow
      if (target <= now) {
        // Typically handled by App logic but safe here just in case:
        target.setDate(target.getDate() + 1);
      }
      
      const diff = Math.max(0, Math.floor((target - now) / 1000));
      
      setTimeLeft({
        h: Math.floor(diff / 3600),
        m: Math.floor((diff % 3600) / 60),
        s: diff % 60,
        total: diff,
      });
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [targetTimeObj]);

  if (!targetTimeObj) return null;

  const isDanger = timeLeft.total > 0 && timeLeft.total < 300; // < 5 mins

  const formatUnit = (val) => val.toString().padStart(2, '0');

  const UnitBlock = ({ value }) => (
    <div className={`glass-card relative overflow-hidden flex items-center justify-center w-12 h-14 rounded-lg border ${isDanger ? 'border-arena-danger/50 text-arena-danger' : 'border-arena-border text-arena-primary'} transition-colors duration-500`}>
      <AnimatePresence mode="popLayout">
        <motion.span
          key={value}
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 20, opacity: 0 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className="absolute font-mono text-2xl font-bold"
        >
          {formatUnit(value)}
        </motion.span>
      </AnimatePresence>
    </div>
  );

  return (
    <div className="flex items-center gap-2">
      <UnitBlock value={timeLeft.h} />
      <span className={`text-xl font-bold ${isDanger ? 'text-arena-danger' : 'text-arena-primary'}`}>:</span>
      <UnitBlock value={timeLeft.m} />
      <span className={`text-xl font-bold ${isDanger ? 'text-arena-danger' : 'text-arena-primary'}`}>:</span>
      <UnitBlock value={timeLeft.s} />
    </div>
  );
};

export default Countdown;

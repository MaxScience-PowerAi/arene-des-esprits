import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, Zap } from 'lucide-react';

function TimeBlock({ value, label, isUrgent }) {
  return (
    <div className={`time-block relative overflow-hidden ${isUrgent ? 'time-block-urgent' : ''}`}>
      <div className={`absolute inset-0 ${isUrgent ? 'shimmer' : 'shimmer opacity-50'}`}
        style={isUrgent ? { background: 'linear-gradient(90deg, transparent, rgba(244,63,94,0.15), transparent)' } : {}} />
      <motion.span
        key={value}
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        className={`font-mono font-bold text-2xl relative z-10 tabular-nums ${isUrgent ? 'text-rose-400' : 'text-white'}`}
      >
        {value}
      </motion.span>
      <span className={`text-[9px] font-display uppercase tracking-widest mt-0.5 relative z-10 ${isUrgent ? 'text-rose-500' : 'text-slate-500'}`}>
        {label}
      </span>
    </div>
  );
}

export default function Countdown({ endHour }) {
  const [parts, setParts] = useState({ h: '00', m: '00', s: '00', urgent: false, ended: false });
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    const generateParticles = () => {
      return [...Array(6)].map((_, i) => ({
        id: i,
        x: Math.random() * 100 - 50,
        y: Math.random() * -30 - 10,
        delay: i * 0.3,
        size: Math.random() * 4 + 2,
      }));
    };
    setParticles(generateParticles());
  }, []);

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const end = new Date();
      end.setHours(endHour, 0, 0, 0);
      const diff = end - now;

      if (diff <= 0) {
        setParts({ h: '00', m: '00', s: '00', urgent: false, ended: true });
        return;
      }

      const totalSecs = Math.floor(diff / 1000);
      const h = Math.floor(totalSecs / 3600).toString().padStart(2, '0');
      const m = Math.floor((totalSecs % 3600) / 60).toString().padStart(2, '0');
      const s = (totalSecs % 60).toString().padStart(2, '0');
      setParts({ h, m, s, urgent: totalSecs < 300, ended: false });
    };

    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [endHour]);

  return (
    <div className="flex flex-col items-end gap-2">
      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/40 border border-slate-800/50">
        {parts.ended ? (
          <div className="flex items-center gap-2">
            <Zap size={12} className="text-slate-500" />
            <span className="text-[10px] font-display uppercase tracking-widest text-slate-500">Terminé</span>
          </div>
        ) : parts.urgent ? (
          <div className="flex items-center gap-2 animate-pulse">
            <Zap size={12} className="text-rose-400" />
            <span className="text-[10px] font-display uppercase tracking-widest text-rose-400">Fin proche</span>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Clock size={12} className="text-slate-500" />
            <span className="text-[10px] font-display uppercase tracking-widest text-slate-500">Temps restant</span>
          </div>
        )}
      </div>
      
      <div className="flex items-center gap-1.5 relative">
        {parts.urgent && particles.map(p => (
          <motion.div
            key={p.id}
            className="absolute w-1 h-1 rounded-full bg-rose-400"
            initial={{ x: 0, y: 0, opacity: 0 }}
            animate={{
              x: p.x,
              y: p.y,
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 1.5,
              delay: p.delay,
              repeat: Infinity,
              repeatDelay: 2,
            }}
            style={{ width: p.size, height: p.size }}
          />
        ))}
        
        <TimeBlock value={parts.h} label="h" isUrgent={parts.urgent} />
        <span className={`font-mono font-bold text-xl pb-3 ${parts.urgent ? 'text-rose-400 animate-pulse' : 'text-slate-600'}`}>:</span>
        <TimeBlock value={parts.m} label="m" isUrgent={parts.urgent} />
        <span className={`font-mono font-bold text-xl pb-3 ${parts.urgent ? 'text-rose-400 animate-pulse' : 'text-slate-600'}`}>:</span>
        <TimeBlock value={parts.s} label="s" isUrgent={parts.urgent} />
      </div>
    </div>
  );
}

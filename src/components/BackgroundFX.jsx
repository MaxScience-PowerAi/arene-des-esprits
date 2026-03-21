import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

const BackgroundFX = () => {
  // Matrix of logical and mathematical symbols
  const symbols = useMemo(() => {
    const chars = ['∞', 'π', '√', '∑', 'Δ', '?', '!', '≠', '≈', 'Ω', '{x}', '< />', 'λ', '01'];
    return Array.from({ length: 20 }).map((_, i) => ({
      id: i,
      char: chars[Math.floor(Math.random() * chars.length)],
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      size: Math.random() * 1.5 + 0.8, // rem
      duration: Math.random() * 25 + 25,
      delay: Math.random() * -30,
    }));
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-[-1] bg-[#03040E] overflow-hidden">
      
      {/* High-Performance Center Glow (Instead of heavy blur div) */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#1d1f42] via-[#03040E] to-[#03040E] opacity-70" />

      {/* Strategic Grid Overlay */}
      <div 
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: "linear-gradient(rgba(34, 211, 238, 0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(34, 211, 238, 0.2) 1px, transparent 1px)",
          backgroundSize: "50px 50px"
        }}
      />

      {/* Floating Logic Symbols */}
      {symbols.map(s => (
        <motion.div
          key={s.id}
          className="absolute text-arena-secondary/30 font-mono font-bold select-none will-change-transform"
          style={{ left: s.left, top: s.top, fontSize: `${s.size}rem` }}
          animate={{
            y: [0, -150, 0],
            x: [0, 30, -30, 0],
            opacity: [0.1, 0.4, 0.1],
          }}
          transition={{
            duration: s.duration,
            delay: s.delay,
            repeat: Infinity,
            ease: "linear"
          }}
        >
          {s.char}
        </motion.div>
      ))}

      {/* Ambient Lighting Accents (Hardware Accelerated positioning) */}
      <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[40%] bg-arena-primary/10 rounded-full blur-[100px] transform-gpu" />
      <div className="absolute bottom-[-10%] left-[-5%] w-[40%] h-[40%] bg-arena-secondary/10 rounded-full blur-[100px] transform-gpu" />
    </div>
  );
};

export default React.memo(BackgroundFX);

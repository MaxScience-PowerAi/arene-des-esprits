import React from 'react';

export default function BackgroundFX() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none select-none" aria-hidden="true">
      <div className="absolute inset-0 bg-hex-pattern" />
      
      <div
        className="absolute rounded-full"
        style={{
          width: 900, height: 900,
          top: '-30%', left: '-20%',
          background: 'radial-gradient(circle, rgba(91, 110, 245, 0.2) 0%, rgba(79, 70, 229, 0.1) 40%, transparent 70%)',
          filter: 'blur(80px)',
        }}
      />
      
      <div
        className="absolute rounded-full"
        style={{
          width: 700, height: 700,
          bottom: '-20%', right: '-15%',
          background: 'radial-gradient(circle, rgba(34, 211, 238, 0.1) 0%, rgba(6, 182, 212, 0.05) 50%, transparent 70%)',
          filter: 'blur(80px)',
        }}
      />
      
      <div
        className="absolute rounded-full"
        style={{
          width: 500, height: 500,
          top: '20%', right: '10%',
          background: 'radial-gradient(circle, rgba(129, 140, 248, 0.1) 0%, rgba(99, 102, 241, 0.05) 50%, transparent 70%)',
          filter: 'blur(60px)',
        }}
      />

      <div
        className="absolute rounded-full"
        style={{
          width: 400, height: 400,
          top: '60%', left: '5%',
          background: 'radial-gradient(circle, rgba(168, 85, 247, 0.08) 0%, rgba(147, 51, 234, 0.03) 50%, transparent 70%)',
          filter: 'blur(60px)',
        }}
      />
      
      <svg
        className="absolute top-1/4 left-1/4 w-40 h-40 opacity-10"
        viewBox="0 0 100 100"
      >
        <polygon
          points="50,5 95,27.5 95,72.5 50,95 5,72.5 5,27.5"
          fill="none"
          stroke="rgba(91,110,245,0.5)"
          strokeWidth="0.5"
        />
      </svg>
      
      <svg
        className="absolute bottom-1/4 right-1/4 w-32 h-32 opacity-10"
        viewBox="0 0 100 100"
      >
        <polygon
          points="50,5 95,27.5 95,72.5 50,95 5,72.5 5,27.5"
          fill="none"
          stroke="rgba(129,140,248,0.5)"
          strokeWidth="0.5"
        />
      </svg>
    </div>
  );
}

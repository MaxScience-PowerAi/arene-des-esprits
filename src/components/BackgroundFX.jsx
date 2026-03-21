import React from 'react';

const BackgroundFX = () => {
  return (
    <div className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden bg-arena-bg">
      {/* 1. Hexagonal svg mesh */}
      <div 
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='100' viewBox='0 0 60 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 100L0 50l30-50 30 50-30 50z' stroke='%23ffffff' fill='none' fill-rule='evenodd' opacity='1'/%3E%3C/svg%3E")`,
          backgroundSize: '40px'
        }}
      />
      
      {/* 2. Floating Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40vw] h-[40vw] bg-arena-primary rounded-full blur-[120px] opacity-20 animate-float" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-arena-secondary rounded-full blur-[150px] opacity-10 animate-float" style={{ animationDelay: '2s' }} />
      <div className="absolute top-[40%] left-[60%] w-[30vw] h-[30vw] bg-arena-danger rounded-full blur-[100px] opacity-10 animate-float" style={{ animationDelay: '4s' }} />
      
      {/* 3. Noise Overlay */}
      <div 
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
        }}
      />
      
      {/* 4. Scanlines */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0)_50%,rgba(0,0,0,0.1)_50%)] bg-[length:100%_4px] pointer-events-none" />
      
      {/* 5. Animated Scanline passing by */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-arena-primary opacity-50 shadow-[0_0_15px_rgba(99,102,241,1)] animate-scan" />
    </div>
  );
};

export default BackgroundFX;

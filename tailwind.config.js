/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Syne"', 'sans-serif'],
        body: ['"DM Sans"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        arena: {
          bg:        '#030712',
          surface:   '#1e1b4b',
          card:      '#312e81',
          border:    '#3730a3',
          accent:    '#5b6ef5',
          glow:      '#4f46e5',
          cyan:      '#22d3ee',
          indigo:    '#818cf8',
          violet:    '#a855f7',
          gold:      '#f59e0b',
          emerald:   '#10b981',
          rose:      '#f43f5e',
        }
      },
      animation: {
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        'glow-border': 'glowBorder 2s ease-in-out infinite alternate',
        'float': 'float 6s ease-in-out infinite',
        'scan': 'scan 3s linear infinite',
        'neon-pulse': 'neonPulse 2s ease-in-out infinite',
        'gold-shimmer': 'goldShimmer 3s ease-in-out infinite',
        'spin-slow': 'spin 8s linear infinite',
        'fade-in-up': 'fadeInUp 0.5s ease-out forwards',
        'glow-soft': 'glowSoft 4s ease-in-out infinite',
      },
      keyframes: {
        glowBorder: {
          '0%':   { boxShadow: '0 0 15px rgba(91,110,245,0.3), inset 0 0 15px rgba(91,110,245,0.05)' },
          '100%': { boxShadow: '0 0 35px rgba(91,110,245,0.6), inset 0 0 25px rgba(91,110,245,0.1)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-10px)' },
        },
        scan: {
          '0%':   { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' },
        },
        neonPulse: {
          '0%, 100%': { opacity: '0.5', filter: 'brightness(1)' },
          '50%':      { opacity: '1', filter: 'brightness(1.2)' },
        },
        goldShimmer: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%':      { backgroundPosition: '100% 50%' },
        },
        glowSoft: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(91,110,245,0.3)' },
          '50%':      { boxShadow: '0 0 40px rgba(91,110,245,0.5), 0 0 60px rgba(91,110,245,0.2)' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
      boxShadow: {
        'neon-indigo': '0 0 20px rgba(91,110,245,0.4), 0 0 60px rgba(91,110,245,0.1)',
        'neon-cyan':   '0 0 20px rgba(34,211,238,0.4), 0 0 60px rgba(34,211,238,0.1)',
        'neon-gold':   '0 0 20px rgba(245,158,11,0.4), 0 0 60px rgba(245,158,11,0.1)',
        'neon-violet': '0 0 20px rgba(168,85,247,0.4), 0 0 60px rgba(168,85,247,0.1)',
        'inner-glow':  'inset 0 1px 0 rgba(255,255,255,0.08)',
      },
    },
  },
  plugins: [],
}

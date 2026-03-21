/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        arena: {
          bg: '#03040E',
          card: '#080C1A',
          border: '#1A2140',
          primary: '#6366F1',
          secondary: '#22D3EE',
          gold: '#F59E0B',
          success: '#10B981',
          danger: '#F43F5E',
          textMain: '#F1F5F9',
          textMuted: '#64748B',
        }
      },
      fontFamily: {
        display: ['Syne', 'sans-serif'],
        body: ['DM Sans', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      animation: {
        shimmer: 'shimmer 2s linear infinite',
        glowPulse: 'glowPulse 3s ease-in-out infinite',
        float: 'float 6s ease-in-out infinite',
        scan: 'scan 4s linear infinite',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% center' },
          '100%': { backgroundPosition: '200% center' },
        },
        glowPulse: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(99,102,241,0.3)' },
          '50%': { boxShadow: '0 0 40px rgba(99,102,241,0.6)' },
        },
        float: {
          '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
          '33%': { transform: 'translate(30px, -20px) scale(1.05)' },
          '66%': { transform: 'translate(-20px, 15px) scale(0.97)' },
        },
        scan: {
          '0%': { transform: 'translateY(-100%)', opacity: '0' },
          '10%': { opacity: '0.5' },
          '90%': { opacity: '0.5' },
          '100%': { transform: 'translateY(100vh)', opacity: '0' },
        }
      }
    },
  },
  plugins: [],
}

/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        stage: {
          950: '#050508',
          900: '#0A0A0F',
          800: '#12121A',
          700: '#1A1A26',
          600: '#252536',
        },
        gold: {
          400: '#E6C665',
          500: '#D4AF37',
          600: '#B8941F',
        },
        neon: {
          pink: '#FF006E',
          purple: '#A855F7',
          blue: '#6366F1',
          cyan: '#06B6D4',
        }
      },
      fontFamily: {
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        body: ['"Inter"', 'system-ui', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'gradient': 'gradient 8s ease infinite',
        'fade-in-up': 'fadeInUp 0.8s ease-out forwards',
        'scale-in': 'scaleIn 0.5s ease-out forwards',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(212, 175, 55, 0.5), 0 0 20px rgba(212, 175, 55, 0.3)' },
          '100%': { boxShadow: '0 0 20px rgba(212, 175, 55, 0.8), 0 0 40px rgba(212, 175, 55, 0.5)' },
        },
        gradient: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.9)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      backgroundImage: {
        'stage-gradient': 'linear-gradient(135deg, #0A0A0F 0%, #1A1A26 50%, #0A0A0F 100%)',
        'neon-gradient': 'linear-gradient(135deg, #6366F1 0%, #A855F7 50%, #FF006E 100%)',
        'gold-gradient': 'linear-gradient(135deg, #E6C665 0%, #D4AF37 50%, #B8941F 100%)',
        'grid-pattern': "linear-gradient(rgba(212, 175, 55, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(212, 175, 55, 0.03) 1px, transparent 1px)",
      },
      backgroundSize: {
        'grid': '50px 50px',
        'gradient-x': '200% 200%',
      },
    },
  },
  plugins: [],
};

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      minWidth: {
        '125': '500px',
      },
      maxWidth: {
        '200': '800px',
      },
      minHeight: {
        '75': '300px',
      },
      maxHeight: {
        '125': '500px',
      },
      scale: {
        '102': '1.02',
      },
      margin: {
        '0': '0',
        '4': '1rem',
        '8': '2rem',
        '12': '3rem',
        '16': '4rem',
        '20': '5rem',
      },
      animation: {
        'slide-in': 'slideIn 0.3s ease-out',
        'shimmer': 'shimmer 1.5s infinite',
        'pulse-glow': 'pulse-glow 2s infinite',
      },
      keyframes: {
        slideIn: {
          from: { opacity: 0, transform: 'translateY(10px)' },
          to: { opacity: 1, transform: 'translateY(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(102, 126, 234, 0.3)' },
          '50%': { boxShadow: '0 0 40px rgba(102, 126, 234, 0.6)' },
        },
      },
    },
  },
  plugins: [],
  darkMode: 'class',
}
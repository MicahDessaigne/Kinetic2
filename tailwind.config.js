/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Dark theme (default)
        ink: {
          bg: '#0B0B0E',
          card: '#16161C',
          border: 'rgba(255,255,255,0.08)',
          primary: '#EDEDF0',
          secondary: '#8A8A93',
        },
        // Light theme
        paper: {
          bg: '#F6F6F8',
          card: '#FFFFFF',
          border: 'rgba(0,0,0,0.06)',
          primary: '#121215',
          secondary: '#686872',
        },
        crimson: {
          DEFAULT: '#931A25',
          light: '#A8202E',
          dark: '#841822',
        },
        slate: {
          accent: '#3B4E6B',
          light: '#2B3B52',
        },
      },
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          'SF Pro Text',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'sans-serif',
        ],
      },
      borderRadius: {
        xl2: '1.25rem',
        '3xl': '1.75rem',
      },
      backdropBlur: {
        glass: '20px',
      },
      boxShadow: {
        glass: '0 8px 32px rgba(0,0,0,0.35)',
        fab: '0 8px 24px rgba(147,26,37,0.45)',
      },
      keyframes: {
        shake: {
          '0%,100%': { transform: 'translateX(0)' },
          '20%,60%': { transform: 'translateX(-8px)' },
          '40%,80%': { transform: 'translateX(8px)' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
      },
      animation: {
        shake: 'shake 0.4s ease-in-out',
        fadeIn: 'fadeIn 0.3s ease-out',
      },
    },
  },
  plugins: [],
}

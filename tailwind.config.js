/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Dark palette
        'dark-bg': '#0a0a0f',
        'dark-surface': '#0f0f1a',
        'dark-card': '#141420',
        'dark-border': '#1e1e30',
        // Light palette
        'light-bg': '#f8f7f4',
        'light-surface': '#f0ede8',
        'light-card': '#e8e4dc',
        'light-border': '#d5cfc6',
        // Accent - electric violet
        accent: {
          50:  '#f3eeff',
          100: '#e9dcff',
          200: '#d5befd',
          300: '#b994fb',
          400: '#9b6af5',
          500: '#7c3aed',
          600: '#6920d6',
          700: '#5818b3',
          800: '#461591',
          900: '#3a1377',
          950: '#220a52',
        },
        violet: {
          DEFAULT: '#7c3aed',
          dark:    '#6920d6',
          light:   '#9b6af5',
          glow:    'rgba(124,58,237,0.35)',
        },
      },
      fontFamily: {
        heading: ['Space Grotesk', 'sans-serif'],
        body:    ['Inter', 'sans-serif'],
        mono:    ['JetBrains Mono', 'monospace'],
      },
      backgroundImage: {
        'noise': "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.05'/%3E%3C/svg%3E\")",
        'gradient-radial':  'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':   'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      animation: {
        'bounce-slow':   'bounce 2s infinite',
        'pulse-glow':    'pulseGlow 2s ease-in-out infinite',
        'float':         'float 6s ease-in-out infinite',
        'text-shimmer':  'textShimmer 3s ease-in-out infinite',
        'spin-slow':     'spin 8s linear infinite',
        'fadeInUp':      'fadeInUp 0.6s ease forwards',
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(124,58,237,0)' },
          '50%':      { boxShadow: '0 0 20px 6px rgba(124,58,237,0.4)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-12px)' },
        },
        textShimmer: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%':      { backgroundPosition: '100% 50%' },
        },
        fadeInUp: {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
      },
      boxShadow: {
        'violet-glow':  '0 0 20px rgba(124,58,237,0.4)',
        'violet-glow-lg': '0 0 40px rgba(124,58,237,0.3)',
        'card-dark':    '0 4px 24px rgba(0,0,0,0.4)',
        'card-light':   '0 4px 24px rgba(0,0,0,0.08)',
      },
      backdropBlur: {
        xs: '2px',
      },
      screens: {
        xs: '375px',
      },
    },
  },
  plugins: [],
}

import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: 'var(--t-hero-from)',
          800: 'var(--t-hero-from)',
          700: 'var(--t-hero-mid)',
          600: 'var(--t-hero-mid)',
          500: 'var(--t-hero-to)',
          400: 'var(--t-hero-to)',
        },
        teal: {
          DEFAULT: 'var(--t-accent)',
          dark: 'var(--t-accent)',
          light: 'var(--t-accent)',
          50: 'var(--t-accent)',
          100: 'var(--t-accent)',
          200: 'var(--t-accent)',
          500: 'var(--t-accent)',
          600: 'var(--t-accent)',
          700: 'var(--t-accent)',
        },
        income: {
          DEFAULT: '#4CAF50',
          light: '#E8F5E9',
          dark: '#388E3C',
          50: '#f0fdf4',
        },
        expense: {
          DEFAULT: '#FF5C5C',
          light: '#FFEBEB',
          dark: '#D32F2F',
          50: '#fff1f1',
        },
        loan: {
          DEFAULT: '#F59E0B',
          light: '#FEF3C7',
          dark: '#B45309',
        },
        jazz: { DEFAULT: '#C8102E', light: '#FCEBEB' },
        easy: { DEFAULT: '#3a7a28', light: '#EAF3DE' },
        surface: {
          DEFAULT: 'var(--t-page-bg)',
          card: 'var(--t-card-bg)',
          dark: 'var(--t-page-bg)',
        },
        border: {
          DEFAULT: 'var(--t-card-border)',
          strong: 'var(--t-card-border)',
        },
        muted: 'var(--t-muted)',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        urdu: ['Noto Nastaliq Urdu', 'serif'],
      },
      borderRadius: {
        '4xl': '2rem',
      },
      boxShadow: {
        'teal-glow': '0 4px 24px rgba(0,196,180,0.25)',
        'teal-glow-lg': '0 8px 40px rgba(0,196,180,0.35)',
        'card': '0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.06)',
        'card-lg': '0 4px 6px rgba(0,0,0,0.04), 0 10px 30px rgba(0,0,0,0.08)',
        'income-glow': '0 4px 20px rgba(76,175,80,0.2)',
        'expense-glow': '0 4px 20px rgba(255,92,92,0.2)',
        'inner-light': 'inset 0 1px 0 rgba(255,255,255,0.1)',
      },
      backgroundImage: {
        'gradient-navy': 'linear-gradient(135deg, #0B0F1A 0%, #131929 50%, #0d1a2a 100%)',
        'gradient-teal': 'linear-gradient(135deg, #00C4B4 0%, #00A89A 100%)',
        'gradient-income': 'linear-gradient(135deg, #4CAF50 0%, #388E3C 100%)',
        'gradient-expense': 'linear-gradient(135deg, #FF5C5C 0%, #D32F2F 100%)',
        'glass-light': 'linear-gradient(135deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.06) 100%)',
      },
      animation: {
        'slide-up': 'slideUp 0.3s cubic-bezier(0.16,1,0.3,1)',
        'fade-in': 'fadeIn 0.2s ease-out',
        'scale-in': 'scaleIn 0.2s cubic-bezier(0.16,1,0.3,1)',
        'pulse-teal': 'pulseTeal 2s cubic-bezier(0.4,0,0.6,1) infinite',
        'shimmer': 'shimmer 1.5s infinite',
        'shake': 'shake 0.5s cubic-bezier(0.36,0.07,0.19,0.97)',
      },
      keyframes: {
        slideUp: { from: { opacity: '0', transform: 'translateY(16px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        fadeIn: { from: { opacity: '0' }, to: { opacity: '1' } },
        scaleIn: { from: { opacity: '0', transform: 'scale(0.95)' }, to: { opacity: '1', transform: 'scale(1)' } },
        pulseTeal: { '0%,100%': { opacity: '1' }, '50%': { opacity: '0.5' } },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        shake: {
          '0%,100%': { transform: 'translateX(0)' },
          '15%':      { transform: 'translateX(-8px)' },
          '30%':      { transform: 'translateX(8px)' },
          '45%':      { transform: 'translateX(-6px)' },
          '60%':      { transform: 'translateX(6px)' },
          '75%':      { transform: 'translateX(-4px)' },
        },
      },
    },
  },
  plugins: [],
}

export default config

import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        heading: ['"Baloo 2"', 'sans-serif'],
        body: ['"Be Vietnam Pro"', 'sans-serif'],
      },
      colors: {
        brand: {
          bg: '#FFF8EE',
          surface: '#FFFFFF',
          primary: '#4A90D9',
          'primary-dark': '#2C6FAB',
          accent: '#F97316',
          'accent-dark': '#D95F0A',
          border: '#E8D5B0',
          text: '#2D2416',
          body: '#5C4B32',
          muted: '#9C8468',
          wood: '#8B5E3C',
        },
      },
      borderRadius: {
        card: '20px',
        btn: '16px',
        chip: '100px',
        frame: '18px',
      },
      boxShadow: {
        clay: 'inset -2px -2px 6px rgba(0,0,0,.06), inset 1px 1px 4px rgba(255,255,255,.7), 4px 6px 18px rgba(74,144,217,.22), 0 2px 4px rgba(0,0,0,.07)',
        'clay-hover':
          'inset -2px -2px 8px rgba(0,0,0,.08), inset 1px 1px 4px rgba(255,255,255,.8), 6px 12px 28px rgba(74,144,217,.32), 0 4px 10px rgba(0,0,0,.10)',
        'clay-btn':
          '3px 4px 12px rgba(74,144,217,.28), inset 1px 1px 3px rgba(255,255,255,.6)',
        'wood-frame':
          'inset 0 0 0 3px #C4874A, inset 0 0 0 5px #7A5234, 0 6px 24px rgba(139,94,60,.35), 0 2px 6px rgba(0,0,0,.15)',
      },
    },
  },
  plugins: [],
} satisfies Config

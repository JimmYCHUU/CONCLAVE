export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: { mono: ['JetBrains Mono', 'Fira Code', 'Consolas', 'monospace'] },
      colors: {
        conclave: {
          bg: '#080810', surface: '#0f0f1a', card: '#14141f', elevated: '#1a1a2e',
          border: '#1e1e35', accent: '#7c6af7', success: '#22d3a5',
          warning: '#f59e0b', error: '#ef4444', info: '#06b6d4',
          muted: '#8b8ba7', faint: '#4a4a6a', slate: '#64748b',
        },
        agent: {
          0: '#7c6af7', 1: '#22d3a5', 2: '#f59e0b', 3: '#ef4444', 4: '#06b6d4',
        },
        signal: {
          purple: { fill: 'rgba(124,106,247,0.14)', border: 'rgba(124,106,247,0.4)', text: '#a89bfb' },
          teal:   { fill: 'rgba(34,211,165,0.14)',  border: 'rgba(34,211,165,0.4)',  text: '#6ee8c5' },
          amber:  { fill: 'rgba(245,158,11,0.14)',  border: 'rgba(245,158,11,0.4)',  text: '#fbbf4a' },
          red:    { fill: 'rgba(239,68,68,0.14)',   border: 'rgba(239,68,68,0.4)',   text: '#f59999' },
          cyan:   { fill: 'rgba(6,182,212,0.14)',   border: 'rgba(6,182,212,0.4)',   text: '#5fd4e8' },
        },
        dossier: {
          paper: '#f2ead8', ink: '#241f17', inkMuted: '#5c5240', stamp: '#b8442f', rule: '#d8cdb4',
        },
      },
      backgroundImage: {
        'dot-grid': 'radial-gradient(circle, #1e1e35 1px, transparent 1px)',
      },
      backgroundSize: {
        'dot-grid': '24px 24px',
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-border': 'pulseBorder 2s ease-in-out infinite',
        'pulse-glow': 'pulseGlow 3s ease infinite',
        'pulse-dot': 'pulseDot 1.5s ease infinite',
        'shimmer': 'shimmer 1.5s infinite',
      },
      keyframes: {
        fadeIn: { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideUp: { '0%': { opacity: '0', transform: 'translateY(8px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        pulseBorder: { '0%, 100%': { borderColor: 'rgba(124,106,247,0.3)' }, '50%': { borderColor: 'rgba(124,106,247,0.8)' } },
        pulseGlow: { '0%, 100%': { boxShadow: '0 0 8px rgba(124,106,247,0.15)' }, '50%': { boxShadow: '0 0 28px rgba(124,106,247,0.5)' } },
        pulseDot: { '0%, 100%': { opacity: '1', transform: 'scale(1)' }, '50%': { opacity: '0.5', transform: 'scale(0.7)' } },
        shimmer: { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } },
      }
    }
  },
  plugins: []
}

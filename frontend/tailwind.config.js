export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: { mono: ['JetBrains Mono', 'Fira Code', 'Consolas', 'monospace'] },
      colors: {
        conclave: {
          bg: '#080810', surface: '#0f0f1a', card: '#14141f', elevated: '#1a1a2e',
          border: '#1e1e35', accent: '#7c6af7', success: '#22d3a5',
          warning: '#f59e0b', error: '#ef4444', muted: '#8b8ba7', faint: '#4a4a6a'
        }
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-border': 'pulseBorder 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideUp: { '0%': { opacity: '0', transform: 'translateY(8px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        pulseBorder: { '0%, 100%': { borderColor: 'rgba(124,106,247,0.3)' }, '50%': { borderColor: 'rgba(124,106,247,0.8)' } }
      }
    }
  },
  plugins: []
}

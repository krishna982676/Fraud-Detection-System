import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        base: '#050806',
        surface: {
          DEFAULT: '#0B120E',
          raised: '#111C16',
          elevated: '#17271E',
        },
        border: {
          DEFAULT: '#2A4033',
          subtle: '#22352A',
          strong: '#3B5A48',
          glow: 'rgba(0, 255, 156, 0.45)',
        },
        accent: {
          DEFAULT: '#00FF9C',
          hover: '#33FFB0',
          contrast: '#03140B',
          dim: '#0B3D2A',
          glow: 'rgba(0, 255, 156, 0.35)',
        },
        text: {
          primary: '#E8FFF3',
          secondary: '#A7C4B3',
          muted: '#7F9C8B',
        },
        semantic: {
          low: '#00E08A',
          medium: '#FFB020',
          high: '#FF3B5C',
          danger: '#FF3B5C',
        },
        cyber: {
          green: '#00FF9C',
          'green-soft': '#33FFB0',
          'green-dim': '#0B3D2A',
          teal: '#00E5FF',
          'teal-soft': '#38E8FF',
          'teal-dim': '#083B44',
        },
      },
      fontFamily: {
        sans: ['"Space Grotesk"', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        'glow-green-sm': '0 0 0 1px rgba(0, 255, 156, 0.4), 0 4px 14px rgba(0, 255, 156, 0.25)',
        'glow-green': '0 0 0 1px rgba(0, 255, 156, 0.5), 0 4px 20px rgba(0, 255, 156, 0.35)',
        'glow-teal': '0 0 0 1px rgba(0, 229, 255, 0.5), 0 4px 20px rgba(0, 229, 255, 0.35)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        float: 'float 6s ease-in-out infinite',
        ticker: 'ticker 25s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        ticker: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;

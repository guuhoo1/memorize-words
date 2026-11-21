/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#0f0f0f',
        bg: '#fafafa',
        line: '#f0f0f0',
        muted: '#a0a0a0',
        accent: '#bc1888',
        ok: '#16934a',
        warn: '#d18109',
        bad: '#d94a5f'
      },
      fontFamily: {
        sans: [
          '-apple-system', 'BlinkMacSystemFont', 'Helvetica Neue',
          'PingFang SC', 'Microsoft YaHei', 'sans-serif'
        ]
      },
      borderRadius: {
        DEFAULT: '18px',
        rail: '14px',
        btn: '12px',
        chip: '13px',
        input: '12px',
        bubble: '18px',
        flash: '26px',
        ans: '16px',
        stat: '18px',
        dot: '50%'
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        }
      },
      animation: {
        'fade-up': 'fadeUp 0.5s ease-out'
      }
    }
  },
  plugins: []
};

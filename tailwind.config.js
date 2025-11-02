export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      keyframes: {
        'parent-float': {
          '0%': { transform: 'translate(-50%, -50%) scale(1)' },
          '100%': { transform: 'translate(-46%, -54%) scale(1.08)' }
        },
        'kid-login-shake': {
          '0%, 100%': { transform: 'translateX(0)' },
          '20%, 60%': { transform: 'translateX(-14px)' },
          '40%, 80%': { transform: 'translateX(14px)' }
        }
      },
      animation: {
        'parent-float': 'parent-float 18s ease-in-out infinite alternate',
        'parent-float-slow': 'parent-float 14s ease-in-out infinite alternate',
        'kid-shake': 'kid-login-shake 0.6s ease'
      }
    }
  },
  plugins: []
};

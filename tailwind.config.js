/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx}'],
  theme: {
    container: { center: true, padding: { DEFAULT: '1.25rem', lg: '2rem' }, screens: { '2xl': '1320px' } },
    extend: {
      colors: {
        // Derived from the official Alight logo (#223579 navy, #C7161C red, #4D4D4D grey)
        navy: { 950: '#050F24', 900: '#071A36', 800: '#0D2550', 700: '#123D70', 600: '#223579' },
        brand: { blue: '#2864A5', sky: '#ABD2FF', mist: '#6683BC' },
        crimson: { 600: '#C7161C', 500: '#D9343F', 400: '#EA5361' },
        surface: '#F3F6FA',
        slate: { DEFAULT: '#52647A' },
        ink: '#172B43',
      },
      fontFamily: {
        display: ['var(--font-display)', 'system-ui', 'sans-serif'],
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'display-xl': ['clamp(2.75rem, 6vw, 5.25rem)', { lineHeight: '1.02', letterSpacing: '-0.035em' }],
        'display-lg': ['clamp(2.25rem, 4.2vw, 3.75rem)', { lineHeight: '1.06', letterSpacing: '-0.03em' }],
        'display-md': ['clamp(1.75rem, 3vw, 2.5rem)', { lineHeight: '1.12', letterSpacing: '-0.02em' }],
      },
      boxShadow: {
        glow: '0 0 0 1px rgba(171,210,255,0.08), 0 30px 80px -20px rgba(5,15,36,0.6)',
        card: '0 1px 2px rgba(7,26,54,0.04), 0 12px 40px -12px rgba(7,26,54,0.12)',
        red: '0 12px 32px -8px rgba(199,22,28,0.45)',
        'red-lg': '0 18px 44px -10px rgba(199,22,28,0.6)',
        lift: '0 1px 2px rgba(7,26,54,0.04), 0 24px 60px -18px rgba(7,26,54,0.28)',
        float: '0 10px 40px -12px rgba(7,26,54,0.28), inset 0 1px 0 rgba(255,255,255,0.6)',
      },
      backgroundImage: {
        grid: 'linear-gradient(rgba(171,210,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(171,210,255,0.06) 1px, transparent 1px)',
        'grid-light': 'linear-gradient(rgba(7,26,54,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(7,26,54,0.05) 1px, transparent 1px)',
      },
      keyframes: {
        marquee: { from: { transform: 'translateX(0)' }, to: { transform: 'translateX(-50%)' } },
        'spin-slow': { to: { transform: 'rotate(360deg)' } },
        pulseLine: { '0%,100%': { opacity: '0.2' }, '50%': { opacity: '1' } },
        dash: { to: { strokeDashoffset: '-18' } },
        float: { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-10px)' } },
        shimmer: { from: { backgroundPosition: '200% 0' }, to: { backgroundPosition: '-200% 0' } },
        aurora: {
          '0%,100%': { transform: 'translate3d(0,0,0) scale(1)' },
          '33%': { transform: 'translate3d(6%,-8%,0) scale(1.12)' },
          '66%': { transform: 'translate3d(-5%,6%,0) scale(0.94)' },
        },
      },
      animation: {
        marquee: 'marquee 40s linear infinite',
        'spin-slow': 'spin-slow 40s linear infinite',
        'pulse-line': 'pulseLine 3s ease-in-out infinite',
        dash: 'dash 1.2s linear infinite',
        float: 'float 6s ease-in-out infinite',
        shimmer: 'shimmer 8s linear infinite',
        aurora: 'aurora 18s ease-in-out infinite',
        'aurora-slow': 'aurora 26s ease-in-out infinite reverse',
      },
    },
  },
  plugins: [],
};

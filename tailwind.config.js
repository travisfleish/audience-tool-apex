/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      screens: {
        /** Viewports where `max-w-7xl` is still full width — extra horizontal gutter before the 1280px cap kicks in */
        'layout-gutter': '1126px',
      },
      fontFamily: {
        sans: ['Red Hat Text', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'Helvetica', 'Arial', 'sans-serif'],
        heading: ['ES Klarheit Kurrent', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'Helvetica', 'Arial', 'sans-serif'],
      },
      colors: {
        gs: {
          primary: {
            900: 'var(--gs-primary-900)',
            700: 'var(--gs-primary-700)',
          },
          accent: {
            500: 'var(--gs-accent-500)',
            600: 'var(--gs-accent-600)',
          },
          neon: 'var(--gs-neon)',
          text: 'var(--gs-text)',
          muted: 'var(--gs-text-muted)',
          border: 'var(--gs-border)',
          surface: 'var(--gs-surface)',
          bg: 'var(--gs-bg)',
          'bg-muted': 'var(--gs-muted)',
          success: 'var(--gs-success)',
          warning: 'var(--gs-warning)',
          error: 'var(--gs-error)',
        },
        'hero-control': {
          surface: 'var(--hero-control-surface)',
          border: 'var(--hero-control-border)',
        },
        pmg: {
          accent: 'var(--pmg-accent)',
          'accent-dark': 'var(--pmg-accent-dark)',
          text: 'var(--pmg-text)',
          muted: 'var(--pmg-muted)',
          border: 'var(--pmg-border)',
          surface: 'var(--pmg-surface)',
          bg: 'var(--pmg-bg)',
          'bg-muted': 'var(--pmg-bg-muted)',
          dark: 'var(--pmg-dark)',
        },
      },
      borderRadius: {
        sm: 'var(--gs-radius-sm)',
        DEFAULT: 'var(--gs-radius-md)',
        md: 'var(--gs-radius-md)',
        lg: 'var(--gs-radius-lg)',
      },
      boxShadow: {
        sm: 'var(--gs-shadow-sm)',
        md: 'var(--gs-shadow-md)',
      },
      keyframes: {
        'hero-stats-marquee': {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
      animation: {
        'hero-stats-marquee': 'hero-stats-marquee 32s linear infinite',
      },
    },
  },
  plugins: [],
};

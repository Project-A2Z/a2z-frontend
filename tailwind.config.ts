import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Brand Colors - A2Z Theme
        primary: {
          50: '#f0f9f0',
          100: '#dcf2dc',
          200: '#bce4bc',
          300: '#8ed08e',
          400: '#5bb85b',
          500: '#88BE46', // Main brand color - Tree green
          600: '#6b9a39',
          700: '#4C9343', // Secondary color
          800: '#3d7a35',
          900: '#2d5a28',
        },
        secondary: {
          50: '#f0f9f0',
          100: '#dcf2dc',
          200: '#bce4bc',
          300: '#8ed08e',
          400: '#5bb85b',
          500: '#4C9343', // Secondary brand color - Forest green
          600: '#6b9a39',
          700: '#4C9343',
          800: '#3d7a35',
          900: '#2d5a28',
        },
        accent: {
          50: '#f0fdfa',
          100: '#ccfbf1',
          200: '#99f6e4',
          300: '#5eead4',
          400: '#2dd4bf',
          500: '#06B590', // Accent color - Teal green
          600: '#0891a4',
          700: '#0e7490',
          800: '#155e75',
          900: '#164e63',
        },
        text: {
          50: '#f8f9fa',
          100: '#e9ecef',
          200: '#dee2e6',
          300: '#ced4da',
          400: '#adb5bd',
          500: '#6c757d',
          600: '#495057',
          700: '#343a40',
          800: '#212529',
          900: '#241E20', // Main text color - Dark charcoal
        },
        // Semantic colors
        success: {
          50: '#f0f9f0',
          100: '#dcf2dc',
          200: '#bce4bc',
          300: '#8ed08e',
          400: '#5bb85b',
          500: '#4C9343', // Success states
          600: '#6b9a39',
          700: '#4C9343',
          800: '#3d7a35',
          900: '#2d5a28',
        },
        warning: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#F59E0B', // Warning states
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
        },
        error: {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#EF4444', // Error states
          600: '#dc2626',
          700: '#b91c1c',
          800: '#991b1b',
          900: '#7f1d1d',
        },
        info: {
          50: '#f0fdfa',
          100: '#ccfbf1',
          200: '#99f6e4',
          300: '#5eead4',
          400: '#2dd4bf',
          500: '#06B590', // Info states
          600: '#0891a4',
          700: '#0e7490',
          800: '#155e75',
          900: '#164e63',
        },
      },
      fontFamily: {
        sans: ['Geist', 'system-ui', 'sans-serif'],
        mono: ['Geist_Mono', 'monospace'],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      borderRadius: {
        '4xl': '2rem',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'bounce-gentle': 'bounceGentle 2s infinite',
        'pulse-gentle': 'pulseGentle 3s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        bounceGentle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        },
        pulseGentle: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.8' },
        },
      },
      boxShadow: {
        'brand': '0 4px 14px 0 rgba(136, 190, 70, 0.15)',
        'brand-lg': '0 10px 25px 0 rgba(136, 190, 70, 0.2)',
        'brand-xl': '0 20px 40px 0 rgba(136, 190, 70, 0.25)',
      },
      backgroundImage: {
        'gradient-brand': 'linear-gradient(135deg, #88BE46 0%, #06B590 100%)',
        'gradient-primary': 'linear-gradient(135deg, #88BE46 0%, #4C9343 100%)',
        'gradient-accent': 'linear-gradient(135deg, #06B590 0%, #4C9343 100%)',
      },
    },
  },
  plugins: [],
};

export default config; 
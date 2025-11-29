import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./Pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./sections/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    screens: {
      'xs': '475px',
      'sm': '640px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px',
      '2xl': '1536px',
    },
    extend: {
      colors: {
        // Primary Brand Colors
        primary: '#88BE46',
        secondary1: '#4C9343',
        secondary2: '#06B590',
        
        // UI State Colors
        disabled: '#A5C9A1',
        error: '#DD3D3D',
        
        // Background Colors
        background: '#FFFFFF',
        card: '#F7FFEE',
        onPrimary: '#FFFFFF',
        
        // Text Colors (Grayscale)
        black87: '#3E3E3E',
        black60: '#666666',
        black37: '#A1A1A1',
        black16: '#D6D6D6',
        black8: '#F0F0F0',
        
        // Legacy color support
        'primary-50': '#f3f8ec',
        'primary-100': '#e7f2da',
        'primary-200': '#cfe4b5',
        'primary-300': '#b7d890',
        'primary-400': '#9fcb6b',
        'primary-500': '#88BE46',
        'primary-600': '#6c9838',
        'primary-700': '#51722a',
        'primary-800': '#364c1c',
        'primary-900': '#1b250d',
        
        'secondary-50': '#edf4ec',
        'secondary-100': '#dbe9d9',
        'secondary-200': '#b7d3b3',
        'secondary-300': '#93be8e',
        'secondary-400': '#6fa868',
        'secondary-500': '#4C9343',
        'secondary-600': '#3c7535',
        'secondary-700': '#2d5828',
        'secondary-800': '#1e3a1a',
        'secondary-900': '#0f1d0d',
        
        'accent-50': '#e6f7f3',
        'accent-100': '#cdf0e8',
        'accent-200': '#9be1d2',
        'accent-300': '#69d2bc',
        'accent-400': '#37c3a6',
        'accent-500': '#06B590',
        'accent-600': '#049073',
        'accent-700': '#036c56',
        'accent-800': '#024839',
        'accent-900': '#01241c',
      },
      boxShadow: {
        brand: '0 4px 6px -1px rgba(136, 190, 70, 0.1), 0 2px 4px -1px rgba(136, 190, 70, 0.06)',
        'brand-lg': '0 10px 15px -3px rgba(136, 190, 70, 0.1), 0 4px 6px -2px rgba(136, 190, 70, 0.05)',
      },fontFamily: {
        beiruti: ['Beiruti', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
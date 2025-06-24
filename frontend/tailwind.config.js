/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // EGXpilot Professional Colors
        primary: {
          DEFAULT: '#00d2ff',
          50: '#f0fcff',
          100: '#e0f8ff',
          500: '#00d2ff',
          600: '#00b8e6',
          700: '#009fcc',
        },
        secondary: {
          DEFAULT: '#3a7bd5',
          50: '#f2f6ff',
          100: '#e6edff',
          500: '#3a7bd5',
          600: '#3369c2',
          700: '#2d58af',
        },
        accent: '#ff6b6b',
        success: {
          DEFAULT: '#4ecdc4',
          50: '#f0fffe',
          100: '#e1fffe',
          500: '#4ecdc4',
          600: '#45b9b1',
          700: '#3ca69e',
        },
        warning: '#ffe66d',
        danger: '#ff4757',
        info: '#74b9ff',
        
        // Background Colors
        'bg-primary': '#0f1419',
        'bg-secondary': '#1a202c',
        'bg-tertiary': '#2d3748',
        'bg-card': 'rgba(26, 32, 44, 0.6)',
        'bg-glass': 'rgba(255, 255, 255, 0.05)',
        
        // Text Colors
        'text-primary': '#ffffff',
        'text-secondary': '#a0aec0',
        'text-muted': '#718096',
        
        // Trading Specific
        'price-up': '#4ade80',
        'price-down': '#f87171',
        'volume-bar': '#6366f1',
      },
      fontFamily: {
        cairo: ['Cairo', 'sans-serif'],
        inter: ['Inter', 'sans-serif'],
      },
      backdropBlur: {
        xs: '2px',
      },
      animation: {
        'gradient-shift': 'gradientShift 20s ease-in-out infinite',
        'slide-in': 'slideIn 0.5s ease-out',
        'fade-in': 'fadeIn 0.3s ease-out',
        'price-up': 'priceUp 1s ease-out',
        'price-down': 'priceDown 1s ease-out',
        'shimmer': 'shimmer 2s infinite',
      },
      keyframes: {
        gradientShift: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.8' },
        },
        slideIn: {
          from: {
            opacity: '0',
            transform: 'translateY(20px)',
          },
          to: {
            opacity: '1',
            transform: 'translateY(0)',
          },
        },
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        priceUp: {
          '0%': { backgroundColor: 'transparent' },
          '50%': { backgroundColor: 'rgba(74, 222, 128, 0.2)' },
          '100%': { backgroundColor: 'transparent' },
        },
        priceDown: {
          '0%': { backgroundColor: 'transparent' },
          '50%': { backgroundColor: 'rgba(248, 113, 113, 0.2)' },
          '100%': { backgroundColor: 'transparent' },
        },
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
      },
      boxShadow: {
        'glow': '0 0 20px rgba(0, 210, 255, 0.3)',
        'card': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'trading': '0 8px 32px 0 rgba(31, 38, 135, 0.37), inset 0 1px 0 0 rgba(255, 255, 255, 0.05)',
      },
    },
  },
  plugins: [],
};

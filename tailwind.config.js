/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./*.jsx", // Include root jsx files
  ],
  theme: {
    extend: {
      // Trading-specific color palette
      colors: {
        gain: {
          50: '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
        },
        loss: {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
        },
        modus: {
          50: '#f5f3ff',
          100: '#ede9fe',
          200: '#ddd6fe',
          300: '#c4b5fd',
          400: '#a78bfa',
          500: '#8b5cf6',
          600: '#7c3aed',
          700: '#6d28d9',
          800: '#5b21b6',
          900: '#4c1d95',
        },
      },
      animation: {
        'fadeIn': 'fadeIn 0.2s ease-out forwards',
        'slideIn': 'slideIn 0.2s ease-out forwards',
        'slideUp': 'slideUp 0.3s ease-out forwards',
        'slideDown': 'slideDown 0.2s ease-out forwards',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'shimmer': 'shimmer 1.5s infinite',
        'price-flash-up': 'priceFlashUp 0.6s ease-out',
        'price-flash-down': 'priceFlashDown 0.6s ease-out',
        'spin-slow': 'spin 2s linear infinite',
        'bounce-subtle': 'bounceSubtle 0.4s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideIn: {
          '0%': { opacity: '0', transform: 'translateX(-10px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 5px rgba(139, 92, 246, 0.3)' },
          '50%': { boxShadow: '0 0 20px rgba(139, 92, 246, 0.6)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        priceFlashUp: {
          '0%': { backgroundColor: 'rgba(16, 185, 129, 0.3)' },
          '100%': { backgroundColor: 'transparent' },
        },
        priceFlashDown: {
          '0%': { backgroundColor: 'rgba(239, 68, 68, 0.3)' },
          '100%': { backgroundColor: 'transparent' },
        },
        bounceSubtle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-3px)' },
        },
      },
      // Better responsive spacing for trading dashboards
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
      // Trading-optimized font sizes
      fontSize: {
        'xxs': ['0.625rem', { lineHeight: '0.875rem' }],
        '7px': ['0.4375rem', { lineHeight: '0.5rem' }],
        'price': ['1.125rem', { lineHeight: '1.5rem', fontWeight: '600' }],
      },
      // Consistent border radius
      borderRadius: {
        'card': '0.875rem',
      },
      // Z-index scale (organized hierarchy)
      zIndex: {
        'sidebar': '40',
        'header': '35',
        'dropdown': '45',
        'modal-overlay': '50',
        'modal': '51',
        'toast': '60',
        'tooltip': '55',
      },
      // Responsive container widths
      maxWidth: {
        'sidebar': '16rem',
        'sidebar-collapsed': '4rem',
      },
      // Backdrop blur
      backdropBlur: {
        'xs': '2px',
      },
      // Box shadow for trading cards
      boxShadow: {
        'card': '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -2px rgba(0, 0, 0, 0.2)',
        'card-hover': '0 10px 25px -5px rgba(0, 0, 0, 0.4), 0 8px 10px -6px rgba(0, 0, 0, 0.3)',
        'glow-violet': '0 0 20px rgba(139, 92, 246, 0.3)',
        'glow-emerald': '0 0 20px rgba(16, 185, 129, 0.3)',
        'glow-red': '0 0 20px rgba(239, 68, 68, 0.3)',
      },
      // Screen breakpoints for trading layouts
      screens: {
        'xs': '475px',
        '3xl': '1920px',
      },
    },
  },
  plugins: [],
}

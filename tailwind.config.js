/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Outfit"', 'Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        brand: {
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
          950: '#2e1065',
        },
        accent: {
          cyan: '#06b6d4',
          violet: '#8b5cf6',
          rose: '#f43f5e',
        },
        glass: {
          50: 'rgba(255, 255, 255, 0.4)',
          100: 'rgba(255, 255, 255, 0.6)',
          200: 'rgba(255, 255, 255, 0.8)',
        }
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'mesh-gradient': 'radial-gradient(at 0% 0%, rgba(124, 58, 237, 0.08) 0px, transparent 50%), radial-gradient(at 100% 0%, rgba(6, 182, 212, 0.08) 0px, transparent 50%), radial-gradient(at 50% 100%, rgba(244, 63, 94, 0.04) 0px, transparent 50%), linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #f1f5f9 100%)',
        'premium-gradient': 'linear-gradient(to right, #8b5cf6, #d946ef)',
      }
    },
  },
  plugins: [],
};

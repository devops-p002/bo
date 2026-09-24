/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Dark, high-contrast casino palette - near-black chrome with a
        // warm gold accent (distinct from any specific competitor's
        // brand color) rather than a literal brand-color copy.
        surface: {
          50: '#F5F6F8',
          900: '#0B0E14',
          800: '#12161F',
          700: '#1A202C',
          600: '#242B3A',
        },
        accent: {
          400: '#F2C14E',
          500: '#E0AC2B',
          600: '#C4941F',
        },
        win: {
          DEFAULT: '#1FBF75',
          light: '#0F2A1E',
        },
        loss: {
          DEFAULT: '#E5484D',
          light: '#2C1315',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

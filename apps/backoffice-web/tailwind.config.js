/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Flat, blue-accented palette loosely modeled on the "Melon"
        // admin dashboard theme (navy chrome, flat saturated accent
        // colors, minimal shadow) - not a pixel copy, just the same
        // general family of hues.
        primary: {
          50: '#EAF3FA',
          100: '#CFE4F3',
          200: '#A3CBE8',
          300: '#71AEDB',
          400: '#4A94CF',
          500: '#2C82C9',
          600: '#236BAA',
          700: '#1B5588',
          800: '#153F65',
          900: '#0F2C48',
        },
        // Dark navy chrome for the sidebar/header - distinct from
        // `primary` (the accent color used on buttons/links) so the two
        // can vary independently.
        navy: {
          700: '#2E4257',
          800: '#233246',
          900: '#1B2836',
        },
        success: {
          DEFAULT: '#1BBC9B',
          light: '#E7FAF6',
        },
        warning: {
          DEFAULT: '#F2784B',
          light: '#FDEEE7',
        },
        error: {
          DEFAULT: '#E74C3C',
          light: '#FBEAE8',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}; 
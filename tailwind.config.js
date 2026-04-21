/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#2F88FF',
          light: '#60a5fa',
        },
        slate: {
          850: '#1e293b',
          950: '#020617', // Explicitly defined to match your app
        }
      },
      fontFamily: {
        poppins: ['Rubik', 'sans-serif'],
        inter: ['Rubik', 'sans-serif'],
        rubik: ['Rubik', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
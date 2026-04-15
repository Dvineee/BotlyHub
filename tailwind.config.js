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
          DEFAULT: '#0098ea',
          light: '#558df7',
        },
        slate: {
          850: '#1e293b',
          950: '#020617', // Explicitly defined to match your app
        }
      }
    },
  },
  plugins: [],
}
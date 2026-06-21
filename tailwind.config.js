/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./App.tsx",
    "./index.tsx",
    "./TranslationContext.tsx",
    "./FilterContext.tsx",
    "./ThemeContext.tsx",
    "./types.ts",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./hooks/**/*.{js,ts,jsx,tsx}",
    "./services/**/*.{js,ts,jsx,tsx}",
    "./bot/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#3b82f6',
          light: '#60a5fa',
        },
        slate: {
          205: '#e8edf5',
          295: '#d2dbe6',
          350: '#b0bcca',
          405: '#909eb2',
          450: '#7c8a9e',
          505: '#56657a',
          650: '#3d4b5e',
          705: '#2a3547',
          802: '#202b3e',
          805: '#1b2434',
          850: '#1e293b',
          950: '#020617',
        },
        indigo: {
          505: '#5956eb',
        },
        rose: {
          450: '#f75871',
          455: '#f75871',
        },
        blue: {
          650: '#2563eb',
        }
      },
      fontSize: {
        'xs': ['14px', { lineHeight: 'inherit' }],
        '2xl': ['1.3rem', { lineHeight: '2rem' }],
      },
      fontWeight: {
        semibold: '500',
        bold: '600',
        extrabold: '600',
        black: '600',
      },
      letterSpacing: {
        wider: '0em',
        widest: '-0.013em',
      },
      width: {
        '4': '1.1rem',
        '8': '1.7rem',
        '20': '5.2rem',
        '48': '9rem',
      },
      height: {
        '4': '1.1rem',
        '8': '1.7rem',
        '16': '3.3rem',
        '20': '3.5rem',
      },
      borderRadius: {
        '2xl': '12px',
        'card': '20px',
        'card-lg': '28px',
        'panel': '32px',
        'panel-lg': '40px',
        'modal': '48px',
      },
      boxShadow: {
        'sm': 'none',
        'lg': 'none',
      },
      fontFamily: {
        inter: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
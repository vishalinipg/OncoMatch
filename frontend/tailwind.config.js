/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // User requested color palette:
        // rgb(97, 130, 100)  -> #618264 (Sage Dark)
        // rgb(121, 172, 120) -> #79AC78 (Sage Medium)
        // rgb(176, 217, 177) -> #B0D9B1 (Sage Light)
        // rgb(208, 231, 210) -> #D0E7D2 (Sage Pale)
        sage: {
          dark: 'rgb(97, 130, 100)',
          medium: 'rgb(121, 172, 120)',
          light: 'rgb(176, 217, 177)',
          pale: 'rgb(208, 231, 210)',
        },
        brand: {
          50: '#f4f9f4',
          100: '#D0E7D2', // rgb(208, 231, 210)
          200: '#B0D9B1', // rgb(176, 217, 177)
          300: '#95C596',
          400: '#79AC78', // rgb(121, 172, 120)
          500: '#618264', // rgb(97, 130, 100)
          600: '#506e53',
          700: '#3f5942',
          800: '#2f4431',
          900: '#1f2e21',
          950: '#111b12',
        }
      }
    },
  },
  plugins: [],
}

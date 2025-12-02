/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      gridTemplateColumns:{
        'auto':'repeat(auto-fill, minmax(200px, 1fr))'
      },
      colors:{
        'primary':'#8B2635',
        'primary-light':'#A83244',
        'primary-dark':'#6B1D28',
        'secondary':'#2D1B1B'
      }
    },
  },
  plugins: [],
}
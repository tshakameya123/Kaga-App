/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{html,js,jsx,ts,tsx}", 
  ],
  theme: {
    extend: {
      colors: {
        'primary': '#8B2635',
        'primary-light': '#A83244',
        'primary-dark': '#6B1D28',
      },
    },
  },
  plugins: [],
}

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'golf-green': '#2D5016',
        'golf-light': '#4A7C2E',
        'golf-gold': '#F4D03F',
      },
    },
  },
  plugins: [],
}
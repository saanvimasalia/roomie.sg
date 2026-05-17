/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        cream: '#FAF7F2',
        sand: '#F0E9DC',
        terra: '#C4581A',
        'terra-light': '#F7EAE0',
        sage: '#5C7A62',
        'sage-light': '#E8F0E9',
        'sage-dark': '#3D5442',
        wb: '#7A5C3A',
        wb2: '#A07850',
        wb3: '#C4A882',
      },
      fontFamily: {
        syne: ['Syne', 'sans-serif'],
        dm: ['DM Sans', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

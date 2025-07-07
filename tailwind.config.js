/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'primary': {
          '50': '#f0f9ff',
          '100': '#e0f3fe',
          '200': '#bae7fd',
          '300': '#7dd6fc',
          '400': '#38c1f8',
          '500': '#0eaae9',
          '600': '#0288c7',
          '700': '#036fa5',
          '800': '#075c85',
          '900': '#0c4c6e',
          '950': '#083049',
      },
      },
      screens: {
        'print': { 'raw': 'print' },
      }
    },
  },
}
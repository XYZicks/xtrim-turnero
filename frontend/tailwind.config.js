/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        'xtrim-purple': '#3F1B6A',
      },
      fontFamily: {
        'ubuntu': ['Ubuntu', 'sans-serif'],
      },
      boxShadow: {
        'xtrim': '0 4px 8px 0 #B9BFCB',
      }
    },
  },
  plugins: [],
  corePlugins: {
    preflight: false,
  }
}
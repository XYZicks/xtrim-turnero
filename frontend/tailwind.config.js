/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        'xtrim-purple': '#402063',
      }
    },
  },
  plugins: [],
  corePlugins: {
    preflight: false,
  }
}
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "primary": "#ff1111",
        "terminal-red": "#ff0000",
        "terminal-green": "#0bda92",
        "background-light": "#f8f6f6",
        "background-dark": "#0a0304",
        "danger-glow": "#b30000",
      },
      fontFamily: {
        "display": ["Space Grotesk", "monospace"],
        "distressed": ["Special Elite", "Courier Prime", "monospace"],
        "terminal": ["monospace"]
      },
    },
  },
  plugins: [],
}

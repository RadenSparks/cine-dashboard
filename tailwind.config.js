// tailwind.config.js
const {heroui} = require("@heroui/react");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        audiowide: ["var(--font-audiowide)", "sans-serif"],
        asul: ["var(--font-asul)", "sans-serif"],
        farro: ["var(--font-farro)", "sans-serif"],
        "red-rose": ["var(--font-red-rose)", "sans-serif"],
      },
    },
  },
  darkMode: "class",
  plugins: [heroui()],
};
/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: ["./*.html", "./*.js"],
  theme: {
    extend: {
      colors: {
        surface: "#0f131d",
        "surface-container-lowest": "#0a0e18",
        "surface-container-low": "#171b26",
        "surface-container": "#1c1f2a",
        "surface-container-high": "#262a35",
        "surface-container-highest": "#313540",
        "surface-bright": "#353944",
        primary: "#5eead4",
        secondary: "#a5b4fc",
        "on-surface": "#e2e8f0",
        "on-surface-variant": "#94a3b8",
        "on-primary-fixed": "#042f2e",
        outline: "#64748b",
        "outline-variant": "#475569",
      },
      fontFamily: {
        headline: ["Space Grotesk", "system-ui", "sans-serif"],
        body: ["Manrope", "system-ui", "sans-serif"],
        label: ["Space Grotesk", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

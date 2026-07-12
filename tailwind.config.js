/** @type {import('tailwindcss').Config} */
module.exports = {
  // Escanear tanto App.tsx en la raíz como cualquier carpeta de componentes
  content: ["./App.tsx", "./components/**/*.{js,jsx,ts,tsx}", "./app/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        "sepia-bg": "#F4ECD8",
        "sepia-text": "#4A3728",
        "sepia-border": "#DCD0B4",
        "sepia-accent": "#8B6B4F",
        "forest-bg": "#14241C",
        "forest-text": "#E6EFE9",
        "forest-border": "#1C362A",
        "forest-accent": "#2D5A43",
        "dark-bg": "#121212",
        "dark-text": "#E2E8F0",
        "dark-border": "#262626",
        "dark-accent": "#3B82F6",
        "light-bg": "#FFFFFF",
        "light-text": "#1E293B",
        "light-border": "#E2E8F0",
        "light-accent": "#3B82F6",
      }
    },
  },
  plugins: [],
}

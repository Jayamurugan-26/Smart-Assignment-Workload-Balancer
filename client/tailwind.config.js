/** @type {import("tailwindcss").Config} */
export default {
  darkMode: ['variant', [
    '&:is(.dark *)',
    '&:is([data-theme="dark"] *)',
    '&:is(.dark)',
    '&:is([data-theme="dark"])',
    '.dark &',
    '[data-theme="dark"] &',
  ]],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ['"Times New Roman"', "Times", "serif"],
        sans: ['"Times New Roman"', "Times", "serif"],
      },
      colors: {
        brand: {
          50: "#eff6ff",
          100: "#dbeafe",
          500: "#3b82f6",
          600: "#2563eb",
          700: "#1d4ed8",
        }
      }
    },
  },
  plugins: [],
}
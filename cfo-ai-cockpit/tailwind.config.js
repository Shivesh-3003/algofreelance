/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#1e3a8a',
        success: '#059669',
        warning: '#f59e0b',
        danger: '#dc2626',
      }
    },
  },
  plugins: [],
}

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f5f3ff',
          100: '#ede9fe',
          200: '#ddd6fe',
          300: '#c4b5fd',
          400: '#a78bfa',
          500: '#8b5cf6',
          600: '#7c3aed',
          700: '#6d28d9',
          800: '#5b21b6',
          900: '#4c1d95',
          950: '#2e1065',
        },
        lavender: {
          50: '#fcfaff',
          100: '#f8f7fd',
          200: '#f1effa',
          300: '#e5e1f7',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.02)',
        'premium': '0 10px 30px -5px rgba(124, 58, 237, 0.08), 0 4px 6px -2px rgba(0, 0, 0, 0.03)',
        'card': '0 0 0 1px rgba(226, 232, 240, 0.8), 0 2px 4px rgba(0, 0, 0, 0.02)',
      }
    },
  },
  plugins: [],
}

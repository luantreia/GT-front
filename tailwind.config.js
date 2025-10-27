/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0f8ff',
          100: '#dff0ff',
          200: '#b9e0ff',
          300: '#80c7ff',
          400: '#39a5ff',
          500: '#0d83ff',
          600: '#0064e5',
          700: '#0050bb',
          800: '#003e8f',
          900: '#032f6f',
          950: '#021f48'
        }
      },
      boxShadow: {
        surface: '0 1px 2px rgba(15, 23, 42, 0.08), 0 4px 16px rgba(15, 23, 42, 0.08)',
        card: '0 1px 3px rgba(15, 23, 42, 0.12), 0 6px 24px rgba(15, 23, 42, 0.12)'
      },
      borderRadius: {
        surface: '20px',
        chip: '999px'
      }
    }
  },
  plugins: [],
}


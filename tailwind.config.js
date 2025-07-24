/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        blue: {
          50: '#eff6ff',
          100: '#dbeafe',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
        }
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
      },
    },
  },
  plugins: [],
  safelist: [
    'bg-blue-100',
    'bg-green-100', 
    'bg-purple-100',
    'bg-orange-100',
    'bg-red-100',
    'bg-yellow-100',
    'text-blue-600',
    'text-green-600',
    'text-purple-600',
    'text-orange-600',
    'text-red-600',
    'text-yellow-600',
  ]
}
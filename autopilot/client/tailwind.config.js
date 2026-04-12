/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      colors: {
        bg: {
          base: '#050505', // Deep space black
          surface: '#0f0f11', // Slightly elevated
          raised: '#17171a',
          hover: '#1e1e24',
        },
        border: {
          subtle: '#1f1f24',
          DEFAULT: '#2d2d36',
          strong: '#40404a',
        },
        accent: {
          DEFAULT: '#a05bf8', // Zomato Nugget purple
          light: '#b882f9',
          dark: '#7c3aed',
          muted: '#24153a', // Very dark tinted purple
        },
        text: {
          primary: '#ffffff',
          secondary: '#a1a1aa',
          muted: '#71717a',
          inverse: '#ffffff',
        },
        success: '#22c55e',
        successBg: '#052e16',
      },
      backgroundImage: {
        'grid-pattern': "url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32' width='32' height='32' fill='none' stroke='rgb(255 255 255 / 0.04)'%3e%3cpath d='M0 .5H31.5V32'/%3e%3c/svg%3e\")",
      }
    },
  },
  plugins: [],
};

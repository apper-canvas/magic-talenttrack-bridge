/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#4B6584',
          50: '#E8EDF3',
          100: '#D1DBE7',
          200: '#A3B7CF',
          300: '#7593B7',
          400: '#476F9F',
          500: '#4B6584',
          600: '#3C5169',
          700: '#2D3D4E',
          800: '#1E2933',
          900: '#0F1418'
        },
        secondary: {
          DEFAULT: '#778CA3',
          50: '#F0F3F7',
          100: '#E1E7EF',
          200: '#C3CFDF',
          300: '#A5B7CF',
          400: '#879FBF',
          500: '#778CA3',
          600: '#5F7082',
          700: '#475462',
          800: '#2F3841',
          900: '#171C21'
        },
        accent: {
          DEFAULT: '#4834D4',
          50: '#E8E6FD',
          100: '#D1CDFB',
          200: '#A39BF7',
          300: '#7569F3',
          400: '#4737EF',
          500: '#4834D4',
          600: '#3A2AA9',
          700: '#2B1F7E',
          800: '#1C1554',
          900: '#0E0A29'
        },
        surface: {
          50: '#FFFFFF',
          100: '#F8FAFC',
          200: '#F1F5F9',
          300: '#E2E8F0',
          400: '#CBD5E1',
          500: '#94A3B8',
          600: '#64748B',
          700: '#475569',
          800: '#334155',
          900: '#1E293B'
        },
        background: '#F5F7FA',
        success: '#20BF6B',
        warning: '#F39C12',
        error: '#EB3B5A',
        info: '#3498DB'
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui'],
        display: ['Inter', 'ui-sans-serif', 'system-ui']
      },
      fontSize: {
        'xs': '0.75rem',
        'sm': '0.875rem',
        'base': '0.875rem',
        'lg': '1.125rem',
        'xl': '1.25rem',
        '2xl': '1.5rem',
        '3xl': '1.875rem',
        '4xl': '2.25rem'
      }
    }
  },
  plugins: []
};
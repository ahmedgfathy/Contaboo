/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        cairo: ['var(--font-cairo)', 'Cairo', 'system-ui', 'sans-serif'],
        sans: ['var(--font-cairo)', 'Cairo', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1.5' }],
        'sm': ['0.875rem', { lineHeight: '1.6' }],
        'base': ['1rem', { lineHeight: '1.7' }],
        'lg': ['1.125rem', { lineHeight: '1.7' }],
        'xl': ['1.25rem', { lineHeight: '1.7' }],
        '2xl': ['1.5rem', { lineHeight: '1.6' }],
        '3xl': ['1.875rem', { lineHeight: '1.5' }],
        '4xl': ['2.25rem', { lineHeight: '1.4' }],
        '5xl': ['3rem', { lineHeight: '1.3' }],
        '6xl': ['3.75rem', { lineHeight: '1.2' }],
      },
      spacing: {
        'rtl-safe': '0.5rem',
      },
      colors: {
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
      },
    },
  },
  plugins: [
    // RTL support plugin
    function({ addUtilities }) {
      const newUtilities = {
        '.rtl-grid': {
          direction: 'rtl',
        },
        '.ltr-grid': {
          direction: 'ltr',
        },
        '.text-start': {
          'text-align': 'start',
        },
        '.text-end': {
          'text-align': 'end',
        },
        '.pe-4': {
          'padding-inline-end': '1rem',
        },
        '.ps-4': {
          'padding-inline-start': '1rem',
        },
        '.me-4': {
          'margin-inline-end': '1rem',
        },
        '.ms-4': {
          'margin-inline-start': '1rem',
        },
        '.border-s': {
          'border-inline-start-width': '1px',
        },
        '.border-e': {
          'border-inline-end-width': '1px',
        },
      }
      addUtilities(newUtilities)
    }
  ],
}

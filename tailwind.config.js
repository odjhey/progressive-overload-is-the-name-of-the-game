/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {},
  },
  // eslint-disable-next-line no-undef
  plugins: [require('daisyui')],
  daisyui: {
    themes: [
      {
        notebook: {
          primary: '#245c47',
          'primary-content': '#ffffff',
          secondary: '#34463d',
          'secondary-content': '#ffffff',
          accent: '#245c47',
          'accent-content': '#ffffff',
          neutral: '#202c25',
          'neutral-content': '#fffef9',
          'base-100': '#fffef9',
          'base-200': '#f3f0e7',
          'base-300': '#dedbd0',
          'base-content': '#202c25',
          info: '#245c47',
          'info-content': '#ffffff',
          success: '#245c47',
          'success-content': '#ffffff',
          warning: '#edca86',
          'warning-content': '#392c14',
          error: '#a02e2e',
          'error-content': '#ffffff',
          '--rounded-box': '0.875rem',
          '--rounded-btn': '0.625rem',
          '--btn-text-case': 'none',
        },
      },
    ],
  },
}

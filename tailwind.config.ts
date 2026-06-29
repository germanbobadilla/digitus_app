import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Digitus Brand Colors
        'digitus': {
          'accent': '#5271ff',
          'dark': '#000937',
          'accent-50': '#f0f4ff',
          'accent-100': '#e0e9ff',
          'accent-200': '#c7d7ff',
          'accent-300': '#a5b8ff',
          'accent-400': '#8190ff',
          'accent-500': '#5271ff',
          'accent-600': '#3d5ce6',
          'accent-700': '#2d44cc',
          'accent-800': '#1f2e99',
          'accent-900': '#0f1a66',
          'dark-50': '#f0f1f7',
          'dark-100': '#e0e2ef',
          'dark-200': '#c1c5df',
          'dark-300': '#a2a8cf',
          'dark-400': '#838bbf',
          'dark-500': '#646eaf',
          'dark-600': '#4a5299',
          'dark-700': '#303683',
          'dark-800': '#161a6d',
          'dark-900': '#000937',
        },
        // Override default colors to use Digitus brand
        'primary': {
          '50': '#f0f4ff',
          '100': '#e0e9ff',
          '200': '#c7d7ff',
          '300': '#a5b8ff',
          '400': '#8190ff',
          '500': '#5271ff',
          '600': '#3d5ce6',
          '700': '#2d44cc',
          '800': '#1f2e99',
          '900': '#0f1a66',
          '950': '#0f1a66',
        },
        'secondary': {
          '50': '#f0f1f7',
          '100': '#e0e2ef',
          '200': '#c1c5df',
          '300': '#a2a8cf',
          '400': '#838bbf',
          '500': '#646eaf',
          '600': '#4a5299',
          '700': '#303683',
          '800': '#161a6d',
          '900': '#000937',
          '950': '#000937',
        },
      },
    },
  },
  plugins: [],
}

export default config























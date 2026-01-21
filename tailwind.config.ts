import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    container: {
      center: true,
      padding: '1rem',
    },
    extend: {
      colors: {
        primary: 'var(--primary-color)',
        secondary: 'var(--secondary-color)',
      },
      typography: (theme: any) => ({
        DEFAULT: {
          css: {
            color: theme('colors.gray.800'), // darken base text
            strong: { color: theme('colors.gray.900') }, // darker bold text
          },
        },
        dark: {
          css: {
            color: theme('colors.gray.200'), // lighter base text in dark mode
            strong: { color: theme('colors.gray.100') }, // ensure bold stands out
          },
        },
      }),
      keyframes: {
        'bounce-subtle': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
        'pulse-ring': {
          '0%, 100%': { transform: 'scale(0.95)', opacity: '0.5' },
          '50%': { transform: 'scale(1.02)', opacity: '0.2' },
        },
      },
      animation: {
        'bounce-subtle': 'bounce-subtle 4s infinite ease-in-out',
        shimmer: 'shimmer 2s infinite',
        'pulse-ring': 'pulse-ring 3s infinite ease-in-out',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
};

export default config;

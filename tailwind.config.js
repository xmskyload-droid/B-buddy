/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
    './app/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        // Light theme
        background: 'var(--color-background, #FAFAFA)',
        card: 'var(--color-card, #FFFFFF)',
        primary: 'var(--color-primary, #111111)',
        secondary: 'var(--color-secondary, #6B7280)',
        border: 'var(--color-border, #E5E7EB)',
        muted: 'var(--color-muted, #F3F4F6)',
        // Fixed colors
        accent: '#22C55E',
        success: '#16A34A',
        danger: '#EF4444',
        warning: '#F59E0B',
      },
      fontFamily: {
        sans: ['Inter_400Regular'],
        medium: ['Inter_500Medium'],
        semibold: ['Inter_600SemiBold'],
        bold: ['Inter_700Bold'],
      },
      borderRadius: {
        '2xl': '16px',
        '3xl': '22px',
        '4xl': '28px',
      },
    },
  },
  plugins: [],
};

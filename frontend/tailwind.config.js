/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        base: '#11161B',
        surface: '#181F26',
        elevated: '#222C36',
        line: '#283542',
        main: '#F0F3F6',
        sub: '#7E8F9F',
        gold: '#D4A853',
        'gold-hover': '#E2B866',
        glacier: '#38BDF8',
        'glacier-hover': '#60A5FA',
      },
      fontFamily: {
        display: ['"Plus Jakarta Sans"', 'sans-serif'],
        sans: ['Inter', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
      },
    },
  },
  plugins: [],
};

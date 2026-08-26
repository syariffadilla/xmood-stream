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
        background: '#12151C',
        surface: '#1B1F29',
        'surface-low': '#10131A',
        'surface-card': '#1B1F29',
        'surface-high': '#272A31',
        'surface-highest': '#32353C',
        'text-primary': '#ECEDEF',
        'text-secondary': '#8B92A3',
        'text-muted': '#656C7D',
        'accent-amber': '#E8A33D', // USDT & Tip Value
        'accent-teal': '#3FA796',  // $XMS Reward Token
        'brand-teal': '#3ED6C4',
        'brand-blue': '#1E56E0',
        'border-subtle': '#282D3B',
      },
      fontFamily: {
        grotesk: ['Space Grotesk', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
        sans: ['Inter', 'sans-serif'],
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(135deg, #3ED6C4 0%, #1E56E0 100%)',
        'brand-gradient-hover': 'linear-gradient(135deg, #4ef0de 0%, #2b65f5 100%)',
      },
    },
  },
  plugins: [],
};

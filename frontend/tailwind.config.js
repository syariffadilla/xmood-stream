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
        background: '#090C15',
        surface: '#0E131F',
        'surface-low': '#070910',
        'surface-card': '#111726',
        'surface-high': '#182032',
        'surface-highest': '#202A40',
        'text-primary': '#F3F4F6',
        'text-secondary': '#94A3B8',
        'text-muted': '#64748B',
        'accent-amber': '#F59E0B',
        'accent-teal': '#00F5A0',
        'brand-teal': '#00F5A0',
        'brand-cyan': '#00D9F5',
        'brand-purple': '#6366F1',
        'border-subtle': '#1E293B',
      },
      fontFamily: {
        grotesk: ['Space Grotesk', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
        sans: ['Inter', 'sans-serif'],
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(135deg, #00F5A0 0%, #00D9F5 50%, #6366F1 100%)',
        'brand-gradient-hover': 'linear-gradient(135deg, #1affb2 0%, #21e0fa 50%, #7d80f5 100%)',
        'botchain-glow': 'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(0, 245, 160, 0.15), rgba(99, 102, 241, 0.05), transparent)',
      },
    },
  },
  plugins: [],
};

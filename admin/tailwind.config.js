/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{ts,tsx,js,jsx}"],
  theme: {
    extend: {
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: { DEFAULT: 'hsl(var(--card))', foreground: 'hsl(var(--card-foreground))' },
        popover: { DEFAULT: 'hsl(var(--popover))', foreground: 'hsl(var(--popover-foreground))' },
        primary: { DEFAULT: 'hsl(var(--primary))', foreground: 'hsl(var(--primary-foreground))' },
        secondary: { DEFAULT: 'hsl(var(--secondary))', foreground: 'hsl(var(--secondary-foreground))' },
        muted: { DEFAULT: 'hsl(var(--muted))', foreground: 'hsl(var(--muted-foreground))' },
        accent: { DEFAULT: 'hsl(var(--accent))', foreground: 'hsl(var(--accent-foreground))' },
        destructive: { DEFAULT: 'hsl(var(--destructive))', foreground: 'hsl(var(--destructive-foreground))' },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        trustblue: {
          DEFAULT: '#125C8D',
          50: '#E8F2FA', 100: '#C5DCF0', 200: '#8BBDE0',
          300: '#519ED1', 400: '#2B7DB8', 500: '#125C8D',
          600: '#0E4A72', 700: '#0A3857', 800: '#07263C', 900: '#031421',
        },
        trustorange: {
          DEFAULT: '#FF6A00',
          50: '#FFF0E5', 100: '#FFD6B3', 200: '#FFAD66',
          300: '#FF8533', 400: '#FF6A00', 500: '#CC5500',
          600: '#994000', 700: '#662B00',
        },
      },
      fontFamily: {
        poppins: ['Poppins', 'sans-serif'],
        inter: ['Inter', 'sans-serif'],
      },
      borderRadius: {
        lg: 'var(--radius)', md: 'calc(var(--radius) - 2px)', sm: 'calc(var(--radius) - 4px)',
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-in': 'slideIn 0.3s ease-out',
        'pulse-live': 'pulse 1.5s cubic-bezier(0.4,0,0.6,1) infinite',
      },
      keyframes: {
        'accordion-down': { from: { height: '0' }, to: { height: 'var(--radix-accordion-content-height)' } },
        'accordion-up': { from: { height: 'var(--radix-accordion-content-height)' }, to: { height: '0' } },
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideIn: {
          '0%': { opacity: '0', transform: 'translateX(-12px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
  safelist: [
    'translate-x-full', '-translate-x-full', 'opacity-0',
    'bg-trustblue', 'bg-trustblue-50', 'bg-trustblue-100',
    'text-trustblue', 'text-trustblue-600',
    'border-trustblue', 'border-trustblue-100',
    'bg-trustorange', 'bg-trustorange-50', 'bg-trustorange-100',
    'text-trustorange', 'border-trustorange-100',
  ],
}

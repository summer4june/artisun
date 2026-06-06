import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      fontFamily: {
        editorial: ['var(--font-editorial)', 'Georgia', 'serif'],
        suisse: ['var(--font-suisse)', 'Helvetica Neue', 'sans-serif'],
      },
      keyframes: {
        scrollIndicator: {
          '0%': { transform: 'translateY(-100%)' },
          '50%': { transform: 'translateY(0)' },
          '100%': { transform: 'translateY(100%)' },
        }
      },
      animation: {
        scrollIndicator: 'scrollIndicator 2s cubic-bezier(0.85, 0, 0.15, 1) infinite',
      }
    },
  },
  plugins: [],
};
export default config;

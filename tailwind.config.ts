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
    },
  },
  plugins: [],
};
export default config;

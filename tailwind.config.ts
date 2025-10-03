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
        'brand-bg': '#1a1a2e',
        'brand-surface': '#16213e',
        'brand-primary': '#0f3460',
        'brand-secondary': '#533483',
        'brand-accent': '#e94560',
        'brand-text': '#dcdcdc',
        'brand-text-muted': '#a4a4a4',
      },
    },
  },
  plugins: [],
};
export default config;

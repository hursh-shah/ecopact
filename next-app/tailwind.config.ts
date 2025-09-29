import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#0EA5E9",
          dark: "#0369A1",
        },
        eco: {
          DEFAULT: "#16a34a",
          dark: "#166534",
        }
      }
    },
  },
  plugins: [],
};
export default config; 
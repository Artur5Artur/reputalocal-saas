import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          50: "#f6f4f1",
          100: "#ebe6de",
          800: "#2c261f",
          900: "#1a1612",
        },
        brass: {
          400: "#d4a853",
          500: "#c4922a",
          600: "#a07521",
        },
        sage: {
          400: "#7d9a7a",
          500: "#5c7a59",
        },
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
        display: ["var(--font-fraunces)", "Georgia", "serif"],
      },
    },
  },
  plugins: [],
};

export default config;

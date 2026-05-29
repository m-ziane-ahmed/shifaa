import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        shifaa: {
          lime: "#c4d778",
          green: "#4cb074",
          header: "#18534F",
          dark: "#18534F",
          footer: "#2d3238",
          cream: "#FAF8F5",
          ink: "#1a2e1f",
          muted: "#5c6b5e",
          border: "#e8e4dc",
        },
      },
      fontFamily: {
        sans: ["var(--font-outfit)", "system-ui", "sans-serif"],
        display: ["var(--font-fraunces)", "Georgia", "serif"],
      },
      boxShadow: {
        card: "0 2px 16px rgba(26, 46, 31, 0.06)",
        lift: "0 8px 32px rgba(26, 46, 31, 0.1)",
      },
    },
  },
  plugins: [],
};

export default config;

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
          // ── Charte graphique prototype Para-Pharma ──────────────
          // Vert primaire (identique au prototype #4aab3d)
          green:   "#4aab3d",
          // Vert foncé hover/dark (prototype #193a15)
          dark:    "#193a15",
          // Secondaire/noir (prototype #1b1a1a)
          ink:     "#1b1a1a",
          // Header navbar (derivé du vert primaire, légèrement plus sombre)
          header:  "#3c9830",
          // Footer dark
          footer:  "#1b1a1a",
          // Fond clair / cream (prototype #f9f9f9)
          cream:   "#f9f9f9",
          // Lime / accent clair (dérivé du vert primaire, 15% opacity)
          lime:    "#d4edce",
          // Texte muted (prototype #9b9b9b)
          muted:   "#9b9b9b",
          // Bordures (prototype #eaeaea)
          border:  "#eaeaea",
          // Fond page
          page:    "#ffffff",
        },
      },
      fontFamily: {
        // Police titres : Rubik (prototype) — chargée via Google Fonts
        sans:    ["var(--font-rubik)", "system-ui", "sans-serif"],
        display: ["var(--font-rubik)", "system-ui", "sans-serif"],
        // Corps : Roboto (prototype)
        body:    ["var(--font-roboto)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 2px 12px rgba(0, 0, 0, 0.06)",
        lift: "0 6px 24px rgba(0, 0, 0, 0.10)",
      },
      borderRadius: {
        xl:  "10px",
        "2xl": "14px",
        "3xl": "20px",
      },
    },
  },
  plugins: [],
};

export default config;

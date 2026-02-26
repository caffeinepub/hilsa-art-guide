/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "oklch(var(--background) / <alpha-value>)",
        foreground: "oklch(var(--foreground) / <alpha-value>)",
        card: {
          DEFAULT: "oklch(var(--card) / <alpha-value>)",
          foreground: "oklch(var(--card-foreground) / <alpha-value>)",
        },
        popover: {
          DEFAULT: "oklch(var(--popover) / <alpha-value>)",
          foreground: "oklch(var(--popover-foreground) / <alpha-value>)",
        },
        primary: {
          DEFAULT: "oklch(var(--primary) / <alpha-value>)",
          foreground: "oklch(var(--primary-foreground) / <alpha-value>)",
        },
        secondary: {
          DEFAULT: "oklch(var(--secondary) / <alpha-value>)",
          foreground: "oklch(var(--secondary-foreground) / <alpha-value>)",
        },
        muted: {
          DEFAULT: "oklch(var(--muted) / <alpha-value>)",
          foreground: "oklch(var(--muted-foreground) / <alpha-value>)",
        },
        accent: {
          DEFAULT: "oklch(var(--accent) / <alpha-value>)",
          foreground: "oklch(var(--accent-foreground) / <alpha-value>)",
        },
        destructive: {
          DEFAULT: "oklch(var(--destructive) / <alpha-value>)",
          foreground: "oklch(var(--destructive-foreground) / <alpha-value>)",
        },
        border: "oklch(var(--border) / <alpha-value>)",
        input: "oklch(var(--input) / <alpha-value>)",
        ring: "oklch(var(--ring) / <alpha-value>)",
        gold: {
          DEFAULT: "#d4af37",
          light: "#e8c84a",
          dark: "#b8941e",
        },
        ink: {
          DEFAULT: "#1a1a1a",
          light: "#222222",
          medium: "#333333",
        },
      },
      fontFamily: {
        serif: ["Playfair Display", "Georgia", "serif"],
        display: ["Cormorant Garamond", "Georgia", "serif"],
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        sharp: "0px",
        soft: "4px",
        card: "8px",
      },
      boxShadow: {
        "gold-sm": "0 1px 3px rgba(212, 175, 55, 0.15)",
        "gold-md": "0 4px 12px rgba(212, 175, 55, 0.20)",
        "gold-lg": "0 8px 24px rgba(212, 175, 55, 0.25)",
        "ink-sm": "0 1px 3px rgba(0, 0, 0, 0.4)",
        "ink-md": "0 4px 12px rgba(0, 0, 0, 0.5)",
        "ink-lg": "0 8px 24px rgba(0, 0, 0, 0.6)",
      },
      typography: {
        DEFAULT: {
          css: {
            color: "oklch(0.92 0.008 60)",
            a: { color: "oklch(0.72 0.12 75)" },
            h1: { fontFamily: "Playfair Display, serif" },
            h2: { fontFamily: "Playfair Display, serif" },
            h3: { fontFamily: "Playfair Display, serif" },
          },
        },
      },
    },
  },
  plugins: [
    require("tailwindcss-animate"),
    require("@tailwindcss/typography"),
  ],
};

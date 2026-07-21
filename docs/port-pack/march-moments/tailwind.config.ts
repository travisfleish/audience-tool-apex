import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    fontFamily: {
      sans: ["var(--font-sans)"],
      heading: ["var(--font-heading)"]
    },
    extend: {
      colors: {
        accent: {
          500: "var(--gs-accent-500)",
          600: "var(--gs-accent-600)"
        },
        gs: {
          "primary-900": "var(--gs-primary-900)",
          "primary-700": "var(--gs-primary-700)",
          neon: "var(--gs-neon)",
          bg: "var(--gs-bg)",
          surface: "var(--gs-surface)",
          muted: "var(--gs-muted)",
          border: "var(--gs-border)",
          text: "var(--gs-text)",
          "text-muted": "var(--gs-text-muted)",
          success: "var(--gs-success)",
          warning: "var(--gs-warning)",
          error: "var(--gs-error)"
        },
        pmg: {
          bg: "var(--pmg-bg)",
          surface: "var(--pmg-surface)"
        }
      },
      boxShadow: {
        soft: "0 12px 40px rgba(15, 23, 42, 0.08)"
      }
    }
  },
  plugins: []
} satisfies Config;

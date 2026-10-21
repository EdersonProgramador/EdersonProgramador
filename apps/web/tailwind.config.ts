import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#000000",
        void: "#030508",
        panel: "rgb(10 15 20 / <alpha-value>)",
        "panel-elev": "rgb(15 22 32 / <alpha-value>)",
        "blue-matte": {
          DEFAULT: "rgb(42 74 107 / <alpha-value>)",
          light: "rgb(61 106 140 / <alpha-value>)"
        },
        "blue-glow": "rgb(90 143 184 / <alpha-value>)",
        "blue-deep": "rgb(26 51 72 / <alpha-value>)"
      },
      fontFamily: {
        sans: ["Segoe UI", "system-ui", "sans-serif"],
        display: ["Segoe UI", "system-ui", "sans-serif"]
      },
      boxShadow: {
        panel: "0 32px 100px rgba(0, 0, 0, 0.75)",
        glow: "0 0 80px rgba(61, 106, 140, 0.25)",
        "glow-sm": "0 0 40px rgba(61, 106, 140, 0.18)"
      },
      animation: {
        "fade-up": "fadeUp 0.8s ease-out forwards",
        "pulse-glow": "pulseGlow 4s ease-in-out infinite",
        shimmer: "shimmer 8s linear infinite"
      },
      keyframes: {
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(24px)" },
          "100%": { opacity: "1", transform: "translateY(0)" }
        },
        pulseGlow: {
          "0%, 100%": { opacity: "0.45" },
          "50%": { opacity: "0.85" }
        },
        shimmer: {
          "0%": { backgroundPosition: "0% 50%" },
          "100%": { backgroundPosition: "200% 50%" }
        }
      }
    }
  },
  plugins: []
} satisfies Config;

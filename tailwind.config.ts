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
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: {
          50: "#eff6ff",
          100: "#dbeafe",
          500: "#3b82f6",
          600: "#2563eb",
          700: "#1d4ed8",
          800: "#1e40af",
          900: "#1e3a8a",
        },
      },
      keyframes: {
        blink: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.2" },
        },
        pulseGlow: {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(239, 68, 68, 0.7)" },
          "50%": { boxShadow: "0 0 20px 6px rgba(239, 68, 68, 0.9)" },
        },
        pulseGlowYellow: {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(234, 179, 8, 0.7)" },
          "50%": { boxShadow: "0 0 20px 6px rgba(234, 179, 8, 0.9)" },
        }
      },
      animation: {
        blink: "blink 1s ease-in-out infinite",
        pulseGlow: "pulseGlow 1.5s infinite",
        pulseGlowYellow: "pulseGlowYellow 1.5s infinite",
      },
    },
  },
  plugins: [],
};
export default config;

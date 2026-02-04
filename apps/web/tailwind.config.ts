import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./pages/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          900: "#0b0b0f",
          800: "#151521",
          700: "#1f1f2d",
          600: "#2c2c3e",
          500: "#3b3b52",
          400: "#60607a",
          300: "#8a8aa3",
          200: "#b9b9cc",
          100: "#e5e5f0"
        },
        accent: {
          600: "#e94b3c",
          500: "#ff5a3c",
          400: "#ff7a63"
        },
        neon: {
          500: "#8affc1"
        }
      },
      fontFamily: {
        display: ["'Archivo Black'", "ui-sans-serif", "system-ui"],
        sans: ["'DM Sans'", "ui-sans-serif", "system-ui"]
      },
      boxShadow: {
        glow: "0 0 40px rgba(255, 90, 60, 0.35)",
        soft: "0 20px 60px rgba(5, 5, 15, 0.35)"
      }
    }
  },
  plugins: []
};

export default config;

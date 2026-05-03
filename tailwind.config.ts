import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        // shadcn CSS variable colours
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // VHS neon palette
        neon: "#00ff41",
        pink: "#ff006e",
        yellow: "#ffe600",
        red: "#ff0000",
        cyan: "#00f5ff",
        dim: "#003b0f",
        void: "#000000",
        void2: "#0a0a0a",
      },
      fontFamily: {
        mono: ["Share Tech Mono", "Courier New", "monospace"],
        sans: ["Share Tech Mono", "Courier New", "monospace"],
        serif: ["Share Tech Mono", "Courier New", "monospace"],
        display: ["Share Tech Mono", "Courier New", "monospace"],
      },
      borderRadius: {
        lg: "0px",
        md: "0px",
        sm: "0px",
        DEFAULT: "0px",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        scanline: {
          "0%": { top: "-4px" },
          "100%": { top: "100vh" },
        },
        blink: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0" },
        },
        glitch: {
          "0%": { transform: "translateX(0) skewX(0deg)", opacity: "1" },
          "20%": { transform: "translateX(-2px) skewX(-1deg)", opacity: "0.9" },
          "40%": { transform: "translateX(2px) skewX(1deg)", opacity: "1" },
          "60%": { transform: "translateX(-1px) skewX(0deg)", opacity: "0.95" },
          "80%": { transform: "translateX(1px) skewX(-0.5deg)", opacity: "1" },
          "100%": { transform: "translateX(0) skewX(0deg)", opacity: "1" },
        },
        flicker: {
          "0%, 100%": { opacity: "1" },
          "10%": { opacity: "0.97" },
          "30%": { opacity: "1" },
          "50%": { opacity: "0.98" },
          "70%": { opacity: "1" },
          "90%": { opacity: "0.97" },
        },
        "glow-pulse": {
          "0%, 100%": {
            textShadow: "0 0 4px #003b0f, 0 0 8px #003b0f",
          },
          "50%": {
            textShadow: "0 0 8px #00ff41, 0 0 20px #00ff41, 0 0 40px #00ff41",
          },
        },
        "coin-pulse": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.6", transform: "scale(1.05)" },
        },
        "fade-in": {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        scanline: "scanline 8s linear infinite",
        blink: "blink 1s step-end infinite",
        glitch: "glitch 0.3s ease-in-out",
        flicker: "flicker 5s ease-in-out infinite",
        "glow-pulse": "glow-pulse 2s ease-in-out infinite",
        "coin-pulse": "coin-pulse 2s ease-in-out infinite",
        "fade-in": "fade-in 0.4s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;

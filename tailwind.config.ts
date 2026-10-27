import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        paper: "#E7E4DD",
        panel: "#F4F2ED",
        ink: "#1C1B19",
        inkfaint: "#6B675F",
        rule: "#C9C4B8",
        flag: "#B3401C",
        flagfaint: "#F0DDD2",
        clear: "#3D6B4A",
        clearfaint: "#DCE7DE"
      },
      fontFamily: {
        serif: ["Source Serif 4", "Georgia", "serif"],
        sans: ["Inter", "system-ui", "sans-serif"]
      }
    }
  },
  plugins: []
};

export default config;

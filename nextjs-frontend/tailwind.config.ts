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
        brand: {
          green: "#00a160",
          greenHover: "#008c53",
          light: "#f4f5f7",
          dark: "#1a1a1a",
          border: "#e2e8f0",
          featured: "#f5b316",
          textSecondary: "#666666",
          beige: "#fafaf0", // PropertyBikri signature CTA background
        },
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      lineHeight: {
        "extra-tight": "1.1",
      },
    },
  },
  plugins: [],
};
export default config;
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        gov: {
          saffron: "#FF9933",
          navy: "#0C2340",
          blue: "#1E3A8A",
          green: "#138808",
          gold: "#D4AF37",
          light: "#F8FAFC",
          card: "#FFFFFF",
          border: "#E2E8F0"
        }
      }
    },
  },
  plugins: [],
};

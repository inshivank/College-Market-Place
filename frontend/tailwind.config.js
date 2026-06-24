/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        cream: "#FFF9F2",
        ocean: {
          DEFAULT: "#2563EB",
          dark: "#1D4ED8",
          accent: "#60A5FA"
        },
        soft: "#DBEAFE"
      },
      boxShadow: {
        soft: "0 24px 60px rgba(15, 23, 42, 0.08)"
      }
    }
  },
  plugins: []
};

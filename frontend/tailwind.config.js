/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        clash: ["ClashDisplay", "sans-serif"],
        geist: ["Geist", "sans-serif"],
        mono: ["GeistMono", "monospace"],
      },
      colors: {
        orchid: "#673CE3",
        "orchid-100": "#774BF3",
        primary: "#9C95AC",
        grey: "#30303A",
        "grey-100": "#373743",
        dark: "#16151C",
        background: "#0D0D11",
      },
    },
  },
  plugins: [],
}
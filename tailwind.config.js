/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/app/**/*.{js,jsx,ts,tsx}",
    "./src/components/**/*.{js,jsx,ts,tsx}",
    "./src/features/**/*.{js,jsx,ts,tsx}",
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./features/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Urbanist_400Regular"],
        urbanist: ["Urbanist_400Regular"],
        "urbanist-medium": ["Urbanist_500Medium"],
        "urbanist-semibold": ["Urbanist_600SemiBold"],
        "urbanist-bold": ["Urbanist_700Bold"],
      },
    },
  },
  plugins: [],
};
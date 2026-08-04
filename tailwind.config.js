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
      colors: {
        primary: {
          DEFAULT: '#333333',
          border: '#F2EEF4',
        },
        secondary: '#626262',
        light: '#999999',
        danger: {
          DEFAULT: '#E70C0C',
          light: 'rgba(231, 12, 12, 0.10)',
        },
        success: {
          DEFAULT: '#02763D',
          light: 'rgba(2, 118, 61, 0.10)',
        },
        'green-primary': '#02763D',
        'green-light': '#E6F4EA',
        'green-border': '#D4EBDB',
      },
      fontFamily: {
        sans: ["Urbanist_400Regular"],
        normal: ["Urbanist_400Regular"],
        medium: ["Urbanist_500Medium"],
        semibold: ["Urbanist_600SemiBold"],
        bold: ["Urbanist_700Bold"],
        urbanist: ["Urbanist_400Regular"],
        "urbanist-medium": ["Urbanist_500Medium"],
        "urbanist-semibold": ["Urbanist_600SemiBold"],
        "urbanist-bold": ["Urbanist_700Bold"],
      },
    },
  },
  plugins: [],
};
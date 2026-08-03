const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname, {
    // ❗ ADD THIS BLOCK
    babel: {
        plugins: ["nativewind/babel"],
    },
});

module.exports = withNativeWind(config, {
    input: "./src/global.css",
});
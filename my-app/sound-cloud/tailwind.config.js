/** @type {import('tailwindcss').Config} */

module.exports = {
    content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
    theme: {
        extend: {
            screens: {
                xs: "360px",

                sm: "640px",

                md: "768px",

                lg: "1024px",

                xl: "1280px",

                "2xl": "1536px",

                "center-lg": "1080px",

                "center-xl": "1568px",

                "full-xl": "1920px",
            },
            colors: {
                white: "#FFFFFF",
                black:"#101010",
                purple:"#9354ff",
                cyan:"#54E0FF",
                darkpurple:"#5241B3",
                lightpurple:"#C9D4FF",
            },
        },
    },
    plugins: [],
};
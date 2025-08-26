
/** @type {import('tailwindcss').Config} */

export default {
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
        },
    },
    plugins: [],
}
/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ["./src/**/*.{js,jsx,ts,tsx}"],
    theme: {
        extend: {
            colors: {
                soko: {
                    yellow: "#facc15",
                    green: "#166534",
                    dark: "#111827",
                    cream: "#fffdf5",
                    light: "#f8fafc",
                    muted: "#6b7280",
                },
            },
            boxShadow: {
                soft: "0 10px 30px rgba(0,0,0,0.08)",
            },
        },
    },
    plugins: [],
};
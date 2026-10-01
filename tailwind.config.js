/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ["./src/**/*.{js,jsx,ts,tsx}"],
    theme: {
        extend: {
            colors: {
                soko: {
                    green: "#00a651",
                    "green-dark": "#007a3d",
                    "green-light": "#e8f8ef",
                    gold: "#ffb800",
                    "gold-hover": "#e6a600",
                    "gold-light": "#fff8e6",
                    dark: "#111827",
                    cream: "#f9fffb",
                    light: "#f8fafc",
                    muted: "#6b7280",
                    yellow: "#ffb800",
                },
            },
            boxShadow: {
                soft: "0 10px 40px -10px rgba(0, 166, 81, 0.12)",
                glow: "0 0 25px -5px rgba(0, 166, 81, 0.25)",
            },
            borderRadius: {
                'card': '32px',
                'inner': '24px',
            }
        },
    },
    plugins: [],
};
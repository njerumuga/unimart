/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ["./src/**/*.{js,jsx,ts,tsx}"],
    darkMode: "class",
    theme: {
        extend: {
            colors: {
                soko: {
                    canvas: "#FFFFFF",
                    tint: "#F8FAFC",
                    midnight: "#0F172A",
                    "midnight-light": "#1E293B",
                    accent: "#2563EB",
                    "accent-hover": "#1D4ED8",
                    "accent-light": "#EFF6FF",
                    indigo: "#4F46E5",
                    cta: "#F97316",
                    "cta-hover": "#EA580C",
                    "cta-light": "#FFF7ED",
                    trust: "#22C55E",
                    "trust-light": "#F0FDF4",
                    muted: "#64748B",
                    dark: "#0F172A",
                    gray: "#F1F5F9",
                },
            },
            boxShadow: {
                soft: "0 4px 20px -2px rgba(15, 23, 42, 0.06)",
                glow: "0 0 25px -5px rgba(37, 99, 235, 0.25)",
                card: "0 2px 10px rgba(15, 23, 42, 0.04)",
                "card-hover": "0 10px 25px -3px rgba(15, 23, 42, 0.08)",
            },
            borderRadius: {
                'card': '20px',
                'inner': '14px',
            }
        },
    },
    plugins: [],
};
/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: ["class"],
    content: ["./src/**/*.{js,jsx,ts,tsx}"],
    theme: {
        extend: {
            colors: {
                primary: {
                    DEFAULT: '#07182E',
                    foreground: '#FFFFFF',
                },
                secondary: {
                    DEFAULT: '#102B4B',
                    foreground: '#FFFFFF',
                },
                accent: {
                    DEFAULT: '#2563EB',
                    hover: '#1D4ED8',
                    foreground: '#FFFFFF',
                },
                navy: {
                    DEFAULT: '#07182E',
                    deep: '#102B4B',
                },
                electric: '#4C8DFF',
                soft: '#F6F8FC',
                tint: '#EAF1FB',
                ink: {
                    DEFAULT: '#0F172A',
                    muted: '#64748B',
                },
                background: '#F6F8FC',
                surface: '#FFFFFF',
                border: '#E2E8F0',
                text: {
                    primary: '#0F172A',
                    secondary: '#475569',
                },
                destructive: {
                    DEFAULT: "hsl(var(--destructive))",
                    foreground: "hsl(var(--destructive-foreground))",
                },
                muted: {
                    DEFAULT: "hsl(var(--muted))",
                    foreground: "hsl(var(--muted-foreground))",
                },
                popover: {
                    DEFAULT: "hsl(var(--popover))",
                    foreground: "hsl(var(--popover-foreground))",
                },
                card: {
                    DEFAULT: "hsl(var(--card))",
                    foreground: "hsl(var(--card-foreground))",
                },
            },
            fontFamily: {
                sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
                heading: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
                body: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
            },
            borderRadius: {
                lg: "var(--radius)",
                md: "calc(var(--radius) - 2px)",
                sm: "calc(var(--radius) - 4px)",
            },
            boxShadow: {
                card: '0 1px 2px rgba(15,23,42,0.04), 0 1px 3px rgba(15,23,42,0.03)',
                'card-hover': '0 2px 4px rgba(15,23,42,0.04), 0 12px 32px -12px rgba(15,23,42,0.14)',
                pop: '0 4px 6px -2px rgba(15,23,42,0.05), 0 20px 40px -12px rgba(15,23,42,0.18)',
            },
            keyframes: {
                "accordion-down": {
                    from: { height: "0" },
                    to: { height: "var(--radix-accordion-content-height)" },
                },
                "accordion-up": {
                    from: { height: "var(--radix-accordion-content-height)" },
                    to: { height: "0" },
                },
            },
            animation: {
                "accordion-down": "accordion-down 0.2s ease-out",
                "accordion-up": "accordion-up 0.2s ease-out",
            },
        },
    },
    plugins: [require("tailwindcss-animate")],
};

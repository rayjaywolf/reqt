import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            keyframes: {
                'float-1': {
                    '0%, 100%': { transform: 'translateY(0px) rotate(-2deg)' },
                    '50%': { transform: 'translateY(-10px) rotate(2deg)' },
                },
                'float-2': {
                    '0%, 100%': { transform: 'translateY(0px) rotate(2deg)' },
                    '50%': { transform: 'translateY(-15px) rotate(-2deg)' },
                },
                'float-3': {
                    '0%, 100%': { transform: 'translateY(0px) rotate(-3deg)' },
                    '50%': { transform: 'translateY(-12px) rotate(3deg)' },
                },
                'float-4': {
                    '0%, 100%': { transform: 'translateY(0px) rotate(3deg)' },
                    '50%': { transform: 'translateY(-8px) rotate(-3deg)' },
                },
            },
            animation: {
                'float-1': 'float-1 3s ease-in-out infinite',
                'float-2': 'float-2 3.5s ease-in-out infinite',
                'float-3': 'float-3 4s ease-in-out infinite',
                'float-4': 'float-4 3.2s ease-in-out infinite',
            },
        },
    },
    plugins: [],
};

export default config; 
/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        './app/**/*.{js,jsx,ts,tsx}',
        './components/**/*.{js,jsx,ts,tsx}',
    ],
    presets: [require('nativewind/preset')],
    theme: {
        extend: {
            colors: {
                // SYNAPSE AI Brand Colors
                synapse: {
                    50: '#F5F3FF',
                    100: '#EDE9FE',
                    200: '#DDD6FE',
                    300: '#C4B5FD',
                    400: '#A78BFA',
                    500: '#8B5CF6',
                    600: '#7C3AED', // Primary
                    700: '#6D28D9',
                    800: '#5B21B6',
                    900: '#4C1D95',
                    950: '#2E1065',
                },
                // Dark theme background
                dark: {
                    50: '#1A1A2E',
                    100: '#16162A',
                    200: '#12121F',
                    300: '#0F0F23', // Main background
                    400: '#0A0A18',
                    500: '#050510',
                },
                // Accent colors per module
                engine: {
                    DEFAULT: '#8B5CF6', // Purple - Creativity
                    light: '#A78BFA',
                    dark: '#6D28D9',
                },
                feed: {
                    DEFAULT: '#06B6D4', // Cyan - Information
                    light: '#22D3EE',
                    dark: '#0891B2',
                },
                pulse: {
                    DEFAULT: '#F59E0B', // Amber - Analytics
                    light: '#FBBF24',
                    dark: '#D97706',
                },
                showcase: {
                    DEFAULT: '#10B981', // Emerald - Community
                    light: '#34D399',
                    dark: '#059669',
                },
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
                mono: ['JetBrains Mono', 'monospace'],
            },
            animation: {
                'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                'glow': 'glow 2s ease-in-out infinite alternate',
            },
            keyframes: {
                glow: {
                    '0%': { boxShadow: '0 0 5px rgba(139, 92, 246, 0.5)' },
                    '100%': { boxShadow: '0 0 20px rgba(139, 92, 246, 0.8)' },
                },
            },
            borderRadius: {
                '4xl': '2rem',
            },
        },
    },
    plugins: [],
};

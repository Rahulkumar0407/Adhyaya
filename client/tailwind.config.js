/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                babua: {
                    primary: '#0ea5e9',    // Sky 500
                    secondary: '#3b82f6',  // Blue 500
                    accent: '#22d3ee',     // Cyan 400
                    text: '#0f172a',       // Slate 900
                    dark: '#1e293b',       // Slate 800
                    darker: '#0f172a',     // Slate 900
                    light: '#f8fafc',      // Slate 50
                    card: '#ffffff',       // White
                    success: '#10b981',    // Emerald 500
                    warning: '#f59e0b',    // Amber 500
                    danger: '#ef4444',     // Red 500
                    yellow: '#fbbf24',     // Amber 400 - Rickshaw yellow
                    skyLight: '#e0f2fe',   // Sky 100 - Hero background
                    skyMid: '#7dd3fc',     // Sky 300
                },
                // Cyberpunk theme colors
                'primary': '#1fb1f9',
                'neon-blue': '#00f2ff',
                'jalebi-orange': '#ff9900',
                'deep-space': '#0d0d0d',
                'background-light': '#f5f7f8',
                'background-dark': '#0d0d0d',
                'surface-dark': '#1a1a1a',
            },
            fontFamily: {
                sans: ['Poppins', 'Inter', 'system-ui', 'sans-serif'],
                mono: ['JetBrains Mono', 'monospace'],
                display: ['Space Grotesk', 'sans-serif'],
                bebas: ['Bebas Neue', 'sans-serif'],
            },
            boxShadow: {
                'neon': '0 0 10px rgba(0, 242, 255, 0.5)',
                'neon-orange': '0 0 10px rgba(255, 153, 0, 0.5)',
            },
            animation: {
                'gradient': 'gradient 8s linear infinite',
                'float': 'float 3s ease-in-out infinite',
                'float-slow': 'float 6s ease-in-out infinite',
                'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                'slide-up': 'slideUp 0.5s ease-out',
                'fade-in': 'fadeIn 0.5s ease-out',
                'bounce-slow': 'bounceSlow 2s ease-in-out infinite',
                'wiggle': 'wiggle 1s ease-in-out infinite',
            },
            keyframes: {
                gradient: {
                    '0%, 100%': { backgroundPosition: '0% 50%' },
                    '50%': { backgroundPosition: '100% 50%' },
                },
                float: {
                    '0%, 100%': { transform: 'translateY(0px)' },
                    '50%': { transform: 'translateY(-15px)' },
                },
                slideUp: {
                    '0%': { transform: 'translateY(20px)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' },
                },
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                bounceSlow: {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-10px)' },
                },
                wiggle: {
                    '0%, 100%': { transform: 'rotate(-3deg)' },
                    '50%': { transform: 'rotate(3deg)' },
                },
            },
            backgroundImage: {
                'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
                'hero-pattern': 'linear-gradient(to right bottom, rgba(99, 102, 241, 0.1), rgba(139, 92, 246, 0.1))',
                'dotted-pattern': 'radial-gradient(circle, #d1d5db 1px, transparent 1px)',
            },
            backgroundSize: {
                'dotted': '20px 20px',
            },
            maxWidth: {
                'desktop': '1280px',
            },
        },
    },
    plugins: [],
}

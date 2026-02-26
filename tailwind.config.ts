import type { Config } from 'tailwindcss';

const config: Config = {
    content: [
        './app/**/*.{js,ts,jsx,tsx,mdx}',
        './components/**/*.{js,ts,jsx,tsx,mdx}',
        './lib/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    // Safelist dynamic colors used in course cards
    // (Tailwind can't detect template-string classes like `bg-${color}-500`)
    safelist: [
        // Course card colors: emerald (groene boek), blue (tweede ronde), rose (derde ronde), amber (goedbezig)
        'bg-emerald-500/10', 'text-emerald-400', 'bg-emerald-500/5',
        'bg-blue-500/10', 'text-blue-400', 'bg-blue-500/5',
        'bg-rose-500/10', 'text-rose-400', 'bg-rose-500/5',
        'bg-amber-500/10', 'text-amber-400', 'bg-amber-500/5',
        'from-emerald-500/5', 'from-blue-500/5', 'from-rose-500/5', 'from-amber-500/5',
    ],
    theme: {
        extend: {
            colors: {
                shadow: {
                    950: '#030712',
                    900: '#0a0f1a',
                    800: '#111827',
                    700: '#1f2937',
                },
                neon: {
                    green: '#10b981',
                    glow: '#34d399',
                },
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
            },
            animation: {
                'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                'glow': 'glow 2s ease-in-out infinite alternate',
                'fade-in': 'fade-in 0.3s ease-out',
            },
            keyframes: {
                glow: {
                    '0%': { boxShadow: '0 0 20px rgba(16, 185, 129, 0.3)' },
                    '100%': { boxShadow: '0 0 40px rgba(16, 185, 129, 0.6)' },
                },
                'fade-in': {
                    from: { opacity: '0', transform: 'translateY(8px)' },
                    to: { opacity: '1', transform: 'translateY(0)' },
                },
            },
        },
    },
    plugins: [],
};

export default config;

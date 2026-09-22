/**
 * MeowlSite design tokens.
 *
 * Tailwind 3. Do NOT introduce Tailwind 4 syntax (@import "tailwindcss" /
 * @tailwindcss/postcss) -- postcss.config.js and app/src/index.css would break.
 *
 * The legacy names `dark` / `darker` / `accent` are kept registered on purpose so
 * that any component which has not been rewritten yet still renders correctly.
 */
/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./app/index.html', './app/src/**/*.{js,jsx}'],
  theme: {
    extend: {
      screens: {
        xs: '420px',
      },

      colors: {
        // ---- legacy aliases (do not remove) --------------------------------
        dark: '#0a1018',
        darker: '#04070d',

        // ---- surfaces ------------------------------------------------------
        void: '#04070d',
        surface: {
          DEFAULT: '#0a1018',
          2: '#101a26',
          3: '#16232f',
        },

        // ---- hairlines -----------------------------------------------------
        line: 'rgba(255, 255, 255, 0.07)',
        'line-strong': 'rgba(255, 255, 255, 0.12)',

        // ---- accent --------------------------------------------------------
        // `accent` stays a DEFAULT-carrying scale so `text-accent`,
        // `bg-accent/20`, `border-accent/70` and `from-accent` keep working.
        accent: {
          DEFAULT: '#06b6d4',
          2: '#22d3ee',
          3: '#0e7490',
        },
        iris: '#6366f1',

        // ---- type ----------------------------------------------------------
        ink: '#e8f1f7',
        muted: '#93a6b8',
        faint: '#5b6d7e',
      },

      fontFamily: {
        sans: [
          'Inter',
          'ui-sans-serif',
          'system-ui',
          '-apple-system',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'sans-serif',
        ],
        display: [
          'Space Grotesk',
          'Inter',
          'ui-sans-serif',
          'system-ui',
          'Segoe UI',
          'sans-serif',
        ],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Consolas', 'monospace'],
      },

      // Fluid scale. Replaces the ad-hoc text-3xl / text-4xl / text-[10px] mix.
      fontSize: {
        'display-1': ['clamp(2.75rem, 6.2vw, 5rem)', { lineHeight: '1.02', letterSpacing: '-0.03em' }],
        'display-2': ['clamp(2rem, 4.4vw, 3.5rem)', { lineHeight: '1.06', letterSpacing: '-0.025em' }],
        h1: ['clamp(1.875rem, 3.4vw, 2.75rem)', { lineHeight: '1.12', letterSpacing: '-0.02em' }],
        h2: ['clamp(1.5rem, 2.6vw, 2rem)', { lineHeight: '1.2', letterSpacing: '-0.015em' }],
        h3: ['1.25rem', { lineHeight: '1.3', letterSpacing: '-0.01em' }],
        h4: ['1.0625rem', { lineHeight: '1.4' }],
        'body-lg': ['1.0625rem', { lineHeight: '1.7' }],
        body: ['0.9375rem', { lineHeight: '1.65' }],
        caption: ['0.8125rem', { lineHeight: '1.5' }],
        eyebrow: ['0.75rem', { lineHeight: '1', letterSpacing: '0.16em' }],
      },

      borderRadius: {
        sm: '6px',
        md: '10px',
        lg: '14px',
        xl: '20px',
        '2xl': '28px',
        '3xl': '36px',
      },

      boxShadow: {
        e1: '0 1px 2px rgba(0, 0, 0, 0.40)',
        e2: '0 4px 16px -4px rgba(0, 0, 0, 0.50)',
        e3: '0 12px 32px -8px rgba(0, 0, 0, 0.60)',
        e4: '0 24px 64px -16px rgba(0, 0, 0, 0.70)',
        glow: '0 0 0 1px rgba(6, 182, 212, 0.35), 0 0 32px -4px rgba(6, 182, 212, 0.35)',
        'glow-sm': '0 0 20px -4px rgba(6, 182, 212, 0.40)',
        'glow-lg': '0 0 0 1px rgba(6, 182, 212, 0.45), 0 0 64px -8px rgba(6, 182, 212, 0.45)',
        hairline: 'inset 0 1px 0 0 rgba(255, 255, 255, 0.06)',
      },

      // Named `expo` / `spring` / `soft` rather than `out` on purpose: overriding
      // Tailwind's built-in `ease-out` key would silently change its meaning.
      transitionTimingFunction: {
        expo: 'cubic-bezier(0.16, 1, 0.3, 1)',
        spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
        soft: 'cubic-bezier(0.65, 0, 0.35, 1)',
      },

      transitionDuration: {
        250: '250ms',
        400: '400ms',
        700: '700ms',
      },

      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        // Named `grid-lines` / `grid-size` so the image and the size utilities
        // do not collide on a single `bg-grid` class.
        'grid-lines':
          'linear-gradient(to right, rgba(255,255,255,0.035) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.035) 1px, transparent 1px)',
      },

      backgroundSize: {
        'grid-size': '56px 56px',
      },

      keyframes: {
        // ---- kept from the original config ---------------------------------
        scroll: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(6px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },

        // ---- entrance ------------------------------------------------------
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(18px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.96)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        blurIn: {
          '0%': { opacity: '0', filter: 'blur(10px)' },
          '100%': { opacity: '1', filter: 'blur(0)' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(24px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        slideInDown: {
          '0%': { opacity: '0', transform: 'translateY(-12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },

        // ---- tab transitions ----------------------------------------------
        tabIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)', filter: 'blur(6px)' },
          '100%': { opacity: '1', transform: 'translateY(0)', filter: 'blur(0)' },
        },
        tabOut: {
          '0%': { opacity: '1', transform: 'translateY(0)', filter: 'blur(0)' },
          '100%': { opacity: '0', transform: 'translateY(-8px)', filter: 'blur(6px)' },
        },

        // ---- ambience ------------------------------------------------------
        aurora: {
          '0%, 100%': { transform: 'translate3d(0, 0, 0) scale(1)' },
          '33%': { transform: 'translate3d(6%, -4%, 0) scale(1.12)' },
          '66%': { transform: 'translate3d(-5%, 5%, 0) scale(1.06)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        gradientPan: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        spinSlow: {
          to: { transform: 'rotate(360deg)' },
        },

        // ---- feedback ------------------------------------------------------
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
        pulseRing: {
          '0%': { transform: 'scale(0.9)', opacity: '1' },
          '70%': { transform: 'scale(2.2)', opacity: '0' },
          '100%': { transform: 'scale(2.2)', opacity: '0' },
        },
      },

      animation: {
        // kept
        scroll: 'scroll 30s linear infinite',
        'fade-in': 'fadeIn 0.25s ease-out forwards',

        // entrance
        'fade-up': 'fadeUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'scale-in': 'scaleIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'blur-in': 'blurIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'slide-in-right': 'slideInRight 0.45s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'slide-in-down': 'slideInDown 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards',

        // tabs
        'tab-in': 'tabIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'tab-out': 'tabOut 0.15s cubic-bezier(0.65, 0, 0.35, 1) forwards',

        // ambience
        aurora: 'aurora 26s ease-in-out infinite',
        'aurora-slow': 'aurora 38s ease-in-out infinite',
        float: 'float 7s ease-in-out infinite',
        'gradient-pan': 'gradientPan 8s ease-in-out infinite',
        'spin-slow': 'spinSlow 18s linear infinite',

        // feedback
        shimmer: 'shimmer 1.6s ease-in-out infinite',
        'pulse-ring': 'pulseRing 2.4s cubic-bezier(0.65, 0, 0.35, 1) infinite',
      },
    },
  },
  plugins: [],
};

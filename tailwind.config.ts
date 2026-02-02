import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  safelist: [
    'text-[8px]',
    'text-[9px]',
    'text-[10px]',
    'text-[11px]',
    'md:text-[9px]',
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
          hover: "hsl(var(--xp-primary-hover))",
          pressed: "hsl(var(--xp-primary-pressed))",
          glow: "hsl(var(--xp-primary-glow))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        xp: {
          primary: "hsl(var(--xp-primary))",
          "primary-hover": "hsl(var(--xp-primary-hover))",
          "primary-pressed": "hsl(var(--xp-primary-pressed))",
          "primary-foreground": "hsl(var(--xp-primary-foreground))",
          "primary-glow": "hsl(var(--xp-primary-glow))",
          background: "hsl(var(--xp-background))",
          surface: "hsl(var(--xp-surface))",
          "surface-muted": "hsl(var(--xp-surface-muted))",
          border: "hsl(var(--xp-border))",
          ring: "hsl(var(--xp-ring))",
          foreground: "hsl(var(--xp-foreground))",
          "foreground-muted": "hsl(var(--xp-foreground-muted))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
        // Cores utilitárias extras para uso direto
        'light-bg': '#F6F7F9',
        'light-card': '#FFFFFF',
        'card-light': 'hsl(210 20% 98%)', // Soft off-white for cards in light mode
        'light-text': '#2A2A2A',
        'light-title': '#161616',
        'dark-bg': '#001F3F',
        'dark-card': '#00264D',
        'dark-input': '#00264D',
        'dark-border': '#003366',
        'dark-text': '#FFFFFF',
        'dark-text-secondary': '#B0C4DE',
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;

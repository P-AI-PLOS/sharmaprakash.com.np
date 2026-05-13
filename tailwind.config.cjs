/**
 * Tailwind reads design tokens from src/styles/tokens.css.
 * Adding new utilities? Add the token to tokens.css and design.md first.
 */
const scale = (prefix, name) =>
  Object.fromEntries(
    [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950].map((n) => [
      n,
      `var(--${name}-${n})`,
    ]),
  );

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{astro,html,js,jsx,ts,tsx,md,mdx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        ink: scale("ink", "ink"),
        accent: scale("accent", "accent"),
        surface: {
          base: "var(--surface-base)",
          raised: "var(--surface-raised)",
          sunken: "var(--surface-sunken)",
          inverse: "var(--surface-inverse)",
          glow: "var(--surface-glow)",
        },
      },
      textColor: {
        strong: "var(--text-strong)",
        default: "var(--text-default)",
        muted: "var(--text-muted)",
        faint: "var(--text-faint)",
        "on-inverse": "var(--text-on-inverse)",
        "on-inverse-muted": "var(--text-on-inverse-muted)",
      },
      borderColor: {
        default: "var(--border-default)",
        strong: "var(--border-strong)",
        accent: "var(--border-accent)",
      },
      fontFamily: {
        ui: ["var(--font-ui)"],
        sans: ["var(--font-ui)"],
        serif: ["var(--font-serif)"],
        mono: ["var(--font-mono)"],
      },
      fontSize: {
        "display-2xl": ["76px", { lineHeight: "1.05", letterSpacing: "-0.03em", fontWeight: "700" }],
        "display-xl":  ["60px", { lineHeight: "1.1",  letterSpacing: "-0.025em", fontWeight: "700" }],
        "display-lg":  ["48px", { lineHeight: "1.1",  letterSpacing: "-0.02em",  fontWeight: "700" }],
        h1:            ["36px", { lineHeight: "1.15", letterSpacing: "-0.02em",  fontWeight: "700" }],
        h2:            ["28px", { lineHeight: "1.2",  letterSpacing: "-0.015em", fontWeight: "600" }],
        h3:            ["22px", { lineHeight: "1.3",  letterSpacing: "-0.01em",  fontWeight: "600" }],
        h4:            ["18px", { lineHeight: "1.4",  letterSpacing: "-0.005em", fontWeight: "600" }],
        "body-lg":     ["18px", { lineHeight: "1.65", letterSpacing: "0",        fontWeight: "400" }],
        body:          ["16px", { lineHeight: "1.6",  letterSpacing: "0",        fontWeight: "400" }],
        "body-sm":     ["14px", { lineHeight: "1.55", letterSpacing: "0",        fontWeight: "400" }],
        caption:       ["12px", { lineHeight: "1.5",  letterSpacing: "0.02em",   fontWeight: "500" }],
        mono:          ["14px", { lineHeight: "1.55", letterSpacing: "0",        fontWeight: "400" }],
      },
      spacing: {
        0: "var(--space-0)",
        1: "var(--space-1)",
        2: "var(--space-2)",
        3: "var(--space-3)",
        4: "var(--space-4)",
        5: "var(--space-5)",
        6: "var(--space-6)",
        8: "var(--space-8)",
        10: "var(--space-10)",
        12: "var(--space-12)",
        16: "var(--space-16)",
        20: "var(--space-20)",
        24: "var(--space-24)",
        32: "var(--space-32)",
      },
      borderRadius: {
        sm: "var(--radius-sm)",
        md: "var(--radius-md)",
        lg: "var(--radius-lg)",
        xl: "var(--radius-xl)",
        pill: "var(--radius-pill)",
        full: "var(--radius-full)",
      },
      boxShadow: {
        sm: "var(--shadow-sm)",
        md: "var(--shadow-md)",
        lg: "var(--shadow-lg)",
        glow: "var(--shadow-glow)",
      },
      transitionDuration: {
        fast: "var(--dur-fast)",
        normal: "var(--dur-normal)",
        slow: "var(--dur-slow)",
        pageturn: "var(--dur-pageturn)",
      },
      transitionTimingFunction: {
        "out-quad": "var(--ease-out-quad)",
        "out-expo": "var(--ease-out-expo)",
        "in-out-cubic": "var(--ease-in-out-cubic)",
      },
      maxWidth: {
        prose: "65ch",
        reading: "68ch",
        display: "18ch",
      },
      keyframes: {
        slidedown: {
          "0%": { transform: "translateY(-100%)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        auroradrift: {
          "0%, 100%": { transform: "translate(0%, 0%) scale(1)" },
          "50%": { transform: "translate(8%, -6%) scale(1.08)" },
        },
        underlinegrow: {
          "0%": { transform: "scaleX(0)" },
          "100%": { transform: "scaleX(1)" },
        },
      },
      animation: {
        slidedown: "slidedown var(--dur-slow) var(--ease-out-expo) 1",
        auroradrift: "auroradrift 14s var(--ease-in-out-cubic) infinite alternate",
      },
    },
  },
  plugins: [],
};

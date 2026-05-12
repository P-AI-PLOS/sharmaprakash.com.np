/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{astro,html,js,jsx,ts,tsx,md,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: "rgb(var(--color-300) / <alpha-value>)",
        secondary: "#AEE272",
        body: "#BFBECB",
        heading: "#FAFAFA",
        placeholder: "#707070",
        accent: "rgb(var(--color-300) / <alpha-value>)",
        dark: {
          50: "#09121F",
          100: "#080E16",
          200: "#09121F",
          300: "#0C1727",
          400: "#1A222E",
        },
        grey: {
          darken: "#0B1223",
          DEFAULT: "#0F172A",
          lighten: "#162033",
        },
      },
      textColor: {
        primary: Object.fromEntries(
          [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 1000].map((n) => [
            n,
            `rgb(var(--color-${n}) / <alpha-value>)`,
          ]),
        ),
      },
      backgroundColor: {
        primary: Object.fromEntries(
          [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 1000].map((n) => [
            n,
            `rgb(var(--color-${n}) / <alpha-value>)`,
          ]),
        ),
      },
      borderColor: {
        primary: Object.fromEntries(
          [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 1000].map((n) => [
            n,
            `rgb(var(--color-${n}) / <alpha-value>)`,
          ]),
        ),
      },
      fill: {
        primary: {
          300: "rgb(var(--color-300) / <alpha-value>)",
          500: "rgb(var(--color-500) / <alpha-value>)",
          1000: "rgb(var(--color-1000) / <alpha-value>)",
        },
      },
      boxShadow: {
        "3xl": "0 0.1em .7em var(--color-300), 0 0.1em 0.1em var((--color-300))",
      },
      fontFamily: {
        display: ["poppins", "sans-serif"],
        segoe: ["poppins", "sans-serif"],
        sans: ["poppins", "sans-serif"],
        body: ["poppins", "sans-serif"],
      },
      fontSize: {
        sm: ["14px", "1.8"],
        base: ["16px", "1.6"],
        lg: ["18px", "1.5"],
        xl: ["20px", "1.5"],
        "2xl": ["22px", "1.4"],
        "3xl": ["26px", "1.3"],
        "4xl": ["36px", "1.2"],
        "5xl": ["46px", "1.2"],
        "6xl": ["68px", "1.2"],
      },
      borderWidth: { 3: "3px", 6: "6px", 10: "10px" },
      animation: {
        lefttoright: "titleDeviderAnimation 3s ease-in-out infinite",
        ledgerleftright: "ledgerLeftRight 3s ease-in-out infinite",
        ledgerrightleft: "ledgerRightLeft 3s ease-in-out infinite",
        ledgertopbottom: "ledgerTopBottom 3s ease-in-out infinite",
        ledgerbottomtop: "ledgerBottomTop 3s ease-in-out infinite",
        slidedown: "slideDown 1s ease-in-out 1",
      },
    },
  },
  plugins: [],
};

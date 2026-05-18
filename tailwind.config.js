/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["Poppins", "Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      colors: {
        ember: {
          50: "#fff7ed",
          100: "#ffedd5",
          200: "#fed7aa",
          300: "#fdba74",
          400: "#fb923c",
          500: "#f97316",
          600: "#ea580c",
          700: "#c2410c",
          800: "#9a3412",
          900: "#7c2d12",
        },
        rosefire: {
          500: "#ef4444",
          600: "#dc2626",
        },
        ink: {
          900: "#15120f",
          800: "#241f1a",
          700: "#3a332b",
          500: "#6f665e",
        },
        pearl: {
          50: "#fffaf5",
          100: "#f7f1e9",
          200: "#ebe2d8",
        },
      },
      boxShadow: {
        glow: "0 18px 60px rgba(249, 115, 22, 0.28)",
        soft: "0 22px 80px rgba(34, 28, 20, 0.12)",
        card: "0 14px 44px rgba(21, 18, 15, 0.10)",
      },
      backgroundImage: {
        "premium-radial":
          "radial-gradient(circle at 20% 20%, rgba(249, 115, 22, 0.22), transparent 30%), radial-gradient(circle at 80% 10%, rgba(20, 184, 166, 0.16), transparent 26%), radial-gradient(circle at 80% 80%, rgba(220, 38, 38, 0.12), transparent 30%)",
      },
      borderRadius: {
        "2xl": "1.25rem",
        "3xl": "1.75rem",
      },
      keyframes: {
        shimmer: {
          "0%": { backgroundPosition: "200% 0" },
          "100%": { backgroundPosition: "-200% 0" },
        },
        gradientShift: {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-14px)" },
        },
      },
      animation: {
        shimmer: "shimmer 1.8s linear infinite",
        gradient: "gradientShift 8s ease infinite",
        float: "float 5s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

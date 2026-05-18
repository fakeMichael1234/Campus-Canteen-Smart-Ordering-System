import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { classNames } from "../lib/utils";

const variants = {
  primary:
    "premium-gradient text-white shadow-glow hover:shadow-[0_22px_70px_rgba(249,115,22,0.34)]",
  secondary:
    "border border-ink-900/10 bg-white/90 text-ink-900 shadow-sm hover:border-ember-300 hover:bg-white",
  dark: "bg-ink-900 text-white shadow-card hover:bg-ink-800",
  ghost: "text-ink-700 hover:bg-ember-50 hover:text-ember-700",
  danger: "bg-rosefire-500 text-white shadow-card hover:bg-rosefire-600",
};

export default function PremiumButton({
  children,
  className = "",
  icon: Icon,
  loading = false,
  variant = "primary",
  type = "button",
  ...props
}) {
  return (
    <motion.button
      type={type}
      whileHover={{ y: -2, scale: 1.015 }}
      whileTap={{ scale: 0.97 }}
      className={classNames(
        "focus-ring relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-full px-5 py-3 text-sm font-extrabold transition disabled:cursor-not-allowed disabled:opacity-60",
        variants[variant],
        className
      )}
      disabled={loading || props.disabled}
      {...props}
    >
      <span className="pointer-events-none absolute inset-0 opacity-0 transition hover:opacity-100">
        <span className="absolute inset-x-6 -top-8 h-12 rounded-full bg-white/20 blur-xl" />
      </span>
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : Icon ? <Icon className="h-4 w-4" /> : null}
      <span className="relative">{children}</span>
    </motion.button>
  );
}

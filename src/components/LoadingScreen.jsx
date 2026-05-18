import { motion } from "framer-motion";

export function LoadingScreen({ label = "Syncing your Campus Bites account" }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-premium-radial px-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-panel flex w-full max-w-sm flex-col items-center rounded-3xl p-8 text-center"
      >
        <div className="relative mb-5 h-16 w-16">
          <motion.div
            className="absolute inset-0 rounded-full border-4 border-ember-100"
            animate={{ rotate: 360 }}
            transition={{ duration: 1.1, repeat: Infinity, ease: "linear" }}
          />
          <motion.div
            className="absolute inset-0 rounded-full border-4 border-transparent border-t-ember-500"
            animate={{ rotate: 360 }}
            transition={{ duration: 0.72, repeat: Infinity, ease: "linear" }}
          />
          <div className="absolute inset-3 rounded-full bg-gradient-to-br from-ember-500 to-rosefire-500 shadow-glow" />
        </div>
        <p className="text-sm font-extrabold text-ink-900">{label}</p>
        <p className="mt-2 text-xs font-semibold text-ink-500">
          Pulling profile, cart, orders, settings, and favorites from Firestore.
        </p>
      </motion.div>
    </div>
  );
}

export function SkeletonCard({ className = "" }) {
  return <div className={`skeleton ${className}`} />;
}

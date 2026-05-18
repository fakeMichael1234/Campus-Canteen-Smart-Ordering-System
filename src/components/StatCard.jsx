import { motion } from "framer-motion";

export default function StatCard({ icon: Icon, label, value, tone = "orange", delay = 0 }) {
  const toneClass =
    tone === "teal"
      ? "from-teal-500 to-cyan-500"
      : tone === "red"
        ? "from-rosefire-500 to-ember-500"
        : tone === "dark"
          ? "from-ink-900 to-ink-700"
          : "from-ember-500 to-amber-400";

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.35 }}
      whileHover={{ y: -5 }}
      className="premium-card rounded-3xl p-5"
    >
      <div className={`mb-4 inline-flex rounded-2xl bg-gradient-to-br ${toneClass} p-3 text-white shadow-lg`}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="font-display text-2xl font-extrabold text-ink-900">{value}</div>
      <div className="mt-1 text-xs font-bold uppercase tracking-[0.14em] text-ink-500">{label}</div>
    </motion.div>
  );
}

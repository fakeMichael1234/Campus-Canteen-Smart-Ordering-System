import { motion } from "framer-motion";
import PremiumButton from "./PremiumButton";

export default function EmptyState({ icon: Icon, title, body, action, onAction }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      className="premium-card flex flex-col items-center rounded-3xl px-6 py-12 text-center"
    >
      {Icon ? (
        <div className="mb-5 rounded-3xl bg-ember-50 p-5 text-ember-600">
          <Icon className="h-9 w-9" />
        </div>
      ) : null}
      <h3 className="font-display text-xl font-extrabold text-ink-900">{title}</h3>
      <p className="mt-2 max-w-md text-sm font-medium leading-6 text-ink-500">{body}</p>
      {action ? (
        <PremiumButton className="mt-6" onClick={onAction}>
          {action}
        </PremiumButton>
      ) : null}
    </motion.div>
  );
}

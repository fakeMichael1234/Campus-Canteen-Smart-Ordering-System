import { AnimatePresence, motion } from "framer-motion";
import { Minus, Plus, ShoppingBag, Trash2, WalletCards } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import EmptyState from "../components/EmptyState";
import PageTransition from "../components/PageTransition";
import PremiumButton from "../components/PremiumButton";
import { useAuth } from "../context/AuthContext";
import { calculateTotals, formatCurrency } from "../lib/utils";

export default function Cart() {
  const { cartItems, updateCartQuantity, clearCart, profile } = useAuth();
  const navigate = useNavigate();
  const totals = calculateTotals(cartItems);
  const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  if (!cartItems.length) {
    return (
      <PageTransition className="section-shell py-10">
        <EmptyState
          icon={ShoppingBag}
          title="Your cart is empty"
          body="Add food from the menu and it will stay synced to Firestore for your next session."
          action="Browse menu"
          onAction={() => navigate("/menu")}
        />
      </PageTransition>
    );
  }

  return (
    <PageTransition className="section-shell py-8 md:py-10">
      <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <div className="eyebrow">
            <ShoppingBag className="h-3.5 w-3.5" />
            Firestore cart
          </div>
          <h1 className="mt-4 font-display text-4xl font-extrabold text-ink-900">Review your order.</h1>
          <p className="mt-3 max-w-2xl text-sm font-semibold leading-7 text-ink-500">
            This cart is saved in <span className="font-extrabold text-ink-800">cart/{profile?.uid}</span> and
            restored after refresh, logout, or device switch.
          </p>
        </div>
        <PremiumButton variant="secondary" icon={Trash2} onClick={clearCart}>
          Clear cart
        </PremiumButton>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <div className="space-y-4">
          <AnimatePresence initial={false}>
            {cartItems.map((item) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -24 }}
                className="premium-card grid gap-4 rounded-3xl p-4 sm:grid-cols-[112px_1fr_auto] sm:items-center"
              >
                <img src={item.image} alt="" className="h-32 w-full rounded-3xl object-cover sm:h-28 sm:w-28" />
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-black ${
                        item.veg ? "bg-teal-50 text-teal-700" : "bg-red-50 text-rosefire-600"
                      }`}
                    >
                      {item.veg ? "Veg" : "Non-veg"}
                    </span>
                    <span className="rounded-full bg-pearl-100 px-3 py-1 text-xs font-black text-ink-500">
                      {item.category}
                    </span>
                  </div>
                  <h2 className="mt-3 font-display text-xl font-extrabold text-ink-900">{item.name}</h2>
                  <p className="mt-1 text-sm font-semibold text-ink-500">
                    {formatCurrency(item.price)} x {item.quantity}
                  </p>
                </div>

                <div className="flex items-center justify-between gap-4 sm:flex-col sm:items-end">
                  <div className="font-display text-xl font-extrabold text-ember-700">
                    {formatCurrency(item.price * item.quantity)}
                  </div>
                  <div className="flex items-center gap-2 rounded-full border border-ember-200 bg-ember-50 p-1.5">
                    <button
                      onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                      className="grid h-9 w-9 place-items-center rounded-full bg-white text-ink-800 shadow-sm transition hover:text-rosefire-600"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="w-7 text-center font-display text-lg font-extrabold">{item.quantity}</span>
                    <button
                      onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                      className="grid h-9 w-9 place-items-center rounded-full bg-ink-900 text-white shadow-sm transition hover:bg-ember-600"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        <aside className="h-fit rounded-[2rem] border border-white/80 bg-white/90 p-5 shadow-soft backdrop-blur-2xl lg:sticky lg:top-28">
          <div className="mb-5 flex items-center gap-3">
            <div className="rounded-2xl bg-ember-50 p-3 text-ember-700">
              <WalletCards className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-display text-xl font-extrabold text-ink-900">Bill summary</h2>
              <p className="text-xs font-bold text-ink-500">{itemCount} total items</p>
            </div>
          </div>

          <div className="space-y-3 text-sm font-bold">
            {[
              ["Subtotal", totals.subtotal],
              ["GST 5%", totals.gst],
              ["Platform fee", totals.platformFee],
              ["Pickup fee", totals.pickupFee],
            ].map(([label, value]) => (
              <div key={label} className="flex items-center justify-between rounded-2xl bg-pearl-50 px-4 py-3">
                <span className="text-ink-500">{label}</span>
                <span className="text-ink-900">{formatCurrency(value)}</span>
              </div>
            ))}
          </div>

          <div className="mt-4 rounded-3xl bg-ink-900 p-5 text-white">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-white/60">Total payable</span>
              <span className="font-display text-3xl font-extrabold">{formatCurrency(totals.total)}</span>
            </div>
          </div>

          <div className="mt-5 grid gap-3">
            <PremiumButton className="w-full" icon={WalletCards} onClick={() => navigate("/checkout")}>
              Continue to checkout
            </PremiumButton>
            <Link
              to="/menu"
              className="inline-flex items-center justify-center rounded-full border border-ink-900/10 bg-white px-5 py-3 text-sm font-extrabold text-ink-800 shadow-sm transition hover:border-ember-300"
            >
              Add more items
            </Link>
          </div>
        </aside>
      </div>
    </PageTransition>
  );
}

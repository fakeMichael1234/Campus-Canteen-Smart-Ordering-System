import { AnimatePresence, motion } from "framer-motion";
import { Heart, Minus, Plus, Star } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { formatCurrency } from "../lib/utils";
import PremiumButton from "./PremiumButton";

export default function FoodCard({ item, index = 0 }) {
  const { addToCart, cartItems, favoriteIds, toggleFavorite, updateCartQuantity } = useAuth();
  const cartItem = cartItems.find((entry) => entry.id === item.id);
  const quantity = cartItem?.quantity || 0;
  const favorite = favoriteIds.includes(item.id);

  const setQuantity = async (next) => {
    if (next <= 0) {
      await updateCartQuantity(item.id, 0);
      return;
    }
    if (quantity === 0) await addToCart(item, next);
    else await updateCartQuantity(item.id, next);
  };

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.035, 0.25), duration: 0.34 }}
      whileHover={{ y: -8 }}
      className="group premium-card overflow-hidden rounded-3xl"
    >
      <div className="relative h-48 overflow-hidden bg-pearl-100">
        <motion.img
          src={item.image}
          alt={item.name}
          className="h-full w-full object-cover transition duration-700 group-hover:scale-110"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-900/60 via-ink-900/10 to-transparent" />
        <button
          onClick={() => toggleFavorite(item.id)}
          className="focus-ring absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full border border-white/60 bg-white/80 text-ink-700 shadow-sm backdrop-blur-xl transition hover:scale-105"
        >
          <motion.span animate={favorite ? { scale: [1, 1.3, 1] } : { scale: 1 }}>
            <Heart
              className={`h-5 w-5 ${favorite ? "fill-rosefire-500 text-rosefire-500" : "text-ink-700"}`}
            />
          </motion.span>
        </button>
        <div className="absolute bottom-4 left-4 flex flex-wrap gap-2">
          <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-black text-ink-900 shadow-sm backdrop-blur">
            {item.category}
          </span>
          <span
            className={`rounded-full px-3 py-1 text-xs font-black shadow-sm backdrop-blur ${
              item.veg ? "bg-teal-50 text-teal-700" : "bg-red-50 text-rosefire-600"
            }`}
          >
            {item.veg ? "Veg" : "Non-veg"}
          </span>
        </div>
      </div>

      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="font-display text-lg font-extrabold leading-tight text-ink-900">{item.name}</h3>
            <div className="mt-2 flex items-center gap-3 text-xs font-bold text-ink-500">
              <span className="inline-flex items-center gap-1 text-amber-600">
                <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                {item.rating}
              </span>
              <span>{item.prepTime}</span>
            </div>
          </div>
          <div className="rounded-2xl bg-ember-50 px-3 py-2 text-sm font-black text-ember-700">
            {formatCurrency(item.price)}
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {item.tags.map((tag) => (
            <span key={tag} className="rounded-full bg-pearl-100 px-3 py-1 text-[11px] font-extrabold text-ink-500">
              {tag}
            </span>
          ))}
        </div>

        <div className="mt-5 min-h-[46px]">
          <AnimatePresence mode="wait">
            {quantity > 0 ? (
              <motion.div
                key="qty"
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.92 }}
                className="flex items-center justify-between rounded-full border border-ember-200 bg-ember-50 p-1.5"
              >
                <button
                  onClick={() => setQuantity(quantity - 1)}
                  className="grid h-9 w-9 place-items-center rounded-full bg-white text-ink-800 shadow-sm transition hover:text-rosefire-600"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="font-display text-lg font-extrabold text-ink-900">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="grid h-9 w-9 place-items-center rounded-full bg-ink-900 text-white shadow-sm transition hover:bg-ember-600"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </motion.div>
            ) : (
              <motion.div key="add" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <PremiumButton className="w-full" icon={Plus} onClick={() => addToCart(item, 1)}>
                  Add to cart
                </PremiumButton>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.article>
  );
}

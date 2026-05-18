import { AnimatePresence, motion } from "framer-motion";
import { Filter, Leaf, Search, ShoppingCart, SlidersHorizontal, X } from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import FoodCard from "../components/FoodCard";
import PageTransition from "../components/PageTransition";
import PremiumButton from "../components/PremiumButton";
import { categories, menuItems } from "../data/menu";
import { useAuth } from "../context/AuthContext";
import { calculateTotals, formatCurrency } from "../lib/utils";

export default function Menu() {
  const { cartItems } = useAuth();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [vegOnly, setVegOnly] = useState(false);

  const filteredItems = useMemo(() => {
    return menuItems.filter((item) => {
      const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = category === "All" || item.category === category;
      const matchesVeg = !vegOnly || item.veg;
      return matchesSearch && matchesCategory && matchesVeg;
    });
  }, [category, search, vegOnly]);

  const totals = calculateTotals(cartItems);
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <PageTransition className="section-shell py-8 md:py-10">
      <div className="mb-8 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="eyebrow">
            <SlidersHorizontal className="h-3.5 w-3.5" />
            Live synced menu
          </div>
          <h1 className="mt-4 font-display text-4xl font-extrabold text-ink-900 md:text-5xl">
            Choose your next campus bite.
          </h1>
          <p className="mt-3 max-w-2xl text-sm font-semibold leading-7 text-ink-500">
            Favorites and cart quantities update in Firestore, so refreshing or switching devices keeps the
            same ordering state.
          </p>
        </div>
      </div>

      <div className="sticky top-24 z-30 mb-7 rounded-[1.6rem] border border-white/80 bg-white/80 p-3 shadow-soft backdrop-blur-2xl">
        <div className="grid gap-3 lg:grid-cols-[1fr_auto_auto] lg:items-center">
          <label className="flex items-center gap-3 rounded-full border border-ink-900/10 bg-pearl-50 px-4 py-3">
            <Search className="h-5 w-5 text-ink-500" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="w-full bg-transparent text-sm font-bold text-ink-900 outline-none placeholder:text-ink-500/60"
              placeholder="Search biriyani, noodles, coffee..."
            />
            {search ? (
              <button onClick={() => setSearch("")} className="text-ink-500">
                <X className="h-4 w-4" />
              </button>
            ) : null}
          </label>

          <button
            onClick={() => setVegOnly((value) => !value)}
            className={`focus-ring inline-flex items-center justify-center gap-2 rounded-full border px-4 py-3 text-sm font-extrabold transition ${
              vegOnly
                ? "border-teal-200 bg-teal-50 text-teal-700"
                : "border-ink-900/10 bg-white text-ink-700 hover:border-teal-200"
            }`}
          >
            <Leaf className="h-4 w-4" />
            Veg only
          </button>

          <div className="inline-flex items-center gap-2 overflow-x-auto rounded-full border border-ink-900/10 bg-white p-1">
            {categories.map((entry) => (
              <button
                key={entry}
                onClick={() => setCategory(entry)}
                className={`whitespace-nowrap rounded-full px-4 py-2 text-xs font-extrabold transition ${
                  category === entry ? "bg-ink-900 text-white shadow-sm" : "text-ink-500 hover:bg-ember-50"
                }`}
              >
                {entry}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-extrabold text-ink-700">
          <Filter className="h-4 w-4" />
          {filteredItems.length} dishes
        </div>
        <div className="text-xs font-bold uppercase tracking-[0.14em] text-ink-500">
          {category === "All" ? "All categories" : category}
        </div>
      </div>

      {filteredItems.length ? (
        <motion.div layout className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          <AnimatePresence>
            {filteredItems.map((item, index) => (
              <FoodCard key={item.id} item={item} index={index} />
            ))}
          </AnimatePresence>
        </motion.div>
      ) : (
        <div className="premium-card rounded-3xl p-12 text-center">
          <p className="font-display text-2xl font-extrabold text-ink-900">No dishes found</p>
          <p className="mt-2 text-sm font-semibold text-ink-500">Try a different category or search term.</p>
        </div>
      )}

      <AnimatePresence>
        {cartCount > 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 90, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 90, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 260, damping: 28 }}
            className="fixed inset-x-4 bottom-24 z-40 mx-auto max-w-2xl rounded-full border border-white/80 bg-ink-900 p-2 text-white shadow-2xl md:bottom-7"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3 pl-3">
                <div className="grid h-10 w-10 place-items-center rounded-full bg-ember-500">
                  <ShoppingCart className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-extrabold">{cartCount} items in cart</p>
                  <p className="text-xs font-bold text-white/60">{formatCurrency(totals.total)} including taxes</p>
                </div>
              </div>
              <Link to="/cart">
                <PremiumButton className="bg-white px-5 text-ink-900 shadow-none hover:bg-pearl-50">
                  View cart
                </PremiumButton>
              </Link>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </PageTransition>
  );
}

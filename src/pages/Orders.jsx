import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, FileText, ReceiptText, RefreshCcw, Search, ShoppingBag } from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import EmptyState from "../components/EmptyState";
import PageTransition from "../components/PageTransition";
import PremiumButton from "../components/PremiumButton";
import { useAuth } from "../context/AuthContext";
import {
  formatCurrency,
  formatDate,
  formatTime,
} from "../lib/utils";

export default function Orders() {
  const { orders, replaceCart } = useAuth();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [openOrder, setOpenOrder] = useState(null);

  const filteredOrders = useMemo(() => {
    const now = new Date();
    return orders.filter((order) => {
      const text = `${order.orderId} ${(order.items || []).map((item) => item.name).join(" ")}`.toLowerCase();
      const createdAt = order.createdAt?.toDate ? order.createdAt.toDate() : new Date(order.createdAtIso || Date.now());
      if (search && !text.includes(search.toLowerCase())) return false;
      if (filter === "today" && createdAt.toDateString() !== now.toDateString()) return false;
      if (filter === "week" && (now - createdAt) / 86400000 > 7) return false;
      return true;
    });
  }, [filter, orders, search]);

  const reorder = async (order) => {
    await replaceCart(order.items || []);
    navigate("/cart");
  };

  return (
    <PageTransition className="section-shell py-8 md:py-10">
      <div className="mb-8 flex flex-col justify-between gap-5 md:flex-row md:items-end">
        <div>
          <div className="eyebrow">
            <ReceiptText className="h-3.5 w-3.5" />
            Order history
          </div>
          <h1 className="mt-4 font-display text-4xl font-extrabold text-ink-900">Every order, permanently saved.</h1>
          <p className="mt-3 max-w-2xl text-sm font-semibold leading-7 text-ink-500">
            These records are loaded from the signed-in user's Firestore order history subcollection.
          </p>
        </div>
      </div>

      <div className="mb-6 grid gap-3 rounded-[1.6rem] border border-white/80 bg-white/80 p-3 shadow-soft backdrop-blur-2xl lg:grid-cols-[1fr_auto]">
        <label className="flex items-center gap-3 rounded-full border border-ink-900/10 bg-pearl-50 px-4 py-3">
          <Search className="h-5 w-5 text-ink-500" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="w-full bg-transparent text-sm font-bold text-ink-900 outline-none placeholder:text-ink-500/60"
            placeholder="Search order ID or dish..."
          />
        </label>
        <div className="flex overflow-x-auto rounded-full border border-ink-900/10 bg-white p-1">
          {[
            ["all", "All"],
            ["today", "Today"],
            ["week", "This week"],
          ].map(([id, label]) => (
            <button
              key={id}
              onClick={() => setFilter(id)}
              className={`whitespace-nowrap rounded-full px-4 py-2 text-xs font-extrabold transition ${
                filter === id ? "bg-ink-900 text-white" : "text-ink-500 hover:bg-ember-50"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {filteredOrders.length ? (
        <div className="space-y-4">
          <AnimatePresence initial={false}>
            {filteredOrders.map((order, index) => {
              const expanded = openOrder === order.orderId;

              // Status text & color logic
              let statusText = "🧾 E-Bill Generated";
              let statusClass = "bg-teal-50 text-teal-700";
              if (order.status === "Completed" || order.status === "Ready" || order.status === "Delivered") {
                statusText = "✅ Bill Issued";
                statusClass = "bg-green-50 text-green-700";
              } else if (order.status === "Cancelled") {
                statusText = "❌ Cancelled";
                statusClass = "bg-red-50 text-red-700";
              }

              return (
                <motion.article
                  key={order.orderId}
                  layout
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ delay: Math.min(index * 0.035, 0.2) }}
                  className="premium-card overflow-hidden rounded-3xl"
                >
                  <button
                    onClick={() => setOpenOrder(expanded ? null : order.orderId)}
                    className="flex w-full flex-col gap-4 p-5 text-left md:flex-row md:items-center"
                  >
                    <div className="flex min-w-0 flex-1 items-center gap-4">
                      <div className="grid h-14 w-14 place-items-center rounded-2xl bg-ember-50 text-ember-700">
                        <ReceiptText className="h-6 w-6" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-display text-lg font-extrabold text-ink-900">{order.orderId}</p>
                          <span className={`rounded-full px-3 py-1 text-xs font-black ${statusClass}`}>
                            {statusText}
                          </span>
                        </div>
                        <p className="mt-1 truncate text-sm font-semibold text-ink-500">
                          {(order.items || []).map((item) => `${item.name} x${item.quantity}`).join(", ")}
                        </p>
                        <p className="mt-1 text-xs font-bold text-ink-400">
                          {formatDate(order.createdAt || order.createdAtIso)} {formatTime(order.createdAt || order.createdAtIso)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between gap-4 md:justify-end">
                      <p className="font-display text-xl font-extrabold text-ember-700">{formatCurrency(order.total)}</p>
                      <ChevronDown className={`h-5 w-5 text-ink-500 transition ${expanded ? "rotate-180" : ""}`} />
                    </div>
                  </button>

                  <AnimatePresence>
                    {expanded ? (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden border-t border-ink-900/5"
                      >
                        <div className="p-5">
                          <div className="grid gap-3 md:grid-cols-2">
                            {(order.items || []).map((item) => (
                              <div key={`${order.orderId}-${item.id}`} className="flex items-center gap-3 rounded-2xl bg-pearl-50 p-3">
                                <img src={item.image} alt="" className="h-14 w-14 rounded-2xl object-cover" />
                                <div className="min-w-0 flex-1">
                                  <p className="truncate text-sm font-extrabold text-ink-900">{item.name}</p>
                                  <p className="text-xs font-bold text-ink-500">
                                    {formatCurrency(item.price)} x {item.quantity}
                                  </p>
                                </div>
                                <p className="font-black text-ember-700">{formatCurrency(item.price * item.quantity)}</p>
                              </div>
                            ))}
                          </div>

                          <div className="mt-5 grid gap-3 rounded-3xl bg-ink-900 p-5 text-white md:grid-cols-2">
                            <div>
                              <p className="text-xs font-bold uppercase tracking-[0.14em] text-white/50">Payment</p>
                              <p className="mt-1 font-extrabold">{order.paymentMethod}</p>
                              <p className="mt-1 text-xs font-bold text-white/60">{order.paymentReference}</p>
                            </div>
                            <div className="md:text-right">
                              <p className="text-xs font-bold uppercase tracking-[0.14em] text-white/50">Total</p>
                              <p className="mt-1 font-display text-3xl font-extrabold">{formatCurrency(order.total)}</p>
                            </div>
                          </div>

                          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                            <PremiumButton icon={RefreshCcw} onClick={() => reorder(order)}>
                              Reorder
                            </PremiumButton>
                            <PremiumButton
                              variant="secondary"
                              icon={FileText}
                              onClick={() => navigate("/ebill", { state: { order } })}
                            >
                              View E-Bill
                            </PremiumButton>
                            <button
                              onClick={() => window.print()}
                              className="focus-ring inline-flex items-center justify-center gap-2 rounded-full border border-ink-900/10 bg-white px-5 py-3 text-sm font-extrabold text-ink-800 shadow-sm transition hover:border-ember-300"
                            >
                              <FileText className="h-4 w-4" />
                              Print receipt
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ) : null}
                  </AnimatePresence>
                </motion.article>
              );
            })}
          </AnimatePresence>
        </div>
      ) : (
        <EmptyState
          icon={ShoppingBag}
          title={orders.length ? "No matching orders" : "No orders yet"}
          body={
            orders.length
              ? "Try a different search or filter."
              : "Place your first order and it will be saved permanently in Firestore."
          }
          action="Open menu"
          onAction={() => navigate("/menu")}
        />
      )}
    </PageTransition>
  );
}

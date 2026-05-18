import { motion } from "framer-motion";
import {
  ArrowRight,
  Bell,
  Clock3,
  Heart,
  ReceiptText,
  RefreshCcw,
  ShoppingBag,
  Sparkles,
  TrendingUp,
  UserRound,
  Wallet,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import EmptyState from "../components/EmptyState";
import PageTransition from "../components/PageTransition";
import PremiumButton from "../components/PremiumButton";
import StatCard from "../components/StatCard";
import { featuredItems, menuItems } from "../data/menu";
import { useAuth } from "../context/AuthContext";
import { formatCurrency, formatDate, getFirstName, getGreeting } from "../lib/utils";

export default function Dashboard() {
  const { profile, orders, cartItems, favoriteIds, notifications, replaceCart } = useAuth();
  const navigate = useNavigate();
  const recentOrders = orders.slice(0, 3);
  const totalItems = orders.reduce(
    (sum, order) => sum + (order.items || []).reduce((inner, item) => inner + Number(item.quantity || 0), 0),
    0
  );
  const totalSpent = profile?.totalAmountSpent || orders.reduce((sum, order) => sum + Number(order.total || 0), 0);
  const firstName = getFirstName(profile?.fullName || profile?.googleName || "Student");
  const hasProfileGaps = !profile?.registeredMobile || !profile?.hostel;
  const unreadNotifications = (notifications?.items || []).filter((item) => !item.read).slice(0, 3);

  const quickReorder = async (order) => {
    await replaceCart(order.items || []);
    navigate("/cart");
  };

  return (
    <PageTransition className="section-shell py-8 md:py-10">
      <section className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden rounded-[2rem] bg-ink-900 p-6 text-white shadow-2xl md:p-8"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_82%_10%,rgba(249,115,22,0.34),transparent_28%),radial-gradient(circle_at_18%_85%,rgba(20,184,166,0.20),transparent_26%)]" />
            <div className="relative z-10 grid gap-8 md:grid-cols-[1fr_260px] md:items-end">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-ember-100">
                  <span className="h-2 w-2 rounded-full bg-teal-400 shadow-[0_0_0_6px_rgba(45,212,191,0.14)]" />
                  Canteen open until 8 PM
                </div>
                <h1 className="mt-5 font-display text-4xl font-extrabold leading-tight md:text-5xl">
                  {getGreeting()}, {firstName}.
                </h1>
                <p className="mt-4 max-w-xl text-sm font-semibold leading-7 text-white/70">
                  Your profile, cart, favorites, and orders are live from Firestore, so this dashboard
                  stays synced after refresh, logout, and device changes.
                </p>
                <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                  <Link
                    to="/menu"
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-extrabold text-ink-900 shadow-lg transition hover:-translate-y-0.5"
                  >
                    Order now
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link
                    to="/orders"
                    className="inline-flex items-center justify-center gap-2 rounded-full border border-white/20 bg-white/10 px-5 py-3 text-sm font-extrabold text-white transition hover:bg-white/20"
                  >
                    Track orders
                    <ReceiptText className="h-4 w-4" />
                  </Link>
                </div>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/10 p-4 backdrop-blur-xl">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-white/50">Cart snapshot</p>
                <div className="mt-3 flex items-end justify-between">
                  <div>
                    <div className="font-display text-4xl font-extrabold">{cartItems.length}</div>
                    <p className="text-xs font-bold text-white/60">unique items ready</p>
                  </div>
                  <ShoppingBag className="h-10 w-10 text-ember-200" />
                </div>
                <Link
                  to="/cart"
                  className="mt-5 inline-flex w-full items-center justify-center rounded-full bg-ember-500 px-4 py-3 text-sm font-extrabold text-white shadow-glow"
                >
                  View cart
                </Link>
              </div>
            </div>
          </motion.div>

          {hasProfileGaps ? (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col gap-4 rounded-3xl border border-amber-200 bg-amber-50/90 p-5 shadow-sm md:flex-row md:items-center md:justify-between"
            >
              <div className="flex items-start gap-3">
                <div className="rounded-2xl bg-white p-3 text-amber-700">
                  <UserRound className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-display text-lg font-extrabold text-ink-900">Finish your student profile</p>
                  <p className="mt-1 text-sm font-semibold text-ink-500">
                    Checkout will autofill faster once phone, hostel, and address are saved to Firestore.
                  </p>
                </div>
              </div>
              <PremiumButton variant="secondary" onClick={() => navigate("/profile")}>
                Update profile
              </PremiumButton>
            </motion.div>
          ) : null}

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard icon={ReceiptText} label="Orders" value={orders.length} delay={0.02} />
            <StatCard icon={Wallet} label="Total spent" value={formatCurrency(totalSpent)} tone="red" delay={0.06} />
            <StatCard icon={ShoppingBag} label="Items ordered" value={totalItems} tone="teal" delay={0.1} />
            <StatCard icon={Heart} label="Favorites" value={favoriteIds.length} tone="dark" delay={0.14} />
          </div>

          <section>
            <div className="mb-4 flex items-end justify-between gap-4">
              <div>
                <p className="eyebrow">Trending</p>
                <h2 className="mt-3 font-display text-2xl font-extrabold text-ink-900">Popular in the canteen</h2>
              </div>
              <Link to="/menu" className="hidden text-sm font-extrabold text-ember-700 sm:inline-flex">
                Full menu
              </Link>
            </div>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {featuredItems.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ y: -6 }}
                  className="premium-card overflow-hidden rounded-3xl"
                >
                  <img src={item.image} alt="" className="h-36 w-full object-cover" />
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-display text-base font-extrabold text-ink-900">{item.name}</p>
                        <p className="mt-1 text-xs font-bold text-ink-500">{item.prepTime}</p>
                      </div>
                      <span className="rounded-full bg-ember-50 px-3 py-1 text-xs font-black text-ember-700">
                        {formatCurrency(item.price)}
                      </span>
                    </div>
                    <PremiumButton className="mt-4 w-full py-2.5" onClick={() => navigate("/menu")}>
                      Add item
                    </PremiumButton>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>

          <section>
            <div className="mb-4 flex items-end justify-between">
              <div>
                <p className="eyebrow">Recent orders</p>
                <h2 className="mt-3 font-display text-2xl font-extrabold text-ink-900">Quick reorder</h2>
              </div>
              <Link to="/orders" className="text-sm font-extrabold text-ember-700">
                View all
              </Link>
            </div>

            {recentOrders.length ? (
              <div className="grid gap-4">
                {recentOrders.map((order, index) => (
                  <motion.div
                    key={order.orderId}
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="premium-card flex flex-col gap-4 rounded-3xl p-5 md:flex-row md:items-center"
                  >
                    <div className="flex min-w-0 flex-1 items-center gap-4">
                      <div className="grid h-14 w-14 place-items-center rounded-2xl bg-ember-50 text-ember-700">
                        <ReceiptText className="h-6 w-6" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-display text-base font-extrabold text-ink-900">{order.orderId}</p>
                        <p className="mt-1 truncate text-sm font-semibold text-ink-500">
                          {(order.items || []).map((item) => item.name).join(", ")}
                        </p>
                        <p className="mt-1 text-xs font-bold text-ink-400">{formatDate(order.createdAt || order.createdAtIso)}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between gap-3 md:justify-end">
                      <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-black text-teal-700">
                        {order.status || "Confirmed"}
                      </span>
                      <p className="font-display text-lg font-extrabold text-ember-700">{formatCurrency(order.total)}</p>
                      <PremiumButton variant="secondary" icon={RefreshCcw} onClick={() => quickReorder(order)}>
                        Reorder
                      </PremiumButton>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={ShoppingBag}
                title="No orders yet"
                body="Your first canteen order will appear here with status tracking and one-tap reorder."
                action="Browse menu"
                onAction={() => navigate("/menu")}
              />
            )}
          </section>
        </div>

        <aside className="space-y-6">
          <div className="premium-card rounded-3xl p-6">
            <div className="flex items-center gap-4">
              <div className="grid h-16 w-16 overflow-hidden rounded-3xl bg-gradient-to-br from-ember-500 to-rosefire-500 text-white shadow-glow">
                {profile?.profilePicture ? (
                  <img src={profile.profilePicture} alt="" className="h-full w-full object-cover" />
                ) : (
                  <span className="m-auto font-display text-xl font-extrabold">{firstName[0]}</span>
                )}
              </div>
              <div className="min-w-0">
                <p className="font-display text-lg font-extrabold text-ink-900">
                  {profile?.fullName || profile?.googleName || "Student"}
                </p>
                <p className="truncate text-sm font-semibold text-ink-500">{profile?.email}</p>
              </div>
            </div>
            <div className="mt-6 grid gap-3 text-sm">
              {[
                ["Department", profile?.department || "Not set"],
                ["Mobile", profile?.registeredMobile || profile?.phoneNumber || "Not set"],
                ["Hostel", profile?.hostel || "Not set"],
              ].map(([label, value]) => (
                <div key={label} className="flex items-center justify-between rounded-2xl bg-pearl-50 px-4 py-3">
                  <span className="font-bold text-ink-500">{label}</span>
                  <span className="font-extrabold text-ink-900">{value}</span>
                </div>
              ))}
            </div>
            <Link
              to="/profile"
              className="mt-5 inline-flex w-full items-center justify-center rounded-full border border-ink-900/10 bg-white px-4 py-3 text-sm font-extrabold text-ink-800 shadow-sm transition hover:border-ember-300"
            >
              Manage account
            </Link>
          </div>

          <div className="premium-card rounded-3xl p-6">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-ink-500">Live canteen</p>
                <h3 className="font-display text-xl font-extrabold text-ink-900">Service status</h3>
              </div>
              <div className="relative grid h-12 w-12 place-items-center rounded-2xl bg-teal-50 text-teal-700">
                <Clock3 className="h-5 w-5" />
                <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-teal-500" />
              </div>
            </div>
            <div className="rounded-3xl bg-ink-900 p-5 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-display text-2xl font-extrabold">Open</p>
                  <p className="mt-1 text-sm font-semibold text-white/60">Serving snacks, meals, and drinks</p>
                </div>
                <TrendingUp className="h-8 w-8 text-ember-300" />
              </div>
            </div>
          </div>

          <div className="premium-card rounded-3xl p-6">
            <div className="mb-5 flex items-center gap-3">
              <div className="rounded-2xl bg-ember-50 p-3 text-ember-700">
                <Bell className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-display text-xl font-extrabold text-ink-900">Notifications</h3>
                <p className="text-xs font-bold text-ink-500">Synced account alerts</p>
              </div>
            </div>
            <div className="space-y-3">
              {unreadNotifications.length ? (
                unreadNotifications.map((item) => (
                  <div key={item.id} className="rounded-2xl bg-pearl-50 p-4">
                    <p className="text-sm font-extrabold text-ink-900">{item.title}</p>
                    <p className="mt-1 text-xs font-semibold leading-5 text-ink-500">{item.body}</p>
                  </div>
                ))
              ) : (
                <div className="rounded-2xl bg-pearl-50 p-4 text-sm font-semibold text-ink-500">
                  No unread notifications. Your next order update will land here.
                </div>
              )}
            </div>
          </div>

          <div className="rounded-3xl bg-gradient-to-br from-ember-500 to-rosefire-500 p-6 text-white shadow-glow">
            <Sparkles className="h-7 w-7" />
            <h3 className="mt-4 font-display text-xl font-extrabold">Data survives logout.</h3>
            <p className="mt-2 text-sm font-semibold leading-6 text-white/75">
              Logout only ends the session. Firestore keeps your history, favorites, cart, and settings.
            </p>
          </div>
        </aside>
      </section>
    </PageTransition>
  );
}

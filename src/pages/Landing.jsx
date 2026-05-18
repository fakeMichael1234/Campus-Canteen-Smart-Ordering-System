import { motion } from "framer-motion";
import {
  ArrowRight,
  BadgeCheck,
  BellRing,
  Clock3,
  Database,
  Heart,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Star,
  Users,
  WalletCards,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import ConfigNotice from "../components/ConfigNotice";
import PageTransition from "../components/PageTransition";
import PremiumButton from "../components/PremiumButton";
import { featuredItems } from "../data/menu";
import { useAuth } from "../context/AuthContext";
import { formatCurrency } from "../lib/utils";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

const features = [
  { icon: Database, title: "Firestore source of truth", body: "Profile, cart, favorites, orders, notifications, and settings sync by Google UID." },
  { icon: ShieldCheck, title: "Google-linked identity", body: "Every account is permanently attached to the Firebase Auth user, not a local browser cache." },
  { icon: BellRing, title: "Live order updates", body: "Realtime listeners keep dashboards and order history fresh across laptop and mobile." },
  { icon: WalletCards, title: "Saved checkout details", body: "Phone, hostel, address, and preferred payment method autofill at checkout." },
];

const testimonials = [
  { name: "Asha, CSE", quote: "It feels like a proper food app, not a college project page." },
  { name: "Rahul, ECE", quote: "My cart was still there when I opened it on my phone. That is the magic." },
  { name: "Maya, IT", quote: "The order history and quick reorder flow make lunch breaks calmer." },
];

export default function Landing() {
  const { currentUser, loginWithGoogle, authLoading, authError, isFirebaseConfigured } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const user = await loginWithGoogle();
      if (user) navigate("/dashboard");
    } catch {
      /* The auth context exposes the user-facing error message. */
    }
  };

  return (
    <PageTransition className="min-h-screen overflow-hidden bg-premium-radial">
      <header className="fixed inset-x-0 top-0 z-50 border-b border-white/60 bg-white/70 backdrop-blur-2xl">
        <div className="section-shell flex h-20 items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-ember-500 to-rosefire-500 text-white shadow-glow">
              <ShoppingBag className="h-5 w-5" />
            </div>
            <div>
              <div className="font-display text-lg font-extrabold leading-none text-ink-900">
                Campus<span className="text-ember-600">Bites</span>
              </div>
              <div className="mt-1 text-[11px] font-bold uppercase tracking-[0.18em] text-ink-500">
                College canteen ordering
              </div>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            {currentUser ? (
              <Link
                to="/dashboard"
                className="hidden rounded-full px-4 py-2 text-sm font-extrabold text-ink-700 transition hover:bg-ember-50 sm:inline-flex"
              >
                Dashboard
              </Link>
            ) : null}
            <PremiumButton
              icon={currentUser ? ArrowRight : Sparkles}
              loading={authLoading}
              disabled={!isFirebaseConfigured}
              onClick={currentUser ? () => navigate("/dashboard") : handleLogin}
            >
              {currentUser ? "Open app" : "Continue with Google"}
            </PremiumButton>
          </div>
        </div>
      </header>

      <section className="section-shell grid min-h-screen items-center gap-12 pb-20 pt-32 lg:grid-cols-[1.02fr_0.98fr] lg:pt-24">
        <motion.div initial="hidden" animate="visible" transition={{ staggerChildren: 0.08 }} className="max-w-3xl">
          <motion.div variants={fadeUp} className="eyebrow">
            <span className="h-2 w-2 rounded-full bg-teal-500 shadow-[0_0_0_6px_rgba(20,184,166,0.12)]" />
            Persistent Firebase accounts
          </motion.div>
          <motion.h1
            variants={fadeUp}
            className="mt-7 font-display text-5xl font-extrabold leading-[0.98] tracking-normal text-ink-900 sm:text-7xl"
          >
            Order campus food with a <span className="gradient-text">real synced account.</span>
          </motion.h1>
          <motion.p variants={fadeUp} className="mt-6 max-w-2xl text-lg font-medium leading-8 text-ink-500">
            A premium food ordering experience for college canteens, redesigned with polished motion,
            modern cards, and Firebase data that follows the student across every device.
          </motion.p>

          <motion.div variants={fadeUp} className="mt-8 flex flex-col gap-3 sm:flex-row">
            <PremiumButton
              icon={Sparkles}
              loading={authLoading}
              disabled={!isFirebaseConfigured}
              onClick={currentUser ? () => navigate("/dashboard") : handleLogin}
              className="px-7"
            >
              {currentUser ? "Go to dashboard" : "Sign in with Google"}
            </PremiumButton>
            <a
              href="#showcase"
              className="focus-ring inline-flex items-center justify-center gap-2 rounded-full border border-ink-900/10 bg-white/80 px-7 py-3 text-sm font-extrabold text-ink-800 shadow-sm transition hover:border-ember-300 hover:bg-white"
            >
              Explore the redesign
              <ArrowRight className="h-4 w-4" />
            </a>
          </motion.div>

          {authError ? <p className="mt-4 text-sm font-bold text-rosefire-600">{authError}</p> : null}
          {!isFirebaseConfigured ? <div className="mt-6"><ConfigNotice /></div> : null}

          <motion.div variants={fadeUp} className="mt-10 grid grid-cols-3 gap-3 sm:max-w-xl">
            {[
              ["2.4k+", "orders served"],
              ["18 min", "avg saved weekly"],
              ["99.9%", "cloud persistence"],
            ].map(([value, label]) => (
              <div key={label} className="rounded-3xl border border-white/70 bg-white/70 p-4 shadow-sm backdrop-blur-xl">
                <div className="font-display text-2xl font-extrabold text-ink-900">{value}</div>
                <div className="mt-1 text-xs font-bold uppercase tracking-[0.13em] text-ink-500">{label}</div>
              </div>
            ))}
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 24 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="relative"
        >
          <div className="absolute -left-4 top-16 hidden rounded-3xl border border-white/70 bg-white/80 p-4 shadow-soft backdrop-blur-2xl md:block">
            <div className="flex items-center gap-3">
              <div className="grid h-11 w-11 place-items-center rounded-2xl bg-teal-50 text-teal-700">
                <BadgeCheck className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-extrabold text-ink-900">Synced cart restored</p>
                <p className="text-xs font-bold text-ink-500">Laptop to mobile instantly</p>
              </div>
            </div>
          </div>

          <div className="absolute -right-3 bottom-20 hidden rounded-3xl border border-white/70 bg-white/80 p-4 shadow-soft backdrop-blur-2xl md:block">
            <div className="flex items-center gap-3">
              <div className="grid h-11 w-11 place-items-center rounded-2xl bg-ember-50 text-ember-700">
                <Clock3 className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-extrabold text-ink-900">Pickup in 12 min</p>
                <p className="text-xs font-bold text-ink-500">Realtime status</p>
              </div>
            </div>
          </div>

          <div className="mx-auto max-w-sm rounded-[2rem] border border-ink-900/10 bg-ink-900 p-3 shadow-2xl">
            <div className="overflow-hidden rounded-[1.55rem] bg-pearl-50">
              <div className="flex items-center justify-between border-b border-ink-900/5 bg-white/80 px-5 py-4 backdrop-blur-xl">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.13em] text-ember-600">Lunch window</p>
                  <p className="font-display text-xl font-extrabold text-ink-900">Popular now</p>
                </div>
                <div className="rounded-full bg-teal-50 px-3 py-1 text-xs font-black text-teal-700">Open</div>
              </div>
              <div className="space-y-3 p-4">
                {featuredItems.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: 18 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 + index * 0.08 }}
                    className="flex items-center gap-3 rounded-3xl bg-white p-3 shadow-sm"
                  >
                    <img src={item.image} alt="" className="h-16 w-16 rounded-2xl object-cover" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-extrabold text-ink-900">{item.name}</p>
                      <div className="mt-1 flex items-center gap-2 text-xs font-bold text-ink-500">
                        <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                        {item.rating}
                        <span>{item.prepTime}</span>
                      </div>
                    </div>
                    <div className="text-sm font-black text-ember-700">{formatCurrency(item.price)}</div>
                  </motion.div>
                ))}
              </div>
              <div className="m-4 rounded-3xl bg-gradient-to-br from-ink-900 to-ink-700 p-5 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.14em] text-white/50">Firestore</p>
                    <p className="mt-1 text-lg font-extrabold">6 live collections</p>
                  </div>
                  <Database className="h-8 w-8 text-ember-300" />
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      <section id="showcase" className="section-shell py-20">
        <div className="mb-10 flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <div className="eyebrow">Food cards</div>
            <h2 className="mt-5 font-display text-4xl font-extrabold text-ink-900 sm:text-5xl">
              Polished cards that feel built for ordering.
            </h2>
          </div>
          <p className="max-w-xl text-sm font-semibold leading-7 text-ink-500">
            Rich imagery, subtle hover lift, favorite states, ratings, category badges, and cart motion
            give the canteen menu a real product feel.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-4">
          {featuredItems.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.06 }}
              whileHover={{ y: -8 }}
              className="premium-card overflow-hidden rounded-3xl"
            >
              <img src={item.image} alt={item.name} className="h-44 w-full object-cover" />
              <div className="p-5">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="font-display text-lg font-extrabold text-ink-900">{item.name}</h3>
                  <Heart className="h-5 w-5 text-rosefire-500" />
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <span className="rounded-full bg-pearl-100 px-3 py-1 text-xs font-black text-ink-500">
                    {item.category}
                  </span>
                  <span className="font-black text-ember-700">{formatCurrency(item.price)}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="bg-white/60 py-20 backdrop-blur-xl">
        <div className="section-shell grid gap-5 md:grid-cols-4">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.06 }}
              className="premium-card rounded-3xl p-6"
            >
              <div className="mb-5 inline-flex rounded-2xl bg-ember-50 p-3 text-ember-700">
                <feature.icon className="h-6 w-6" />
              </div>
              <h3 className="font-display text-lg font-extrabold text-ink-900">{feature.title}</h3>
              <p className="mt-3 text-sm font-medium leading-6 text-ink-500">{feature.body}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="section-shell grid gap-12 py-20 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <div>
          <div className="eyebrow">How it works</div>
          <h2 className="mt-5 font-display text-4xl font-extrabold text-ink-900 sm:text-5xl">
            A real account system, not browser memory.
          </h2>
          <p className="mt-5 text-sm font-semibold leading-7 text-ink-500">
            Google sign-in creates a Firebase Auth user. That UID becomes the permanent key for Firestore
            documents and subcollections, so every session reloads the same student data.
          </p>
        </div>
        <div className="grid gap-4">
          {[
            ["01", "Sign in with Google", "Firebase Auth persists the browser session and links the account to Gmail."],
            ["02", "Seed user documents", "users, cart, favorites, notifications, settings, and orders root docs are created only when missing."],
            ["03", "Listen in realtime", "Snapshots hydrate dashboard, checkout, cart, favorites, and order history immediately."],
          ].map(([step, title, body]) => (
            <div key={step} className="premium-card flex gap-5 rounded-3xl p-5">
              <div className="grid h-12 w-12 flex-shrink-0 place-items-center rounded-2xl bg-ink-900 font-display text-sm font-extrabold text-white">
                {step}
              </div>
              <div>
                <h3 className="font-display text-lg font-extrabold text-ink-900">{title}</h3>
                <p className="mt-1 text-sm font-medium leading-6 text-ink-500">{body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="section-shell py-20">
        <div className="rounded-[2rem] bg-ink-900 p-6 text-white shadow-2xl md:p-10">
          <div className="grid gap-6 md:grid-cols-3">
            {testimonials.map((item) => (
              <div key={item.name} className="rounded-3xl border border-white/10 bg-white/10 p-6">
                <div className="mb-4 flex text-amber-300">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <Star key={index} className="h-4 w-4 fill-current" />
                  ))}
                </div>
                <p className="text-sm font-semibold leading-7 text-white/75">"{item.quote}"</p>
                <p className="mt-5 text-sm font-extrabold text-white">{item.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-ink-900/5 bg-white/70 py-10">
        <div className="section-shell flex flex-col justify-between gap-4 text-sm font-bold text-ink-500 md:flex-row md:items-center">
          <p>CampusBites. Premium college canteen ordering.</p>
          <div className="flex items-center gap-5">
            <span className="inline-flex items-center gap-2">
              <Users className="h-4 w-4" />
              Student ready
            </span>
            <span className="inline-flex items-center gap-2">
              <ShieldCheck className="h-4 w-4" />
              Firebase secured
            </span>
          </div>
        </div>
      </footer>
    </PageTransition>
  );
}

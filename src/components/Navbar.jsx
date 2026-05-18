import { AnimatePresence, motion, useScroll } from "framer-motion";
import {
  Bell,
  ChevronDown,
  LayoutDashboard,
  LogOut,
  Menu as MenuIcon,
  ReceiptText,
  Settings,
  ShoppingBag,
  ShoppingCart,
  User,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getFirstName } from "../lib/utils";
import PremiumButton from "./PremiumButton";

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/menu", label: "Menu", icon: ShoppingBag },
  { to: "/orders", label: "Orders", icon: ReceiptText },
  { to: "/profile", label: "Profile", icon: User },
];

export default function Navbar() {
  const { profile, cartItems, notifications, logout } = useAuth();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { scrollY } = useScroll();

  useEffect(() => {
    return scrollY.on("change", (latest) => setScrolled(latest > 8));
  }, [scrollY]);

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const unread = (notifications?.items || []).filter((item) => !item.read).length;
  const name = profile?.fullName || profile?.googleName || "Student";
  const avatar = profile?.profilePicture;

  const initials = useMemo(
    () =>
      name
        .split(" ")
        .slice(0, 2)
        .map((part) => part[0])
        .join("")
        .toUpperCase(),
    [name]
  );

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <header
      className={`sticky top-0 z-50 border-b transition-all duration-300 ${
        scrolled ? "nav-blur border-white/80 shadow-soft" : "border-transparent bg-pearl-50/60"
      }`}
    >
      <div className="section-shell flex h-20 items-center justify-between">
        <Link to="/dashboard" className="group flex items-center gap-3">
          <motion.div
            whileHover={{ rotate: -6, scale: 1.06 }}
            className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-ember-500 to-rosefire-500 text-white shadow-glow"
          >
            <ShoppingBag className="h-5 w-5" />
          </motion.div>
          <div>
            <div className="font-display text-lg font-extrabold leading-none text-ink-900">
              Campus<span className="text-ember-600">Bites</span>
            </div>
            <div className="mt-1 text-[11px] font-bold uppercase tracking-[0.18em] text-ink-500">
              Canteen OS
            </div>
          </div>
        </Link>

        <nav className="hidden items-center gap-2 rounded-full border border-white/80 bg-white/70 p-1.5 shadow-sm backdrop-blur-xl lg:flex">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `relative flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold transition ${
                  isActive ? "text-ember-700" : "text-ink-500 hover:text-ink-900"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive ? (
                    <motion.span
                      layoutId="activeNav"
                      className="absolute inset-0 rounded-full bg-ember-50 shadow-sm"
                      transition={{ type: "spring", stiffness: 450, damping: 34 }}
                    />
                  ) : null}
                  <item.icon className="relative h-4 w-4" />
                  <span className="relative">{item.label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            to="/cart"
            className="focus-ring relative hidden h-11 w-11 place-items-center rounded-full border border-ink-900/10 bg-white/80 text-ink-800 shadow-sm transition hover:border-ember-300 hover:text-ember-600 sm:grid"
          >
            <ShoppingCart className="h-5 w-5" />
            {cartCount > 0 ? (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-rosefire-500 px-1 text-[11px] font-black text-white"
              >
                {cartCount}
              </motion.span>
            ) : null}
          </Link>

          <button className="focus-ring relative hidden h-11 w-11 place-items-center rounded-full border border-ink-900/10 bg-white/80 text-ink-800 shadow-sm transition hover:border-ember-300 hover:text-ember-600 sm:grid">
            <Bell className="h-5 w-5" />
            {unread > 0 ? (
              <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-teal-500 ring-2 ring-white" />
            ) : null}
          </button>

          <div className="relative hidden sm:block">
            <button
              onClick={() => setProfileOpen((open) => !open)}
              className="focus-ring flex items-center gap-3 rounded-full border border-ink-900/10 bg-white/80 py-1.5 pl-1.5 pr-3 shadow-sm transition hover:border-ember-300"
            >
              <span className="grid h-9 w-9 overflow-hidden rounded-full bg-gradient-to-br from-ember-500 to-rosefire-500 text-sm font-black text-white">
                {avatar ? <img src={avatar} alt="" className="h-full w-full object-cover" /> : <span className="m-auto">{initials}</span>}
              </span>
              <span className="hidden text-left md:block">
                <span className="block text-xs font-extrabold text-ink-900">{getFirstName(name)}</span>
                <span className="block text-[11px] font-bold text-ink-500">Google synced</span>
              </span>
              <ChevronDown className="h-4 w-4 text-ink-500" />
            </button>

            <AnimatePresence>
              {profileOpen ? (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.96 }}
                  className="absolute right-0 mt-3 w-72 rounded-3xl border border-white/80 bg-white/95 p-3 shadow-soft backdrop-blur-2xl"
                >
                  <div className="rounded-2xl bg-pearl-50 p-4">
                    <p className="text-sm font-extrabold text-ink-900">{name}</p>
                    <p className="mt-1 truncate text-xs font-semibold text-ink-500">{profile?.email}</p>
                  </div>
                  <Link
                    to="/profile"
                    onClick={() => setProfileOpen(false)}
                    className="mt-2 flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold text-ink-700 transition hover:bg-ember-50 hover:text-ember-700"
                  >
                    <Settings className="h-4 w-4" />
                    Account settings
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold text-rosefire-600 transition hover:bg-red-50"
                  >
                    <LogOut className="h-4 w-4" />
                    Log out
                  </button>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>

          <button
            onClick={() => setMobileOpen(true)}
            className="focus-ring grid h-11 w-11 place-items-center rounded-full border border-ink-900/10 bg-white/80 text-ink-900 shadow-sm lg:hidden"
          >
            <MenuIcon className="h-5 w-5" />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[80] bg-ink-900/30 backdrop-blur-sm lg:hidden"
            onClick={() => setMobileOpen(false)}
          >
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 32, stiffness: 260 }}
              className="ml-auto flex h-full w-[86vw] max-w-sm flex-col bg-white p-5 shadow-2xl"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-display text-lg font-extrabold text-ink-900">CampusBites</p>
                  <p className="text-xs font-bold text-ink-500">{profile?.email}</p>
                </div>
                <button
                  className="grid h-10 w-10 place-items-center rounded-full bg-pearl-100 text-ink-700"
                  onClick={() => setMobileOpen(false)}
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="mt-8 grid gap-2">
                {navItems.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={() => setMobileOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 rounded-2xl px-4 py-4 text-sm font-extrabold ${
                        isActive ? "bg-ember-50 text-ember-700" : "text-ink-700"
                      }`
                    }
                  >
                    <item.icon className="h-5 w-5" />
                    {item.label}
                  </NavLink>
                ))}
              </div>

              <PremiumButton className="mt-auto" variant="danger" icon={LogOut} onClick={handleLogout}>
                Log out
              </PremiumButton>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  );
}

import { motion } from "framer-motion";
import { Home, ReceiptText, ShoppingBag, ShoppingCart, User } from "lucide-react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const items = [
  { to: "/dashboard", label: "Home", icon: Home },
  { to: "/menu", label: "Menu", icon: ShoppingBag },
  { to: "/cart", label: "Cart", icon: ShoppingCart },
  { to: "/orders", label: "Orders", icon: ReceiptText },
  { to: "/profile", label: "Me", icon: User },
];

export default function BottomNav() {
  const { cartItems } = useAuth();
  const count = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <nav className="safe-bottom fixed inset-x-0 bottom-0 z-40 border-t border-white/80 bg-white/90 px-2 pt-2 shadow-[0_-18px_45px_rgba(21,18,15,0.10)] backdrop-blur-2xl md:hidden">
      <div className="mx-auto grid max-w-md grid-cols-5 gap-1">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `relative flex flex-col items-center gap-1 rounded-2xl px-2 py-2 text-[11px] font-extrabold transition ${
                isActive ? "text-ember-700" : "text-ink-500"
              }`
            }
          >
            {({ isActive }) => (
              <>
                {isActive ? (
                  <motion.span
                    layoutId="mobileActive"
                    className="absolute inset-0 rounded-2xl bg-ember-50"
                    transition={{ type: "spring", stiffness: 420, damping: 32 }}
                  />
                ) : null}
                <span className="relative">
                  <item.icon className="h-5 w-5" />
                  {item.to === "/cart" && count > 0 ? (
                    <span className="absolute -right-2 -top-2 grid h-4 min-w-4 place-items-center rounded-full bg-rosefire-500 px-1 text-[9px] text-white">
                      {count}
                    </span>
                  ) : null}
                </span>
                <span className="relative">{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}

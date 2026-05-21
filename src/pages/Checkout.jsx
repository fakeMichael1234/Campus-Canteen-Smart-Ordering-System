import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, Home, Loader2, MapPin, ShieldCheck, Smartphone, WalletCards } from "lucide-react";
import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import EmptyState from "../components/EmptyState";
import PageTransition from "../components/PageTransition";
import PremiumButton from "../components/PremiumButton";
import { useAuth } from "../context/AuthContext";
import { calculateTotals, formatCurrency } from "../lib/utils";

const methods = [
  { id: "UPI", label: "UPI", detail: "GPay, PhonePe, Paytm", icon: Smartphone },
  { id: "Card", label: "Card", detail: "Debit or credit card", icon: WalletCards },
  { id: "Pay at Counter", label: "Counter", detail: "Pay at pickup", icon: Home },
];

export default function Checkout() {
  const { cartItems, profile, placeOrder } = useAuth();
  const navigate = useNavigate();
  const totals = calculateTotals(cartItems);
  const preferredMethod = profile?.paymentPreferences?.preferredMethod || "UPI";
  const [method, setMethod] = useState(preferredMethod);
  const [upiId, setUpiId] = useState(profile?.paymentPreferences?.upiId || "");
  const [savePreference, setSavePreference] = useState(true);
  const [loading, setLoading] = useState(false);
  const profileReady = Boolean(profile?.fullName && (profile?.registeredMobile || profile?.phoneNumber));

  const profileRows = useMemo(
    () => [
      ["Name", profile?.fullName || profile?.googleName || "Not set"],
      ["Email", profile?.email || "Not set"],
      ["Mobile", profile?.registeredMobile || profile?.phoneNumber || "Not set"],
      ["Hostel", profile?.hostel || "Not set"],
      ["Address", profile?.address || "Campus pickup"],
    ],
    [profile]
  );

  if (!cartItems.length) {
    return (
      <PageTransition className="section-shell py-10">
        <EmptyState
          icon={WalletCards}
          title="Nothing to checkout"
          body="Add items to your Firestore-synced cart before placing an order."
          action="Open menu"
          onAction={() => navigate("/menu")}
        />
      </PageTransition>
    );
  }

  const submitOrder = async () => {
    setLoading(true);
    try {
      const order = await placeOrder({
        method,
        upiId,
        savePreference,
        reference: `PAY-${Date.now().toString(36).toUpperCase()}`,
      });
      navigate("/ebill", { state: { order } });
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageTransition className="section-shell py-8 md:py-10">
      <div className="mb-8">
        <div className="eyebrow">
          <ShieldCheck className="h-3.5 w-3.5" />
          Secure checkout
        </div>
        <h1 className="mt-4 font-display text-4xl font-extrabold text-ink-900">Confirm pickup details.</h1>
        <p className="mt-3 max-w-2xl text-sm font-semibold leading-7 text-ink-500">
          Saved profile and payment preferences are loaded from Firestore and attached to the order snapshot.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <div className="space-y-6">
          <section className="premium-card rounded-[2rem] p-6">
            <div className="mb-5 flex items-center justify-between gap-3">
              <div>
                <h2 className="font-display text-2xl font-extrabold text-ink-900">Student details</h2>
                <p className="mt-1 text-sm font-semibold text-ink-500">Autofilled from your saved account.</p>
              </div>
              <span
                className={`rounded-full px-3 py-1 text-xs font-black ${
                  profileReady ? "bg-teal-50 text-teal-700" : "bg-amber-50 text-amber-700"
                }`}
              >
                {profileReady ? "Ready" : "Needs update"}
              </span>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {profileRows.map(([label, value]) => (
                <div key={label} className="rounded-2xl bg-pearl-50 px-4 py-3">
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-ink-500">{label}</p>
                  <p className="mt-1 break-words text-sm font-extrabold text-ink-900">{value}</p>
                </div>
              ))}
            </div>
            {!profileReady ? (
              <Link
                to="/profile"
                className="mt-5 inline-flex items-center justify-center rounded-full border border-amber-200 bg-amber-50 px-5 py-3 text-sm font-extrabold text-amber-800"
              >
                Complete profile before checkout
              </Link>
            ) : null}
          </section>

          <section className="premium-card rounded-[2rem] p-6">
            <h2 className="font-display text-2xl font-extrabold text-ink-900">Payment method</h2>
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              {methods.map((entry) => (
                <button
                  key={entry.id}
                  onClick={() => setMethod(entry.id)}
                  className={`focus-ring rounded-3xl border p-4 text-left transition ${
                    method === entry.id
                      ? "border-ember-300 bg-ember-50 shadow-sm"
                      : "border-ink-900/10 bg-white hover:border-ember-200"
                  }`}
                >
                  <div className="mb-4 flex items-center justify-between">
                    <div className="rounded-2xl bg-white p-3 text-ember-700 shadow-sm">
                      <entry.icon className="h-5 w-5" />
                    </div>
                    {method === entry.id ? <CheckCircle2 className="h-5 w-5 text-teal-600" /> : null}
                  </div>
                  <p className="font-display text-lg font-extrabold text-ink-900">{entry.label}</p>
                  <p className="mt-1 text-xs font-bold text-ink-500">{entry.detail}</p>
                </button>
              ))}
            </div>

            <AnimatePresence>
              {method === "UPI" ? (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="mt-5 grid gap-3 rounded-3xl bg-pearl-50 p-4">
                    <label className="grid gap-2">
                      <span className="label">UPI ID</span>
                      <input
                        value={upiId}
                        onChange={(event) => setUpiId(event.target.value)}
                        placeholder="yourname@upi"
                        className="field"
                      />
                    </label>
                    <label className="flex items-center gap-3 text-sm font-bold text-ink-700">
                      <input
                        type="checkbox"
                        checked={savePreference}
                        onChange={(event) => setSavePreference(event.target.checked)}
                        className="h-4 w-4 rounded border-ink-900/20 text-ember-600"
                      />
                      Save this payment preference to my account
                    </label>
                  </div>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </section>
        </div>

        <aside className="h-fit rounded-[2rem] border border-white/80 bg-white/90 p-5 shadow-soft backdrop-blur-2xl lg:sticky lg:top-28">
          <div className="mb-5 flex items-center gap-3">
            <div className="rounded-2xl bg-ember-50 p-3 text-ember-700">
              <MapPin className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-display text-xl font-extrabold text-ink-900">Pickup order</h2>
              <p className="text-xs font-bold text-ink-500">Main canteen counter</p>
            </div>
          </div>

          <div className="space-y-3">
            {cartItems.map((item) => (
              <div key={item.id} className="flex items-center gap-3 rounded-2xl bg-pearl-50 p-3">
                <img src={item.image} alt="" className="h-14 w-14 rounded-2xl object-cover" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-extrabold text-ink-900">{item.name}</p>
                  <p className="text-xs font-bold text-ink-500">Qty {item.quantity}</p>
                </div>
                <p className="font-black text-ember-700">{formatCurrency(item.price * item.quantity)}</p>
              </div>
            ))}
          </div>

          <div className="mt-5 rounded-3xl bg-ink-900 p-5 text-white">
            <div className="space-y-2 text-sm font-bold text-white/60">
              <div className="flex justify-between"><span>Subtotal</span><span>{formatCurrency(totals.subtotal)}</span></div>
              <div className="flex justify-between"><span>GST</span><span>{formatCurrency(totals.gst)}</span></div>
              <div className="flex justify-between"><span>Platform</span><span>{formatCurrency(totals.platformFee)}</span></div>
            </div>
            <div className="mt-4 flex items-end justify-between border-t border-white/10 pt-4">
              <span className="text-sm font-bold text-white/60">Total</span>
              <span className="font-display text-3xl font-extrabold">{formatCurrency(totals.total)}</span>
            </div>
          </div>

          <PremiumButton
            className="mt-5 w-full"
            icon={loading ? Loader2 : ShieldCheck}
            loading={loading}
            disabled={!profileReady}
            onClick={submitOrder}
          >
            Place order
          </PremiumButton>
        </aside>
      </div>
    </PageTransition>
  );
}

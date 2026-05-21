import { doc, getDoc } from "firebase/firestore";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  Calendar,
  CheckCircle2,
  Clock,
  Hash,
  Loader2,
  ShoppingBag,
  User,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { db, isFirebaseConfigured } from "../lib/firebase";
import { formatCurrency } from "../lib/utils";

export default function OrderVerify() {
  const { uid, orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchOrder() {
      if (!isFirebaseConfigured || !db) {
        setError("Firebase is not configured.");
        setLoading(false);
        return;
      }

      try {
        const orderRef = doc(db, "orders", uid, "history", orderId);
        const snapshot = await getDoc(orderRef);
        if (snapshot.exists()) {
          setOrder(snapshot.data());
        } else {
          setError("Order not found. The QR code may be invalid or expired.");
        }
      } catch (err) {
        console.error(err);
        setError("Failed to fetch order details. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    fetchOrder();
  }, [uid, orderId]);

  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center bg-premium-radial">
        <div className="text-center">
          <Loader2 className="mx-auto h-10 w-10 animate-spin text-ember-500" />
          <p className="mt-4 font-display text-lg font-extrabold text-ink-900">
            Loading order details...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="grid min-h-screen place-items-center bg-premium-radial p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md text-center"
        >
          <div className="mx-auto mb-4 grid h-20 w-20 place-items-center rounded-full bg-amber-50 text-amber-600">
            <AlertTriangle className="h-10 w-10" />
          </div>
          <h1 className="font-display text-2xl font-extrabold text-ink-900">
            Verification Failed
          </h1>
          <p className="mt-3 text-sm font-semibold text-ink-500">{error}</p>
        </motion.div>
      </div>
    );
  }

  const profile = order.profileSnapshot || {};
  const createdDate = new Date(order.createdAtIso || Date.now());
  const dateStr = createdDate.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  const timeStr = createdDate.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="min-h-screen bg-premium-radial px-4 py-8">
      <div className="mx-auto max-w-lg">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 text-center"
        >
          <div className="mx-auto mb-4 grid h-20 w-20 place-items-center rounded-full bg-teal-50 text-teal-600">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.15 }}
            >
              <CheckCircle2 className="h-10 w-10" />
            </motion.div>
          </div>
          <h1 className="font-display text-3xl font-extrabold text-ink-900">
            Order Verification
          </h1>
          <p className="mt-2 text-sm font-semibold text-ink-500">
            Verify the details below before handing over the order.
          </p>
        </motion.div>

        {/* Verification Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="overflow-hidden rounded-[2rem] border border-white/80 bg-white/90 p-6 shadow-soft backdrop-blur-xl"
        >
          {/* Branding */}
          <div className="mb-5 border-b border-ink-900/5 pb-5 text-center">
            <h2 className="font-display text-2xl font-extrabold gradient-text">
              Campus Bites
            </h2>
            <p className="mt-1 text-xs font-bold text-ink-500">
              Admin Verification Panel
            </p>
          </div>

          {/* Order ID + Status */}
          <div className="mb-5 flex items-center justify-between rounded-2xl bg-ember-50 px-4 py-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-ember-600">
                Order ID
              </p>
              <p className="mt-1 font-display text-xl font-extrabold text-ember-700">
                {order.orderId}
              </p>
            </div>
            <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-black text-teal-700">
              {order.status || "Confirmed"}
            </span>
          </div>

          {/* Student Info */}
          <div className="mb-5 grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-pearl-50 px-4 py-3">
              <div className="mb-1 flex items-center gap-1.5">
                <User className="h-3 w-3 text-ink-500" />
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-ink-500">
                  Student
                </p>
              </div>
              <p className="text-sm font-extrabold text-ink-900">
                {profile.fullName || profile.googleName || "N/A"}
              </p>
            </div>
            <div className="rounded-2xl bg-pearl-50 px-4 py-3">
              <div className="mb-1 flex items-center gap-1.5">
                <Hash className="h-3 w-3 text-ink-500" />
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-ink-500">
                  Department
                </p>
              </div>
              <p className="text-sm font-extrabold text-ink-900">
                {profile.department || "N/A"}
              </p>
            </div>
            <div className="rounded-2xl bg-pearl-50 px-4 py-3">
              <div className="mb-1 flex items-center gap-1.5">
                <Calendar className="h-3 w-3 text-ink-500" />
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-ink-500">
                  Date
                </p>
              </div>
              <p className="text-sm font-extrabold text-ink-900">{dateStr}</p>
            </div>
            <div className="rounded-2xl bg-pearl-50 px-4 py-3">
              <div className="mb-1 flex items-center gap-1.5">
                <Clock className="h-3 w-3 text-ink-500" />
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-ink-500">
                  Time
                </p>
              </div>
              <p className="text-sm font-extrabold text-ink-900">{timeStr}</p>
            </div>
          </div>

          {/* Additional Student Info */}
          {(profile.registeredMobile || profile.phoneNumber || profile.registerNumber) && (
            <div className="mb-5 grid grid-cols-2 gap-3">
              {(profile.registeredMobile || profile.phoneNumber) && (
                <div className="rounded-2xl bg-pearl-50 px-4 py-3">
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-ink-500">
                    Mobile
                  </p>
                  <p className="mt-1 text-sm font-extrabold text-ink-900">
                    {profile.registeredMobile || profile.phoneNumber}
                  </p>
                </div>
              )}
              {profile.registerNumber && (
                <div className="rounded-2xl bg-pearl-50 px-4 py-3">
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-ink-500">
                    Reg. Number
                  </p>
                  <p className="mt-1 text-sm font-extrabold text-ink-900">
                    {profile.registerNumber}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Order Items */}
          <div className="mb-5">
            <div className="mb-3 flex items-center gap-2">
              <ShoppingBag className="h-4 w-4 text-ember-600" />
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-ink-500">
                Items to hand over
              </p>
            </div>
            <div className="space-y-2">
              {(order.items || []).map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between rounded-2xl bg-pearl-50 px-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`inline-block h-2.5 w-2.5 rounded-full ${
                        item.veg ? "bg-green-500" : "bg-red-500"
                      }`}
                    />
                    <div>
                      <p className="text-sm font-extrabold text-ink-900">
                        {item.name}
                      </p>
                      <p className="text-xs font-bold text-ink-500">
                        Qty: {item.quantity}
                      </p>
                    </div>
                  </div>
                  <p className="font-black text-ink-900">
                    {formatCurrency(item.price * item.quantity)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Totals */}
          <div className="mb-5 rounded-3xl bg-ink-900 p-5 text-white">
            <div className="space-y-2 text-sm font-bold text-white/60">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{formatCurrency(order.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>GST</span>
                <span>{formatCurrency(order.gst)}</span>
              </div>
              <div className="flex justify-between">
                <span>Platform Fee</span>
                <span>{formatCurrency(order.platformFee)}</span>
              </div>
            </div>
            <div className="mt-4 flex items-end justify-between border-t border-white/10 pt-4">
              <span className="text-sm font-bold text-white/60">Total</span>
              <span className="font-display text-3xl font-extrabold">
                {formatCurrency(order.total)}
              </span>
            </div>
          </div>

          {/* Payment info */}
          <div className="flex items-center justify-between rounded-2xl bg-pearl-50 px-4 py-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-ink-500">
                Payment
              </p>
              <p className="mt-1 text-sm font-extrabold text-ink-900">
                {order.paymentMethod}
              </p>
            </div>
            <span
              className={`rounded-full px-3 py-1 text-xs font-black ${
                order.paymentStatus === "Paid"
                  ? "bg-teal-50 text-teal-700"
                  : "bg-amber-50 text-amber-700"
              }`}
            >
              {order.paymentStatus}
            </span>
          </div>

          {/* Footer */}
          <div className="mt-5 border-t border-ink-900/5 pt-4 text-center">
            <p className="text-xs font-bold text-ink-400">
              Campus Bites — Order Verification
            </p>
            <p className="mt-1 text-[10px] font-semibold text-ink-400/60">
              Verified at {new Date().toLocaleTimeString("en-IN")} on{" "}
              {new Date().toLocaleDateString("en-IN")}
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

import { motion } from "framer-motion";
import html2canvas from "html2canvas";
import {
  Calendar,
  Clock,
  Download,
  FileText,
  Hash,
  Share2,
  ShoppingBag,
  User,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { useCallback, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import EmptyState from "../components/EmptyState";
import PageTransition from "../components/PageTransition";
import PremiumButton from "../components/PremiumButton";
import { formatCurrency } from "../lib/utils";

export default function EBill() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const billRef = useRef(null);
  const [downloading, setDownloading] = useState(false);

  const order = state?.order;

  if (!order) {
    return (
      <PageTransition className="section-shell py-10">
        <EmptyState
          icon={FileText}
          title="No bill to display"
          body="Place an order first to receive your E-Bill."
          action="Open menu"
          onAction={() => navigate("/menu")}
        />
      </PageTransition>
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

  const verifyUrl = `${window.location.origin}/verify/${order.uid}/${order.id}`;

  const downloadBill = useCallback(async () => {
    if (!billRef.current) return;
    setDownloading(true);
    try {
      const canvas = await html2canvas(billRef.current, {
        backgroundColor: "#fffaf5",
        scale: 2,
        useCORS: true,
        logging: false,
      });
      const link = document.createElement("a");
      link.download = `${order.orderId}-ebill.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (err) {
      console.error("Download failed:", err);
    } finally {
      setDownloading(false);
    }
  }, [order.orderId]);

  const shareBill = useCallback(async () => {
    if (!navigator.share) {
      try {
        await navigator.clipboard.writeText(verifyUrl);
        alert("E-Bill link copied to clipboard!");
      } catch {
        alert("Sharing not supported on this browser.");
      }
      return;
    }

    try {
      if (billRef.current) {
        const canvas = await html2canvas(billRef.current, {
          backgroundColor: "#fffaf5",
          scale: 2,
          useCORS: true,
          logging: false,
        });
        const blob = await new Promise((resolve) =>
          canvas.toBlob(resolve, "image/png")
        );
        const file = new File([blob], `${order.orderId}-ebill.png`, {
          type: "image/png",
        });
        await navigator.share({
          title: `Campus Bites E-Bill — ${order.orderId}`,
          text: `Order ${order.orderId} — ${formatCurrency(order.total)}`,
          files: [file],
        });
      }
    } catch (err) {
      if (err.name !== "AbortError") {
        try {
          await navigator.share({
            title: `Campus Bites E-Bill — ${order.orderId}`,
            text: `Order ${order.orderId} — ${formatCurrency(order.total)}`,
            url: verifyUrl,
          });
        } catch {
          /* user cancelled */
        }
      }
    }
  }, [order.orderId, order.total, verifyUrl]);

  return (
    <PageTransition className="section-shell py-8 md:py-10">
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
              <FileText className="h-10 w-10" />
            </motion.div>
          </div>
          <h1 className="font-display text-3xl font-extrabold text-ink-900">
            Your E-Bill
          </h1>
          <p className="mt-2 text-sm font-semibold text-ink-500">
            Show this QR code at the counter to collect your order.
          </p>
        </motion.div>

        {/* E-Bill Card — captured for download */}
        <motion.div
          ref={billRef}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="premium-card overflow-hidden rounded-[2rem] p-6"
        >
          {/* Restaurant branding */}
          <div className="mb-5 border-b border-ink-900/5 pb-5 text-center">
            <h2 className="font-display text-2xl font-extrabold gradient-text">
              Campus Bites
            </h2>
            <p className="mt-1 text-xs font-bold text-ink-500">
              Main Canteen • College Campus
            </p>
          </div>

          {/* Order ID */}
          <div className="mb-5 rounded-2xl bg-ember-50 px-4 py-3 text-center">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-ember-600">
              Order ID
            </p>
            <p className="mt-1 font-display text-xl font-extrabold text-ember-700">
              {order.orderId}
            </p>
          </div>

          {/* Student Info */}
          <div className="mb-5 grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-pearl-50 px-4 py-3">
              <div className="mb-1 flex items-center gap-1.5">
                <User className="h-3 w-3 text-ink-500" />
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-ink-500">
                  Name
                </p>
              </div>
              <p className="text-sm font-extrabold text-ink-900">
                {profile.fullName || profile.googleName || "Student"}
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

          {/* Order Items */}
          <div className="mb-5">
            <div className="mb-3 flex items-center gap-2">
              <ShoppingBag className="h-4 w-4 text-ember-600" />
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-ink-500">
                Ordered Items
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
                        {formatCurrency(item.price)} × {item.quantity}
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
          <div className="mb-5 flex items-center justify-between rounded-2xl bg-pearl-50 px-4 py-3">
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

          {/* QR Code */}
          <div className="rounded-3xl border-2 border-dashed border-ember-200 bg-white p-6 text-center">
            <p className="mb-4 text-xs font-bold uppercase tracking-[0.14em] text-ink-500">
              Scan to verify order
            </p>
            <div className="mx-auto inline-block rounded-2xl bg-white p-3 shadow-sm">
              <QRCodeSVG
                value={verifyUrl}
                size={180}
                level="H"
                bgColor="#ffffff"
                fgColor="#15120f"
                includeMargin={false}
              />
            </div>
            <p className="mt-4 text-xs font-bold text-ink-400">
              {order.orderId}
            </p>
          </div>

          {/* Footer */}
          <div className="mt-5 border-t border-ink-900/5 pt-4 text-center">
            <p className="text-xs font-bold text-ink-400">
              Thank you for ordering with Campus Bites!
            </p>
            <p className="mt-1 text-[10px] font-semibold text-ink-400/60">
              Present this E-Bill at the counter to collect your food.
            </p>
          </div>
        </motion.div>

        {/* Action Buttons — outside the captured area */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="mt-6 grid gap-3 sm:grid-cols-3"
        >
          <PremiumButton
            icon={Download}
            loading={downloading}
            onClick={downloadBill}
          >
            Download
          </PremiumButton>
          <PremiumButton
            variant="secondary"
            icon={Share2}
            onClick={shareBill}
          >
            Share
          </PremiumButton>
          <PremiumButton
            variant="dark"
            icon={ShoppingBag}
            onClick={() => navigate("/menu")}
          >
            Order more
          </PremiumButton>
        </motion.div>
      </div>
    </PageTransition>
  );
}

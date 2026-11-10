import { useEffect, useMemo, useRef, useState } from "react";
import { collection, collectionGroup, doc, getDoc, limit, onSnapshot, query, updateDoc, where, serverTimestamp } from "firebase/firestore";
import { onAuthStateChanged, signInWithPopup } from "firebase/auth";
import { Camera, CheckCircle2, Clock3, LogOut, PackageCheck, ScanLine, Search, Volume2 } from "lucide-react";
import { useParams } from "react-router-dom";
import PageTransition from "../components/PageTransition";
import { auth, db, googleProvider } from "../lib/firebase";
import { stations } from "../lib/stations";
import { formatCurrency } from "../lib/utils";

const money = (n) => formatCurrency(n);
const orderDate = (o) => o.createdAt?.toDate ? o.createdAt.toDate() : new Date(o.createdAtIso || Date.now());

export default function CounterPortal() {
  const { stationId } = useParams();
  const station = stations[stationId];
  const [user, setUser] = useState(auth?.currentUser || null);
  const [role, setRole] = useState(null);
  const [orders, setOrders] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [scanValue, setScanValue] = useState("");
  const [scanMessage, setScanMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    if (!auth) return;
    return onAuthStateChanged(auth,setUser);
  }, []);

  useEffect(() => {
    if (!user || !station) return;
    getDoc(doc(db, "staff", user.uid)).then(s => setRole(s.exists() ? s.data() : null));
  }, [user, stationId]);

  useEffect(() => {
    if (!role || role.stationId !== stationId) return;
    const q = query(collectionGroup(db, "history"), where("stationIds", "array-contains", stationId), limit(100));
    return onSnapshot(q, snap => setOrders(snap.docs.map(d => ({ ...d.data(), firestoreId: d.id, ref: d.ref })).sort((a,b) => orderDate(b)-orderDate(a))));
  }, [role, stationId]);

  useEffect(() => {
    if (!role || role.stationId !== stationId) return;
    return onSnapshot(collection(db, "inventory"), snap => setInventory(snap.docs.map(d => ({id:d.id,...d.data()})).filter(x=>x.stationId===stationId)));
  }, [role, stationId]);

  useEffect(() => () => streamRef.current?.getTracks().forEach(t=>t.stop()), []);

  const filteredOrders = useMemo(() => orders.filter(o => o.paymentStatus === "Paid" || o.paymentStatus === "Captured"), [orders]);

  const readQr = async (raw) => {
    const value = String(raw || "").trim();
    if (!value) return;
    try {
      let uid, orderId;
      const url = new URL(value, window.location.origin);
      const match = url.pathname.match(/\/verify\/([^/]+)\/([^/]+)/);
      if (match) [, uid, orderId] = match;
      else {
        const parts = value.split(":");
        if (parts.length === 2) [uid, orderId] = parts;
      }
      if (!uid || !orderId) throw new Error("This QR is not a Campus Bites order QR.");
      const snap = await getDoc(doc(db, "orders", uid, "history", orderId));
      if (!snap.exists()) throw new Error("Order not found.");
      const order = snap.data();
      if (!(order.stationIds || []).includes(stationId)) throw new Error("This order has no items for this counter.");
      if (!["Paid", "Captured"].includes(order.paymentStatus)) throw new Error("Payment is not verified. Please ask the student to retry.");
      setScanMessage("Verified order " + (order.orderId || orderId) + " — " + (order.items || []).filter(i=>i.stationId===stationId).map(i=>i.name).join(", "));
      setScanValue(value);
    } catch (e) { setScanMessage(e.message || "Unable to read order."); }
  };

  const startCamera = async () => {
    if (!("BarcodeDetector" in window)) { setScanMessage("Camera QR scanning is unavailable in this browser. Use a USB QR scanner in the scan field."); return; }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({video:{facingMode:"environment"}});
      streamRef.current = stream;
      videoRef.current.srcObject = stream;
      await videoRef.current.play();
      const detector = new BarcodeDetector({formats:["qr_code"]});
      const scan = async () => {
        if (!videoRef.current || !streamRef.current) return;
        const codes = await detector.detect(videoRef.current);
        if (codes.length) { await readQr(codes[0].rawValue); streamRef.current.getTracks().forEach(t=>t.stop()); streamRef.current=null; return; }
        requestAnimationFrame(scan);
      };
      requestAnimationFrame(scan);
    } catch { setScanMessage("Camera permission denied or camera unavailable."); }
  };

  const changeStatus = async (order, status) => {
    const key = `stationStatus.${stationId}`;
    await updateDoc(order.ref, { [key]: status, updatedAt: serverTimestamp() });
  };

  const toggleAvailability = async (item, available) => {
    await updateDoc(doc(db, "inventory", item.id), { available, updatedAt: serverTimestamp() });
  };

  if (!station) return <div className="section-shell py-12">Unknown counter.</div>;
  if (!user) return <PageTransition className="section-shell py-16"><section className="premium-card mx-auto max-w-md rounded-3xl p-8 text-center"><ScanLine className="mx-auto h-12 w-12 text-ember-600"/><h1 className="mt-4 font-display text-3xl font-extrabold">Staff sign in</h1><p className="my-3 text-sm text-ink-500">Sign in with your authorized counter account.</p><button className="rounded-full bg-ink-900 px-6 py-3 font-bold text-white" onClick={()=>signInWithPopup(auth,googleProvider)}>Continue with Google</button></section></PageTransition>;
  if (!role || role.stationId !== stationId) return <div className="section-shell py-12"><h1 className="text-2xl font-extrabold">Counter access not assigned</h1><p className="mt-2 text-ink-500">Ask the administrator to assign this Google account to {station.label} in Firestore staff/{user.uid}.</p></div>;

  return <PageTransition className="min-h-screen bg-pearl-50">
    <header className="border-b border-ink-900/10 bg-white"><div className="section-shell flex flex-wrap items-center justify-between gap-4 py-5"><div><p className="eyebrow">Campus Bites · Staff portal</p><h1 className="mt-2 font-display text-3xl font-extrabold">{station.label}</h1><p className="text-sm text-ink-500">{user.email}</p></div><button className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-bold" onClick={()=>auth.signOut()}><LogOut size={16}/> Sign out</button></div></header>
    <main className="section-shell grid gap-6 py-7 lg:grid-cols-[360px_1fr]">
      <section className="space-y-5">
        <div className="premium-card rounded-3xl p-5"><h2 className="flex items-center gap-2 text-lg font-extrabold"><ScanLine/> Scan student QR</h2><form className="mt-4 flex gap-2" onSubmit={e=>{e.preventDefault();readQr(scanValue)}}><input className="field" value={scanValue} onChange={e=>setScanValue(e.target.value)} placeholder="Scan or paste QR value" autoFocus/><button className="rounded-2xl bg-ink-900 px-4 text-white"><Search/></button></form><button onClick={startCamera} className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl border border-ink-900/10 py-3 text-sm font-bold"><Camera size={17}/> Open camera scanner</button><video ref={videoRef} className="mt-3 w-full rounded-2xl" playsInline muted/><p className="mt-3 text-sm font-semibold text-ember-700">{scanMessage}</p></div>
        <div className="premium-card rounded-3xl p-5"><h2 className="text-lg font-extrabold">Menu availability</h2><p className="mb-3 mt-1 text-xs text-ink-500">Changes appear on the student menu immediately.</p>{inventory.map(item=><label key={item.id} className="flex items-center justify-between border-b py-3 last:border-0"><span className="text-sm font-bold">{item.name}</span><input type="checkbox" checked={item.available!==false} onChange={e=>toggleAvailability(item,e.target.checked)} className="h-5 w-5 accent-emerald-600"/></label>)}{!inventory.length&&<p className="text-sm text-ink-400">Inventory items will appear here after admin setup.</p>}</div>
      </section>
      <section><div className="mb-4 flex items-center justify-between"><div><h2 className="text-2xl font-extrabold">Live counter orders</h2><p className="text-sm text-ink-500">Paid orders containing items for this counter</p></div><span className="rounded-full bg-ember-100 px-3 py-1 text-sm font-extrabold text-ember-700">{filteredOrders.length} orders</span></div><div className="space-y-4">{filteredOrders.map(order=>{const items=(order.items||[]).filter(i=>i.stationId===stationId);const status=order.stationStatus?.[stationId]||"Pending";return <article key={order.firestoreId} className="premium-card rounded-3xl p-5"><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="font-mono text-xs font-bold text-ember-700">{order.orderId}</p><h3 className="mt-1 text-lg font-extrabold">{order.profileSnapshot?.fullName||"Student"}</h3><p className="text-xs text-ink-500">{orderDate(order).toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit"})} · {order.profileSnapshot?.registerNumber||"Student"}</p></div><span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-extrabold text-teal-700">{status}</span></div><div className="my-4 space-y-2">{items.map(item=><div key={item.id} className="flex justify-between rounded-xl bg-pearl-50 px-3 py-2"><span className="text-sm font-bold">{item.name} × {item.quantity}</span><span className="text-sm font-extrabold">{money(item.price*item.quantity)}</span></div>)}</div><div className="flex flex-wrap gap-2">{["Pending","Preparing","Ready","Completed"].map(s=><button key={s} disabled={status===s} onClick={()=>changeStatus(order,s)} className={`rounded-full px-4 py-2 text-xs font-extrabold ${status===s?"bg-ink-900 text-white":"border border-ink-900/10 bg-white"}`}>{s}</button>)}</div></article>})}{!filteredOrders.length&&<div className="premium-card rounded-3xl p-12 text-center text-ink-500"><PackageCheck className="mx-auto mb-3 h-10 w-10"/>No paid orders for this counter yet.</div>}</div></section>
    </main>
  </PageTransition>;
}

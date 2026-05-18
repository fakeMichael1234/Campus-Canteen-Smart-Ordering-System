import { motion } from "framer-motion";
import {
  BadgeCheck,
  Bell,
  CreditCard,
  Database,
  LogOut,
  Mail,
  MapPin,
  Phone,
  Save,
  Settings,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import PageTransition from "../components/PageTransition";
import PremiumButton from "../components/PremiumButton";
import { useAuth } from "../context/AuthContext";

const departments = [
  "Computer Science",
  "Information Technology",
  "Electronics",
  "Mechanical",
  "Civil",
  "Electrical",
  "MBA",
  "MCA",
  "Other",
];

export default function Profile() {
  const { profile, settings, saveProfile, saveSettings, logout, currentUser } = useAuth();
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({
    fullName: "",
    phoneNumber: "",
    registeredMobile: "",
    hostel: "",
    address: "",
    department: "",
    year: "",
    registerNumber: "",
    dietary: "all",
    spiceLevel: "medium",
    preferredMethod: "UPI",
    upiId: "",
    notificationsEnabled: true,
    orderUpdates: true,
  });

  useEffect(() => {
    setForm({
      fullName: profile?.fullName || profile?.googleName || "",
      phoneNumber: profile?.phoneNumber || "",
      registeredMobile: profile?.registeredMobile || "",
      hostel: profile?.hostel || "",
      address: profile?.address || "",
      department: profile?.department || "",
      year: profile?.year || "",
      registerNumber: profile?.registerNumber || "",
      dietary: profile?.preferences?.dietary || "all",
      spiceLevel: profile?.preferences?.spiceLevel || "medium",
      preferredMethod: profile?.paymentPreferences?.preferredMethod || "UPI",
      upiId: profile?.paymentPreferences?.upiId || "",
      notificationsEnabled: settings?.notificationsEnabled ?? true,
      orderUpdates: settings?.orderUpdates ?? true,
    });
  }, [profile, settings]);

  const update = (field) => (event) => {
    const value = event.target.type === "checkbox" ? event.target.checked : event.target.value;
    setForm((previous) => ({ ...previous, [field]: value }));
  };

  const submit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setSaved(false);
    try {
      await saveProfile({
        fullName: form.fullName.trim(),
        phoneNumber: form.phoneNumber.trim(),
        registeredMobile: form.registeredMobile.trim(),
        hostel: form.hostel.trim(),
        address: form.address.trim(),
        department: form.department,
        year: form.year,
        registerNumber: form.registerNumber.trim(),
        preferences: {
          dietary: form.dietary,
          spiceLevel: form.spiceLevel,
          pickupWindow: profile?.preferences?.pickupWindow || "asap",
        },
        paymentPreferences: {
          preferredMethod: form.preferredMethod,
          upiId: form.upiId.trim(),
          saveForNextOrder: true,
        },
      });
      await saveSettings({
        notificationsEnabled: form.notificationsEnabled,
        orderUpdates: form.orderUpdates,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2600);
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <PageTransition className="section-shell py-8 md:py-10">
      <div className="mb-8">
        <div className="eyebrow">
          <UserRound className="h-3.5 w-3.5" />
          Account center
        </div>
        <h1 className="mt-4 font-display text-4xl font-extrabold text-ink-900">Profile and preferences.</h1>
        <p className="mt-3 max-w-2xl text-sm font-semibold leading-7 text-ink-500">
          These details are stored in Firestore under users/{currentUser?.uid}, settings/{currentUser?.uid},
          and reused during checkout.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
        <aside className="space-y-6">
          <div className="premium-card rounded-[2rem] p-6 text-center">
            <div className="mx-auto grid h-24 w-24 overflow-hidden rounded-[1.75rem] bg-gradient-to-br from-ember-500 to-rosefire-500 text-white shadow-glow">
              {profile?.profilePicture ? (
                <img src={profile.profilePicture} alt="" className="h-full w-full object-cover" />
              ) : (
                <UserRound className="m-auto h-10 w-10" />
              )}
            </div>
            <h2 className="mt-5 font-display text-2xl font-extrabold text-ink-900">
              {profile?.fullName || profile?.googleName || "Student"}
            </h2>
            <p className="mt-1 break-words text-sm font-semibold text-ink-500">{profile?.email}</p>
            <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-teal-50 px-4 py-2 text-xs font-black text-teal-700">
              <BadgeCheck className="h-4 w-4" />
              Google linked
            </div>
          </div>

          <div className="premium-card rounded-[2rem] p-6">
            <h3 className="font-display text-xl font-extrabold text-ink-900">Firestore schema</h3>
            <div className="mt-4 space-y-2 text-sm font-bold">
              {["users", "orders/history", "favorites", "cart", "notifications", "settings"].map((item) => (
                <div key={item} className="flex items-center gap-3 rounded-2xl bg-pearl-50 px-4 py-3">
                  <Database className="h-4 w-4 text-ember-700" />
                  <span className="text-ink-700">{item}/{currentUser?.uid?.slice(0, 7)}...</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-red-100 bg-red-50/80 p-5">
            <h3 className="font-display text-lg font-extrabold text-rosefire-600">Session controls</h3>
            <p className="mt-2 text-sm font-semibold leading-6 text-ink-500">
              Logging out clears the active Firebase session only. Your Firestore data remains saved.
            </p>
            <PremiumButton className="mt-4" variant="danger" icon={LogOut} onClick={handleLogout}>
              Log out
            </PremiumButton>
          </div>
        </aside>

        <form onSubmit={submit} className="space-y-6">
          <section className="premium-card rounded-[2rem] p-6">
            <div className="mb-6 flex items-center gap-3">
              <div className="rounded-2xl bg-ember-50 p-3 text-ember-700">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-display text-2xl font-extrabold text-ink-900">Student information</h2>
                <p className="text-sm font-semibold text-ink-500">Saved once, reused everywhere.</p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Full name" icon={UserRound}>
                <input className="field" value={form.fullName} onChange={update("fullName")} required />
              </Field>
              <Field label="Register number">
                <input className="field" value={form.registerNumber} onChange={update("registerNumber")} placeholder="21CS001" />
              </Field>
              <Field label="Email" icon={Mail}>
                <input className="field" value={profile?.email || ""} readOnly />
              </Field>
              <Field label="Google phone" icon={Phone}>
                <input className="field" value={form.phoneNumber} onChange={update("phoneNumber")} placeholder="Optional" />
              </Field>
              <Field label="Registered mobile" icon={Phone}>
                <input className="field" value={form.registeredMobile} onChange={update("registeredMobile")} placeholder="10 digit mobile" />
              </Field>
              <Field label="Department">
                <select className="field" value={form.department} onChange={update("department")}>
                  <option value="">Select department</option>
                  {departments.map((department) => (
                    <option key={department}>{department}</option>
                  ))}
                </select>
              </Field>
              <Field label="Year">
                <select className="field" value={form.year} onChange={update("year")}>
                  <option value="">Select year</option>
                  {["1st", "2nd", "3rd", "4th", "PG 1st", "PG 2nd"].map((year) => (
                    <option key={year}>{year}</option>
                  ))}
                </select>
              </Field>
              <Field label="Hostel or block" icon={MapPin}>
                <input className="field" value={form.hostel} onChange={update("hostel")} placeholder="Block A / Hostel 2" />
              </Field>
              <div className="md:col-span-2">
                <Field label="Address details" icon={MapPin}>
                  <textarea
                    className="field min-h-28 resize-y"
                    value={form.address}
                    onChange={update("address")}
                    placeholder="Room number, hostel wing, or pickup note"
                  />
                </Field>
              </div>
            </div>
          </section>

          <section className="premium-card rounded-[2rem] p-6">
            <div className="mb-6 flex items-center gap-3">
              <div className="rounded-2xl bg-teal-50 p-3 text-teal-700">
                <Settings className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-display text-2xl font-extrabold text-ink-900">Preferences</h2>
                <p className="text-sm font-semibold text-ink-500">Dietary, payment, and notification settings.</p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Dietary preference">
                <select className="field" value={form.dietary} onChange={update("dietary")}>
                  <option value="all">All foods</option>
                  <option value="veg">Veg only</option>
                  <option value="nonveg">Non-veg preferred</option>
                </select>
              </Field>
              <Field label="Spice level">
                <select className="field" value={form.spiceLevel} onChange={update("spiceLevel")}>
                  <option value="mild">Mild</option>
                  <option value="medium">Medium</option>
                  <option value="hot">Hot</option>
                </select>
              </Field>
              <Field label="Preferred payment" icon={CreditCard}>
                <select className="field" value={form.preferredMethod} onChange={update("preferredMethod")}>
                  <option>UPI</option>
                  <option>Card</option>
                  <option>Pay at Counter</option>
                </select>
              </Field>
              <Field label="Saved UPI ID" icon={CreditCard}>
                <input className="field" value={form.upiId} onChange={update("upiId")} placeholder="yourname@upi" />
              </Field>
            </div>

            <div className="mt-5 grid gap-3 md:grid-cols-2">
              <Toggle
                icon={Bell}
                title="Notifications"
                body="Store notification preference in settings."
                checked={form.notificationsEnabled}
                onChange={update("notificationsEnabled")}
              />
              <Toggle
                icon={BadgeCheck}
                title="Order status updates"
                body="Receive status notifications for active orders."
                checked={form.orderUpdates}
                onChange={update("orderUpdates")}
              />
            </div>
          </section>

          <div className="sticky bottom-24 z-20 rounded-full border border-white/80 bg-white/90 p-2 shadow-soft backdrop-blur-2xl md:bottom-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="px-4 text-sm font-bold text-ink-500">
                {saved ? (
                  <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-teal-700">
                    Saved to Firestore.
                  </motion.span>
                ) : (
                  "Changes sync across all devices after save."
                )}
              </div>
              <PremiumButton type="submit" loading={saving} icon={Save}>
                Save profile
              </PremiumButton>
            </div>
          </div>
        </form>
      </div>
    </PageTransition>
  );
}

function Field({ label, icon: Icon, children }) {
  return (
    <label className="grid gap-2">
      <span className="label inline-flex items-center gap-2">
        {Icon ? <Icon className="h-3.5 w-3.5" /> : null}
        {label}
      </span>
      {children}
    </label>
  );
}

function Toggle({ icon: Icon, title, body, checked, onChange }) {
  return (
    <label className="flex cursor-pointer items-center gap-4 rounded-3xl bg-pearl-50 p-4">
      <div className="rounded-2xl bg-white p-3 text-ember-700 shadow-sm">
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-extrabold text-ink-900">{title}</p>
        <p className="mt-1 text-xs font-semibold text-ink-500">{body}</p>
      </div>
      <input type="checkbox" checked={checked} onChange={onChange} className="sr-only" />
      <span className={`relative h-7 w-12 rounded-full transition ${checked ? "bg-ember-500" : "bg-ink-900/10"}`}>
        <span
          className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow-sm transition ${
            checked ? "left-6" : "left-1"
          }`}
        />
      </span>
    </label>
  );
}

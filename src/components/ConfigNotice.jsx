import { AlertTriangle } from "lucide-react";

export default function ConfigNotice() {
  return (
    <div className="rounded-3xl border border-amber-200 bg-amber-50/90 p-4 text-sm text-amber-900 shadow-sm">
      <div className="flex items-start gap-3">
        <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0" />
        <div>
          <p className="font-extrabold">Firebase is not configured yet.</p>
          <p className="mt-1 font-medium leading-6">
            Add your Firebase web app values to <span className="font-bold">.env</span> using
            <span className="font-bold"> .env.example</span>, enable Google Authentication, then deploy the
            included Firestore rules.
          </p>
        </div>
      </div>
    </div>
  );
}

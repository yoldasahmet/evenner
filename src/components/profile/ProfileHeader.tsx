import type { Profile } from "@/lib/types";

// Identity card with an animated profile-completeness ring around the avatar.
// The organiser variant matches the dark "studio" template.
export default function ProfileHeader({
  profile,
  completeness,
  variant = "attendee",
}: {
  profile: Profile;
  completeness: number;
  variant?: "attendee" | "organiser";
}) {
  const dark = variant === "organiser";
  const r = 32;
  const circ = 2 * Math.PI * r;
  const dash = (completeness / 100) * circ;
  const initial = (profile.full_name ?? "?").charAt(0).toUpperCase();

  return (
    <div
      className={`relative overflow-hidden rounded-3xl border p-5 shadow-sm animate-fade-up ${
        dark ? "border-slate-700 bg-slate-900" : "border-gray-200 bg-white"
      }`}
    >
      <div
        className={`pointer-events-none absolute inset-x-0 top-0 h-20 ${
          dark
            ? "bg-gradient-to-r from-amber-500/20 via-slate-800 to-teal-500/20"
            : "bg-aurora opacity-90"
        }`}
      />
      <div className="relative flex items-center gap-4 pt-6">
        <div className="relative h-[76px] w-[76px] shrink-0">
          <svg viewBox="0 0 76 76" className="absolute inset-0 -rotate-90">
            <circle
              cx="38" cy="38" r={r} fill="none" strokeWidth="6"
              stroke={dark ? "#334155" : "#ede9fe"}
            />
            <circle
              cx="38" cy="38" r={r} fill="none" strokeWidth="6"
              stroke={dark ? "#f59e0b" : "#7c3aed"}
              strokeLinecap="round"
              strokeDasharray={`${dash} ${circ}`}
            />
          </svg>
          <div
            className={`absolute inset-[10px] flex items-center justify-center rounded-full text-2xl font-bold ${
              dark ? "bg-slate-800 text-amber-400" : "bg-brand-100 text-brand-700"
            }`}
          >
            {initial}
          </div>
        </div>

        <div className="min-w-0">
          <p className={`truncate text-lg font-bold ${dark ? "text-white" : "text-gray-900"}`}>
            {profile.full_name ?? "Unnamed"}
          </p>
          <p className={`truncate text-sm ${dark ? "text-slate-400" : "text-gray-500"}`}>
            {dark
              ? profile.company_name ?? profile.headline ?? "Add your organisation"
              : profile.headline ?? "Add a headline"}
          </p>
          <div className="mt-2 flex items-center gap-2">
            <span
              className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${
                dark ? "bg-amber-500/15 text-amber-400" : "bg-brand-50 text-brand-700"
              }`}
            >
              {profile.role}
            </span>
            <span className={`text-xs ${dark ? "text-slate-500" : "text-gray-400"}`}>
              {completeness}% complete
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

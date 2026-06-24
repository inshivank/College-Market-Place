import clsx from "clsx";

const toneClasses = {
  high: "bg-emerald-100 text-emerald-800 ring-emerald-200",
  medium: "bg-amber-100 text-amber-800 ring-amber-200",
  low: "bg-slate-100 text-slate-700 ring-slate-200"
};

export default function MatchScoreBadge({ score, reason }) {
  const tier = score >= 85 ? "high" : score >= 70 ? "medium" : "low";
  return (
    <div className={clsx("rounded-3xl border px-3 py-2 text-xs font-black uppercase tracking-[0.18em] ring-1", toneClasses[tier])}>
      <span className="text-ocean">✓</span> {score}% Match • {reason}
    </div>
  );
}

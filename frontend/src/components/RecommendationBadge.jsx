import clsx from "clsx";

const variantStyles = {
  recommended: "bg-sky-100 text-sky-800 ring-sky-200",
  trending: "bg-blue-100 text-blue-800 ring-blue-200",
  hot: "bg-orange-100 text-orange-800 ring-orange-200",
  new: "bg-cyan-100 text-cyan-800 ring-cyan-200",
  verified: "bg-emerald-100 text-emerald-800 ring-emerald-200",
  default: "bg-slate-100 text-slate-700 ring-slate-200"
};

export default function RecommendationBadge({ label, variant = "default" }) {
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] ring-1",
        variantStyles[variant] || variantStyles.default
      )}
    >
      {label}
    </span>
  );
}

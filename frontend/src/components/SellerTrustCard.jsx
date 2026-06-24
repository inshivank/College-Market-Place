export default function SellerTrustCard({ seller, stats }) {
  if (!seller) return null;

  const trustBadges = [
    { label: "Verified Student", color: "bg-emerald-100 text-emerald-700" },
    { label: "Top Seller", color: "bg-amber-100 text-amber-700" },
    { label: "Fast Responder", color: "bg-blue-100 text-blue-700" }
  ];

  return (
    <section className="overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-soft">
      <div className="bg-slate-50 p-6">
        <p className="text-sm font-black uppercase tracking-[0.24em] text-slate-500">Trust & safety</p>
        <div className="mt-4 flex items-center gap-4">
          <div className="grid h-16 w-16 place-items-center rounded-3xl bg-ocean text-2xl font-black text-white">{seller.name?.[0] || "S"}</div>
          <div>
            <p className="text-xl font-black text-slate-950">{seller.name}</p>
            <p className="text-sm text-slate-500">{seller.department || "Department not specified"}</p>
          </div>
        </div>
      </div>
      <div className="grid gap-4 p-6">
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-3xl bg-slate-50 p-4 text-center">
            <p className="text-2xl font-black text-slate-950">{stats?.totalListings ?? "—"}</p>
            <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Listings</p>
          </div>
          <div className="rounded-3xl bg-slate-50 p-4 text-center">
            <p className="text-2xl font-black text-slate-950">{stats?.successRate ? `${stats.successRate}%` : "—"}</p>
            <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Response rate</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-3xl bg-slate-50 p-4 text-center">
            <p className="text-2xl font-black text-slate-950">{stats?.itemsSold ?? "—"}</p>
            <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Sold</p>
          </div>
          <div className="rounded-3xl bg-slate-50 p-4 text-center">
            <p className="text-2xl font-black text-slate-950">{stats?.rating ?? "—"}</p>
            <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Rating</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {trustBadges.map((badge) => (
            <span key={badge.label} className={`rounded-full px-3 py-2 text-xs font-black uppercase tracking-[0.18em] ${badge.color}`}>
              {badge.label}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

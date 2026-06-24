export default function CampusTrendWidget({ trends }) {
  return (
    <section className="rounded-[32px] bg-white p-6 shadow-soft">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.24em] text-slate-500">Campus trends</p>
          <h2 className="mt-2 text-2xl font-black text-slate-950">What the campus is shopping</h2>
        </div>
        <span className="rounded-full bg-slate-100 px-4 py-2 text-xs font-bold uppercase tracking-[0.22em] text-slate-700">Live</span>
      </div>
      <div className="mt-6 grid gap-4">
        {trends.map((trend) => (
          <div key={trend.category} className="flex items-center justify-between rounded-3xl border border-slate-200 bg-slate-50 px-5 py-4">
            <div>
              <p className="font-black text-slate-950">{trend.category}</p>
              <p className="text-sm text-slate-500">{trend.subtitle}</p>
            </div>
            <p className={`text-lg font-black ${trend.value > 0 ? "text-rose-600" : "text-slate-700"}`}>{trend.value > 0 ? `↑ ${trend.value}%` : `${trend.value}%`}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

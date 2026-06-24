export default function AIInsightCard({ title, value, detail, color = "bg-slate-50" }) {
  return (
    <article className={`rounded-3xl p-5 shadow-sm ${color}`}>
      <p className="text-xs font-black uppercase tracking-[0.24em] text-slate-500">{title}</p>
      <p className="mt-4 text-3xl font-black text-slate-950">{value}</p>
      {detail && <p className="mt-2 text-sm text-slate-600">{detail}</p>}
    </article>
  );
}

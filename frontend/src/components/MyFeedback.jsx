import { useEffect, useState } from "react";
import api from "../api";
import FeedbackStatusBadge from "./FeedbackStatusBadge";

export default function MyFeedback() {
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/feedback").then(({ data }) => setItems(data.feedback)).catch((requestError) => setError(requestError.response?.data?.message || "Could not load your feedback")).finally(() => setLoading(false));
  }, []);

  return <section className="mt-10">
    <div className="mb-4"><p className="text-sm font-black uppercase text-teal-700">Help shape the marketplace</p><h2 className="text-2xl font-black">My Feedback</h2></div>
    {error && <p className="rounded-xl bg-rose-50 p-3 text-sm font-bold text-rose-700">{error}</p>}
    {loading ? <p className="text-sm text-slate-500">Loading feedback…</p> : items.length === 0 ? <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-500"><span className="text-3xl">💬</span><p className="mt-2 font-bold text-slate-700">No feedback yet</p><p className="text-sm">Use the Feedback button whenever something could be better.</p></div> : <div className="grid gap-4 md:grid-cols-2">{items.map((item) => <article key={item._id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3"><div><p className="text-xs font-black uppercase tracking-wide text-teal-700">{item.category}</p><p className="mt-1 text-sm text-slate-400">{new Date(item.createdAt).toLocaleDateString(undefined, { dateStyle: "medium" })}</p></div><FeedbackStatusBadge status={item.status}/></div>
      {item.rating && <p className="mt-3 text-amber-400" aria-label={`${item.rating} out of 5 stars`}>{"★".repeat(item.rating)}<span className="text-slate-200">{"★".repeat(5-item.rating)}</span></p>}
      <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-600">{item.message}</p>
    </article>)}</div>}
  </section>;
}

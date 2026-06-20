import { useEffect, useMemo, useState } from "react";
import api from "../api";
import FeedbackStatusBadge from "./FeedbackStatusBadge";

const categories = ["Bug Report", "Feature Request", "UI / UX", "Performance", "Marketplace Listing", "General Feedback"];
const statuses = ["New", "In Review", "Planned", "Resolved", "Closed"];

export default function AdminFeedback() {
  const [items, setItems] = useState([]);
  const [filters, setFilters] = useState({ category: "", rating: "", status: "", search: "" });
  const [selected, setSelected] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try { const { data } = await api.get("/feedback", { params: Object.fromEntries(Object.entries(filters).filter(([, value]) => value)) }); setItems(data.feedback); }
    catch (requestError) { setError(requestError.response?.data?.message || "Could not load feedback"); }
    finally { setLoading(false); }
  }
  useEffect(() => { const timer = window.setTimeout(load, 250); return () => window.clearTimeout(timer); }, [filters.category, filters.rating, filters.status, filters.search]);
  useEffect(() => { if (!selected) return undefined; const close = (event) => event.key === "Escape" && setSelected(null); document.addEventListener("keydown", close); return () => document.removeEventListener("keydown", close); }, [selected]);
  const counts = useMemo(() => statuses.reduce((result, status) => ({ ...result, [status]: items.filter((item) => item.status === status).length }), {}), [items]);

  async function updateStatus(id, status) { try { const { data } = await api.patch(`/feedback/${id}`, { status }); setItems((current) => current.map((item) => item._id === id ? data.feedback : item)); setSelected((current) => current?._id === id ? data.feedback : current); } catch (requestError) { setError(requestError.response?.data?.message || "Could not update status"); } }
  async function remove(id) { if (!window.confirm("Delete this feedback permanently?")) return; try { await api.delete(`/feedback/${id}`); setItems((current) => current.filter((item) => item._id !== id)); setSelected(null); } catch (requestError) { setError(requestError.response?.data?.message || "Could not delete feedback"); } }

  return <section>
    <div className="mb-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">{statuses.map((status) => <div key={status} className="rounded-xl border border-slate-200 bg-white p-3"><p className="text-xs font-bold text-slate-500">{status}</p><p className="text-2xl font-black">{counts[status] || 0}</p></div>)}</div>
    <div className="mb-5 grid gap-3 rounded-xl border border-slate-200 bg-white p-4 sm:grid-cols-2 lg:grid-cols-4">
      <input aria-label="Search feedback" placeholder="Search name, email, message…" value={filters.search} onChange={(e) => setFilters({ ...filters, search: e.target.value })}/>
      <select aria-label="Filter by category" value={filters.category} onChange={(e) => setFilters({ ...filters, category: e.target.value })}><option value="">All categories</option>{categories.map((value) => <option key={value}>{value}</option>)}</select>
      <select aria-label="Filter by rating" value={filters.rating} onChange={(e) => setFilters({ ...filters, rating: e.target.value })}><option value="">All ratings</option>{[5,4,3,2,1].map((value) => <option key={value} value={value}>{value} stars</option>)}</select>
      <select aria-label="Filter by status" value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}><option value="">All statuses</option>{statuses.map((value) => <option key={value}>{value}</option>)}</select>
    </div>
    {error && <p className="mb-4 rounded-xl bg-rose-50 p-3 text-sm font-bold text-rose-700">{error}</p>}
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm"><table className="w-full min-w-[940px] text-left text-sm"><thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr><th className="p-4">User</th><th>Category</th><th>Rating</th><th>Message</th><th>Screenshot</th><th>Status</th><th>Date</th></tr></thead><tbody className="divide-y divide-slate-100">{loading ? <tr><td colSpan="7" className="p-8 text-center text-slate-500">Loading feedback…</td></tr> : items.length === 0 ? <tr><td colSpan="7" className="p-8 text-center text-slate-500">No feedback matches these filters.</td></tr> : items.map((item) => <tr key={item._id} onClick={() => setSelected(item)} className="cursor-pointer hover:bg-slate-50"><td className="p-4"><p className="font-bold">{item.name}</p><p className="text-xs text-slate-400">{item.email}</p></td><td>{item.category}</td><td className="text-amber-500">{item.rating ? `${item.rating} ★` : "—"}</td><td className="max-w-xs truncate text-slate-600">{item.message}</td><td>{item.screenshot ? <img src={item.screenshot} alt="Feedback screenshot" className="h-10 w-14 rounded object-cover"/> : "—"}</td><td><FeedbackStatusBadge status={item.status}/></td><td className="text-slate-500">{new Date(item.createdAt).toLocaleDateString()}</td></tr>)}</tbody></table></div>
    {selected && <div className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-slate-950/60 p-4 backdrop-blur-sm" onMouseDown={(e) => e.target === e.currentTarget && setSelected(null)}><article role="dialog" aria-modal="true" aria-label="Feedback details" className="relative my-auto w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl"><button type="button" onClick={() => setSelected(null)} aria-label="Close details" className="absolute right-5 top-4 text-2xl text-slate-400">×</button><div className="pr-10"><p className="text-xs font-black uppercase text-teal-700">{selected.category}</p><h2 className="text-2xl font-black">Feedback from {selected.name}</h2><p className="text-sm text-slate-500">{selected.email} · {new Date(selected.createdAt).toLocaleString()}</p></div><div className="mt-5 flex flex-wrap items-center gap-3">{selected.rating && <span className="text-amber-500">{"★".repeat(selected.rating)}</span>}<select aria-label="Update feedback status" className="max-w-40" value={selected.status} onChange={(e) => updateStatus(selected._id, e.target.value)}>{statuses.map((status) => <option key={status}>{status}</option>)}</select>{selected.allowContact && <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-bold text-teal-700">Contact allowed</span>}</div><p className="mt-5 whitespace-pre-wrap rounded-xl bg-slate-50 p-4 leading-7 text-slate-700">{selected.message}</p>{selected.screenshot && <a href={selected.screenshot} target="_blank" rel="noreferrer"><img src={selected.screenshot} alt="Full feedback screenshot" className="mt-5 max-h-80 w-full rounded-xl object-contain bg-slate-100"/></a>}<dl className="mt-5 grid gap-3 rounded-xl border border-slate-200 p-4 text-sm sm:grid-cols-2"><div><dt className="font-bold text-slate-400">Page</dt><dd className="break-all">{selected.page || "Unknown"}</dd></div><div><dt className="font-bold text-slate-400">Environment</dt><dd>{selected.browser} · {selected.os} · {selected.screen}</dd></div></dl><div className="mt-5 flex justify-end"><button type="button" onClick={() => remove(selected._id)} className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-bold text-white hover:bg-rose-700">Delete feedback</button></div></article></div>}
  </section>;
}

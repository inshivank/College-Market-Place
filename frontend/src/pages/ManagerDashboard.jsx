import { useEffect, useMemo, useState } from "react";
import api from "../api";

const tabs = ["Pending Items", "Active Items"];

export default function ManagerDashboard() {
  const [activeTab, setActiveTab] = useState("Pending Items");
  const [items, setItems] = useState([]);
  const [message, setMessage] = useState("");

  async function loadItems() {
    const { data } = await api.get("/admin/items");
    setItems(data.items);
  }

  useEffect(() => {
    loadItems().catch((error) => {
      setMessage(error.response?.data?.message || "Could not load manager dashboard");
    });
  }, []);

  const pendingItems = useMemo(() => items.filter((item) => item.status === "pending"), [items]);
  const activeItems = useMemo(() => items.filter((item) => item.status === "active"), [items]);

  async function updateStatus(itemId, status) {
    const { data } = await api.put(`/admin/items/${itemId}/status`, { status });
    setItems((current) => current.map((item) => (item._id === itemId ? data.item : item)));
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <section className="mb-6 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <p className="text-sm font-black uppercase text-teal-700">Moderation queue</p>
        <h1 className="text-4xl font-black text-slate-950">Manager Dashboard</h1>
        <p className="mt-2 max-w-2xl text-slate-500">Review pending listings, approve good posts, reject incomplete ones, and mark sold items when they leave the marketplace.</p>
      </section>

      {message && <p className="mb-4 rounded-xl bg-rose-50 p-3 text-sm font-bold text-rose-700">{message}</p>}

      <div className="mb-6 flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`rounded-lg px-4 py-2 text-sm font-black ${activeTab === tab ? "bg-teal-700 text-white" : "bg-white text-slate-600 ring-1 ring-slate-200"}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === "Pending Items" && (
        <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {pendingItems.map((item) => (
            <article key={item._id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-black">{item.title}</h2>
                  <p className="text-sm text-slate-500">{item.seller?.name || "Deleted user"} · {item.category}</p>
                </div>
                <p className="font-black text-teal-700">Rs. {Number(item.price).toLocaleString("en-IN")}</p>
              </div>
              <p className="mb-4 line-clamp-3 text-sm leading-6 text-slate-600">{item.description}</p>
              <div className="flex gap-2">
                <button type="button" onClick={() => updateStatus(item._id, "active")} className="btn-primary">Approve</button>
                <button type="button" onClick={() => updateStatus(item._id, "sold")} className="rounded-lg bg-rose-50 px-4 py-2 text-sm font-bold text-rose-700 hover:bg-rose-100">Reject</button>
              </div>
            </article>
          ))}
          {pendingItems.length === 0 && <p className="rounded-xl bg-white p-8 text-center font-semibold text-slate-500 md:col-span-2 xl:col-span-3">No pending items.</p>}
        </section>
      )}

      {activeTab === "Active Items" && (
        <section className="space-y-3">
          {activeItems.map((item) => (
            <article key={item._id} className="flex flex-col justify-between gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center">
              <div>
                <h2 className="font-black">{item.title}</h2>
                <p className="text-sm text-slate-500">{item.seller?.name || "Deleted user"} · Rs. {Number(item.price).toLocaleString("en-IN")} · {item.category}</p>
              </div>
              <button type="button" onClick={() => updateStatus(item._id, "sold")} className="btn-secondary">Mark as Sold</button>
            </article>
          ))}
          {activeItems.length === 0 && <p className="rounded-xl bg-white p-8 text-center font-semibold text-slate-500">No active items.</p>}
        </section>
      )}
    </main>
  );
}

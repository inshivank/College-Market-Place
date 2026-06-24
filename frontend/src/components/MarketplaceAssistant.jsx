import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../api";

const starterPrompts = [
  "Find laptops under ₹25000",
  "Show books for DSA",
  "Recommend electronics under ₹5000",
  "Show trending hostel essentials"
];

export default function MarketplaceAssistant() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [history, setHistory] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("marketplaceAssistantHistory") || "[]");
    setHistory(Array.isArray(stored) ? stored : []);
  }, []);

  useEffect(() => {
    localStorage.setItem("marketplaceAssistantHistory", JSON.stringify(history.slice(0, 20)));
  }, [history]);

  async function search(queryText) {
    if (!queryText.trim()) return;
    setLoading(true);
    try {
      const { data } = await api.get("/items", { params: { search: queryText, limit: 10 } });
      setResults(data.items || []);
      setHistory((current) => [{ query: queryText, results: data.items?.slice(0, 5) || [] }, ...current].slice(0, 10));
    } finally {
      setLoading(false);
    }
  }

  const suggested = useMemo(() => history.slice(0, 3), [history]);

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-3">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="w-[360px] rounded-[32px] border border-slate-200 bg-white p-4 shadow-2xl"
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-black uppercase tracking-[0.24em] text-slate-500">Campus assistant</p>
                <h2 className="text-lg font-black text-slate-950">Ask the marketplace</h2>
              </div>
              <button type="button" onClick={() => setOpen(false)} className="text-slate-500 hover:text-slate-900">Close</button>
            </div>
            <div className="mt-4 space-y-3">
              <div className="grid gap-2">
                {starterPrompts.map((prompt) => (
                  <button
                    type="button"
                    key={prompt}
                    onClick={() => { setQuery(prompt); search(prompt); }}
                    className="rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 text-left transition hover:bg-slate-100"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-3">
                <label htmlFor="assistant-search" className="sr-only">Assistant search</label>
                <input
                  id="assistant-search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Ask the assistant..."
                  className="w-full bg-transparent text-sm text-slate-900 outline-none"
                />
                <button
                  type="button"
                  onClick={() => search(query)}
                  className="mt-3 w-full rounded-3xl bg-ocean px-4 py-3 text-sm font-black text-white transition hover:bg-ocean-dark"
                >
                  {loading ? "Searching..." : "Find products"}
                </button>
              </div>
              <div className="space-y-2">
                {suggested.length > 0 && <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Recent queries</p>}
                {suggested.map((item, index) => (
                  <button
                    key={`${item.query}-${index}`}
                    type="button"
                    onClick={() => { setQuery(item.query); search(item.query); }}
                    className="w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 text-left transition hover:bg-slate-50"
                  >
                    {item.query}
                  </button>
                ))}
              </div>
              <div className="rounded-3xl bg-slate-950 p-4 text-white">
                <p className="text-sm font-black uppercase tracking-[0.24em]">Tip</p>
                <p className="mt-2 text-sm leading-6 text-slate-100">Use the assistant to surface listings, compare options, and find fast campus deals.</p>
              </div>
              {results.length > 0 && (
                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-sm font-black uppercase tracking-[0.24em] text-slate-500">Suggested results</p>
                  <div className="mt-3 space-y-2">
                    {results.slice(0, 5).map((item) => (
                      <div key={item._id} className="rounded-3xl bg-white p-3 shadow-sm">
                        <p className="font-black text-slate-950">{item.title}</p>
                        <p className="text-sm text-slate-500">₹{Number(item.price).toLocaleString("en-IN")}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex h-16 w-16 items-center justify-center rounded-full bg-ocean text-white shadow-xl shadow-ocean/20 transition hover:bg-ocean-dark"
        aria-label="Open marketplace assistant"
      >
        🤖
      </button>
    </div>
  );
}

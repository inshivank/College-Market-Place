import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";

const trendingSearches = ["laptops under ₹5000", "second-hand textbooks", "hostel mattress", "study lamp", "bike helmet"];
const categorySuggestions = ["Electronics", "Books", "Furniture", "Accessories", "Cycles"];

export default function SmartSearchBar({ value, onSearch, onCategorySelect }) {
  const [query, setQuery] = useState(value || "");
  const [savedSearches, setSavedSearches] = useState([]);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("collegeMarketplaceSavedSearches") || "[]");
    setSavedSearches(Array.isArray(stored) ? stored.slice(0, 6) : []);
  }, []);

  const suggestions = useMemo(() => {
    if (!query.trim()) {
      return trendingSearches;
    }

    const lower = query.toLowerCase();
    return [...trendingSearches, ...categorySuggestions]
      .filter((term) => term.toLowerCase().includes(lower))
      .slice(0, 6);
  }, [query]);

  function handleSubmit(event) {
    event.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;

    localStorage.setItem(
      "collegeMarketplaceSavedSearches",
      JSON.stringify([trimmed, ...savedSearches.filter((item) => item !== trimmed)].slice(0, 8))
    );
    setSavedSearches((current) => [trimmed, ...current.filter((item) => item !== trimmed)].slice(0, 8));
    onSearch(trimmed);
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="relative">
        <label htmlFor="smart-search" className="sr-only">Search campus items</label>
        <div className="flex items-center gap-3 rounded-3xl border border-slate-200 bg-white px-4 py-3 shadow-sm focus-within:border-ocean focus-within:ring-2 focus-within:ring-ocean/20">
          <span className="text-slate-400">🔎</span>
          <input
            id="smart-search"
            className="flex-1 bg-transparent text-lg font-semibold text-slate-950 outline-none placeholder:text-slate-400"
            placeholder="Search for books, laptops, furniture..."
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            aria-label="Search campus items"
          />
          <button type="submit" className="rounded-2xl bg-ocean px-5 py-3 text-sm font-black text-white transition hover:bg-ocean-dark">
            Search
          </button>
        </div>
      </form>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <div className="rounded-3xl bg-sky-50 p-4">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-sky-600">Popular searches</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {trendingSearches.slice(0, 4).map((term) => (
              <button
                key={term}
                type="button"
                onClick={() => { setQuery(term); onSearch(term); }}
                className="rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-ocean hover:text-ocean"
              >
                {term}
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-3xl bg-white p-4 shadow-sm">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">Saved searches</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {savedSearches.length === 0 ? (
              <p className="text-sm text-slate-400">Save searches for quick access.</p>
            ) : (
              savedSearches.map((term) => (
                <button
                  key={term}
                  type="button"
                  onClick={() => { setQuery(term); onSearch(term); }}
                  className="rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                >
                  {term}
                </button>
              ))
            )}
          </div>
        </div>

        <motion.div
          className="rounded-3xl bg-slate-950 p-4 text-white"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <p className="text-xs font-black uppercase tracking-[0.2em] text-sky-300">Student insight</p>
          <p className="mt-3 text-sm leading-6 text-slate-100">Browse less and find more with AI-curated picks, personalized for your department and study habits.</p>
        </motion.div>
      </div>

      <div className="rounded-3xl bg-white p-4 shadow-sm">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">Category suggestions</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {categorySuggestions.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => onCategorySelect(category)}
              className="rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-ocean hover:text-ocean"
            >
              {category}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

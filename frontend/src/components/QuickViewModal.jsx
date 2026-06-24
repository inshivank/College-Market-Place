import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import RecommendationBadge from "./RecommendationBadge";

export default function QuickViewModal({ open, item, onClose }) {
  useEffect(() => {
    function onKeyDown(event) {
      if (event.key === "Escape") onClose();
    }

    if (open) {
      window.addEventListener("keydown", onKeyDown);
      return () => window.removeEventListener("keydown", onKeyDown);
    }
  }, [open, onClose]);

  if (!item) return null;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="w-full max-w-3xl overflow-hidden rounded-3xl bg-white shadow-2xl"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="Quick view item"
          >
            <div className="grid gap-6 p-6 lg:grid-cols-[360px_1fr]">
              <img src={item.images?.[0] || "/placeholder.jpg"} alt={item.title} className="h-72 w-full rounded-3xl object-cover" />
              <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-2">
                  {item.trending && <RecommendationBadge label="Trending" variant="trending" />}
                  {item.recommended && <RecommendationBadge label="Recommended" variant="recommended" />}
                </div>
                <h2 className="text-3xl font-black text-slate-950">{item.title}</h2>
                <p className="text-sm text-slate-500">{item.category} · {item.department || "General"} · {item.condition}</p>
                <p className="text-2xl font-black text-ocean">₹{Number(item.price).toLocaleString("en-IN")}</p>
                <p className="text-sm leading-7 text-slate-600">{item.description || "A classroom-ready listing that is highly rated by students."}</p>
                <div className="flex flex-wrap gap-3">
                  <Link to={`/items/${item._id}`} className="rounded-2xl bg-ocean px-5 py-3 text-sm font-black text-white">Open listing</Link>
                  <button type="button" onClick={onClose} className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-3 text-sm font-bold text-slate-700">Close</button>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

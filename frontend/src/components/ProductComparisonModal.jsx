import { AnimatePresence, motion } from "framer-motion";

export default function ProductComparisonModal({ open, items, onClose, removeItem }) {
  if (!open) return null;

  const attributes = [
    { label: "Price", accessor: (item) => `₹${Number(item.price || 0).toLocaleString("en-IN")}` },
    { label: "Condition", accessor: (item) => item.condition || "N/A" },
    { label: "Category", accessor: (item) => item.category || "N/A" },
    { label: "Seller rating", accessor: (item) => item.seller?.rating || "N/A" },
    { label: "Wishlist saves", accessor: (item) => item.wishlistedBy?.length || 0 },
    { label: "Views", accessor: (item) => item.views || 0 },
    { label: "Match score", accessor: (item) => (item.matchScore ? `${item.matchScore}%` : "—") }
  ];

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/70 p-4 sm:items-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="w-full max-w-6xl overflow-hidden rounded-[32px] bg-white shadow-2xl"
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 40, opacity: 0 }}
        >
          <div className="flex flex-col gap-4 border-b border-slate-200 p-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.24em] text-slate-500">Compare products</p>
              <h2 className="mt-2 text-2xl font-black text-slate-950">Compare selection side-by-side</h2>
            </div>
            <button type="button" onClick={onClose} className="rounded-3xl bg-slate-100 px-5 py-3 text-sm font-black text-slate-700 transition hover:bg-slate-200">Close</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] border-collapse text-left text-sm">
              <thead>
                <tr>
                  <th className="border-b border-slate-200 px-6 py-4"></th>
                  {items.map((item) => (
                    <th key={item._id} className="border-b border-slate-200 px-6 py-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-black text-slate-950">{item.title}</p>
                          <p className="mt-1 text-xs text-slate-500">{item.category}</p>
                        </div>
                        <button type="button" onClick={() => removeItem(item._id)} className="rounded-full bg-rose-100 px-3 py-1 text-xs font-bold text-rose-700">Remove</button>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {attributes.map((attribute) => (
                  <tr key={attribute.label} className="border-b border-slate-100">
                    <th className="px-6 py-4 font-semibold text-slate-700">{attribute.label}</th>
                    {items.map((item) => (
                      <td key={item._id} className="px-6 py-4 text-slate-600">{attribute.accessor(item)}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

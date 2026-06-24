import { motion } from "framer-motion";

const categories = [
  { label: "Electronics", hint: "Laptops, chargers, headphones", accent: "from-sky-500 to-indigo-600", value: "Electronics" },
  { label: "Books", hint: "Notes, guides, textbooks", accent: "from-cyan-500 to-blue-500", value: "Books" },
  { label: "Hostel Essentials", hint: "Bedding, cookery, storage", accent: "from-emerald-500 to-teal-600", value: "Hostel Essentials" },
  { label: "Furniture", hint: "Tables, chairs, storage", accent: "from-slate-500 to-slate-700", value: "Furniture" },
  { label: "Accessories", hint: "Backpacks, lights, cables", accent: "from-blue-400 to-sky-500", value: "Accessories" },
  { label: "Cycles", hint: "Bikes, spare parts, helmets", accent: "from-fuchsia-500 to-violet-600", value: "Cycles" },
  { label: "Notes & Study Material", hint: "Guides, revision notes", accent: "from-amber-500 to-orange-500", value: "Notes & Study Material" }
];

export default function CategoryGrid({ onSelect }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
      {categories.map((category) => (
        <motion.button
          key={category.label}
          type="button"
          onClick={() => onSelect(category.value)}
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.98 }}
          className="group overflow-hidden rounded-3xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:shadow-lg"
        >
          <div className={`mb-4 h-12 w-12 rounded-3xl bg-gradient-to-br ${category.accent} shadow-lg shadow-slate-200/40`} />
          <h3 className="text-lg font-black text-slate-950">{category.label}</h3>
          <p className="mt-2 text-sm text-slate-500">{category.hint}</p>
        </motion.button>
      ))}
    </div>
  );
}

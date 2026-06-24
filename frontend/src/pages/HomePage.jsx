import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../api";
import ItemCard from "../components/ItemCard";

const categories = ["All", "Books", "Electronics", "Clothes", "Others"];

export default function HomePage() {
  const [searchParams] = useSearchParams();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: searchParams.get("search") || "",
    category: "All",
    minPrice: "",
    maxPrice: "",
    sort: "newest"
  });

  async function fetchItems() {
    setLoading(true);
    const { data } = await api.get("/items", { params: filters });
    setItems(data.items);
    setLoading(false);
  }

  useEffect(() => {
    setFilters((current) => ({ ...current, search: searchParams.get("search") || "" }));
  }, [searchParams]);

  useEffect(() => {
    fetchItems();
  }, [filters]);

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <section className="mb-8 rounded-2xl bg-slate-950 p-8 text-white">
        <p className="text-sm font-black uppercase text-teal-300">Campus exchange</p>
        <h1 className="mt-2 max-w-3xl text-4xl font-black tracking-tight sm:text-5xl">
          Buy, sell, and discover useful college items.
        </h1>
      </section>

      <section className="mb-6 grid gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-5">
        <input placeholder="Search" value={filters.search} onChange={(event) => setFilters({ ...filters, search: event.target.value })} />
        <select value={filters.category} onChange={(event) => setFilters({ ...filters, category: event.target.value })}>
          {categories.map((category) => <option key={category}>{category}</option>)}
        </select>
        <input type="number" placeholder="Min price" value={filters.minPrice} onChange={(event) => setFilters({ ...filters, minPrice: event.target.value })} />
        <input type="number" placeholder="Max price" value={filters.maxPrice} onChange={(event) => setFilters({ ...filters, maxPrice: event.target.value })} />
        <select value={filters.sort} onChange={(event) => setFilters({ ...filters, sort: event.target.value })}>
          <option value="newest">Newest</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
          <option value="name">Name</option>
        </select>
      </section>

      {loading ? (
        <p className="rounded-xl bg-white p-8 text-center font-semibold text-slate-500">Loading items...</p>
      ) : items.length === 0 ? (
        <p className="rounded-xl bg-white p-8 text-center font-semibold text-slate-500">No items found.</p>
      ) : (
        <section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {items.map((item) => <ItemCard key={item._id} item={item} onWishlistChange={fetchItems} />)}
        </section>
      )}
    </main>
  );
}

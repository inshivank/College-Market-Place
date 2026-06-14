import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api from "../api";
import ItemCard from "../components/ItemCard";
import { useAuth } from "../context/AuthContext";

export default function ItemDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, role } = useAuth();
  const [item, setItem] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [error, setError] = useState("");

  async function fetchItem() {
    try {
      const [itemResponse, recommendationResponse] = await Promise.all([
        api.get(`/items/${id}`),
        api.get(`/items/${id}/recommendations`)
      ]);
      setItem(itemResponse.data.item);
      setRecommendations(recommendationResponse.data.recommendations);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Could not load item");
    }
  }

  useEffect(() => {
    fetchItem();
  }, [id]);

  async function deleteItem() {
    await api.delete(`/items/${id}`);
    navigate("/");
  }

  if (error) {
    return <main className="mx-auto max-w-3xl px-4 py-10 text-rose-700">{error}</main>;
  }

  if (!item) {
    return <main className="mx-auto max-w-3xl px-4 py-10 text-slate-500">Loading item...</main>;
  }

  const sellerId = item.seller?._id || item.seller;
  const canEdit = String(sellerId) === String(user?.id) || ["admin", "manager"].includes(role);
  const canDelete = String(sellerId) === String(user?.id) || role === "admin";

  return (
    <main className="mx-auto grid max-w-7xl gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[1fr_360px]">
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <img src={item.images?.[0] || "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80"} alt={item.title} className="h-80 w-full object-cover" />
        <div className="space-y-5 p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm font-black uppercase text-teal-700">{item.category}</p>
              <h1 className="text-4xl font-black">{item.title}</h1>
            </div>
            <p className="text-3xl font-black text-teal-700">Rs. {Number(item.price).toLocaleString("en-IN")}</p>
          </div>
          <p className="leading-7 text-slate-600">{item.description}</p>
          <div className="flex flex-wrap gap-2">
            {item.tags?.map((tag) => <span key={tag} className="rounded-full bg-slate-100 px-3 py-1 text-sm font-bold text-slate-600">#{tag}</span>)}
          </div>
          <div className="rounded-xl bg-slate-50 p-4">
            <p className="font-black">Seller</p>
            <p className="text-slate-600">{item.seller?.name || "Campus Seller"} · {item.seller?.email}</p>
            <p className="text-sm text-slate-500">{item.views} views · {item.status}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            {canEdit && <Link to={`/items/${item._id}/edit`} className="btn-secondary">Edit</Link>}
            {canDelete && <button type="button" onClick={deleteItem} className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-bold text-white">Delete</button>}
          </div>
        </div>
      </section>

      <aside>
        <h2 className="mb-4 text-xl font-black">Similar items</h2>
        <div className="space-y-4">
          {recommendations.map(({ item: recommendation }) => (
            <ItemCard key={recommendation._id} item={recommendation} />
          ))}
        </div>
      </aside>
    </main>
  );
}

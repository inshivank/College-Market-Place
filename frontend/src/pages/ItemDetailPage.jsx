import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api from "../api";
import ItemCard from "../components/ItemCard";
import SellerContactCard from "../components/SellerContactCard";
import { useAuth } from "../context/AuthContext";

function categoryPlaceholder(category = "Others") {
  const palette = {
    Books: ["#0f766e", "#ccfbf1", "BOOK"],
    Electronics: ["#2563eb", "#dbeafe", "TECH"],
    Clothes: ["#be123c", "#ffe4e6", "WEAR"],
    Others: ["#92400e", "#fef3c7", "ITEM"]
  };
  const [color, background, label] = palette[category] || palette.Others;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 520"><rect width="900" height="520" fill="${background}"/><rect x="170" y="104" width="560" height="312" rx="34" fill="${color}" opacity="0.94"/><circle cx="250" cy="190" r="34" fill="white" opacity="0.88"/><path d="M228 330 H672" stroke="white" stroke-width="28" stroke-linecap="round" opacity="0.9"/><path d="M228 274 H548" stroke="white" stroke-width="22" stroke-linecap="round" opacity="0.68"/><text x="450" y="222" text-anchor="middle" fill="white" font-family="Arial" font-size="72" font-weight="700">${label}</text></svg>`;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

export default function ItemDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, role } = useAuth();
  const [item, setItem] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [sellerStats, setSellerStats] = useState(null);
  const [error, setError] = useState("");

  async function fetchItem() {
    try {
      const [itemResponse, recommendationResponse] = await Promise.all([
        api.get(`/items/${id}`),
        api.get(`/items/${id}/recommendations`)
      ]);
      setItem(itemResponse.data.item);
      setSellerStats(itemResponse.data.sellerStats);
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
  const images = item.images?.length > 0 ? item.images : [categoryPlaceholder(item.category)];

  return (
    <main className="mx-auto grid max-w-7xl gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[1fr_360px]">
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <img src={images[0]} alt={item.title} className="h-80 w-full object-cover" />
        {images.length > 1 && (
          <div className="grid grid-cols-4 gap-2 border-b border-slate-100 bg-slate-50 p-3">
            {images.slice(0, 4).map((image) => (
              <img key={image} src={image} alt={item.title} className="h-20 w-full rounded-lg object-cover ring-1 ring-slate-200" />
            ))}
          </div>
        )}
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
          <p className="text-sm font-bold text-slate-400">{item.views} views · {item.status}</p>
          <div className="flex flex-wrap gap-3">
            {canEdit && <Link to={`/items/${item._id}/edit`} className="btn-secondary">Edit</Link>}
            {canDelete && <button type="button" onClick={deleteItem} className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-bold text-white">Delete</button>}
          </div>
        </div>
      </section>

      <aside className="space-y-7">
        <SellerContactCard item={item} stats={sellerStats} />
        <div>
        <h2 className="mb-4 text-xl font-black">Similar items</h2>
        <div className="space-y-4">
          {recommendations.map(({ item: recommendation }) => (
            <ItemCard key={recommendation._id} item={recommendation} />
          ))}
        </div>
        </div>
      </aside>
    </main>
  );
}

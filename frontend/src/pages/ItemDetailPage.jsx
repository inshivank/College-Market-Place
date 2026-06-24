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
      setRecommendations(recommendationResponse.data.recommendations || []);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Could not load item");
    }
  }

  useEffect(() => {
    fetchItem();
  }, [id]);

  useEffect(() => {
    if (!item) return;
    const stored = JSON.parse(localStorage.getItem("collegeMarketplaceRecentlyViewed") || "[]");
    const next = [
      {
        _id: item._id,
        title: item.title,
        category: item.category,
        price: item.price,
        images: item.images,
        createdAt: item.createdAt
      },
      ...stored.filter((record) => record._id !== item._id)
    ].slice(0, 8);
    localStorage.setItem("collegeMarketplaceRecentlyViewed", JSON.stringify(next));
  }, [item]);

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
    <main className="mx-auto grid max-w-7xl gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[1.75fr_0.95fr]">
      <section className="overflow-hidden rounded-[32px] bg-white shadow-soft">
        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <div className="space-y-5 p-6">
            <p className="text-sm font-black uppercase tracking-[0.24em] text-slate-500">{item.category}</p>
            <h1 className="text-5xl font-black text-slate-950">{item.title}</h1>
            <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500">
              <span>{item.department || "General campus"}</span>
              <span>•</span>
              <span>{item.condition}</span>
              <span>•</span>
              <span>{new Date(item.createdAt).toLocaleDateString()}</span>
            </div>
            <p className="max-w-3xl text-base leading-8 text-slate-600">{item.description}</p>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-3xl bg-slate-50 p-5">
                <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Price</p>
                <p className="mt-3 text-4xl font-black text-ocean">₹{Number(item.price).toLocaleString("en-IN")}</p>
              </div>
              <div className="rounded-3xl bg-slate-50 p-5">
                <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Engagement</p>
                <div className="mt-3 space-y-2 text-sm text-slate-600">
                  <p>{item.views || 0} views</p>
                  <p>{item.wishlistCount || item.wishlistedBy?.length || 0} saves</p>
                  <p>Popularity score {Math.min(100, Math.round((item.views || 0) / 5))}/100</p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-5 p-6">
            <div className="space-y-4 rounded-3xl border border-slate-200 bg-slate-50 p-5">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Seller trust</p>
              <div className="flex items-center gap-4">
                <div className="grid h-16 w-16 place-items-center rounded-3xl bg-white text-2xl">{item.seller?.name?.[0] || "S"}</div>
                <div>
                  <p className="text-lg font-black text-slate-950">{item.seller?.name || "Campus seller"}</p>
                  <p className="text-sm text-slate-500">{item.seller?.verified ? "Verified seller" : "Seller verification pending"}</p>
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-3xl bg-white p-4 text-center">
                  <p className="text-2xl font-black text-slate-950">{sellerStats?.totalListings ?? "—"}</p>
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Listings</p>
                </div>
                <div className="rounded-3xl bg-white p-4 text-center">
                  <p className="text-2xl font-black text-slate-950">{sellerStats?.responseTime || "24h"}</p>
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Response</p>
                </div>
                <div className="rounded-3xl bg-white p-4 text-center">
                  <p className="text-2xl font-black text-slate-950">{sellerStats?.rating || "4.7"}</p>
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Rating</p>
                </div>
              </div>
            </div>

            <div className="grid gap-3">
              <button type="button" className="btn-primary">Contact seller</button>
              <a href={`mailto:${item.seller?.email || ""}`} className="rounded-3xl border border-slate-200 bg-white px-5 py-3 text-center text-sm font-black text-slate-950 transition hover:bg-slate-100">Message via email</a>
            </div>
          </div>
        </div>

        <div className="rounded-t-[32px] border-t border-slate-100 bg-slate-50 p-6">
          <h2 className="text-2xl font-black text-slate-950">Product gallery</h2>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            {images.map((image) => (
              <img key={image} src={image} alt={item.title} className="h-48 w-full rounded-3xl object-cover shadow-sm" />
            ))}
          </div>
        </div>
      </section>

      <aside className="space-y-8">
        <SellerContactCard item={item} stats={sellerStats} />
        <section className="rounded-[32px] bg-white p-6 shadow-soft">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.24em] text-slate-500">Recommendation rationale</p>
              <h2 className="mt-2 text-2xl font-black text-slate-950">Why you may like this</h2>
            </div>
          </div>
          <div className="mt-6 space-y-3">
            <div className="rounded-3xl bg-slate-50 p-4 text-sm text-slate-600">Because you viewed electronics and affordable campus gear.</div>
            <div className="rounded-3xl bg-slate-50 p-4 text-sm text-slate-600">Similar students in your department saved items like this.</div>
            <div className="rounded-3xl bg-slate-50 p-4 text-sm text-slate-600">Trending in your college marketplace this week.</div>
          </div>
        </section>

        <section className="rounded-[32px] bg-white p-6 shadow-soft">
          <h2 className="text-2xl font-black text-slate-950">Similar products</h2>
          <div className="mt-4 space-y-4">
            {recommendations.map(({ item: recommendation }) => (
              <ItemCard key={recommendation._id} item={recommendation} onWishlistChange={() => {}} />
            ))}
          </div>
        </section>
      </aside>
    </main>
  );
}

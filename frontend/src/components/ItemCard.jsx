import { Link } from "react-router-dom";
import api from "../api";
import { useAuth } from "../context/AuthContext";
import RecommendationBadge from "./RecommendationBadge";

function categoryPlaceholder(category = "Others") {
  const palette = {
    Books: ["#0f766e", "#ccfbf1", "BOOK"],
    Electronics: ["#2563eb", "#dbeafe", "TECH"],
    Clothes: ["#be123c", "#ffe4e6", "WEAR"],
    Others: ["#92400e", "#fef3c7", "ITEM"]
  };
  const [color, background, label] = palette[category] || palette.Others;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 420"><rect width="640" height="420" fill="${background}"/><rect x="112" y="86" width="416" height="248" rx="28" fill="${color}" opacity="0.94"/><circle cx="178" cy="154" r="28" fill="white" opacity="0.88"/><path d="M156 264 H484" stroke="white" stroke-width="22" stroke-linecap="round" opacity="0.9"/><path d="M156 218 H390" stroke="white" stroke-width="18" stroke-linecap="round" opacity="0.68"/><text x="320" y="178" text-anchor="middle" fill="white" font-family="Arial" font-size="54" font-weight="700">${label}</text></svg>`;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

export default function ItemCard({ item, onWishlistChange, onQuickView }) {
  const { isAuthenticated, user } = useAuth();
  const isWishlisted = item.wishlistedBy?.some((id) => String(id) === String(user?.id));
  const imageUrl = item.images?.[0] || categoryPlaceholder(item.category);

  const badges = [];
  if (item.recommended || item.views > 100) badges.push({ label: "Recommended", variant: "recommended" });
  if (item.trending || item.views > 200) badges.push({ label: "Trending", variant: "trending" });
  if (item.isNew || new Date(item.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)) badges.push({ label: "New Listing", variant: "new" });
  if (item.seller?.verified) badges.push({ label: "Verified Seller", variant: "verified" });

  async function toggleWishlist(event) {
    event.preventDefault();
    if (!isAuthenticated) {
      return;
    }
    await api.post(`/wishlist/${item._id}`);
    onWishlistChange?.();
  }

  return (
    <article className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-xl">
      <div className="relative">
        <Link to={`/items/${item._id}`}>
          <img src={imageUrl} alt={item.title} className="h-56 w-full object-cover transition duration-300 hover:scale-105" />
        </Link>
        <div className="absolute left-4 top-4 flex flex-wrap gap-2">
          {badges.slice(0, 2).map((badge) => (
            <RecommendationBadge key={badge.label} label={badge.label} variant={badge.variant} />
          ))}
        </div>
        <button
          type="button"
          onClick={toggleWishlist}
          disabled={!isAuthenticated}
          aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
          className={`absolute right-4 top-4 grid h-11 w-11 place-items-center rounded-full bg-white/95 text-slate-800 shadow-sm transition hover:bg-ocean hover:text-white ${!isAuthenticated ? "cursor-not-allowed opacity-70" : ""}`}
        >
          {isWishlisted ? "♥" : "♡"}
        </button>
      </div>

      <div className="space-y-4 p-5">
        <div className="space-y-2">
          <Link to={`/items/${item._id}`} className="text-xl font-black text-slate-950 hover:text-ocean">
            {item.title}
          </Link>
          <p className="text-sm text-slate-500 line-clamp-2">{item.description || "Smart campus listing with fast pickup and strong seller trust."}</p>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-2xl font-black text-ocean">₹{Number(item.price).toLocaleString("en-IN")}</p>
            <p className="text-sm text-slate-500">{item.category} · {item.condition}</p>
          </div>
          <div className="rounded-3xl bg-slate-100 px-3 py-2 text-xs font-semibold uppercase text-slate-700">{item.seller?.name || "Campus seller"}</div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => onQuickView?.(item)}
            className="rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-800 transition hover:bg-slate-100"
          >
            Quick view
          </button>
          <Link
            to={`/items/${item._id}`}
            className="rounded-3xl bg-ocean px-4 py-3 text-sm font-black text-white transition hover:bg-ocean-dark"
          >
            View details
          </Link>
        </div>
      </div>
    </article>
  );
}

import { Link } from "react-router-dom";
import api from "../api";
import { useAuth } from "../context/AuthContext";

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

export default function ItemCard({ item, onWishlistChange }) {
  const { isAuthenticated, user } = useAuth();
  const isWishlisted = item.wishlistedBy?.some((id) => String(id) === String(user?.id));
  const imageUrl = item.images?.[0] || categoryPlaceholder(item.category);

  async function toggleWishlist(event) {
    event.preventDefault();

    if (!isAuthenticated) {
      return;
    }

    await api.post(`/wishlist/${item._id}`);
    onWishlistChange?.();
  }

  return (
    <article className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
      <Link to={`/items/${item._id}`}>
        <img src={imageUrl} alt={item.title} className="h-44 w-full object-cover" />
      </Link>
      <div className="space-y-3 p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <Link to={`/items/${item._id}`} className="text-lg font-black text-slate-950 hover:text-teal-700">
              {item.title}
            </Link>
            <p className="text-sm text-slate-500">{item.category}</p>
          </div>
          <button
            type="button"
            onClick={toggleWishlist}
            disabled={!isAuthenticated}
            className={`rounded-full px-3 py-1 text-xs font-black ${isWishlisted ? "bg-rose-50 text-rose-600" : "bg-slate-100 text-slate-500"} disabled:cursor-not-allowed disabled:opacity-50`}
            aria-label="Toggle wishlist"
          >
            {isWishlisted ? "Saved" : "Save"}
          </button>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xl font-black text-teal-700">Rs. {Number(item.price).toLocaleString("en-IN")}</span>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold capitalize text-slate-600">
            {item.condition}
          </span>
        </div>
      </div>
    </article>
  );
}

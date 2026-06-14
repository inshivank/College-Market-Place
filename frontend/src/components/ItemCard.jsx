import { Link } from "react-router-dom";
import api from "../api";
import { useAuth } from "../context/AuthContext";

const fallbackImage =
  "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=900&q=80";

export default function ItemCard({ item, onWishlistChange }) {
  const { isAuthenticated, user } = useAuth();
  const isWishlisted = item.wishlistedBy?.some((id) => String(id) === String(user?.id));

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
        <img
          src={item.images?.[0] || fallbackImage}
          alt={item.title}
          className="h-44 w-full object-cover"
        />
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
            className={`rounded-full px-3 py-1 text-lg ${isWishlisted ? "bg-rose-50 text-rose-600" : "bg-slate-100 text-slate-400"} disabled:cursor-not-allowed disabled:opacity-50`}
            aria-label="Toggle wishlist"
          >
            <span aria-hidden="true">{isWishlisted ? "♥" : "♡"}</span>
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

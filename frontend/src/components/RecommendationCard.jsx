import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import api from "../api";
import RecommendationBadge from "./RecommendationBadge";
import MatchScoreBadge from "./MatchScoreBadge";
import RecommendationReasonChip from "./RecommendationReasonChip";

export default function RecommendationCard({ item, onWishlistChange, onQuickView, onCompareToggle, isCompared }) {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [saving, setSaving] = useState(false);

  const isWishlisted = useMemo(
    () => item.wishlistedBy?.some((id) => String(id) === String(user?.id)),
    [item.wishlistedBy, user?.id]
  );

  const badges = useMemo(() => {
    const list = [];
    if (item.trending) list.push(["Trending", "trending"]);
    if (item.recommended) list.push(["Recommended", "recommended"]);
    if (item.isNew) list.push(["New Listing", "new"]);
    if (item.verifiedSeller) list.push(["Verified", "verified"]);
    return list.slice(0, 3);
  }, [item]);

  async function toggleWishlist(event) {
    event.preventDefault();
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    setSaving(true);
    try {
      await api.post(`/wishlist/${item._id}`);
      onWishlistChange?.();
    } finally {
      setSaving(false);
    }
  }

  const matchScore = item.matchScore ?? Math.min(96, Math.max(70, 60 + (item.recommended ? 12 : 0) + (item.trending ? 8 : 0) + Math.round((item.views || 0) / 25)));
  const matchReason = item.category ? `Based on ${item.category}` : "Based on your activity";
  const imageUrl = item.images?.[0] || "/placeholder.jpg";

  return (
    <motion.article
      layout
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"
    >
      <div className="relative">
        <Link to={`/items/${item._id}`} className="block">
          <img src={imageUrl} alt={item.title} className="h-56 w-full object-cover transition duration-300 group-hover:scale-105" />
        </Link>
        <button
          type="button"
          onClick={toggleWishlist}
          aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
          className="absolute right-4 top-4 grid h-11 w-11 place-items-center rounded-full bg-white/90 text-slate-800 shadow-sm transition hover:bg-ocean hover:text-white"
        >
          {saving ? "..." : isWishlisted ? "♥" : "♡"}
        </button>
      </div>

      <div className="space-y-3 p-5">
        <div className="flex flex-wrap items-center gap-2">
          <MatchScoreBadge score={matchScore} reason={matchReason} />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {badges.map(([label, variant]) => (
            <RecommendationBadge key={label} label={label} variant={variant} />
          ))}
        </div>
        <Link to={`/items/${item._id}`} className="block">
          <h3 className="text-xl font-black text-slate-950">{item.title}</h3>
        </Link>
        <p className="text-sm text-slate-500 max-h-14 overflow-hidden">{item.description || "A well-loved campus item with useful features."}</p>
        <div className="flex flex-wrap gap-2">
          <RecommendationReasonChip reason={matchReason} />
          {item.department && <RecommendationReasonChip reason={`Popular in ${item.department}`} />}
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          <div>
            <p className="text-2xl font-black text-ocean">₹{Number(item.price).toLocaleString("en-IN")}</p>
            <p className="text-sm text-slate-500">{item.category} · {item.condition}</p>
          </div>
          <div className="grid gap-2">
            <button
              type="button"
              onClick={() => onQuickView?.(item)}
              className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-100"
            >
              Quick view
            </button>
            <div className="grid gap-2 sm:grid-cols-2">
              <Link
                to={`/items/${item._id}`}
                className="rounded-2xl bg-ocean px-4 py-2 text-sm font-black text-white transition hover:bg-ocean-dark"
              >
                View
              </Link>
              {onCompareToggle && (
                <button
                  type="button"
                  onClick={() => onCompareToggle(item)}
                  className={`rounded-2xl border px-4 py-2 text-sm font-black transition ${isCompared ? "border-ocean bg-ocean text-white" : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"}`}
                >
                  {isCompared ? "Comparing" : "Compare"}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.article>
  );
}

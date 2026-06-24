import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../api";
import ItemCard from "../components/ItemCard";
import SmartSearchBar from "../components/SmartSearchBar";
import CategoryGrid from "../components/CategoryGrid";
import QuickViewModal from "../components/QuickViewModal";
import RecommendationCarousel from "../components/RecommendationCarousel";
import RecommendationCard from "../components/RecommendationCard";
import AIInsightCard from "../components/AIInsightCard";
import CampusTrendWidget from "../components/CampusTrendWidget";
import ContinueBrowsingSection from "../components/ContinueBrowsingSection";
import ProductComparisonModal from "../components/ProductComparisonModal";
import { useAuth } from "../context/AuthContext";

const filterChips = [
  { label: "Electronics", value: "Electronics" },
  { label: "Books", value: "Books" },
  { label: "Under ₹1000", value: "under_1000" },
  { label: "New", value: "new" },
  { label: "Recently Posted", value: "recent" }
];

function formatCount(count) {
  return count >= 1000 ? `${Math.round(count / 100) / 10}k` : count;
}

export default function HomePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, isAuthenticated } = useAuth();
  const [items, setItems] = useState([]);
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: searchParams.get("search") || "",
    category: "All",
    minPrice: "",
    maxPrice: "",
    sort: "relevance"
  });
  const [quickViewItem, setQuickViewItem] = useState(null);
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const [compareItems, setCompareItems] = useState([]);

  useEffect(() => {
    setFilters((current) => ({ ...current, search: searchParams.get("search") || "" }));
  }, [searchParams]);

  useEffect(() => {
    async function fetchItems() {
      setLoading(true);
      try {
        const { data } = await api.get("/items", { params: filters });
        setItems(data.items || []);
      } catch (error) {
        setItems([]);
      } finally {
        setLoading(false);
      }
    }

    fetchItems();
  }, [filters]);

  useEffect(() => {
    if (!isAuthenticated) return;
    async function fetchWishlist() {
      try {
        const { data } = await api.get("/wishlist");
        setWishlistItems(data.items || []);
      } catch {
        setWishlistItems([]);
      }
    }
    fetchWishlist();
  }, [isAuthenticated]);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("collegeMarketplaceRecentlyViewed") || "[]");
    setRecentlyViewed(Array.isArray(stored) ? stored : []);
  }, []);

  const wishlistCategories = useMemo(
    () => Array.from(new Set(wishlistItems.map((item) => item.category).filter(Boolean))),
    [wishlistItems]
  );

  const recommendedForYou = useMemo(
    () => items.filter((item) => filters.category === "All" || item.category === filters.category).slice(0, 8),
    [items, filters.category]
  );

  const basedOnWishlist = useMemo(
    () => items.filter((item) => wishlistCategories.includes(item.category)).slice(0, 8),
    [items, wishlistCategories]
  );

  const recentlyViewedIds = useMemo(() => recentlyViewed.map((item) => item._id), [recentlyViewed]);

  const becauseViewedSimilar = useMemo(
    () => {
      const recentCategories = Array.from(new Set(recentlyViewed.map((item) => item.category).filter(Boolean)));
      return items.filter((item) => recentCategories.includes(item.category) && !recentlyViewedIds.includes(item._id)).slice(0, 8);
    },
    [items, recentlyViewed, recentlyViewedIds]
  );

  const studentsAlsoViewed = useMemo(
    () => items.filter((item) => item.department && item.department === user?.department && !recentlyViewedIds.includes(item._id)).slice(0, 8),
    [items, user?.department, recentlyViewedIds]
  );

  const trendingThisWeek = useMemo(
    () => [...items].sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 8),
    [items]
  );

  const popularInDepartment = useMemo(
    () => items.filter((item) => item.department && item.department === user?.department).slice(0, 8),
    [items, user?.department]
  );

  const recentlyAdded = useMemo(
    () => items.filter((item) => new Date(item.createdAt) > new Date(Date.now() - 14 * 24 * 60 * 60 * 1000)).slice(0, 8),
    [items]
  );

  const hiddenGems = useMemo(
    () => items.filter((item) => (item.views || 0) < 30 && !recentlyViewedIds.includes(item._id)).slice(0, 8),
    [items, recentlyViewedIds]
  );

  const popularThisWeekSummary = useMemo(() => trendingThisWeek[0]?.category || "Electronics", [trendingThisWeek]);

  const electronicsNewCount = useMemo(
    () => items.filter((item) => item.category === "Electronics" && new Date(item.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length,
    [items]
  );

  const booksInterestCount = useMemo(
    () => items.filter((item) => item.category === "Books").length,
    [items]
  );

  const wishlistPriceDropCount = useMemo(
    () => wishlistItems.filter((item) => Number(item.price) < 1000).length,
    [wishlistItems]
  );

  const similarViewedCount = becauseViewedSimilar.length;

  const departmentLabel = user?.department ? `Popular in ${user.department}` : "Popular in your department";

  function handleSearch(query) {
    setFilters((current) => ({ ...current, search: query }));
    setSearchParams(query ? { search: query } : {});
  }

  function handleCategorySelect(category) {
    setFilters((current) => ({ ...current, category }));
  }

  function applySmartFilter(value) {
    if (value === "under_1000") {
      setFilters((current) => ({ ...current, minPrice: "", maxPrice: "1000" }));
      return;
    }

    if (value === "new") {
      setFilters((current) => ({ ...current, sort: "newest" }));
      return;
    }

    if (value === "recent") {
      setFilters((current) => ({ ...current, sort: "recent" }));
      return;
    }

    setFilters((current) => ({ ...current, category: value }));
  }

  function toggleCompare(item) {
    setCompareItems((current) => {
      const already = current.some((compare) => compare._id === item._id);
      if (already) {
        return current.filter((compare) => compare._id !== item._id);
      }
      if (current.length >= 4) {
        return [...current.slice(1), item];
      }
      return [...current, item];
    });
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <section className="overflow-hidden rounded-[32px] bg-white p-8 shadow-soft">
        <div className="grid gap-10 xl:grid-cols-[1.6fr_0.9fr] xl:items-center">
          <div className="space-y-6">
            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-full bg-sky-100 px-4 py-2 text-xs font-black uppercase tracking-[0.24em] text-sky-700">AI-powered campus recommendations</span>
              <span className="rounded-full bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-600">Safe • Fast • Personalized</span>
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Good evening{user?.name ? `, ${user.name.split(" ")[0]}` : ""} 👋</p>
              <h1 className="mt-3 max-w-3xl text-5xl font-black tracking-tight text-slate-950 sm:text-6xl">Campus deals tailored to your study goals.</h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
                Based on your browsing history, wishlist, and department preferences, we surface the best campus marketplace picks.
              </p>
            </div>
            <SmartSearchBar onSearch={handleSearch} onCategorySelect={handleCategorySelect} value={filters.search} />
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <AIInsightCard title="New Electronics" value={electronicsNewCount} detail="Fresh listings in your department." color="bg-sky-50" />
              <AIInsightCard title="Books matching interests" value={booksInterestCount} detail="Precise results for your study needs." color="bg-slate-50" />
              <AIInsightCard title="Wishlist value" value={wishlistPriceDropCount} detail="Items with strong campus affordability." color="bg-emerald-50" />
              <AIInsightCard title="Similar finds" value={similarViewedCount} detail="Recommended from your recent views." color="bg-indigo-50" />
            </div>
          </div>

          <div className="rounded-[28px] bg-soft p-6 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-black uppercase tracking-[0.24em] text-slate-700">Quick actions</p>
                <p className="mt-2 text-sm text-slate-600">Jump to your most important filters.</p>
              </div>
              <span className="rounded-3xl bg-ocean px-4 py-3 text-sm font-black text-white">Fast</span>
            </div>
            <div className="mt-6 grid gap-3">
              {filterChips.map((chip) => (
                <button
                  key={chip.value}
                  type="button"
                  onClick={() => applySmartFilter(chip.value)}
                  className="rounded-3xl border border-slate-200 bg-white px-5 py-4 text-left text-sm font-semibold text-slate-900 shadow-sm transition hover:bg-slate-50"
                >
                  {chip.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="mt-8 grid gap-8 xl:grid-cols-[2fr_1fr]">
        <div className="space-y-8">
          <RecommendationCarousel
            title="Recommended for you"
            subtitle="Personalized listings based on your campus activity"
            items={recommendedForYou}
            emptyState="No recommendations yet—try a new search to personalize your feed."
          >
            {(item) => (
              <RecommendationCard
                key={item._id}
                item={item}
                onWishlistChange={() => setFilters((current) => ({ ...current }))}
                onQuickView={setQuickViewItem}
                onCompareToggle={toggleCompare}
                isCompared={compareItems.some((compare) => compare._id === item._id)}
              />
            )}
          </RecommendationCarousel>

          <RecommendationCarousel
            title="Based on your wishlist"
            subtitle="Listings with the same category as your saved favorites"
            items={basedOnWishlist}
            emptyState="Save items to your wishlist and discover matching recommendations here."
          >
            {(item) => (
              <RecommendationCard
                key={item._id}
                item={item}
                onWishlistChange={() => setFilters((current) => ({ ...current }))}
                onQuickView={setQuickViewItem}
                onCompareToggle={toggleCompare}
                isCompared={compareItems.some((compare) => compare._id === item._id)}
              />
            )}
          </RecommendationCarousel>

          <RecommendationCarousel
            title="Because you viewed similar products"
            subtitle="Items aligned with your recent browsing"
            items={becauseViewedSimilar}
            emptyState="Browse more products and the system will surface related campus finds."
          >
            {(item) => (
              <RecommendationCard
                key={item._id}
                item={item}
                onWishlistChange={() => setFilters((current) => ({ ...current }))}
                onQuickView={setQuickViewItem}
                onCompareToggle={toggleCompare}
                isCompared={compareItems.some((compare) => compare._id === item._id)}
              />
            )}
          </RecommendationCarousel>

          <RecommendationCarousel
            title="Popular in your department"
            subtitle={departmentLabel}
            items={popularInDepartment}
            emptyState="Department recommendations appear once we learn more about your interests."
          >
            {(item) => (
              <RecommendationCard
                key={item._id}
                item={item}
                onWishlistChange={() => setFilters((current) => ({ ...current }))}
                onQuickView={setQuickViewItem}
                onCompareToggle={toggleCompare}
                isCompared={compareItems.some((compare) => compare._id === item._id)}
              />
            )}
          </RecommendationCarousel>

          <RecommendationCarousel
            title="Trending this week"
            subtitle="Campus favorites gaining momentum"
            items={trendingThisWeek}
            emptyState="More campus trends will show here as engagement grows."
          >
            {(item) => (
              <RecommendationCard
                key={item._id}
                item={item}
                onWishlistChange={() => setFilters((current) => ({ ...current }))}
                onQuickView={setQuickViewItem}
                onCompareToggle={toggleCompare}
                isCompared={compareItems.some((compare) => compare._id === item._id)}
              />
            )}
          </RecommendationCarousel>

          <RecommendationCarousel
            title="Recently added"
            subtitle="Fresh campus listings added in the last two weeks"
            items={recentlyAdded}
            emptyState="No new listings yet—check back soon for fresh campus finds."
          >
            {(item) => (
              <RecommendationCard
                key={item._id}
                item={item}
                onWishlistChange={() => setFilters((current) => ({ ...current }))}
                onQuickView={setQuickViewItem}
                onCompareToggle={toggleCompare}
                isCompared={compareItems.some((compare) => compare._id === item._id)}
              />
            )}
          </RecommendationCarousel>

          <RecommendationCarousel
            title="Hidden gems"
            subtitle="Low-view listings with strong student value"
            items={hiddenGems}
            emptyState="Hidden gems will appear here as the community uncovers more campus value."
          >
            {(item) => (
              <RecommendationCard
                key={item._id}
                item={item}
                onWishlistChange={() => setFilters((current) => ({ ...current }))}
                onQuickView={setQuickViewItem}
                onCompareToggle={toggleCompare}
                isCompared={compareItems.some((compare) => compare._id === item._id)}
              />
            )}
          </RecommendationCarousel>
        </div>

        <aside className="space-y-8">
          <div className="rounded-[32px] bg-slate-50 p-6 shadow-soft">
            <p className="text-sm font-black uppercase tracking-[0.24em] text-slate-500">Campus trends</p>
            <CampusTrendWidget
              trends={[
                { category: "Electronics", subtitle: "High demand this week", value: 34 },
                { category: "Books", subtitle: "Top study materials", value: 21 },
                { category: "Cycles", subtitle: "Campus commuters", value: 17 },
                { category: "Hostel Essentials", subtitle: "Everyday essentials", value: 12 }
              ]}
            />
          </div>

          <div className="rounded-[32px] bg-white p-6 shadow-soft">
            <p className="text-sm font-black uppercase tracking-[0.24em] text-slate-500">Summary</p>
            <div className="mt-6 grid gap-4">
              <AIInsightCard title="Electronics new" value={electronicsNewCount} detail="New items in your campus feed." />
              <AIInsightCard title="Books interest" value={booksInterestCount} detail="Matches based on your search history." />
              <AIInsightCard title="Wishlist opportunities" value={wishlistPriceDropCount} detail="Estimated savings from wishlist items." />
            </div>
          </div>

          <ContinueBrowsingSection items={recentlyViewed} onQuickView={setQuickViewItem} />
        </aside>
      </div>

      <ProductComparisonModal open={compareItems.length > 0} items={compareItems} onClose={() => setCompareItems([])} removeItem={(id) => setCompareItems((current) => current.filter((item) => item._id !== id))} />
      <QuickViewModal open={Boolean(quickViewItem)} item={quickViewItem} onClose={() => setQuickViewItem(null)} />
    </main>
  );
}

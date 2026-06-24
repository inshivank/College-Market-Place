import RecommendationCarousel from "./RecommendationCarousel";
import RecommendationCard from "./RecommendationCard";

export default function ContinueBrowsingSection({ items, onQuickView }) {
  return (
    <RecommendationCarousel
      title="Continue browsing"
      subtitle="Pick up where you left off"
      items={items}
      emptyState="You haven't viewed any items recently. Start browsing to build your history."
    >
      {(item) => <RecommendationCard key={item._id} item={item} onQuickView={onQuickView} />}
    </RecommendationCarousel>
  );
}

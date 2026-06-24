import RecommendationCarousel from "./RecommendationCarousel";
import RecommendationCard from "./RecommendationCard";

export default function DepartmentRecommendations({ department, items, onQuickView }) {
  return (
    <RecommendationCarousel
      title={`Popular in ${department}`}
      subtitle={`Trending products within ${department}`}
      items={items}
      emptyState={`No department recommendations available for ${department}.`}
    >
      {(item) => <RecommendationCard key={item._id} item={item} onQuickView={onQuickView} />}
    </RecommendationCarousel>
  );
}

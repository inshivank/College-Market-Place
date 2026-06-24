import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

export default function RecommendationCarousel({ title, subtitle, items, children, emptyState, onViewMore }) {
  const trackRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  useEffect(() => {
    function updateScroll() {
      const track = trackRef.current;
      if (!track) return;
      setCanScrollLeft(track.scrollLeft > 0);
      setCanScrollRight(track.scrollWidth > track.clientWidth + track.scrollLeft + 4);
    }
    updateScroll();
    const track = trackRef.current;
    track?.addEventListener("scroll", updateScroll);
    window.addEventListener("resize", updateScroll);
    return () => {
      track?.removeEventListener("scroll", updateScroll);
      window.removeEventListener("resize", updateScroll);
    };
  }, [items]);

  function scrollBy(offset) {
    trackRef.current?.scrollBy({ left: offset, behavior: "smooth" });
  }

  return (
    <section className="rounded-[32px] bg-white p-6 shadow-soft">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.24em] text-slate-500">{title}</p>
          <p className="mt-2 text-2xl font-black text-slate-950">{subtitle}</p>
        </div>
        <div className="flex items-center gap-3">
          {onViewMore && (
            <button type="button" onClick={onViewMore} className="rounded-3xl bg-slate-100 px-4 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-200">
              View all
            </button>
          )}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => scrollBy(-380)}
              disabled={!canScrollLeft}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 transition disabled:cursor-not-allowed disabled:opacity-40 hover:bg-slate-50"
              aria-label="Scroll left"
            >
              <svg viewBox="0 0 20 20" className="h-5 w-5 fill-current"><path d="M12.5 15.5 7 10l5.5-5.5" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
            <button
              type="button"
              onClick={() => scrollBy(380)}
              disabled={!canScrollRight}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 transition disabled:cursor-not-allowed disabled:opacity-40 hover:bg-slate-50"
              aria-label="Scroll right"
            >
              <svg viewBox="0 0 20 20" className="h-5 w-5 fill-current"><path d="m7.5 15.5 5.5-5.5-5.5-5.5" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
          </div>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-10 text-center text-slate-500">{emptyState}</div>
      ) : (
        <div ref={trackRef} className="no-scrollbar flex gap-5 overflow-x-auto pb-2 pt-1">
          {items.map((item) => (
            <motion.div key={item._id} layout whileHover={{ y: -4 }} className="min-w-[280px] max-w-[280px] flex-shrink-0">
              {children(item)}
            </motion.div>
          ))}
        </div>
      )}
    </section>
  );
}

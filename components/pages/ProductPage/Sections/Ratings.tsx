"use client";
import React, { useState } from "react";

type RatingsDistribution = { stars: number; count: number }[];

type Props = {
  average?: number;
  total?: number;
  distribution?: RatingsDistribution;
  onStarClick?: (stars: number) => void;
  onDistributionClick?: (stars: number) => void;
  interactive?: boolean;
};

const StarIcon = ({ filled = true, size = 20 }: { filled?: boolean; size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill={filled ? "#F59E0B" : "#D1D5DB"}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
  </svg>
);

const Ratings: React.FC<Props> = React.memo(({
  average = 0,
  total = 0,
  distribution = [],
  onStarClick,
  onDistributionClick,
  interactive = true,
}) => {
  const [hoveredStar, setHoveredStar] = useState<number | null>(null);
  const [selectedStar, setSelectedStar] = useState<number | null>(null);

  const safeAverage = typeof average === "number" && !isNaN(average) ? average : 0;
  const safeTotal = typeof total === "number" && !isNaN(total) ? total : 0;

  // Normalize: always have all 5 stars, counts as real numbers
  const rawDistribution: RatingsDistribution = Array.isArray(distribution) ? distribution : [];
  const distributionMap = new Map<number, number>(
    rawDistribution.map((d) => [Number(d.stars), Number(d.count)])
  );
  const safeDistribution: RatingsDistribution = [5, 4, 3, 2, 1].map((stars) => ({
    stars,
    count: distributionMap.get(stars) ?? 0,
  }));

  const totalFromDistribution = safeDistribution.reduce((sum, d) => sum + d.count, 0);
  const displayTotal = safeTotal || totalFromDistribution;

  // ✅ Bar width = percentage of TOTAL reviews (not relative to max bar)
  // e.g. 13 out of 21 reviews = 62% wide bar
  const getBarPct = (count: number) => {
    if (displayTotal === 0) return 0;
    return (count / displayTotal) * 100;
  };

  const displayAverage = hoveredStar !== null ? hoveredStar : safeAverage;

  const handleStarClick = (val: number) => {
    if (!interactive || !onStarClick) return;
    setSelectedStar(selectedStar === val ? null : val);
    onStarClick(val);
  };

  const handleRowClick = (stars: number) => {
    if (!interactive || !onDistributionClick) return;
    onDistributionClick(stars);
  };

  if (safeTotal === 0 && totalFromDistribution === 0) {
    return (
      <section className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5" dir="rtl">
        <h2 className="text-base font-bold text-gray-900 mb-3 text-right">الآراء حول هذا المنتج</h2>
        <p className="text-gray-400 text-sm">لا توجد تقييمات بعد.</p>
      </section>
    );
  }

  return (
    <section className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5" dir="rtl">
      {/* Title */}
      <h2 className="text-base font-bold text-gray-900 mb-3 text-right">
        الآراء حول هذا المنتج
      </h2>

      {/* Rating header */}
      <div className="flex items-center gap-2.5" aria-label={`التقييم ${displayAverage.toFixed(1)} من 5`}>
        <span className="text-xl font-bold text-gray-900 leading-none">
          {displayAverage.toFixed(1)}
        </span>
        <div className="flex gap-1" dir="ltr">
          {Array.from({ length: 5 }).map((_, i) => {
            const val = i + 1;
            const filled = val <= Math.round(displayAverage);
            const isClickable = interactive && !!onStarClick;
            return (
              <span
                key={i}
                className={`inline-flex transition-transform duration-150 ${isClickable ? "cursor-pointer hover:scale-110" : ""}`}
                role={isClickable ? "button" : undefined}
                tabIndex={isClickable ? 0 : undefined}
                aria-label={`${val} stars`}
                onMouseEnter={() => isClickable && setHoveredStar(val)}
                onMouseLeave={() => isClickable && setHoveredStar(null)}
                onClick={() => handleStarClick(val)}
                onKeyDown={(e) => {
                  if (isClickable && (e.key === "Enter" || e.key === " ")) {
                    e.preventDefault();
                    handleStarClick(val);
                  }
                }}
              >
                <StarIcon filled={filled} size={28} />
              </span>
            );
          })}
        </div>
      </div>

      {/* Review count */}
      <p className="text-xs text-gray-400 mt-1 mb-3 text-right">
        تقييم {displayTotal}
        {selectedStar ? ` - تم تصفية ${selectedStar} نجوم` : ""}
      </p>

      {/* Distribution bars */}
      <div className="flex flex-col gap-2">
        {safeDistribution.map((row) => {
          const pct = getBarPct(row.count);
          const isHighlighted = selectedStar === row.stars;
          const isClickable = interactive && !!onDistributionClick;

          return (
            <div
              key={row.stars}
              onClick={() => handleRowClick(row.stars)}
              role={isClickable ? "button" : undefined}
              tabIndex={isClickable ? 0 : undefined}
              onKeyDown={(e) => {
                if (isClickable && (e.key === "Enter" || e.key === " ")) {
                  e.preventDefault();
                  handleRowClick(row.stars);
                }
              }}
              className={`flex items-center gap-2.5 px-1.5 py-0.5 rounded-lg border transition-all duration-200
                ${isClickable ? "cursor-pointer" : ""}
                ${isHighlighted ? "bg-amber-50 border-amber-200" : "border-transparent hover:bg-gray-50"}`}
            >
              {/* RIGHT in RTL: ★ + star number */}
              <div className="flex items-center gap-1 shrink-0 w-8 justify-start" dir="ltr">
                <StarIcon filled size={16} />
                <span className="text-sm text-gray-700 font-medium">{row.stars}</span>
              </div>

              {/* MIDDLE: progress bar */}
              <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-amber-400 to-amber-500 transition-all duration-500"
                  style={{ width: `${pct}%` }}
                />
              </div>

              {/* LEFT in RTL: user count */}
              <span className="w-5 text-left text-sm text-gray-500 shrink-0">
                {row.count}
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
});

Ratings.displayName = "Ratings";

export default React.memo(Ratings);
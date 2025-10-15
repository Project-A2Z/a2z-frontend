"use client";
import React, { useState } from 'react';

type RatingsDistribution = { stars: number; count: number }[];

type Props = {
  average: number;
  total: number;
  distribution: RatingsDistribution;
  onStarClick?: (stars: number) => void;
  onDistributionClick?: (stars: number) => void;
  interactive?: boolean;
};

const Ratings: React.FC<Props> = ({
  average,
  total,
  distribution = [],
  onStarClick,
  onDistributionClick,
  interactive = true
}) => {
  const [hoveredStars, setHoveredStars] = useState<number | null>(null);
  const [selectedStars, setSelectedStars] = useState<number | null>(null);

  const maxCount = Math.max(1, ...distribution.map(d => d.count));

  const handleStarClick = (starValue: number) => {
    if (!interactive || !onStarClick) return;
    setSelectedStars(selectedStars === starValue ? null : starValue);
    onStarClick(starValue);
  };

  const handleDistributionClick = (stars: number) => {
    if (!interactive || !onDistributionClick) return;
    onDistributionClick(stars);
  };

  const getDisplayAverage = () => {
    return hoveredStars !== null ? hoveredStars : average;
  };

  const getGoldColor = (count: number) => {
    if (count >= 50) return 'bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600';
    else if (count >= 30) return 'bg-gradient-to-r from-yellow-300 via-yellow-400 to-yellow-500';
    else if (count >= 15) return 'bg-gradient-to-r from-yellow-200 via-yellow-300 to-yellow-400';
    else if (count >= 5) return 'bg-gradient-to-r from-yellow-100 via-yellow-200 to-yellow-300';
    else return 'bg-gradient-to-r from-yellow-50 via-yellow-100 to-yellow-200';
  };

  const getGoldTextColor = (count: number) => {
    return count >= 30 ? 'text-yellow-700' : 'text-yellow-600';
  };

  if (total === 0) {
    return (
      <section className="bg-white rounded-2xl border shadow-sm p-4 sm:p-6">
        <h2 className="text-right text-lg sm:text-xl font-bold text-black87 mb-3">الآراء حول هذا المنتج</h2>
        <p className="text-black60">لا توجد تقييمات بعد.</p>
      </section>
    );
  }

  return (
    <section className="bg-white rounded-2xl border shadow-sm p-4 sm:p-6">
      <h2 className="text-right text-lg sm:text-xl font-bold text-black87 mb-3">الآراء حول هذا المنتج</h2>

      <div className="flex items-center justify-start gap-4 mb-2">
        <div className="flex items-center gap-1 text-amber-500" aria-label={`التقييم ${getDisplayAverage().toFixed(1)} من 5`}>
          {Array.from({ length: 5 }).map((_, i) => {
            const starValue = i + 1;
            const isActive = starValue <= Math.round(getDisplayAverage());
            const isClickable = interactive && onStarClick;

            return (
              <span
                key={i}
                className={`text-2xl sm:text-3xl leading-none transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'text-amber-500 hover:text-amber-600'
                    : 'text-black16 hover:text-amber-400'
                } ${isClickable ? 'hover:scale-110' : ''}`}
                onMouseEnter={() => isClickable && setHoveredStars(starValue)}
                onMouseLeave={() => isClickable && setHoveredStars(null)}
                onClick={() => handleStarClick(starValue)}
                role={isClickable ? "button" : undefined}
                tabIndex={isClickable ? 0 : undefined}
                onKeyDown={(e) => {
                  if (isClickable && (e.key === 'Enter' || e.key === ' ')) {
                    e.preventDefault();
                    handleStarClick(starValue);
                  }
                }}
              >
                ★
              </span>
            );
          })}
        </div>
        <div className="text-black60 text-sm sm:text-base font-medium">
          {getDisplayAverage().toFixed(1)}
        </div>
      </div>
      <div className="text-right text-black40 text-xs mb-4">
        تقييم {total} {selectedStars && `- تم تصفية ${selectedStars} نجوم`}
      </div>

      <div className="space-y-2">
        {distribution
          .sort((a, b) => b.stars - a.stars)
          .map((row) => {
            const isClickable = interactive && onDistributionClick;
            const isHighlighted = selectedStars === row.stars;

            return (
              <div
                key={row.stars}
                className={`flex items-center gap-3 transition-all duration-200 ${
                  isClickable ? 'cursor-pointer hover:bg-gray-50 rounded-lg p-2 -m-2' : ''
                } ${isHighlighted ? 'bg-amber-50 border border-amber-200 rounded-lg' : ''}`}
                onClick={() => handleDistributionClick(row.stars)}
                role={isClickable ? "button" : undefined}
                tabIndex={isClickable ? 0 : undefined}
                onKeyDown={(e) => {
                  if (isClickable && (e.key === 'Enter' || e.key === ' ')) {
                    e.preventDefault();
                    handleDistributionClick(row.stars);
                  }
                }}
              >
                <div className={`w-8 text-sm text-right transition-colors duration-200 ${getGoldTextColor(row.count)}`}>
                  {row.count}
                </div>

                <div className="flex-1 h-2 bg-black8 rounded-full overflow-hidden relative">
                  <div
                    className={`h-full transition-all duration-300 ${getGoldColor(row.count)}`}
                    style={{
                      width: `${(row.count / maxCount) * 100}%`,
                      transform: isHighlighted ? 'scaleY(1.2)' : 'scaleY(1)'
                    }}
                  />
                  {isHighlighted && (
                    <div className="absolute inset-0 bg-amber-400 opacity-20 rounded-full animate-pulse" />
                  )}
                </div>

                <div className={`flex items-center gap-1 w-10 justify-end transition-colors duration-200 ${getGoldTextColor(row.count)}`}>
                  <span className="transition-transform duration-200 hover:scale-110">★</span>
                  <span className={`transition-colors duration-200 ${
                    isHighlighted ? 'font-semibold' : ''
                  }`}>
                    {row.stars}
                  </span>
                </div>
              </div>
            );
          })}
      </div>
    </section>
  );
};

export default React.memo(Ratings);

// "use client";
// import React from 'react';
// import { Star } from 'lucide-react';

// type RatingsDistribution = { stars: number; count: number }[];
// type Props = {
//   average: number;
//   total: number;
//   distribution: RatingsDistribution;
// };

// const Ratings: React.FC<Props> = ({ average, total, distribution }) => {
//   if (!total) return null;

//   // Ensure distribution covers all 1-5 stars, defaulting to 0 if missing
//   const fullDistribution = Array.from({ length: 5 }, (_, i) => {
//     const star = i + 1;
//     const entry = distribution.find(d => d.stars === star) || { stars: star, count: 0 };
//     return entry;
//   });

//   // Calculate max count for dynamic bar scaling
//   const maxCount = Math.max(...fullDistribution.map(d => d.count), 1); // Avoid division by zero

//   // Render stars dynamically
//   const renderStars = (rating: number) => {
//     const safeRating = Math.max(0, Math.min(5, isNaN(rating) ? 0 : rating));
//     const fullStars = Math.floor(safeRating);
//     const hasHalfStar = safeRating % 1 >= 0.5;
//     return (
//       <div className="flex items-center gap-1 text-amber-500">
//         {Array.from({ length: 5 }).map((_, i) => {
//           let starClass = 'text-black16';
//           if (i < fullStars) {
//             starClass = 'fill-amber-500 text-amber-500';
//           } else if (i === fullStars && hasHalfStar) {
//             starClass = 'fill-amber-500 text-amber-500 opacity-50';
//           }
//           return <Star key={i} className={`w-4 h-4 ${starClass}`} />;
//         })}
//       </div>
//     );
//   };

//   return (
//     <section className="bg-white rounded-2xl border shadow-sm p-4 sm:p-6">
//       <h2 className="text-right text-lg sm:text-xl font-bold text-black87 mb-4">التقييمات</h2>
//       <div className="flex items-center justify-between mb-4">
//         <div>
//           <span className="text-xl font-bold text-black87">{average.toFixed(1)}</span>
//           <span className="text-sm text-black60"> / 5</span>
//         </div>
//         <div>{renderStars(average)}</div>
//       </div>
//       <div className="space-y-2">
//         {fullDistribution.map(({ stars, count }) => (
//           <div key={stars} className="flex items-center gap-2">
//             <span className="text-sm text-black87">{stars} نجوم</span>
//             <div className="flex-1 bg-gray-200 rounded-full h-2.5">
//               <div
//                 className="bg-amber-500 h-2.5 rounded-full"
//                 style={{ width: `${(count / maxCount) * 100}%` }}
//               ></div>
//             </div>
//             <span className="text-sm text-black60">{count}</span>
//           </div>
//         ))}
//       </div>
//     </section>
//   );
// };

// export default React.memo(Ratings);

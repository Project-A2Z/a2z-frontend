"use client";
import React, { useState } from 'react';
import { Star } from 'lucide-react'


type RatingsDistribution = { stars: number; count: number }[];

type Props = {
  average?: number;
  total?: number;
  distribution?: RatingsDistribution;
  onStarClick?: (stars: number) => void;
  onDistributionClick?: (stars: number) => void;
  interactive?: boolean;
};

const Ratings: React.FC<Props> = React.memo(({
  average = 0,
  total = 0,
  distribution = [],
  onStarClick,
  onDistributionClick,
  interactive = true
}) => {
  const [hoveredStars, setHoveredStars] = useState<number | null>(null);
  const [selectedStars, setSelectedStars] = useState<number | null>(null);

  // Ensure distribution is always an array
  const safeDistribution = Array.isArray(distribution) ? distribution : [];
  
  // Ensure average and total are valid numbers
  const safeAverage = typeof average === 'number' && !isNaN(average) ? average : 0;
  const safeTotal = typeof total === 'number' && !isNaN(total) ? total : 0;

  const totalFromDistribution = safeDistribution.reduce((sum, d) => sum + d.count, 0);
  const displayTotal = safeTotal || totalFromDistribution;
const getBarPct = (count: number) => {
    if (displayTotal === 0) return 0;
    return (count / displayTotal) * 100;
  };
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
  if (hoveredStars !== null) return hoveredStars;
  if (selectedStars !== null) return selectedStars;
  return safeAverage;
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

  if (safeTotal === 0) {
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
              // <span
              //   key={i}
              //   className={`text-2xl sm:text-3xl leading-none transition-all duration-200 cursor-pointer ${
              //     isActive
              //       ? 'text-amber-500 hover:text-amber-600'
              //       : 'text-black16 hover:text-amber-400'
              //   } ${isClickable ? 'hover:scale-110' : ''}`}
              //   onMouseEnter={() => isClickable && setHoveredStars(starValue)}
              //   onMouseLeave={() => isClickable && setHoveredStars(null)}
              //   onClick={() => handleStarClick(starValue)}
              //   role={isClickable ? "button" : undefined}
              //   tabIndex={isClickable ? 0 : undefined}
              //   onKeyDown={(e) => {
              //     if (isClickable && (e.key === 'Enter' || e.key === ' ')) {
              //       e.preventDefault();
              //       handleStarClick(starValue);
              //     }
              //   }}
              // >
              //   ★
              // </span>
              <Star
                key={i}
                size={24}
                className={`transition-all duration-200 cursor-pointer ${isActive ? 'fill-amber-500 hover:text-amber-600' : 'text-black16 hover:text-amber-400'} ${isClickable ? 'hover:scale-110' : ''}`}
                onMouseEnter={() => isClickable && setHoveredStars(starValue)}
                onMouseLeave={() => isClickable && setHoveredStars(null)}
                // onClick={() => handleStarClick(starValue)}
                // role={isClickable ? "button" : undefined}
                // tabIndex={isClickable ? 0 : undefined}
                // onKeyDown={(e) => {
                //   if (isClickable && (e.key === 'Enter' || e.key === ' ')) {
                //     e.preventDefault();
                //     handleStarClick(starValue);
                //   }
                // }}
              />
            );
          })}
        </div>
        <div className="text-black60 text-sm sm:text-base font-medium">
          {getDisplayAverage().toFixed(1)}
        </div>
      </div>
      <div className="text-right text-black40 text-xs mb-4">
        تقييم {safeTotal} {selectedStars && `- تم تصفية ${selectedStars} نجوم`}
      </div>

      <div className="space-y-2 ">
        {safeDistribution
          .sort((a, b) => b.stars - a.stars)
          .map((row) => {
            const isClickable = interactive && onDistributionClick;
            const isHighlighted = selectedStars === row.stars;
            
            const pct = getBarPct(row.count);

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
                <div className={`w-8 text-sm text-right transition-colors `}>
                  <Star size={16} className={" fill-amber-500 duration-200 text-amber-500"} />
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

Ratings.displayName = 'Ratings';

export default React.memo(Ratings);
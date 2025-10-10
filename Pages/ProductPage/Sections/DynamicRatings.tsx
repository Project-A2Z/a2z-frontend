"use client";
import React, { useState, useEffect } from 'react';
import { reviewService, type Review } from '@/services/api/reviews';

type RatingsDistribution = { stars: number; count: number }[];

type Props = {
  productId: string; // Product ID for fetching reviews
  onStarClick?: (stars: number) => void; // Callback when a star rating is clicked
  onDistributionClick?: (stars: number) => void; // Callback when distribution bar is clicked
  interactive?: boolean; // Whether the component should be interactive
};

const Ratings: React.FC<Props> = ({
  productId,
  onStarClick,
  onDistributionClick,
  interactive = true
}) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hoveredStars, setHoveredStars] = useState<number | null>(null);
  const [selectedStars, setSelectedStars] = useState<number | null>(null);

  // Fetch reviews when component mounts or productId changes
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await reviewService.getProductReviews(productId, {
          limit: 100, // Get enough reviews for distribution
          sort: 'date',
          order: 'desc'
        });

        if (response.status === 'success') {
          setReviews(response.data.reviews);
        } else {
          setError('Failed to load reviews');
        }
      } catch (err) {
        console.error('Error fetching reviews:', err);
        setError('Failed to load reviews');
      } finally {
        setLoading(false);
      }
    };

    if (productId) {
      fetchReviews();
    }
  }, [productId]);

  // Calculate distribution from reviews
  const distribution: RatingsDistribution = reviewService.calculateRatingsDistribution(reviews);
  const average = reviewService.calculateAverageRating(reviews);
  const total = reviewService.getTotalReviewCount(reviews);
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
    // Dynamic gold colors based on absolute review count
    if (count >= 50) {
      return 'bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600'; // Rich gold for 50+ reviews
    } else if (count >= 30) {
      return 'bg-gradient-to-r from-yellow-300 via-yellow-400 to-yellow-500'; // Medium gold for 30-49 reviews
    } else if (count >= 15) {
      return 'bg-gradient-to-r from-yellow-200 via-yellow-300 to-yellow-400'; // Light gold for 15-29 reviews
    } else if (count >= 5) {
      return 'bg-gradient-to-r from-yellow-100 via-yellow-200 to-yellow-300'; // Very light gold for 5-14 reviews
    } else {
      return 'bg-gradient-to-r from-yellow-50 via-yellow-100 to-yellow-200'; // Pale gold for <5 reviews
    }
  };

  const getGoldTextColor = (count: number) => {
    if (count >= 30) {
      return 'text-yellow-700'; // Darker text for better contrast on rich gold
    } else {
      return 'text-yellow-600'; // Standard gold text
    }
  };

  if (loading) {
    return (
      <section className="bg-white rounded-2xl border shadow-sm p-4 sm:p-6">
        <div className="text-right text-black60">جاري تحميل التقييمات...</div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="bg-white rounded-2xl border shadow-sm p-4 sm:p-6">
        <div className="text-right text-red-600">خطأ في تحميل التقييمات: {error}</div>
      </section>
    );
  }

  if (total === 0) {
    return (
      <section className="bg-white rounded-2xl border shadow-sm p-4 sm:p-6">
        <h2 className="text-right text-lg sm:text-xl font-bold text-black87 mb-3">الآراء حول هذا المنتج</h2>
        <div className="text-right text-black60">لا توجد تقييمات بعد</div>
      </section>
    );
  }

  return (
    <section className="bg-white rounded-2xl border shadow-sm p-4 sm:p-6">
      {/* Title */}
      <h2 className="text-right text-lg sm:text-xl font-bold text-black87 mb-3">الآراء حول هذا المنتج</h2>

      {/* Stars row */}
      <div className="flex items-center justify-start gap-4 mb-2 ">
        <div className="flex items-center gap-1 text-amber-500 items-start" aria-label={`التقييم ${getDisplayAverage().toFixed(1)} من 5`}>
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

      {/* Distribution */}
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
                {/* Left: count */}
                <div className={`w-8 text-sm text-right transition-colors duration-200 ${getGoldTextColor(row.count)}`}>
                  {row.count}
                </div>

                {/* Middle: bar */}
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

                {/* Right: star number */}
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

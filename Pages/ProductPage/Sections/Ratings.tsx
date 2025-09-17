"use client";
import React from 'react';

type Props = {
  average: number; // 0..5
  total: number;
  distribution?: { stars: number; count: number }[]; // e.g. [{stars:5,count:10}]
};

const Ratings: React.FC<Props> = ({ average, total, distribution = [] }) => {
  const maxCount = Math.max(1, ...distribution.map(d => d.count));
  return (
    <section className="bg-white rounded-2xl border shadow-sm p-4 sm:p-6">
      {/* Title */}
      <h2 className="text-right text-lg sm:text-xl font-bold text-black87 mb-3">الآراء حول هذا المنتج</h2>

      {/* Stars row */}
      <div className="flex items-center justify-start gap-4 mb-2 ">
        <div className="flex items-center gap-1 text-amber-500 items-start" aria-label={`التقييم ${average} من 5`}>
          {Array.from({ length: 5 }).map((_, i) => (
            <span
              key={i}
              className={`${i < Math.round(average) ? 'text-amber-500' : 'text-black16'} text-2xl sm:text-3xl leading-none`}
            >
              ★
            </span>
          ))}
        </div>
        <div className="text-black60 text-sm sm:text-base">{average.toFixed(1)}</div>
      </div>
      <div className="text-right text-black40 text-xs mb-4">تقييم {total}</div>

      {/* Distribution */}
      <div className="space-y-2">
        {distribution
          .sort((a, b) => b.stars - a.stars)
          .map((row) => (
          <div key={row.stars} className="flex items-center gap-3">
            {/* Left: count */}
            <div className="w-8 text-sm text-black60 text-right">{row.count}</div>
            {/* Middle: bar */}
            <div className="flex-1 h-2 bg-black8 rounded-full overflow-hidden">
              <div
                className="h-full bg-amber-500"
                style={{ width: `${(row.count / maxCount) * 100}%` }}
              />
            </div>
            {/* Right: star number */}
            <div className="flex items-center gap-1 w-10 justify-end text-amber-500">
              <span>★</span>
              <span className="text-black60">{row.stars}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Ratings;

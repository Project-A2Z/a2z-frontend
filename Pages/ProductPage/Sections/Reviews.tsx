"use client";
import React from 'react';
import { Star } from 'lucide-react';

type Review = {
  id: string | number;
  author: string;
  rating: number; // 0..5
  date: string;
  content: string;
};

type Props = {
  reviews: Review[];
};

const Reviews: React.FC<Props> = ({ reviews }) => {
  if (!reviews?.length) return null;
  return (
    <section className="bg-white rounded-2xl border shadow-sm p-4 sm:p-6">
      <h2 className="text-right text-lg sm:text-xl font-bold text-black87 mb-4">التعليقات</h2>
      <div className="divide-y">
        {reviews.map((r) => (
          <article key={r.id} className="py-4">
            {/* Top row: author on right, stars on left */}
            <div className="flex items-start justify-between gap-3 mb-2">
              {/* Right: author */}
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold">
                  {r.author?.[0]?.toUpperCase()}
                </div>
                <div className="text-sm font-medium text-black87">{r.author}</div>
              </div>

              {/* Left: stars */}
              <div className="flex flex-col items-start sm:items-center">
                <div className="flex items-center gap-1 text-amber-500">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className={`w-4 h-4 ${i < Math.round(r.rating) ? 'fill-amber-500 text-amber-500' : 'text-black16'}`} />
                  ))}
                </div>
              </div>
            </div>

            {/* Body */}
            <p className="text-sm text-black87 leading-relaxed mb-1">
              {r.content}
            </p>
            <div className="text-xs text-black60 text-end">{r.date}</div>
          </article>
        ))}
      </div>
    </section>
  );
};

export default Reviews;

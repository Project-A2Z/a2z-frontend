"use client";
import React from 'react';

export type FavoriteItem = {
  id: number | string;
  name: string;
  price: number;
  image: string;
};

type Props = {
  items: FavoriteItem[];
  onRemove?: (id: number | string) => void;
};

const FavoritesList: React.FC<Props> = ({ items, onRemove }) => {
  if (!items?.length) return null;

  return (
    <section className="bg-white rounded-2xl border shadow-sm p-4 sm:p-6">
      <h2 className="text-lg sm:text-xl font-bold text-black87 mb-4">المفضلة</h2>

      {/* List on mobile, grid on desktop */}
      <div className="space-y-4 lg:space-y-0 lg:grid lg:grid-cols-2 xl:grid-cols-3 lg:gap-4">
        {items.map((item) => (
          <div
            key={item.id}
            className="rounded-xl border border-black8 p-3 sm:p-4 flex items-center justify-between gap-3 hover:shadow-sm transition-shadow"
         >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-16 h-16 rounded-lg bg-card overflow-hidden flex-shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="min-w-0">
                <h3 className="text-sm sm:text-base font-medium text-black87 truncate" title={item.name}>
                  {item.name}
                </h3>
                <div className="text-primary font-bold">{item.price.toLocaleString()} ج.م</div>
                <button className="text-secondary1 text-xs mt-1 hover:underline">أضف إلى السلة</button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {onRemove && (
                <button
                  onClick={() => onRemove(item.id)}
                  className="px-3 py-1 rounded-full border text-sm hover:border-primary hover:text-primary"
                >
                  إزالة
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default FavoritesList;

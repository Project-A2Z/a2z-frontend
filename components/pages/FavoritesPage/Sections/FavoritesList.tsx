"use client";
import React from 'react';
import { Trash2 } from 'lucide-react';

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
    <section className="bg-white rounded-xl sm:rounded-2xl border border-gray-200 shadow-sm p-2 sm:p-3 md:p-4 lg:p-5">
      {/* Responsive grid that adapts to all screen sizes */}
      <div className="grid grid-cols-2 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-2 sm:gap-3 md:gap-4">
        {items.map((item) => (
          <article
            key={item.id}
            className="group rounded-lg sm:rounded-xl md:rounded-2xl border border-gray-200 bg-white hover:shadow-md transition-all duration-200 flex flex-col items-stretch overflow-hidden min-h-[280px] xs:min-h-[300px] sm:min-h-[320px] md:min-h-[360px]"
            aria-label={item.name}
          >
            {/* Image Container */}
            <div className="p-2 sm:p-3 md:p-4 flex-shrink-0">
              <div className="aspect-square w-full rounded-lg sm:rounded-xl border border-gray-100 bg-gray-50 flex items-center justify-center overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.image}
                  alt={item.name}
                  className="h-full w-full object-contain p-1 sm:p-2 md:p-3"
                  loading="lazy"
                />
              </div>
            </div>

            {/* Content Container - grows to fill remaining space */}
            <div className="p-2 sm:p-3 md:p-4 pt-0 flex flex-col gap-1 sm:gap-2 items-start flex-grow">
              {/* Product Name */}
              <h3 
                className="text-xs sm:text-sm md:text-base font-medium text-gray-800 leading-tight line-clamp-2 min-h-[2rem] sm:min-h-[2.5rem] w-full" 
                title={item.name}
              >
                {item.name}
              </h3>
              
              {/* Availability Status */}
              <div className="text-emerald-600 text-xs sm:text-sm font-medium">
                متوفر
              </div>

              {/* Price Container */}
              <div className="mt-auto pt-1 sm:pt-2 flex items-baseline justify-start gap-1 sm:gap-2 w-full">
                <div className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-extrabold text-gray-800 leading-none">
                  {item.price.toLocaleString()}
                </div>
                <div className="text-gray-600 text-sm sm:text-base leading-none">
                  ج
                </div>
              </div>

              {/* Remove Button */}
              {onRemove && (
                <div className="mt-2 w-full">
                  <button
                    onClick={() => onRemove(item.id)}
                    className="w-full flex items-center justify-center gap-1.5 sm:gap-2 text-red-500 hover:text-red-600 hover:bg-red-50 border border-red-200 hover:border-red-300 bg-transparent text-xs sm:text-sm py-1.5 sm:py-2 px-2 sm:px-3 transition-all duration-200 min-h-[28px] sm:min-h-[32px] rounded-md sm:rounded-lg cursor-pointer font-medium"
                    type="button"
                    aria-label={`حذف ${item.name} من المفضلة`}
                  >
                    <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                    <span className="shrink-0 text-nowrap">حذف</span>
                  </button>
                </div>
              )}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};

export default React.memo(FavoritesList);
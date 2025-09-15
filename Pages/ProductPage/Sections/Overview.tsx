"use client";
import React from 'react';
import { Heart, ShoppingCart } from 'lucide-react';
import { useFavorites } from '@/services/favorites/FavoritesContext';
import { Minus, Plus } from 'lucide-react';

type Props = {
  id: number | string;
  title: string;
  description?: string;
  price: number;
  image: string;
  rating: number; // 0..5
  ratingCount: number;
};

const Overview: React.FC<Props> = ({ id, title, description, price, image, rating, ratingCount }) => {
  const { toggle, isFavorite } = useFavorites();
  const loved = isFavorite(id);
  return (
    <section className="bg-white max-w-[95%] mx-auto rounded-2xl border shadow-sm p-4 sm:p-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Product media */}
        <div className="lg:col-span-4">
          <div className="w-full max-w-sm mx-auto lg:mx-0 aspect-square bg-card rounded-xl overflow-hidden flex items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={image} alt={title} className="w-full h-full object-contain" />
          </div>
        </div>

        {/* Right: Details */}
        <div className="lg:col-span-8 w-full">
          {/* Header row: title + wishlist */}
          <div className="flex items-start justify-between gap-3 mb-2">
            <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-black87 leading-snug flex-1">{title}</h1>
            <button
              aria-label={loved ? 'remove from wishlist' : 'add to wishlist'}
              onClick={() => toggle({ id, name: title, price, image })}
              className={`p-2 rounded-full border hover:border-primary transition-colors ${loved ? 'text-primary border-primary' : 'text-black60'}`}
            >
              <Heart className={`w-5 h-5 ${loved ? 'fill-current' : ''}`} />
            </button>
          </div>

          {/* Price + availability */}
          <div className="flex flex-col items-start justify-between gap-4 mb-3">
            <span className="px-3 py-1 rounded-full text-xs  rounded-full border text-sm hover:border-primary hover:text-primary">كيماويات عامة</span>
            <div className="text-2xl font-extrabold text-primary">{price.toLocaleString()} ج.م</div>
            <span className="px-3 py-1 rounded-full text-xs bg-green-100 text-green-700 border border-green-200">متوفر في المخزون</span>
          </div>

          {/* Description */}
          {description && (
            <p className="text-black60 text-sm sm:text-base leading-relaxed mb-3">
              {description}
            </p>
          )}

          {/* Rating */}
          <div className="flex items-center gap-2 text-amber-500 mb-4" aria-label={`التقييم ${rating} من 5`}>
            {Array.from({ length: 5 }).map((_, i) => (
              <span key={i} className={i < Math.round(rating) ? 'text-amber-500' : 'text-black16'}>★</span>
            ))}
            <span className="text-black60 text-sm">({ratingCount})</span>
          </div>

          {/* Controls: unit selector + quantity + add to cart */}
          <div className="flex flex-row justify-between flex-wrap items-center gap-3">
            {/* Unit pills */}
            <div className="flex items-center gap-2 order-1">
              <button className="w-[90px] h-[35px] px-4 py-1 rounded-full border text-sm hover:border-primary hover:text-primary">طن</button>
              <button className="w-[90px] h-[35px] px-4 py-1 rounded-full border text-sm hover:border-primary hover:text-primary">كيلو</button>
            </div>

            <div className="flex  items-center gap-2 order-2">
              
              {/* Quantity stepper */}
              <div className="flex items-center gap-3 border rounded-full px-3 py-1 order-2">
                <button aria-label="decrease" className="p-1 rounded-full hover:bg-black8"><Minus className="w-4 h-4" /></button>
                <span className="min-w-[1.5rem] text-center">1</span>
                <button aria-label="increase" className="p-1 rounded-full hover:bg-black8"><Plus className="w-4 h-4" /></button>
              </div>

              {/* Add to cart */}
              <div className="order-3 sm:ml-auto">
                <button className="px-5 py-2 rounded-full bg-primary text-white hover:bg-primary/90 transition-colors flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5" />
                  أضف إلى سلة التسوق
                </button>
              </div>

            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Overview;

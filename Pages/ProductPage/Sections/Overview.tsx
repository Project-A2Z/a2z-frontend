"use client";
import React, { useState } from 'react';
import { Heart, ShoppingCart } from 'lucide-react';
import { useFavorites } from '@/services/favorites/FavoritesContext';
import { Minus, Plus } from 'lucide-react';
import { CustomImage } from '@/components/UI/Image/Images';
import { Button } from '@/components/UI/Buttons';
import { cartService } from '@/services/api/cart';
import { useRouter } from 'next/navigation';
import { isAuthenticated } from '@/utils/auth';

type Props = {
  id: number | string;
  title: string;
  description?: string;
  price: number;
  image: string;
  rating: number;
  ratingCount: number;
  category: string;
  stockQty: number;
  stockType: 'unit' | 'kg' | 'ton';
};

const Overview: React.FC<Props> = ({ id, title, description, price, image, rating, ratingCount, category, stockQty, stockType }) => {
  const { toggle, isFavorite } = useFavorites();
  const loved = isFavorite(id);
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState(stockType); // State for selected unit, init with prop
  const router = useRouter();

  const unitOptions = {
    unit: 'قطعة',
    kg: 'كيلو',
    ton: 'طن',
  };

  const handleUnitSelect = (key: keyof typeof unitOptions) => {
    setSelectedUnit(key); // Update selected unit dynamically
  };

  const handleAddToCart = async () => {
    if (stockQty === 0 || isAdding) return;
    try {
      setIsAdding(true);
      if (!isAuthenticated()) {
        router.push('/login');
        return;
      }
      // Send selected unit to cart
      await cartService.addToCart({ 
        productId: String(id), 
        quantity, 
        stockType: selectedUnit // Include the selected stockType
      });
      router.push('/cart');
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <section className="bg-white max-w-[95%] mx-auto rounded-2xl border shadow-sm p-4 sm:p-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-4">
          <div className="w-full max-w-sm mx-auto lg:mx-0 aspect-square bg-card rounded-xl overflow-hidden flex items-center justify-center">
            <CustomImage
              src={image}
              alt={title}
              fill
              objectFit="contain"
              priority={true}
              fallbackSrc="/assets/download (47).jpg"
              className="w-full h-full"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
        </div>

        <div className="lg:col-span-8 w-full">
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

          <div className="flex flex-col items-start justify-between gap-4 mb-3">
            <span className="px-3 py-1 rounded-full text-xs border text-sm hover:border-primary hover:text-primary">{category || 'غير محدد'}</span>
            <div className="text-2xl font-extrabold text-primary">{price.toLocaleString()} ج.م</div>
            <span
              className={`px-3 py-1 rounded-full text-xs border ${
                stockQty > 0 ? 'bg-green-100 text-green-700 border-green-200' : 'bg-red-100 text-red-700 border-red-200'
              }`}
            >
              {stockQty > 0 ? 'متوفر في المخزون' : 'غير متوفر'}
            </span>
          </div>

          {description && (
            <p className="text-black60 text-sm sm:text-base leading-relaxed mb-3">{description}</p>
          )}

          <div className="flex items-center gap-2 text-amber-500 mb-4" aria-label={`التقييم ${rating} من 5`}>
            {Array.from({ length: 5 }).map((_, i) => (
              <span key={i} className={i < Math.round(rating) ? 'text-amber-500' : 'text-black16'}>★</span>
            ))}
            <span className="text-black60 text-sm">({ratingCount})</span>
          </div>

          <div className="flex flex-row justify-between flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 order-1">
              {Object.entries(unitOptions).map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => handleUnitSelect(key as keyof typeof unitOptions)} // Make clickable and dynamic
                  className={`w-[90px] h-[35px] px-4 py-1 rounded-full border text-sm transition-colors ${
                    selectedUnit === key 
                      ? 'border-primary text-primary bg-primary/10' // Active style
                      : 'hover:border-primary hover:text-primary hover:bg-gray-50' // Hover style
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 order-2">
              <div className="flex items-center gap-3 border rounded-full px-3 py-1 order-2">
                <button
                  aria-label="decrease"
                  onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                  className="p-1 rounded-full hover:bg-black8"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="min-w-[1.5rem] text-center">{quantity}</span>
                <button
                  aria-label="increase"
                  onClick={() => setQuantity((prev) => Math.min(stockQty, prev + 1))}
                  className="p-1 rounded-full hover:bg-black8"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <div className="order-3 sm:ml-auto">
                <button
                  className="px-5 py-2 rounded-full bg-primary text-white hover:bg-primary/90 transition-colors flex items-center gap-2"
                  disabled={stockQty === 0 || isAdding}
                  onClick={handleAddToCart}
                >
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

export default React.memo(Overview);
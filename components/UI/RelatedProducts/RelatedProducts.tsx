"use client";
import React, { useEffect, useRef, useState } from 'react';
import { useKeenSlider } from 'keen-slider/react';
import 'keen-slider/keen-slider.min.css';
import Link from 'next/link';


interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  status: boolean | string;
  image: string;
}

const RelatedProducts: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const [sliderRef, instanceRef] = useKeenSlider<HTMLDivElement>({
    loop: true,
    mode: 'free-snap',
    slides: { perView: 2, spacing: 12 },
    breakpoints: {
      '(min-width: 768px)': { slides: { perView: 3, spacing: 16 } },
      '(min-width: 1024px)': { slides: { perView: 6, spacing: 16 } },
    },
  });

  const timerRef = useRef<number | null>(null);
  const start = () => {
    if (timerRef.current) return;
    const slider = instanceRef.current;
    if (!slider) return;
    timerRef.current = window.setInterval(() => slider.next(), 2500);
  };
  const stop = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  // Load products from public/Test_data/products.json
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('/Test_data/products.json');
        const data: Product[] = await response.json();
        setProducts((data || []).slice(0, 8));
      } catch (error) {
        console.error('Error fetching related products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  useEffect(() => {
    start();
    return () => stop();
  }, [instanceRef]);

  if (loading) {
    return (
      <div className="mt-12">
        <h2 className="text-2xl font-bold text-black87 mb-6">منتجات قد تعجبك</h2>
        <div className="text-black60">جاري التحميل...</div>
      </div>
    );
  }

  return (
    <div className="mt-12">
      <h2 className="text-2xl font-bold text-black87 mb-6">منتجات قد تعجبك</h2>
      <div
        ref={sliderRef}
        className="keen-slider"
        onMouseEnter={stop}
        onMouseLeave={start}
      >
        {products.map((product) => (
          <div key={product.id} className="keen-slider__slide">
            <Link href={`/product/${product.id}`} className="block">
              <div className="bg-white rounded-[20px] shadow-sm border p-4 mx-1 hover:shadow-md transition-shadow cursor-pointer" role="link" aria-label={product.name}>
                <div className="aspect-square bg-card rounded-lg mb-3 overflow-hidden">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="font-medium text-black87 text-sm mb-2 truncate" title={product.name}>
                  {product.name}
                </h3>
                <div className="text-primary font-bold">{product.price.toLocaleString()} ج.م</div>
                <div className="text-xs text-black60 mt-1">{product.category}</div>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default React.memo(RelatedProducts);

"use client";
import React, { useEffect, useRef, useState } from 'react';
import { useKeenSlider } from 'keen-slider/react';
import 'keen-slider/keen-slider.min.css';
import Link from 'next/link';
import { Product, productService } from '@/services/api/products';

interface RelatedProductsProps {
  category?: string;
  currentProductId?: string;
  minPriceGte?: number;
}

const RelatedProducts: React.FC<RelatedProductsProps> = ({ category, currentProductId, minPriceGte }) => {
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

  // Safely pick a primary image and provide a runtime fallback
  const PLACEHOLDER_SRC = '/acessts/NoImage.jpg';
  const getPrimaryImage = (p: Product): string => {
    const first = Array.isArray(p.imageList)
      ? p.imageList.find((img) => typeof img === 'string' && img.trim() !== '')
      : undefined;
    return first || PLACEHOLDER_SRC;
  };

  // Fetch related products from API
  useEffect(() => {
    const fetchRelatedProducts = async () => {
      try {
        setLoading(true);
        const filters: any = {
          limit: 12,
          fields: '_id,name,category,price,imageList,stockType,stockQty'
        };
        if (category) filters.category = category;
        if (typeof minPriceGte === 'number') {
          filters['price[gte]'] = minPriceGte;
          // Alternatively using nested object works with Axios params serialization too:
          // filters.price = { gte: minPriceGte };
        }

        const response = await productService.getProducts(filters);

        // productService returns { status, data }
        const raw = (response as any)?.data ?? response;
        const list = Array.isArray(raw) ? raw : (Array.isArray(raw?.data) ? raw.data : []);

        const filteredProducts = list
          .filter((p: any) => (category ? p.category === category : true))
          .filter((p: any) => (currentProductId ? p._id !== currentProductId : true));

        setProducts(filteredProducts.slice(0, 8));
      } catch (error) {
        console.error('Error fetching related products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRelatedProducts();
  }, [category, currentProductId]);

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
          <div key={product._id} className="keen-slider__slide">
            <Link href={`/product/${product._id}`} className="block">
              <div className="bg-white rounded-[20px] shadow-sm border p-4 mx-1 hover:shadow-md transition-shadow cursor-pointer" role="link" aria-label={product.name}>
                <div className="aspect-square bg-card rounded-lg mb-3 overflow-hidden">
                  <img
                    src={getPrimaryImage(product)}
                    alt={product.name}
                    className="w-full h-full object-cover"
                    onError={(e) => { (e.currentTarget as HTMLImageElement).src = PLACEHOLDER_SRC; }}
                    loading="lazy"
                  />
                </div>
                <h3 className="font-medium text-black87 text-sm mb-2 truncate" title={product.name}>
                  {product.name}
                </h3>
                <div className="text-primary font-bold">{product.price.toLocaleString()} ج.م</div>
                <div className="text-xs text-black60 mt-1">{product.stockQty} {product.stockType === 'unit' ? 'قطعة' : product.stockType}</div>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default React.memo(RelatedProducts);

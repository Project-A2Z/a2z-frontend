"use client";
import React, { useEffect, useRef, useState } from 'react';
import { useKeenSlider } from 'keen-slider/react';
import 'keen-slider/keen-slider.min.css';
import Link from 'next/link';
import { Product, productService, ProductFilters } from '@/services/api/products';

// Define props to accept currentProductId and minPriceGte
interface RelatedProductsProps {
  currentProductId?: string;
  minPriceGte?: number;
}

const RelatedProducts: React.FC<RelatedProductsProps> = ({ currentProductId, minPriceGte }) => {
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

  // Base URL for images (adjust based on your backend)
  const BASE_IMAGE_URL = 'https://a2z-backend.fly.dev';

  // Safely pick a primary image with fallback
  const PLACEHOLDER_SRC = '/acessts/NoImage.jpg';
  const getPrimaryImage = (p: Product): string => {
    // Check if imageList exists and has valid images
    if (p?.imageList && Array.isArray(p.imageList) && p.imageList.length > 0) {
      const firstValidImage = p.imageList.find((img) => typeof img === 'string' && img.trim() !== '');

      if (firstValidImage) {
        // Handle relative URLs by prepending the base URL
        const imageUrl = firstValidImage.startsWith('http')
          ? firstValidImage
          : `${BASE_IMAGE_URL}${firstValidImage.startsWith('/') ? '' : '/'}${firstValidImage}`;

        return imageUrl;
      }
    }

    return PLACEHOLDER_SRC;
  };

  // Fetch related products from API
  useEffect(() => {
    const fetchRelatedProducts = async () => {
      try {
        setLoading(true);

        // Build filters using the ProductFilters interface
        const filters: ProductFilters = {
          limit: 12,
          // Remove fields filter to ensure we get all product data including images
          // fields: '_id,name,category,price,imageList,stockType,stockQty',
        };

        // Add price filter if minPriceGte is provided
        if (typeof minPriceGte === 'number' && !isNaN(minPriceGte)) {
          filters.price = { gte: minPriceGte };
        }

        // Use the centralized product fetching with state management
        const response = await productService.getProducts(filters);

        // Extract products array from response
        const productsList = Array.isArray(response.data) ? response.data : [];
        if (productsList.length === 0) {
          // Silent fallback; no log needed
        }

        // Filter out current product if currentProductId is provided
        const filteredProducts = currentProductId
          ? productsList.filter((p: Product) => p._id !== currentProductId)
          : productsList;

        setProducts(filteredProducts.slice(0, 8));
      } catch (error) {
        // Silent error handling; no log needed in production

        // Fallback to empty array on error
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRelatedProducts();
  }, [currentProductId, minPriceGte]);

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

  if (products.length === 0) {
    return null;
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
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = PLACEHOLDER_SRC;
                    }}
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
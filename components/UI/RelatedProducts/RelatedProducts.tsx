"use client";
import React, { useEffect, useRef, useState, useCallback } from "react";
import { useKeenSlider } from "keen-slider/react";
import "keen-slider/keen-slider.min.css";
import {
  Product,
  productService,
  ProductFilters,
} from "@/services/api/products";
import Card from "@/components/UI/Card/Card";
import styles from "@/components/UI/RelatedProducts/RelatedProducts.module.css";

const BASE_IMAGE_URL = "https://a2z-backend.fly.dev";
const PLACEHOLDER_SRC = "/acessts/NoImage.jpg";

const getPrimaryImage = (p: Product): string => {
  if (p?.imageList && Array.isArray(p.imageList) && p.imageList.length > 0) {
    const firstValidImage = p.imageList.find(
      (img) => typeof img === "string" && img.trim() !== "",
    );
    if (firstValidImage) {
      return firstValidImage.startsWith("http")
        ? firstValidImage
        : `${BASE_IMAGE_URL}${firstValidImage.startsWith("/") ? "" : "/"}${firstValidImage}`;
    }
  }
  return PLACEHOLDER_SRC;
};

interface RelatedProductsProps {
  currentProductId?: string;
  currentCategory?: string;
}

const RelatedProducts: React.FC<RelatedProductsProps> = ({
  currentProductId,
  currentCategory,
}) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [sliderRef, instanceRef] = useKeenSlider<HTMLDivElement>({
    loop: true,
    mode: "free-snap",
    slides: { perView: 2, spacing: 12 },
    breakpoints: {
      "(min-width: 768px)": { slides: { perView: 3, spacing: 16 } },
      "(min-width: 1024px)": { slides: { perView: 4, spacing: 16 } },
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

  const fetchRelatedProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const filters: ProductFilters = {
        limit: 8,
        ...(currentProductId && { excludeId: currentProductId }),
        ...(currentCategory && { category: currentCategory }),
      };

      const response = await productService.getProducts(filters);

      if (response && Array.isArray(response.data)) {
        // Extra client-side guard: exclude current product and match category
        const filtered = response.data.filter((p) => {
          const notCurrent = p._id !== currentProductId;
          const sameCategory = currentCategory
            ? p.category === currentCategory
            : true;
          return notCurrent && sameCategory;
        });
        setProducts(filtered);
      } else {
        setProducts([]);
      }
    } catch {
      setError("حدث خطأ أثناء تحميل المنتجات المتعلقة");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [currentProductId, currentCategory]);

  useEffect(() => {
    fetchRelatedProducts();
  }, [fetchRelatedProducts]);

  useEffect(() => {
    start();
    return () => stop();
  }, [instanceRef]);

  if (loading) {
    return (
      <div className="mt-12">
        <h2 className="text-2xl font-bold text-black87 mb-6">
          منتجات قد تعجبك
        </h2>
        <div className="keen-slider">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="keen-slider__slide">
              <Card isLoading />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-12">
        <h2 className="text-2xl font-bold text-black87 mb-6">
          منتجات قد تعجبك
        </h2>
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  if (products.length === 0) return null;

  return (
    <div className="mt-12">
      <h2 className="text-2xl font-bold text-black87 mb-6">منتجات قد تعجبك</h2>
      <div
        ref={sliderRef}
        className="keen-slider relative"
        onMouseEnter={stop}
        onMouseLeave={start}
      >
        {products.map((product) => (
          <div key={product._id} className="keen-slider__slide">
            <div
              className={styles.slideWrapper}
            >
              <Card
                productId={product._id}
                productName={product.name}
                productCategory={product.category}
                productPrice={String(product.price)}
                productImg={getPrimaryImage(product)}
                available={product.stockQty > 0}
                IsKG={product.IsKG}
                IsTON={product.IsTON}
                IsLITER={product.IsLITER}
                IsCUBIC_METER={product.IsCUBIC_METER}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default React.memo(RelatedProducts);

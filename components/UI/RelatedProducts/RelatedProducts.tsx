"use client";
import React, { useEffect, useRef, useState, useCallback } from "react";
import { useKeenSlider } from "keen-slider/react";
import "keen-slider/keen-slider.min.css";
import { useTranslations } from "next-intl";

import {
  // Product,
  ProductVariant,
  fetchProductsByCategory,
  getProductsWithState,
} from "@/services/product/products";
import { Product } from "@/services/product/products";
import Card from "@/components/UI/Card/Card";
import styles from "@/components/UI/RelatedProducts/RelatedProducts.module.css";

// ─────────────────────────────────────────────────────────────────────────────

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
  const t = useTranslations("about-us.products.relatedProducts");


  // Track selected variant per product  { [productIdStr]: variantId }
  const [activeVariants, setActiveVariants] = useState<Record<string, string>>({});

  // ── slider ────────────────────────────────────────────────────────────────

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

  const start = useCallback(() => {
    if (timerRef.current) return;
    const slider = instanceRef.current;
    if (!slider) return;
    timerRef.current = window.setInterval(() => slider.next(), 2500);
  }, [instanceRef]);

  const stop = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  // ── variant selection ─────────────────────────────────────────────────────

  const handleVariantSelect = useCallback(
    (productId: string | number, variantId: string) => {
      setActiveVariants((prev) => ({
        ...prev,
        [String(productId)]: variantId,
      }));
    },
    []
  );

  // ── fetch ─────────────────────────────────────────────────────────────────

  const fetchRelatedProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch by category if available; fall back to all products
      let allProducts: Product[];
      try {
        allProducts = currentCategory
          ? await fetchProductsByCategory(currentCategory)
          : await getProductsWithState();
      } catch {
        // If category fetch fails (backend 500), fall back to all products
        allProducts = await getProductsWithState();
      }

      // Client-side: exclude current product, limit to 8
      const filtered = allProducts
        .filter((p) => {
          const idStr = p.id?.toString() || "";
          const notCurrent = idStr !== currentProductId;
          const sameCategory = currentCategory
            ? p.category === currentCategory
            : true;
          return notCurrent && sameCategory;
        })
        .slice(0, 8);

      setProducts(filtered);

      // Pre-select the first variant for each product
      const initialVariants: Record<string, string> = {};
      for (const p of filtered) {
        const key = p.id?.toString() || "";
        const firstVariant = p.productVariants?.[0];
        if (key && firstVariant) {
          initialVariants[key] = firstVariant._id ?? firstVariant.id;
        }
      }
      setActiveVariants(initialVariants);
    } catch {
      setError(t("loading.error")); // "حدث خطأ أثناء تحميل المنتجات المتعلقة"
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
  }, [start, stop]);

  // ── render states ─────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="mt-12">
        <h2 className="text-2xl font-bold text-black87 mb-6">{t("title")}</h2>
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
        <h2 className="text-2xl font-bold text-black87 mb-6">{t("title")}</h2>
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  if (products.length === 0) return null;

  // ── main render ───────────────────────────────────────────────────────────

  return (
    <div className="mt-12">
      <h2 className="text-2xl font-bold text-black87 mb-6">{t("title")}</h2>
      <div
        ref={sliderRef}
        className="keen-slider relative"
        onMouseEnter={stop}
        onMouseLeave={start}
      >
        {products.map((product, index) => {
          // product.id is already normalised by processProductImagesStatic
          const productIdStr = product.id?.toString() || String(index);

          const activeVariantId = activeVariants[productIdStr];

          // Resolve the active variant (fall back to first)
          const activeVariant: ProductVariant | null =
            product.productVariants?.find(
              (v) => (v.id || v._id) === activeVariantId
            ) ?? product.productVariants?.[0] ?? null;

          // Price: active variant overrides the pre-derived product.price
          const effectivePrice = activeVariant?.price ?? product.price ?? 0;

          // Stock: active variant's quantity, or pre-derived inStock flag
          const effectiveStock =
            activeVariant != null
              ? activeVariant.totalQuantity > 0
              : product.inStock;

          return (
            <div key={`${productIdStr}-${index}`} className="keen-slider__slide">
              <div className={styles.slideWrapper}>
                <Card
                  // Identity
                  productId={productIdStr}
                  productName={product.nameAr || product.name}
                  productCategory={product.category || t("unknownCategory")}
                  // Full product object — Card uses it for variants, unit labels, etc.
                  product={product}
                  // Image — already resolved by processProductImagesStatic
                  productImg={product.image || "/acessts/NoImage.jpg"}
                  // Price & availability
                  productPrice={effectivePrice.toString()}
                  available={effectiveStock}
                  // Optional display fields — pre-derived by the service
                  originalPrice={product.originalPrice?.toString()}
                  discount={product.discount}
                  rating={product.rating}
                  reviewsCount={product.reviewsCount}
                  // Variant selection
                  activeVariantId={activeVariantId}
                  onVariantSelect={handleVariantSelect}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default React.memo(RelatedProducts);
"use client";
import Card from '@/components/UI/Card/Card';
import styles from '@/components/UI/Product/ProductSlider.module.css';
import { Product } from '@/services/product/products';
import {useTranslations} from 'next-intl';

interface ProductSliderProps {
  products: Product[];
  title?: string;
  isLoading?: boolean;
  error?: string | null;
  selectedVariants?: Record<string, string>;     
  onVariantSelect?: (productId: string | number, variantId: string) => void;
}

function ProductSlider({
  products = [],
  title = "المنتجات المميزة",
  isLoading = false,
  error = null,
  selectedVariants = {},
  onVariantSelect,
}: ProductSliderProps) {

  const t = useTranslations("products");

  if (isLoading) {
    return (
      <div className={styles.sliderContainer}>
        <div className={styles.loadingContainer}>
          <div className={styles.loadingGrid}>
            {Array.from({ length: 20 }).map((_, index) => (
              <div key={index} className={styles.skeletonCard}>
                <div className={styles.skeletonImage}></div>
                <div className={styles.skeletonContent}>
                  <div className={styles.skeletonTitle}></div>
                  <div className={styles.skeletonCategory}></div>
                  <div className={styles.skeletonPrice}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.sliderContainer}>
        <div className={styles.errorContainer}>
          <div className={styles.errorIcon}>⚠️</div>
          <p className={styles.errorMessage}>{error}</p>
          <p className={styles.errorSubtext}>{t('error')}</p>
        </div>
      </div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <div className={styles.sliderContainer}>
        <div className={styles.emptyContainer}>
          <div className={styles.emptyIcon}>📦</div>
          <h3 className={styles.emptyTitle}>{t('empty')}</h3>
          <p className={styles.emptyMessage}>{t('emptyQuery')}</p>
        </div>
      </div>
    );
  }

  const getProductImage = (product: Product): string => {
    if (product.image) return product.image;
    if (product.images && product.images.length > 0) return product.images[0];
    return '/acessts/NoImage.jpg';
  };

  const getProductName = (product: Product): string => {
    return product.nameAr || product.name || t('unpredictable');
  };

  return (
    <div className={styles.sliderContainer}>
      <div className={styles.gridWrapper}>
        <div className={styles.productGrid}>
          {products.map((product, index) => {
            const productIdStr = product.id?.toString() || index.toString();
            const activeVariantId = selectedVariants[productIdStr];

            // Find the currently selected variant (if any)
            const activeVariant = product.productVariants?.find(
              v => (v.id || v._id) === activeVariantId
            ) || product.productVariants?.[0] || null;

            // Derive price & stock from active variant
            const effectivePrice = activeVariant?.price ?? product.price ?? 0;
            const effectiveStock =
              activeVariant != null
                ? activeVariant.totalQuantity > 0
                : product.inStock;

            return (
              <div
                key={`${product.id || product.name}-${index}`}
                className={styles.gridItem}
              >
                <Card
                  productId={productIdStr}
                  productImg={getProductImage(product)}
                  productName={getProductName(product)}
                  productCategory={product.category || t('unpredictable')}
                  productPrice={effectivePrice.toString()}
                  available={effectiveStock}
                  originalPrice={product.originalPrice?.toString()}
                  discount={product.discount}
                  rating={product.rating}
                  reviewsCount={product.reviewsCount}
                  product={product}
                  // NEW: pass variant state to Card
                  activeVariantId={activeVariantId}
                  onVariantSelect={onVariantSelect}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default ProductSlider;
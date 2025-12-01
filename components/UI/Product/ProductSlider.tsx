"use client"
import { useState, useRef } from 'react';
import Card from '@/components/UI/Card/Card';
import styles from '@/components/UI/Product/ProductSlider.module.css';
import { Product } from '@/services/product/products';

interface ProductSliderProps {
  products: Product[];
  title?: string;
  isLoading?: boolean;
  error?: string | null;
}

function ProductSlider({ 
  products = [],
  title = "المنتجات المميزة",
  isLoading = false,
  error = null
}: ProductSliderProps) {
  
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
          <p className={styles.errorSubtext}>حدث خطأ في تحميل المنتجات</p>
        </div>
      </div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <div className={styles.sliderContainer}>
        <div className={styles.emptyContainer}>
          <div className={styles.emptyIcon}>📦</div>
          <h3 className={styles.emptyTitle}>لا توجد منتجات</h3>
          <p className={styles.emptyMessage}>لم يتم العثور على أي منتجات تطابق معايير البحث</p>
        </div>
      </div>
    );
  }

  const getProductImage = (product: Product): string => {
    if (product.image) return product.image;
    if (product.images && product.images.length > 0) return product.images[0];
    return '/acessts/NoImage.jpg';
  };

  const getProductStatus = (product: Product): boolean => {
    if (typeof product.inStock === 'boolean') return product.inStock;
    return true;
  };

  const getProductName = (product: Product): string => {
    return product.nameAr || product.name || 'منتج غير محدد';
  };

  return (
    <div className={styles.sliderContainer}>
      <div className={styles.gridWrapper}>
        <div className={styles.productGrid}>
          {products.map((product, index) => (
            <div key={`${product.id || product.name}-${index}`} className={styles.gridItem}>
              <Card
                productId={product.id?.toString() || index.toString()}
                productImg={getProductImage(product)}
                productName={getProductName(product)}
                productCategory={product.category || 'غير محدد'}
                productPrice={product.price?.toString() || '0'}
                available={getProductStatus(product)}
                originalPrice={product.originalPrice?.toString()}
                discount={product.discount}
                rating={product.rating}
                reviewsCount={product.reviewsCount}
                product={product}
                IsKG={product.IsKG}
                IsTON={product.IsTON}
                IsLITER={product.IsLITER}
                IsCUBIC_METER={product.IsCUBIC_METER}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default ProductSlider;
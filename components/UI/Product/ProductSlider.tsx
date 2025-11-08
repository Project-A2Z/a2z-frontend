"use client"
import { useState, useRef } from 'react';
import Card from './../Card/Card';
import styles from './ProductSlider.module.css';

const Def = './../../../public/acessts/Logo-picsart.png'

export interface Product {
  id: string | number;
  name: string;
  nameAr?: string;
  nameEn?: string;
  description?: string;
  descriptionAr?: string;
  descriptionEn?: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  image: string;
  images?: (string)[];
  imageList?: (string)[];
  category: string;
  categoryId?: string | number;
  brand?: string;
  brandId?: string | number;
  inStock: boolean;
  stockQuantity?: number;
  rating?: number;
  reviewsCount?: number;
  tags?: string[];
  specifications?: Record<string, any>;
  createdAt?: string;
  updatedAt?: string;
}

interface ProductSliderProps {
  products: Product[];
  title?: string;
  itemsPerPage?: number;
  columns?: number;
  rows?: number;
  isLoading?: boolean;
  error?: string | null;
}

function ProductSlider({ 
  products = [],
  title = "المنتجات المميزة",
  itemsPerPage = 20,
  columns = 4,
  rows = 5,
  isLoading = false,
  error = null
}: ProductSliderProps) {
  const [currentPage, setCurrentPage] = useState(0);
  const sliderRef = useRef<HTMLDivElement>(null);

  if (isLoading) {
    return (
      <div className={styles.sliderContainer}>
        <div className={styles.loadingContainer}>
          <div className={styles.loadingGrid}>
            {Array.from({ length: itemsPerPage }).map((_, index) => (
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

  const totalPages = Math.ceil(products.length / itemsPerPage);
  
  const getCurrentPageProducts = () => {
    const startIndex = currentPage * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return products.slice(startIndex, endIndex);
  };

  const nextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages - 1));
  };

  const prevPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 0));
  };

  const goToPage = (pageIndex: number) => {
    setCurrentPage(pageIndex);
  };

  const currentProducts = getCurrentPageProducts();

  const getProductImage = (product: Product): string => {
    if (product.image) return product.image;
    if (product.images && product.images.length > 0) return product?.images[0];
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
        <div 
          className={styles.productGrid}
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${columns}, 1fr)`,
            gap: '16px'
          }}
        >
          {currentProducts.map((product, index) => (
            <div key={`${product.id || product.name}-${currentPage}-${index}`} className={styles.gridItem}>
              <Card
                productId={product.id?.toString() || (currentPage * itemsPerPage + index).toString()}
                productImg={getProductImage(product)}
                productName={getProductName(product)}
                productCategory={product.category || 'غير محدد'}
                productPrice={product.price?.toString() || '0'}
                available={getProductStatus(product)}
                originalPrice={product.originalPrice?.toString()}
                discount={product.discount}
                rating={product.rating}
                reviewsCount={product.reviewsCount}
              />
            </div>
          ))}
          
          {Array.from({ length: itemsPerPage - currentProducts.length }).map((_, index) => (
            <div key={`empty-${index}`} className={styles.emptySlot} />
          ))}
        </div>
      </div>

      {totalPages > 1 && (
        <div className={styles.bottomPagination}>
          <div className={styles.paginationInfo}>
            <span>
              عرض {currentPage * itemsPerPage + 1} إلى {Math.min((currentPage + 1) * itemsPerPage, products.length)} من {products.length}
            </span>
          </div>
          
          <div className={styles.paginationControls}>
            <button
              className={`${styles.paginationArrow} ${currentPage === 0 ? styles.disabled : ''}`}
              onClick={prevPage}
              disabled={currentPage === 0}
              aria-label="الصفحة السابقة"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg> 
            </button>
            
            <div className={styles.pageNumbers}>
              {currentPage > 2 && (
                <>
                  <button
                    className={styles.pageNumber}
                    onClick={() => goToPage(0)}
                  >
                    1
                  </button>
                  {currentPage > 3 && <span className={styles.ellipsis}>...</span>}
                </>
              )}
              
              {Array.from({ length: totalPages }).map((_, index) => {
                if (index >= currentPage - 1 && index <= currentPage + 1) {
                  return (
                    <button
                      key={index}
                      className={`${styles.pageNumber} ${currentPage === index ? styles.active : ''}`}
                      onClick={() => goToPage(index)}
                    >
                      {index + 1}
                    </button>
                  );
                }
                return null;
              })}

              {currentPage < totalPages - 1 && (
                <span className={styles.ellipsis}>من</span>
              )}
              
              {currentPage < totalPages - 3 && (
                <>
                  {currentPage < totalPages - 4 && <span className={styles.ellipsis}>...</span>}
                  <button
                    className={styles.pageNumber}
                    onClick={() => goToPage(totalPages - 1)}
                  >
                    {totalPages}
                  </button>
                </>
              )}
            </div>
            
            <button
              className={`${styles.paginationArrow} ${currentPage >= totalPages - 1 ? styles.disabled : ''}`}
              onClick={nextPage}
              disabled={currentPage >= totalPages - 1}
              aria-label="الصفحة التالية"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProductSlider;
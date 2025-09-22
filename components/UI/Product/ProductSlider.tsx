"use client"
import { useState, useRef, useEffect, useCallback } from 'react';
import Card from './../Card/Card'; // Adjust the import path as needed
import styles from './ProductSlider.module.css';

// Updated Types to match API response
interface Product {
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
  images?: string[];
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
  // Legacy compatibility
  status?: boolean | string;
  img?: any;
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
  products = [], // Default empty array
  title = "المنتجات المميزة",
  itemsPerPage = 20, // 4 columns × 5 rows = 20 items per page
  columns = 4,
  rows = 5,
  isLoading = false,
  error = null
}: ProductSliderProps) {
  const [currentPage, setCurrentPage] = useState(0);
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());
  const sliderRef = useRef<HTMLDivElement>(null);

  // Debug function to log image information
  const debugImages = useCallback((products: Product[]) => {
    console.log('=== PRODUCT SLIDER IMAGE DEBUG ===');
    console.log(`Total products: ${products.length}`);
    
    products.slice(0, 5).forEach((product, index) => {
      console.log(`Product ${index + 1}:`, {
        id: product.id,
        name: product.name || product.nameAr,
        image: product.image,
        img: product.img,
        images: product.images,
        imageFields: Object.keys(product).filter(key => 
          key.toLowerCase().includes('image') || 
          key.toLowerCase().includes('img') || 
          key.toLowerCase().includes('photo') ||
          key.toLowerCase().includes('pic')
        ),
        allFields: Object.keys(product)
      });
    });
  }, []);

  // Debug images when products change
  useEffect(() => {
    if (products.length > 0) {
      debugImages(products);
    }
  }, [products, debugImages]);

  // Test image URL accessibility
  const testImageUrl = useCallback(async (url: string, productId: string | number) => {
    try {
      console.log(`Testing image URL for product ${productId}:`, url);
      
      const response = await fetch(url, { 
        method: 'HEAD',
        mode: 'no-cors' // Try no-cors first
      });
      
      console.log(`Image test result for ${productId}:`, {
        url,
        status: response.status,
        type: response.type,
        ok: response.ok
      });
      
    } catch (err) {
      console.error(`Image test failed for product ${productId}: ${err}`)
      //   url,
      //   error: err?.message,
      //   errorType: err?.name
      // });
    }
  }, []);

  // Handle loading state
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

  // Handle error state
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

  // Handle empty state
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

  // Calculate total pages
  const totalPages = Math.ceil(products.length / itemsPerPage);
  
  // Get current page products
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

  // Enhanced helper function to get product image with debugging
  const getProductImage = useCallback((product: Product): string => {
    console.log(`Getting image for product ${product.id}:`, {
      image: product.image,
      img: product.img,
      images: product.images
    });

    let imageUrl = '';
    
    // Try different image fields in order of preference
    if (product.image && typeof product.image === 'string' && product.image.trim()) {
      imageUrl = product.image.trim();
    } else if (product.img && typeof product.img === 'string' && product.img.trim()) {
      imageUrl = product.img.trim();
    } else if (product.images && Array.isArray(product.images) && product.images.length > 0) {
      imageUrl = product.images[0];
    }

    // If no image found, use placeholder
    if (!imageUrl) {
      console.warn(`No image found for product ${product.id}, using placeholder`);
      return '/images/placeholder.jpg';
    }

    // Handle relative URLs - adjust this based on your API setup
    if (imageUrl.startsWith('/') && !imageUrl.startsWith('//')) {
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 
                     process.env.NEXT_PUBLIC_IMAGE_BASE_URL || 
                     window.location.origin;
      imageUrl = `${baseUrl}${imageUrl}`;
      console.log(`Converted relative URL for product ${product.id}:`, imageUrl);
    }
    
    // Handle URLs without protocol
    if (!imageUrl.startsWith('http') && !imageUrl.startsWith('data:') && !imageUrl.startsWith('//')) {
      imageUrl = `https://${imageUrl}`;
      console.log(`Added https protocol for product ${product.id}:`, imageUrl);
    }

    // Test the URL accessibility
    if (typeof window !== 'undefined') {
      testImageUrl(imageUrl, product.id);
    }

    console.log(`Final image URL for product ${product.id}:`, imageUrl);
    return imageUrl;
  }, [testImageUrl]);

  // Helper function to get product status
  const getProductStatus = (product: Product): boolean => {
    if (typeof product.inStock === 'boolean') return product.inStock;
    if (typeof product.status === 'boolean') return product.status;
    return true; // Default to available
  };

  // Helper function to get product name
  const getProductName = (product: Product): string => {
    return product.nameAr || product.name || 'منتج غير محدد';
  };

  // Handle image error
  const handleImageError = useCallback((productId: string) => {
    console.error(`Image failed to load for product: ${productId}`);
    setImageErrors(prev => new Set([...prev, productId]));
  }, []);

  // Log current page products for debugging
  useEffect(() => {
    console.log('Current page products:', currentProducts.map(p => ({
      id: p.id,
      name: p.name,
      image: getProductImage(p)
    })));
  }, [currentProducts, getProductImage]);

  return (
    <div className={styles.sliderContainer}>
      {/* Debug Panel - Remove in production */}
      {process.env.NODE_ENV === 'development' && (
        <div style={{
          position: 'fixed',
          top: '10px',
          right: '10px',
          background: 'rgba(0,0,0,0.8)',
          color: 'white',
          padding: '10px',
          borderRadius: '5px',
          fontSize: '12px',
          zIndex: 9999,
          maxWidth: '300px'
        }}>
          <div>Products: {products.length}</div>
          <div>Current Page: {currentPage + 1}/{totalPages}</div>
          <div>Image Errors: {imageErrors.size}</div>
          <div>First Product Image: {products[0] ? getProductImage(products[0]) : 'N/A'}</div>
        </div>
      )}

      <div className={styles.gridWrapper}>
        <div 
          className={styles.productGrid}
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${columns}, 1fr)`,
            gridTemplateRows: `repeat(${rows}, 1fr)`,
            gap: '16px',
            minHeight: `${rows * 300}px` // Adjust based on your card height
          }}
        >
          {currentProducts.map((product, index) => {
            const productId = product.id?.toString() || (currentPage * itemsPerPage + index).toString();
            const productImage = getProductImage(product);
            const hasImageError = imageErrors.has(productId);

            return (
              <div key={`${product.id || product.name}-${currentPage}-${index}`} className={styles.gridItem}>
                <Card
                  productId={productId}
                  productImg={hasImageError ? '/images/placeholder.jpg' : productImage}
                  productName={getProductName(product)}
                  productCategory={product.category || 'غير محدد'}
                  productPrice={product.price?.toString() || '0'}
                  available={getProductStatus(product)}
                  originalPrice={product.originalPrice?.toString()}
                  discount={product.discount}
                  rating={product.rating}
                  reviewsCount={product.reviewsCount}
                  // onImageError={() => handleImageError(productId)}
                />
              </div>
            );
          })}
          
          {/* Fill empty slots if needed */}
          {Array.from({ length: itemsPerPage - currentProducts.length }).map((_, index) => (
            <div key={`empty-${index}`} className={styles.emptySlot} />
          ))}
        </div>
      </div>

      {/* Bottom Pagination */}
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
              {/* Show first page */}
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
              
              {/* Show pages around current page */}
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

              {/* Show "من" only between current page and last page */}
              {currentPage < totalPages - 2 && (
                <span className={styles.ellipsis}>من</span>
              )}
              
              {/* Show last page */}
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
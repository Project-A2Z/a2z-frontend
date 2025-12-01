"use client";
import { useState, useEffect, useCallback, useMemo, useRef, Suspense } from 'react';
import dynamic from 'next/dynamic';
import { Button } from "@/components/UI/Buttons/Button"; 
import { 
  fetchAllProducts,
  Product,
  ProductsResponse 
} from '@/services/product/products';
import style from './Product.module.css';
import FilterIcon from '@/public/icons/Filter.svg'; 

// Lazy load heavy components
const ProductSlider = dynamic(() => import("@/components/UI/Product/ProductSlider"), {
  loading: () => <ProductSliderSkeleton />,
  ssr: false 
});

const Filter = dynamic(() => import("@/components/UI/Product/Filter"), {
  loading: () => <FilterSkeleton />,
  ssr: true
});

interface OptimizedProductSectionProps {
  initialData?: ProductsResponse;
}

const PRODUCTS_PER_PAGE = 20;

// Skeleton components for loading states
function ProductSliderSkeleton() {
  return (
    <div className={style.sliderContainer}>
      <div className={style.skeletonGrid}>
        {[...Array(8)].map((_, i) => (
          <div key={i} className={style.skeletonCard} />
        ))}
      </div>
    </div>
  );
}

function FilterSkeleton() {
  return (
    <div className={style.filterContainer}>
      <div className={style.skeletonFilter} />
    </div>
  );
}

function OptimizedProductSection({ initialData }: OptimizedProductSectionProps) {
  // State management
  const [displayedProducts, setDisplayedProducts] = useState<Product[]>(initialData?.data || []);
  const [totalProducts, setTotalProducts] = useState<number>(initialData?.pagination?.total || 0);
  
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedLetter, setSelectedLetter] = useState<string>('الكل');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(initialData?.pagination?.totalPages || 1);
  
  const [isLoading, setIsLoading] = useState(!initialData);
  const [error, setError] = useState<string | null>(null);
  
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [tempSelectedCategories, setTempSelectedCategories] = useState<string[]>([]);
  const [tempSelectedLetter, setTempSelectedLetter] = useState<string>('الكل');

  const mountedRef = useRef(true);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup
  useEffect(() => {
    return () => {
      mountedRef.current = false;
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  // Helper to check if "All" is selected
  const isAllLetter = useCallback((letter: string): boolean => {
    const normalizedLetter = letter.toLowerCase().trim();
    return normalizedLetter === 'all' || 
           normalizedLetter === 'الكل' || 
           normalizedLetter === 'كل';
  }, []);

  // Load products with pagination
  const loadProducts = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Build filters object
      const filters: any = {
        page: currentPage,
        limit: PRODUCTS_PER_PAGE,
      };

      // Add category filter
      if (selectedCategories.length > 0) {
        filters.category = selectedCategories.length === 1 
          ? selectedCategories[0] 
          : selectedCategories;
      }

      // Add search filter
      if (searchQuery.trim()) {
        filters.search = searchQuery.trim();
      }

      const response = await fetchAllProducts(filters);

      // console.log('Fetched Products:', response);
      
      if (!mountedRef.current) return;
      
      setDisplayedProducts(response.data);
      setTotalProducts(response.pagination?.total || 0);
      setTotalPages(response.pagination?.totalPages || 1);
      
    } catch (err: any) {
      if (!mountedRef.current) return;
      
      const errorMessage = err instanceof Error ? err.message : 'فشل في تحميل المنتجات';
      setError(errorMessage);
    } finally {
      if (mountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [currentPage, selectedCategories, searchQuery]);

  // Load products when filters or page changes
  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  // Client-side letter filtering (applied to already loaded products)
  const filteredProducts = useMemo(() => {
    if (!selectedLetter || isAllLetter(selectedLetter)) {
      return displayedProducts;
    }

    return displayedProducts.filter(product => {
      const firstChar = product.name?.charAt(0) || '';
      return firstChar === selectedLetter || 
             firstChar.toLowerCase() === selectedLetter.toLowerCase();
    });
  }, [displayedProducts, selectedLetter, isAllLetter]);

  // Filter handlers
  const handleCategoryFilter = useCallback((categories: string[] | null | undefined) => {
    setSelectedCategories(categories || []);
    setCurrentPage(1); // Reset to first page when category changes
  }, []);

  const handleLetterFilter = useCallback((letter: string | null | undefined) => {
    setSelectedLetter(letter || 'الكل');
  }, []);

  // Pagination handlers
  const handlePageChange = useCallback((page: number) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [currentPage, totalPages]);

  // Modal handlers
  const openFilterModal = useCallback(() => {
    setTempSelectedCategories([...selectedCategories]);
    setTempSelectedLetter(selectedLetter);
    setIsFilterModalOpen(true);
    document.body.style.overflow = 'hidden';
  }, [selectedCategories, selectedLetter]);

  const closeFilterModal = useCallback(() => {
    setIsFilterModalOpen(false);
    document.body.style.overflow = 'unset';
  }, []);

  const applyTempFilters = useCallback(() => {
    setSelectedCategories([...tempSelectedCategories]);
    setSelectedLetter(tempSelectedLetter);
    setCurrentPage(1); // Reset to first page when applying filters
    closeFilterModal();
  }, [tempSelectedCategories, tempSelectedLetter, closeFilterModal]);

  const handleTempCategoryFilter = useCallback((categories: string[] | null | undefined) => {
    setTempSelectedCategories(categories || []);
  }, []);

  const handleTempLetterFilter = useCallback((letter: string | null | undefined) => {
    setTempSelectedLetter(letter || 'الكل');
  }, []);

  // Clear all filters
  const clearAllFilters = useCallback(() => {
    setSelectedCategories([]);
    setSelectedLetter('الكل');
    setSearchQuery('');
    setCurrentPage(1);
    
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
  }, []);

  // Refresh data
  const refreshData = useCallback(() => {
    loadProducts();
  }, [loadProducts]);

  // Active filters count
  const activeFiltersCount = useMemo(() => 
    selectedCategories.length + 
    (!isAllLetter(selectedLetter) ? 1 : 0) + 
    (searchQuery.trim() ? 1 : 0),
    [selectedCategories.length, selectedLetter, searchQuery, isAllLetter]
  );

  // Loading state
  if (isLoading && displayedProducts.length === 0) {
    return (
      <div className={style.containerSection}>
        <div className={style.loadingContainer}>
          <div className={style.loader}></div>
          <p>جاري تحميل المنتجات...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error && displayedProducts.length === 0) {
    return (
      <div className={style.containerSection}>
        <div className={style.errorContainer}>
          <p className={style.errorMessage}>{error}</p>
          <div className={style.errorActions}>
            <Button 
              variant="primary" 
              size="md" 
              onClick={refreshData}
            >
              إعادة المحاولة
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Main render
  return (
    <div className={style.containerSection}>
      {/* Mobile Filter Button */}
      <div className={style.mobileFilterButton}>
        <Button 
          variant="custom" 
          size="md" 
          onClick={openFilterModal}
          rightIcon={<FilterIcon/>}
          rounded={true}
        >
          فيلتر 
        </Button>
        
        {activeFiltersCount > 0 && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={clearAllFilters}
          >
            مسح الفلاتر
          </Button>
        )}
      </div>

      {/* Products Display */}
      <div className={style.container}>
        <Suspense fallback={<ProductSliderSkeleton />}>
          <ProductSlider 
            products={filteredProducts} 
            isLoading={isLoading}
            error={error}
          />
        </Suspense>
        
        <Suspense fallback={<FilterSkeleton />}>
          <Filter 
            getByCategory={handleCategoryFilter} 
            getByLetter={handleLetterFilter}
            selectedCategories={selectedCategories}
            selectedLetter={selectedLetter}
          />
        </Suspense>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className={style.paginationContainer}>
          <div className={style.pageNumbers}>
            <div className={style.paginationInfo}>
              <span className={style.productsCount}>
                عرض {totalProducts} من إجمالي المنتجات
              </span>
            </div>

            <button
              className={`${style.pageNumber} ${style.arrowButton}`}
              disabled={currentPage === 1}
              onClick={() => handlePageChange(currentPage - 1)}
              aria-label="السابق"
            >
              ‹
            </button>

            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const pageNum = Math.max(1, currentPage - 2) + i;
              if (pageNum > totalPages) return null;
              
              return (
                <button
                  key={pageNum}
                  className={`${style.pageNumber} ${currentPage === pageNum ? style.active : ''}`}
                  onClick={() => handlePageChange(pageNum)}
                >
                  {pageNum}
                </button>
              );
            })}

            <button
              className={`${style.pageNumber} ${style.arrowButton}`}
              disabled={currentPage === totalPages}
              onClick={() => handlePageChange(currentPage + 1)}
              aria-label="التالي"
            >
              ›
            </button>
          </div>
        </div>
      )}

      {/* Mobile Filter Modal */}
      {isFilterModalOpen && (
        <div className={style.filterModal}>
          <div className={style.filterModalContent}>
            <div className={style.filterModalHeader}>
              <h3>الفلاتر</h3>
              <button onClick={closeFilterModal} className={style.closeModal}>×</button>
            </div>

            <div className={style.filterModalBody}>
              <Filter 
                getByCategory={handleTempCategoryFilter} 
                getByLetter={handleTempLetterFilter}
                selectedCategories={tempSelectedCategories}
                selectedLetter={tempSelectedLetter}
              />
            </div>

            <div className={style.filterModalFooter}>
              <Button 
                variant="outline" 
                size="lg" 
                fullWidth
                onClick={closeFilterModal}
              >
                إلغاء
              </Button>
              <Button 
                variant="primary" 
                size="lg" 
                fullWidth
                onClick={applyTempFilters}
              >
                حفظ التغيير
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default OptimizedProductSection;
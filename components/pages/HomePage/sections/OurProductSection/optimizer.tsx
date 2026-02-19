"use client";
import { useState, useEffect, useCallback, useMemo, useRef, memo } from 'react';
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

// Skeleton components (memoized for performance)
const ProductSliderSkeleton = memo(() => (
  <div className={style.sliderContainer}>
    <div className={style.skeletonGrid}>
      {[...Array(8)].map((_, i) => (
        <div key={i} className={style.skeletonCard} />
      ))}
    </div>
  </div>
));

const FilterSkeleton = memo(() => (
  <div className={style.filterContainer}>
    <div className={style.skeletonFilter} />
  </div>
));

function OptimizedProductSection({ initialData }: OptimizedProductSectionProps) {
  // State management
  const [displayedProducts, setDisplayedProducts] = useState<Product[]>(
    initialData?.data || []
  );
  const [totalProducts, setTotalProducts] = useState<number>(
    initialData?.pagination?.total || 0
  );
  
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedLetter, setSelectedLetter] = useState<string>('الكل');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(initialData?.pagination?.totalPages || 1);
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [tempSelectedCategories, setTempSelectedCategories] = useState<string[]>([]);
  const [tempSelectedLetter, setTempSelectedLetter] = useState<string>('الكل');

  const mountedRef = useRef(true);
  const abortControllerRef = useRef<AbortController | null>(null);
  const hasInitialData = useRef(!!initialData && initialData.data.length > 0);
  
  // 🔧 FIX: Track previous filter values to prevent unnecessary API calls
  const prevFiltersRef = useRef({
    categories: selectedCategories,
    page: currentPage,
    search: searchQuery
  });

  // Cleanup
  useEffect(() => {
    return () => {
      mountedRef.current = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
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

  // 🚀 OPTIMIZED: Load products with abort controller
  const loadProducts = useCallback(async () => {
    // 🔧 FIX: Skip if filters haven't actually changed
    const currentFilters = {
      categories: selectedCategories,
      page: currentPage,
      search: searchQuery
    };
    
    const filtersChanged = 
      JSON.stringify(currentFilters.categories.sort()) !== JSON.stringify(prevFiltersRef.current.categories.sort()) ||
      currentFilters.page !== prevFiltersRef.current.page ||
      currentFilters.search !== prevFiltersRef.current.search;
    
    if (!filtersChanged && !hasInitialData.current) {
      console.log('⏭️ Skipping API call - filters unchanged');
      return;
    }
    
    prevFiltersRef.current = currentFilters;

    // Cancel previous request if exists
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController();

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

      console.log('🔄 Loading products with filters:', filters);
      
      const response = await fetchAllProducts(filters, abortControllerRef.current.signal);

      // Check if component is still mounted
      if (!mountedRef.current) return;
      
      setDisplayedProducts(response.data);
      setTotalProducts(response.pagination?.total || 0);
      setTotalPages(response.pagination?.totalPages || 1);
      
      console.log('✅ Loaded', response.data.length, 'products');
      
    } catch (err: any) {
      // Ignore abort errors
      if (err.name === 'AbortError') {
        console.log('Request cancelled');
        return;
      }

      if (!mountedRef.current) return;
      
      const errorMessage = err instanceof Error ? err.message : 'فشل في تحميل المنتجات';
      setError(errorMessage);
      console.error('❌ Error loading products:', errorMessage);
    } finally {
      if (mountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [currentPage, selectedCategories, searchQuery]);

  // 🔧 FIX: Only load if filters changed or no initial data
  useEffect(() => {
    // Skip first load if we have initial data
    if (hasInitialData.current) {
      hasInitialData.current = false;
      console.log('✅ Using initial data, skipping first API call');
      return;
    }

    loadProducts();
  }, [loadProducts]);

  // Client-side letter filtering (applied to already loaded products)
  const filteredProducts = useMemo(() => {
    if (!selectedLetter || isAllLetter(selectedLetter)) {
      return displayedProducts;
    }

    const filtered = displayedProducts.filter(product => {
      const firstChar = product.name?.charAt(0) || '';
      return firstChar === selectedLetter || 
             firstChar.toLowerCase() === selectedLetter.toLowerCase();
    });
    
    console.log(`🔤 Letter filter "${selectedLetter}": ${filtered.length}/${displayedProducts.length} products`);
    return filtered;
  }, [displayedProducts, selectedLetter, isAllLetter]);

  // 🔧 FIX: Memoize and stabilize callback references
  const handleCategoryFilter = useCallback((categories: string[] | null | undefined) => {
    const newCategories = categories || [];
    
    // Only update if actually changed (deep comparison)
    const currentSorted = JSON.stringify([...selectedCategories].sort());
    const newSorted = JSON.stringify([...newCategories].sort());
    
    if (currentSorted !== newSorted) {
      console.log('📂 Category filter changed:', newCategories);
      setSelectedCategories(newCategories);
      setCurrentPage(1); // Reset to first page
    }
  }, [selectedCategories]);

  const handleLetterFilter = useCallback((letter: string | null | undefined) => {
    const newLetter = letter || 'الكل';
    if (newLetter !== selectedLetter) {
      console.log('🔤 Letter filter changed:', newLetter);
      setSelectedLetter(newLetter);
      // Note: Letter filtering is client-side, so no need to reset page
    }
  }, [selectedLetter]);

  // Pagination handlers
  const handlePageChange = useCallback((page: number) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      console.log('📄 Page changed:', page);
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [currentPage, totalPages]);

  // Modal handlers (memoized)
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
    console.log('✅ Applying modal filters');
    setSelectedCategories([...tempSelectedCategories]);
    setSelectedLetter(tempSelectedLetter);
    setCurrentPage(1);
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
    console.log('🗑️ Clearing all filters');
    setSelectedCategories([]);
    setSelectedLetter('الكل');
    setSearchQuery('');
    setCurrentPage(1);
  }, []);

  // Refresh data
  const refreshData = useCallback(() => {
    console.log('🔄 Refreshing data');
    hasInitialData.current = false; // Force reload
    prevFiltersRef.current = { categories: [], page: 1, search: '' }; // Reset filter tracking
    loadProducts();
  }, [loadProducts]);

  // Active filters count
  const activeFiltersCount = useMemo(() => {
    const count = selectedCategories.length + 
      (!isAllLetter(selectedLetter) ? 1 : 0) + 
      (searchQuery.trim() ? 1 : 0);
    return count;
  }, [selectedCategories.length, selectedLetter, searchQuery, isAllLetter]);

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
          تصفية  
        </Button>
        
        {activeFiltersCount > 0 && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={clearAllFilters}
              rounded={true}
          >
            إلغاء التصفية 
          </Button>
        )}
      </div>

      {/* Products Display */}
      <div className={style.container}>
        <ProductSlider 
          products={filteredProducts} 
          isLoading={isLoading}
          error={error}
        />
        
        <Filter 
          getByCategory={handleCategoryFilter} 
          getByLetter={handleLetterFilter}
          selectedCategories={selectedCategories}
          selectedLetter={selectedLetter}
          disabled={isLoading}
        />
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && !isLoading && (
        <div className={style.paginationContainer}>
          <div className={style.pageNumbers}>
            <div className={style.paginationInfo}>
              <span className={style.productsCount}>
                عرض {filteredProducts.length} من {totalProducts} منتج
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
              const pageNum = Math.max(1, Math.min(currentPage - 2, totalPages - 4)) + i;
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
        <div className={style.filterModal} onClick={closeFilterModal}>
          <div 
            className={style.filterModalContent} 
            onClick={(e) => e.stopPropagation()}
          >
            <div className={style.filterModalHeader}>
              <h3>الفلاتر</h3>
              <button 
                onClick={closeFilterModal} 
                className={style.closeModal}
                aria-label="إغلاق"
              >
                ×
              </button>
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

// Add display names for debugging
ProductSliderSkeleton.displayName = 'ProductSliderSkeleton';
FilterSkeleton.displayName = 'FilterSkeleton';
OptimizedProductSection.displayName = 'OptimizedProductSection';

export default OptimizedProductSection;
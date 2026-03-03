"use client";
import { useState, useEffect, useCallback, useMemo, useRef, memo } from 'react';
import dynamic from 'next/dynamic';
import { Button } from "@/components/UI/Buttons/Button";
import {
  fetchAllProducts,
  Product,
  ProductVariant,
  ProductsResponse,
  getProductAttributes,
  getVariantByAttributes,
} from '@/services/product/products';
import style from './Product.module.css';
import FilterIcon from '@/public/icons/Filter.svg';

// Lazy load heavy components
const ProductSlider = dynamic(() => import("@/components/UI/Product/ProductSlider"), {
  loading: () => <ProductSliderSkeleton />,
  ssr: false,
});

const Filter = dynamic(() => import("@/components/UI/Product/Filter"), {
  loading: () => <FilterSkeleton />,
  ssr: true,
});

interface OptimizedProductSectionProps {
  initialData?: ProductsResponse;
}

const PRODUCTS_PER_PAGE = 20;

// Skeleton components
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

  // NEW: Per-product selected variant tracking
  // Key: product id, Value: selected variant id
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});

  const mountedRef = useRef(true);
  const abortControllerRef = useRef<AbortController | null>(null);
  const hasInitialData = useRef(!!initialData && initialData.data.length > 0);

  const prevFiltersRef = useRef({
    categories: selectedCategories,
    page: currentPage,
    search: searchQuery,
  });

  // Cleanup
  useEffect(() => {
    return () => {
      mountedRef.current = false;
      if (abortControllerRef.current) abortControllerRef.current.abort();
    };
  }, []);

  const isAllLetter = useCallback((letter: string): boolean => {
    const n = letter.toLowerCase().trim();
    return n === 'all' || n === 'الكل' || n === 'كل';
  }, []);

  // Load products
  const loadProducts = useCallback(async () => {
    const currentFilters = {
      categories: selectedCategories,
      page: currentPage,
      search: searchQuery,
    };

    const filtersChanged =
      JSON.stringify([...currentFilters.categories].sort()) !==
        JSON.stringify([...prevFiltersRef.current.categories].sort()) ||
      currentFilters.page !== prevFiltersRef.current.page ||
      currentFilters.search !== prevFiltersRef.current.search;

    if (!filtersChanged && !hasInitialData.current) {
      console.log('⏭️ Skipping API call - filters unchanged');
      return;
    }

    prevFiltersRef.current = currentFilters;

    if (abortControllerRef.current) abortControllerRef.current.abort();
    abortControllerRef.current = new AbortController();

    try {
      setIsLoading(true);
      setError(null);

      const filters: any = {
        page: currentPage,
        limit: PRODUCTS_PER_PAGE,
      };

      if (selectedCategories.length > 0) {
        filters.category = selectedCategories.length === 1
          ? selectedCategories[0]
          : selectedCategories;
      }

      if (searchQuery.trim()) {
        filters.search = searchQuery.trim();
      }

      console.log('🔄 Loading products with filters:', filters);

      const response = await fetchAllProducts(filters, abortControllerRef.current.signal);

      if (!mountedRef.current) return;

      setDisplayedProducts(response.data);
      setTotalProducts(response.pagination?.total || 0);
      setTotalPages(response.pagination?.totalPages || 1);

      // NEW: Initialize default variant selections for products with variants
      const defaultVariants: Record<string, string> = {};
      response.data.forEach(product => {
        if (product.productVariants && product.productVariants.length > 0) {
          // Default to first available (in-stock) variant
          const firstAvailable = product.productVariants.find(v => v.totalQuantity > 0)
            || product.productVariants[0];
          if (firstAvailable) {
            defaultVariants[String(product.id)] = firstAvailable.id || firstAvailable._id;
          }
        }
      });
      setSelectedVariants(prev => ({ ...defaultVariants, ...prev }));

      console.log('✅ Loaded', response.data.length, 'products');

    } catch (err: any) {
      if (err.name === 'AbortError') {
        console.log('Request cancelled');
        return;
      }
      if (!mountedRef.current) return;
      setError(err instanceof Error ? err.message : 'فشل في تحميل المنتجات');
      console.error('❌ Error loading products:', err);
    } finally {
      if (mountedRef.current) setIsLoading(false);
    }
  }, [currentPage, selectedCategories, searchQuery]);

  useEffect(() => {
    if (hasInitialData.current) {
      hasInitialData.current = false;
      console.log('✅ Using initial data, skipping first API call');
      return;
    }
    loadProducts();
  }, [loadProducts]);

  // Client-side letter filtering
  const filteredProducts = useMemo(() => {
    if (!selectedLetter || isAllLetter(selectedLetter)) return displayedProducts;

    const filtered = displayedProducts.filter(product => {
      const firstChar = product.name?.charAt(0) || '';
      return firstChar === selectedLetter ||
        firstChar.toLowerCase() === selectedLetter.toLowerCase();
    });

    console.log(`🔤 Letter filter "${selectedLetter}": ${filtered.length}/${displayedProducts.length} products`);
    return filtered;
  }, [displayedProducts, selectedLetter, isAllLetter]);

  // NEW: Get effective price for a product (based on selected variant)
  const getEffectivePrice = useCallback((product: Product): number => {
    const selectedVariantId = selectedVariants[String(product.id)];
    if (!selectedVariantId || !product.productVariants) return product.price;

    const variant = product.productVariants.find(
      v => (v.id || v._id) === selectedVariantId
    );
    return variant?.price ?? product.price;
  }, [selectedVariants]);

  // NEW: Handle variant selection per product
  const handleVariantSelect = useCallback((productId: string | number, variantId: string) => {
    setSelectedVariants(prev => ({ ...prev, [String(productId)]: variantId }));
  }, []);

  // Filter handlers
  const handleCategoryFilter = useCallback((categories: string[] | null | undefined) => {
    const newCategories = categories || [];
    const currentSorted = JSON.stringify([...selectedCategories].sort());
    const newSorted = JSON.stringify([...newCategories].sort());
    if (currentSorted !== newSorted) {
      setSelectedCategories(newCategories);
      setCurrentPage(1);
    }
  }, [selectedCategories]);

  const handleLetterFilter = useCallback((letter: string | null | undefined) => {
    const newLetter = letter || 'الكل';
    if (newLetter !== selectedLetter) setSelectedLetter(newLetter);
  }, [selectedLetter]);

  const handlePageChange = useCallback((page: number) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [currentPage, totalPages]);

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
    setCurrentPage(1);
    closeFilterModal();
  }, [tempSelectedCategories, tempSelectedLetter, closeFilterModal]);

  const handleTempCategoryFilter = useCallback((categories: string[] | null | undefined) => {
    setTempSelectedCategories(categories || []);
  }, []);

  const handleTempLetterFilter = useCallback((letter: string | null | undefined) => {
    setTempSelectedLetter(letter || 'الكل');
  }, []);

  const clearAllFilters = useCallback(() => {
    setSelectedCategories([]);
    setSelectedLetter('الكل');
    setSearchQuery('');
    setCurrentPage(1);
  }, []);

  const refreshData = useCallback(() => {
    hasInitialData.current = false;
    prevFiltersRef.current = { categories: [], page: 1, search: '' };
    loadProducts();
  }, [loadProducts]);

  const activeFiltersCount = useMemo(() => {
    return (
      selectedCategories.length +
      (!isAllLetter(selectedLetter) ? 1 : 0) +
      (searchQuery.trim() ? 1 : 0)
    );
  }, [selectedCategories.length, selectedLetter, searchQuery, isAllLetter]);

  // NEW: Enrich products with effective prices before passing to children
  const enrichedProducts = useMemo(() => {
    return filteredProducts.map(product => ({
      ...product,
      price: getEffectivePrice(product),
    }));
  }, [filteredProducts, getEffectivePrice]);

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
            <Button variant="primary" size="md" onClick={refreshData}>
              إعادة المحاولة
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={style.containerSection}>
      {/* Mobile Filter Button */}
      <div className={style.mobileFilterButton}>
        <Button
          variant="custom"
          size="md"
          onClick={openFilterModal}
          rightIcon={<FilterIcon />}
          rounded={true}
        >
          تصفية
        </Button>

        {activeFiltersCount > 0 && (
          <Button variant="outline" size="sm" onClick={clearAllFilters} rounded={true}>
            إلغاء التصفية
          </Button>
        )}
      </div>

      {/* Products Display */}
      <div className={style.container}>
        <ProductSlider
          products={enrichedProducts}           // enriched with variant-aware prices
          isLoading={isLoading}
          error={error}
          selectedVariants={selectedVariants}   // pass down so cards can show active variant
          onVariantSelect={handleVariantSelect} // NEW prop for variant switching in cards
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
                عرض {enrichedProducts.length} من {totalProducts} منتج
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
            onClick={e => e.stopPropagation()}
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
              <Button variant="outline" size="lg" fullWidth onClick={closeFilterModal}>
                إلغاء
              </Button>
              <Button variant="primary" size="lg" fullWidth onClick={applyTempFilters}>
                حفظ التغيير
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

ProductSliderSkeleton.displayName = 'ProductSliderSkeleton';
FilterSkeleton.displayName = 'FilterSkeleton';
OptimizedProductSection.displayName = 'OptimizedProductSection';

export default OptimizedProductSection;
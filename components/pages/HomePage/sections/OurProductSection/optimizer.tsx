"use client";
import { useState, useEffect, useCallback, useMemo, useRef, memo } from 'react';
import dynamic from 'next/dynamic';
import { useParams } from 'next/navigation';
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

// Helper to get the default "All" label per locale
function getAllLabel(locale: string): string {
  return locale === 'ar' ? 'الكل' : 'All';
}

function OptimizedProductSection({ initialData }: OptimizedProductSectionProps) {
  // ✅ FIX 1: Read active locale from Next.js route params
  const params = useParams();
  const locale = (params?.locale as string) || 'ar';

  // ✅ FIX 2: Derive the "All" label from the current locale
  const allLabel = getAllLabel(locale);

  // State management
  const [displayedProducts, setDisplayedProducts] = useState<Product[]>(
    initialData?.data || []
  );
  const [totalProducts, setTotalProducts] = useState<number>(
    initialData?.pagination?.total || 0
  );

  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  // ✅ FIX 3: Use locale-aware default for letter state
  const [selectedLetter, setSelectedLetter] = useState<string>(allLabel);
  const [searchQuery, setSearchQuery] = useState('');

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(initialData?.pagination?.totalPages || 1);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [tempSelectedCategories, setTempSelectedCategories] = useState<string[]>([]);
  // ✅ FIX 3: Use locale-aware default for temp letter state
  const [tempSelectedLetter, setTempSelectedLetter] = useState<string>(allLabel);

  // Per-product selected variant tracking
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});

  const mountedRef = useRef(true);
  const abortControllerRef = useRef<AbortController | null>(null);
  const hasInitialData = useRef(!!initialData && initialData.data.length > 0);

  // ✅ FIX 4: Include locale in prevFiltersRef so changes are detected
  const prevFiltersRef = useRef({
    categories: selectedCategories,
    page: currentPage,
    search: searchQuery,
    locale: '',
  });

  // Cleanup — always pass a reason to abort() so React 18 Strict Mode
  // double-invoke doesn't throw "signal is aborted without reason"
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort('component unmounted');
        abortControllerRef.current = null;
      }
    };
  }, []);

  // ✅ FIX 5: Reset everything when locale changes so new language data is fetched
  useEffect(() => {
    const newAllLabel = getAllLabel(locale);
    hasInitialData.current = false;
    prevFiltersRef.current = { categories: [], page: 1, search: '', locale: '' };
    setCurrentPage(1);
    setSelectedCategories([]);
    setSelectedLetter(newAllLabel);
    setTempSelectedLetter(newAllLabel);
    setSelectedVariants({});
  }, [locale]);

  const isAllLetter = useCallback((letter: string): boolean => {
    const n = letter.toLowerCase().trim();
    return n === 'all' || n === 'الكل' || n === 'كل';
  }, []);

  // ✅ FIX 6: Pass locale to the API so the backend returns the right language
  const loadProducts = useCallback(async () => {
    const currentFilters = {
      categories: selectedCategories,
      page: currentPage,
      search: searchQuery,
      locale,
    };

    const filtersChanged =
      JSON.stringify([...currentFilters.categories].sort()) !==
        JSON.stringify([...prevFiltersRef.current.categories].sort()) ||
      currentFilters.page !== prevFiltersRef.current.page ||
      currentFilters.search !== prevFiltersRef.current.search ||
      // ✅ FIX 7: Detect locale change so a new fetch is triggered
      currentFilters.locale !== prevFiltersRef.current.locale;

    if (!filtersChanged && !hasInitialData.current) {
      return;
    }

    prevFiltersRef.current = currentFilters;

    if (abortControllerRef.current) {
      abortControllerRef.current.abort('new request started');
    }
    abortControllerRef.current = new AbortController();

    try {
      setIsLoading(true);
      setError(null);

      const filters: any = {
        page: currentPage,
        limit: PRODUCTS_PER_PAGE,
        // ✅ FIX 8: Send locale/lang so the DB returns translated products
        lang: locale,
        locale,
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

      // Initialize default variant selections for products with variants
      const defaultVariants: Record<string, string> = {};
      response.data.forEach(product => {
        if (product.productVariants && product.productVariants.length > 0) {
          const firstAvailable = product.productVariants.find(v => v.totalQuantity > 0)
            || product.productVariants[0];
          if (firstAvailable) {
            defaultVariants[String(product.id)] = firstAvailable.id || firstAvailable._id;
          }
        }
      });
      setSelectedVariants(prev => ({ ...defaultVariants, ...prev }));

      console.log('✅ Loaded', response.data.length, 'products for locale:', locale);

    } catch (err: any) {
      // Catch both named AbortError and reason-string aborts (React 18 Strict Mode)
      if (
        err.name === 'AbortError' ||
        err.message === 'component unmounted' ||
        err.message === 'new request started' ||
        abortControllerRef.current?.signal.aborted
      ) {
        return;
      }
      if (!mountedRef.current) return;
      setError(err instanceof Error ? err.message : 'فشل في تحميل المنتجات');
      console.error('❌ Error loading products:', err);
    } finally {
      if (mountedRef.current) setIsLoading(false);
    }
  // ✅ FIX 9: locale added to dependency array
  }, [currentPage, selectedCategories, searchQuery, locale]);

  useEffect(() => {
    if (hasInitialData.current) {
      hasInitialData.current = false;
      return;
    }
    loadProducts();
  }, [loadProducts]);

  // Client-side letter filtering
  const filteredProducts = useMemo(() => {
    if (!selectedLetter || isAllLetter(selectedLetter)) return displayedProducts;

    return displayedProducts.filter(product => {
      const firstChar = product.name?.charAt(0) || '';
      return firstChar === selectedLetter ||
        firstChar.toLowerCase() === selectedLetter.toLowerCase();
    });
  }, [displayedProducts, selectedLetter, isAllLetter]);

  // Get effective price for a product (based on selected variant)
  const getEffectivePrice = useCallback((product: Product): number => {
    const selectedVariantId = selectedVariants[String(product.id)];
    if (!selectedVariantId || !product.productVariants) return product.price;

    const variant = product.productVariants.find(
      v => (v.id || v._id) === selectedVariantId
    );
    return variant?.price ?? product.price;
  }, [selectedVariants]);

  // Handle variant selection per product
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
    const newLetter = letter || allLabel;
    if (newLetter !== selectedLetter) setSelectedLetter(newLetter);
  }, [selectedLetter, allLabel]);

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
    setTempSelectedLetter(letter || allLabel);
  }, [allLabel]);

  const clearAllFilters = useCallback(() => {
    setSelectedCategories([]);
    setSelectedLetter(allLabel);
    setSearchQuery('');
    setCurrentPage(1);
  }, [allLabel]);

  const refreshData = useCallback(() => {
    hasInitialData.current = false;
    prevFiltersRef.current = { categories: [], page: 1, search: '', locale: '' };
    loadProducts();
  }, [loadProducts]);

  const activeFiltersCount = useMemo(() => {
    return (
      selectedCategories.length +
      (!isAllLetter(selectedLetter) ? 1 : 0) +
      (searchQuery.trim() ? 1 : 0)
    );
  }, [selectedCategories.length, selectedLetter, searchQuery, isAllLetter]);

  // Enrich products with effective prices before passing to children
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
          products={enrichedProducts}
          isLoading={isLoading}
          error={error}
          selectedVariants={selectedVariants}
          onVariantSelect={handleVariantSelect}
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
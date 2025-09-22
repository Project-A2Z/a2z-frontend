"use client";
import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import ProductSlider from "@/components/UI/Product/ProductSlider";
import Filter from "@/components/UI/Product/Filter";
import { Button } from "@/components/UI/Buttons/Button"; 
import { 
  fetchProducts, 
  searchProducts,
  getByFirstLetter,
  Product,
  ProductFilters,
  ProductsResponse 
} from './../../../../services/product/products';
import style from './Product.module.css';
import FilterIcon from '@/public/icons/Filter.svg'; 

interface OptimizedProductSectionProps {
  initialData?: ProductsResponse;
}

// Cache for products to avoid repeated API calls
const productCache = new Map<string, { data: ProductsResponse; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export default function OptimizedProductSection({ initialData }: OptimizedProductSectionProps) {
  const [allProducts, setAllProducts] = useState<Product[]>(initialData?.data || []);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>(initialData?.data || []);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedLetter, setSelectedLetter] = useState<string>('كل');
  const [isLoading, setIsLoading] = useState(!initialData);
  const [error, setError] = useState<string | null>(null);
  
  // Mobile filter modal states
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [tempSelectedCategories, setTempSelectedCategories] = useState<string[]>([]);
  const [tempSelectedLetter, setTempSelectedLetter] = useState<string>('كل');

  // Pagination and search states
  const [currentPage, setCurrentPage] = useState(initialData?.pagination?.page || 1);
  const [totalPages, setTotalPages] = useState(initialData?.pagination?.totalPages || 1);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Refs for cleanup and debouncing
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const mountedRef = useRef(true);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false;
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // Generate cache key
  const getCacheKey = useCallback((filters: ProductFilters) => {
    return JSON.stringify({
      ...filters,
      search: searchQuery
    });
  }, [searchQuery]);

  // Check if cached data is still valid
  const getCachedData = useCallback((key: string): ProductsResponse | null => {
    const cached = productCache.get(key);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.data;
    }
    productCache.delete(key);
    return null;
  }, []);

  // Cache data
  const setCachedData = useCallback((key: string, data: ProductsResponse) => {
    productCache.set(key, { data, timestamp: Date.now() });
  }, []);

  // Optimized data loading with caching and error handling
  const loadFreshData = useCallback(async (filters: ProductFilters = {}) => {
    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    const abortController = new AbortController();
    abortControllerRef.current = abortController;
    
    try {
      setIsLoading(true);
      setError(null);
      
      const cacheKey = getCacheKey(filters);
      const cachedData = getCachedData(cacheKey);
      
      if (cachedData) {
        console.log('Using cached data');
        setAllProducts(cachedData.data || []);
        if (cachedData.pagination) {
          setTotalPages(cachedData.pagination.totalPages);
          setCurrentPage(cachedData.pagination.page);
        }
        setIsLoading(false);
        return;
      }

      // Add timeout and signal for request cancellation
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Request timeout')), 10000); // 10 second timeout
      });

      const apiPromise = searchQuery.trim() 
        ? searchProducts(searchQuery, { ...filters })
        : fetchProducts({ ...filters});
      
      const response = await Promise.race([apiPromise, timeoutPromise]) as ProductsResponse;
      
      // Check if component is still mounted
      if (!mountedRef.current) return;
      
      setCachedData(cacheKey, response);
      setAllProducts(response.data || []);
      
      if (response.pagination) {
        setTotalPages(response.pagination.totalPages);
        setCurrentPage(response.pagination.page);
      }
      
    } catch (err: any) {
      if (!mountedRef.current) return;
      
      if (err.name === 'AbortError') {
        console.log('Request was cancelled');
        return;
      }
      
      const errorMessage = err.message === 'Request timeout' 
        ? 'انتهت مهلة التحميل - يرجى المحاولة مرة أخرى' 
        : err instanceof Error ? err.message : 'فشل في تحميل المنتجات';
      
      setError(errorMessage);
      console.error('Error loading products:', err);
    } finally {
      if (mountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [searchQuery, getCacheKey, getCachedData, setCachedData]);

  // Initial load with retry mechanism
  useEffect(() => {
    if (!initialData) {
      let retryCount = 0;
      const maxRetries = 3;
      
      const loadWithRetry = async () => {
        try {
          await loadFreshData({ page: 1, limit: 20 });
        } catch (error) {
          if (retryCount < maxRetries) {
            retryCount++;
            console.log(`Retrying... Attempt ${retryCount}`);
            setTimeout(loadWithRetry, 1000 * retryCount); // Exponential backoff
          }
        }
      };
      
      loadWithRetry();
    }
  }, [initialData, loadFreshData]);

  // Memoized categories
  const availableCategories = useMemo(() => {
    const categories = new Set<string>();
    allProducts.forEach(product => {
      if (product.category) {
        categories.add(product.category);
      }
    });
    return Array.from(categories);
  }, [allProducts]);

  // Optimized client-side filtering with early returns
  const clientSideFiltered = useMemo(() => {
    if (!allProducts.length) return [];
    
    let filtered = allProducts;

    // Apply category filter first (usually most selective)
    if (selectedCategories.length > 0) {
      filtered = filtered.filter(product => 
        selectedCategories.some(category => 
          product.category === category || product.categoryId === category
        )
      );
    }

    // Apply letter filter
    if (selectedLetter && selectedLetter !== 'كل') {
      filtered = getByFirstLetter(selectedLetter, filtered);
    }

    // Apply search filter last (most expensive)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(product => {
        return (
          product.name?.toLowerCase().includes(query) ||
          product.nameAr?.toLowerCase().includes(query) ||
          product.description?.toLowerCase().includes(query) ||
          product.category?.toLowerCase().includes(query)
        );
      });
    }

    return filtered;
  }, [allProducts, selectedCategories, selectedLetter, searchQuery]);

  // Update filtered products
  useEffect(() => {
    setFilteredProducts(clientSideFiltered);
  }, [clientSideFiltered]);

  // Optimized category filter handler
  const handleCategoryFilter = useCallback((categories: string[] | null | undefined) => {
    const safeCategories = categories || [];
    setSelectedCategories(safeCategories);
    setCurrentPage(1);
    
    // Use client-side filtering for better performance unless dataset is huge
    if (allProducts.length > 500) {
      loadFreshData({ 
        category: safeCategories.length > 0 ? safeCategories : undefined,
        page: 1,
        limit: 20 
      });
    }
  }, [allProducts.length, loadFreshData]);

  // Letter filter (always client-side)
  const handleLetterFilter = useCallback((letter: string | null | undefined) => {
    setSelectedLetter(letter || 'كل');
  }, []);

  // Debounced search handler
  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    
    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    // For small datasets, search immediately client-side
    if (allProducts.length < 200 && !query.trim()) {
      setSelectedCategories([]);
      setCurrentPage(1);
      return;
    }
    
    // Debounce server-side search
    searchTimeoutRef.current = setTimeout(() => {
      setSelectedCategories([]);
      setCurrentPage(1);
      
      if (query.trim().length >= 2) { // Only search if query is meaningful
        loadFreshData({ page: 1, limit: 20 });
      } else if (!query.trim()) {
        // Clear search - reload all products
        loadFreshData({ page: 1, limit: 20 });
      }
    }, 500);
  }, [allProducts.length, loadFreshData]);

  // Pagination with preloading
  const handlePageChange = useCallback((page: number) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      loadFreshData({
        category: selectedCategories.length > 0 ? selectedCategories : undefined,
        page,
        limit: 20
      });
      
      // Smooth scroll to top
      window.scrollTo({ top: 0, behavior: 'smooth' });
      
      // Preload next page for better UX
      if (page < totalPages) {
        setTimeout(() => {
          const nextPageKey = getCacheKey({
            category: selectedCategories.length > 0 ? selectedCategories : undefined,
            page: page + 1,
            limit: 20
          });
          if (!getCachedData(nextPageKey)) {
            // Preload next page silently
            loadFreshData({
              category: selectedCategories.length > 0 ? selectedCategories : undefined,
              page: page + 1,
              limit: 20
            });
          }
        }, 1000);
      }
    }
  }, [currentPage, totalPages, selectedCategories, loadFreshData, getCacheKey, getCachedData]);

  // Modal handlers (unchanged but optimized)
  const handleTempCategoryFilter = useCallback((categories: string[] | null | undefined) => {
    setTempSelectedCategories(categories || []);
  }, []);

  const handleTempLetterFilter = useCallback((letter: string | null | undefined) => {
    setTempSelectedLetter(letter || 'كل');
  }, []);

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
    closeFilterModal();
  }, [tempSelectedCategories, tempSelectedLetter, closeFilterModal]);

  // Clear all filters
  const clearAllFilters = useCallback(() => {
    setSelectedCategories([]);
    setSelectedLetter('كل');
    setSearchQuery('');
    setCurrentPage(1);
    
    // Clear search timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    if (initialData) {
      setAllProducts(initialData.data || []);
      setTotalPages(initialData.pagination?.totalPages || 1);
    } else {
      loadFreshData({ page: 1, limit: 20 });
    }
  }, [initialData, loadFreshData]);

  // Refresh data
  const refreshData = useCallback(() => {
    // Clear cache for current filters
    const cacheKey = getCacheKey({
      category: selectedCategories.length > 0 ? selectedCategories : undefined,
      page: currentPage,
      limit: 20
    });
    productCache.delete(cacheKey);
    
    loadFreshData({ 
      category: selectedCategories.length > 0 ? selectedCategories : undefined,
      page: currentPage, 
      limit: 20 
    });
  }, [currentPage, selectedCategories, loadFreshData, getCacheKey]);

  // Active filters count
  const activeFiltersCount = useMemo(() => 
    selectedCategories.length + (selectedLetter !== 'كل' ? 1 : 0) + (searchQuery.trim() ? 1 : 0),
    [selectedCategories.length, selectedLetter, searchQuery]
  );

  // Enhanced loading component
  if (isLoading && allProducts.length === 0) {
    return (
      <div className={style.containerSection}>
        <div className={style.loadingContainer}>
          <div className={style.loader}></div>
          <p>جاري تحميل المنتجات...</p>
          <div className={style.loadingProgress}>
            <div className={style.progressBar}></div>
          </div>
        </div>
      </div>
    );
  }

  // Error component
  if (error && allProducts.length === 0) {
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
            <Button 
              variant="outline" 
              size="md" 
              onClick={() => {
                // Clear cache and try fresh
                productCache.clear();
                refreshData();
              }}
            >
              مسح الذاكرة المؤقتة
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
          rightIcon={<FilterIcon/>}
          rounded={true}
        >
          فيلتر ({activeFiltersCount})
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

        <Button 
          variant="outline" 
          size="sm" 
          onClick={refreshData}
          disabled={isLoading}
        >
          {isLoading ? 'تحديث...' : 'تحديث'}
        </Button>
      </div>

  

      <div className={style.container}>
        <ProductSlider 
          products={filteredProducts} 
          isLoading={isLoading && allProducts.length === 0}
          error={error}
        />
        <Filter 
          getByCategory={handleCategoryFilter} 
          getByLetter={handleLetterFilter}
          selectedCategories={selectedCategories}
          selectedLetter={selectedLetter}
        />
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className={style.paginationContainer}>
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage === 1 || isLoading}
            onClick={() => handlePageChange(currentPage - 1)}
          >
            السابق
          </Button>
          
          <span className={style.paginationInfo}>
            صفحة {currentPage} من {totalPages}
          </span>
          
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage === totalPages || isLoading}
            onClick={() => handlePageChange(currentPage + 1)}
          >
            التالي
          </Button>
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
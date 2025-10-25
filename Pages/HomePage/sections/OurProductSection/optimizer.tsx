"use client";
import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import ProductSlider from "@/components/UI/Product/ProductSlider";
import Filter from "@/components/UI/Product/Filter";
import { Button } from "@/components/UI/Buttons/Button"; 
import { 
  fetchAllProducts,
  paginateProducts,
  getByFirstLetter,
  Product,
  ProductsResponse 
} from '@/services/product/products';
import style from './Product.module.css';
import FilterIcon from '@/public/icons/Filter.svg'; 

interface OptimizedProductSectionProps {
  initialData?: ProductsResponse;
}

const PRODUCTS_PER_PAGE = 20;

function OptimizedProductSection({ initialData }: OptimizedProductSectionProps) {
  // All products (fetched once)
  const [allProducts, setAllProducts] = useState<Product[]>(initialData?.data || []);
  
  // Filtered products (after applying filters)
  const [filteredProducts, setFilteredProducts] = useState<Product[]>(initialData?.data || []);
  
  // Paginated products (current page display)
  const [displayedProducts, setDisplayedProducts] = useState<Product[]>([]);
  
  // Filter states
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedLetter, setSelectedLetter] = useState<string>('الكل');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // Loading and error states
  const [isLoading, setIsLoading] = useState(!initialData);
  const [error, setError] = useState<string | null>(null);
  
  // Mobile filter modal states
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [tempSelectedCategories, setTempSelectedCategories] = useState<string[]>([]);
  const [tempSelectedLetter, setTempSelectedLetter] = useState<string>('الكل');

  const mountedRef = useRef(true);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false;
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  // Helper function to check if "All" is selected
  const isAllLetter = useCallback((letter: string): boolean => {
    const normalizedLetter = letter.toLowerCase().trim();
    return normalizedLetter === 'all' || 
           normalizedLetter === 'الكل' || 
           normalizedLetter === 'كل';
  }, []);

  // ============================================
  // FETCH ALL PRODUCTS ONCE
  // ============================================
  const loadAllProducts = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('🔄 Loading all products...');
      const response = await fetchAllProducts();
      
      if (!mountedRef.current) return;
      
      console.log(`✅ Loaded ${response.data.length} products`);
      setAllProducts(response.data);
      
    } catch (err: any) {
      if (!mountedRef.current) return;
      
      const errorMessage = err instanceof Error ? err.message : 'فشل في تحميل المنتجات';
      setError(errorMessage);
      console.error('Error loading products:', err);
    } finally {
      if (mountedRef.current) {
        setIsLoading(false);
      }
    }
  }, []);

  // Initial load
  useEffect(() => {
    if (!initialData) {
      loadAllProducts();
    }
  }, [initialData, loadAllProducts]);

  // ============================================
  // AVAILABLE CATEGORIES
  // ============================================
  const availableCategories = useMemo(() => {
    const categories = new Set<string>();
    allProducts.forEach(product => {
      if (product.category) {
        categories.add(product.category);
      }
    });
    return Array.from(categories);
  }, [allProducts]);

  // ============================================
  // CLIENT-SIDE FILTERING
  // ============================================
  const applyFilters = useMemo(() => {
    if (!allProducts.length) return [];
    
    let filtered = allProducts;

    // Apply category filter
    if (selectedCategories.length > 0) {
      filtered = filtered.filter(product => 
        selectedCategories.some(category => 
          product.category === category || product.categoryId === category
        )
      );
    }

    // Apply letter filter - ONLY if it's not "All"/"الكل"
    if (selectedLetter && !isAllLetter(selectedLetter)) {
      filtered = getByFirstLetter(selectedLetter, filtered);
    }

    // Apply search filter
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
  }, [allProducts, selectedCategories, selectedLetter, searchQuery, isAllLetter]);

  // Update filtered products whenever filters change
  useEffect(() => {
    setFilteredProducts(applyFilters);
    setCurrentPage(1); // Reset to first page when filters change
  }, [applyFilters]);

  // ============================================
  // CLIENT-SIDE PAGINATION
  // ============================================
  useEffect(() => {
    const paginated = paginateProducts(filteredProducts, currentPage, PRODUCTS_PER_PAGE);
    setDisplayedProducts(paginated.data);
    setTotalPages(paginated.pagination?.totalPages || 1);
  }, [filteredProducts, currentPage]);

  // ============================================
  // FILTER HANDLERS
  // ============================================
  const handleCategoryFilter = useCallback((categories: string[] | null | undefined) => {
    setSelectedCategories(categories || []);
  }, []);

  const handleLetterFilter = useCallback((letter: string | null | undefined) => {
    // Store the letter as-is (including "All"/"الكل")
    setSelectedLetter(letter || 'الكل');
  }, []);

  // Debounced search
  const handleSearch = useCallback((query: string) => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    searchTimeoutRef.current = setTimeout(() => {
      setSearchQuery(query);
    }, 300);
  }, []);

  // ============================================
  // PAGINATION HANDLERS
  // ============================================
  const handlePageChange = useCallback((page: number) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [currentPage, totalPages]);

  const goToFirstPage = useCallback(() => handlePageChange(1), [handlePageChange]);
  const goToLastPage = useCallback(() => handlePageChange(totalPages), [handlePageChange, totalPages]);

  // ============================================
  // MODAL HANDLERS
  // ============================================
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

  const handleTempCategoryFilter = useCallback((categories: string[] | null | undefined) => {
    setTempSelectedCategories(categories || []);
  }, []);

  const handleTempLetterFilter = useCallback((letter: string | null | undefined) => {
    setTempSelectedLetter(letter || 'الكل');
  }, []);

  // ============================================
  // CLEAR FILTERS
  // ============================================
  const clearAllFilters = useCallback(() => {
    setSelectedCategories([]);
    setSelectedLetter('الكل');
    setSearchQuery('');
    setCurrentPage(1);
    
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
  }, []);

  // ============================================
  // REFRESH DATA
  // ============================================
  const refreshData = useCallback(() => {
    loadAllProducts();
  }, [loadAllProducts]);

  // Active filters count - don't count "All" as an active filter
  const activeFiltersCount = useMemo(() => 
    selectedCategories.length + 
    (!isAllLetter(selectedLetter) ? 1 : 0) + 
    (searchQuery.trim() ? 1 : 0),
    [selectedCategories.length, selectedLetter, searchQuery, isAllLetter]
  );

  // ============================================
  // LOADING STATE
  // ============================================
  if (isLoading && allProducts.length === 0) {
    return (
      <div className={style.containerSection}>
        <div className={style.loadingContainer}>
          <div className={style.loader}></div>
          <p>جاري تحميل المنتجات...</p>
        </div>
      </div>
    );
  }

  // ============================================
  // ERROR STATE
  // ============================================
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
          </div>
        </div>
      </div>
    );
  }

  // ============================================
  // MAIN RENDER
  // ============================================
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
      </div>

      {/* Products Display */}
      <div className={style.container}>
        <ProductSlider 
          products={displayedProducts} 
          isLoading={isLoading}
          error={error}
        />
        <Filter 
          getByCategory={handleCategoryFilter} 
          getByLetter={handleLetterFilter}
          selectedCategories={selectedCategories}
          selectedLetter={selectedLetter}
        />
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className={style.paginationContainer}>
          {/* Page Numbers */}
          <div className={style.pageNumbers}>
             {/* Products Count Info */}
            <div className={style.paginationInfo}>
              <span className={style.productsCount}>
                عرض {filteredProducts.length} من إجمالي المنتجات
              </span>
            </div>

            {/* Previous Page Arrow */}
            <button
              className={`${style.pageNumber} ${style.arrowButton}`}
              disabled={currentPage === 1}
              onClick={() => handlePageChange(currentPage - 1)}
              aria-label="السابق"
            >
              ‹
            </button>

            {/* Page Number Buttons */}
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

            {/* Next Page Arrow */}
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
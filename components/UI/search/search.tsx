"use client";
import React, { useState, useEffect, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";

// Styles
import styles from "@/components/UI/search/search.module.css";

// Icons
import SearchIcon from "@/public/icons/Search.svg";

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  inStock: boolean;
  img: any; // or string if it's a URL
}

interface SearchComponentProps {
  data: Product[];
  isModal?: boolean;
  onClose?: () => void;
  onProductSelect?: (product: Product) => void; // Added callback for product selection
}

const SearchComponent: React.FC<SearchComponentProps> = ({
  data = [],
  isModal = false,
  onClose,
  onProductSelect,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredResults, setFilteredResults] = useState<Product[]>([]);
  const [showResults, setShowResults] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Sample data for demonstration - memoized to prevent recreation on every render
  // const sampleData: Product[] = useMemo(() => [
  //   { name: 'زنك كبريتات (1 كجم)', category: 'كيميائيات مبيدات', price: 150.00, status: true, img: null },
  //   { name: 'نحاس كبريتات (500 جم)', category: 'كيميائيات مبيدات', price: 85.00, status: true, img: null },
  //   { name: 'مبيد حشري طبيعي', category: 'مبيدات حشرية', price: 120.00, status: true, img: null },
  //   { name: 'سماد عضوي (5 كجم)', category: 'أسمدة', price: 200.00, status: true, img: null },
  //   { name: 'بذور طماطم هجين', category: 'بذور', price: 45.00, status: true, img: null },
  //   { name: 'أدوات تقليم', category: 'أدوات زراعية', price: 75.00, status: false, img: null },
  //   { name: 'خرطوم ري (25 متر)', category: 'معدات الري', price: 95.00, status: true, img: null },
  //   { name: 'تربة زراعية مخصبة', category: 'تربة ومواد نمو', price: 65.00, status: true, img: null }
  // ], []);

  // Memoize searchData to prevent infinite re-renders
  // const searchData = useMemo(() => {
  //   return data.length > 0 ? data : sampleData;
  // }, [data, sampleData]);

  // Popular searches based on your product categories - memoized
  const popularSearches = useMemo(
    () => ["مبيدات", "أسمدة", "بذور", "أدوات زراعية", "معدات الري"],
    []
  );

  // console.log("Search Component Data:", data);

  // Filter results based on search term
  useEffect(() => {
    if (searchTerm.trim()) {
      const filtered = data.filter(
        (product) =>
          product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredResults(filtered);
      setShowResults(true);
      //console.log("Filtered results:", filtered);
    } else {
      setFilteredResults([]);
      setShowResults(false);
    }
  }, [searchTerm, data]);

  // Focus input when modal opens
  useEffect(() => {
    if (isModal && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isModal]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    //console.log("Searching for:", searchTerm);
    // Add your search logic here
  };

  const handleResultClick = (product: Product) => {
    //console.log("Selected product:", product);
    setSearchTerm(product.name);
    setShowResults(false);


    // Call the product selection callback if provided
    if (onProductSelect) {
      onProductSelect(product);
    }

    if (onClose) onClose();
    setSearchTerm("");
    router.push(`/product/${product.id}`);

  };

  const handlePopularSearchClick = (term: string) => {
    setSearchTerm(term);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleClose = () => {
    setSearchTerm("");
    setShowResults(false);
    if (onClose) onClose();
  };

  // Format price helper function - memoized with useCallback would be even better
  const formatPrice = (price: number) => {
    return `${price.toFixed(2)} جنيه`;
  };

  // Regular search component (for header)
  if (!isModal) {
    return (
      <form onSubmit={handleSearch} className={styles.searchForm}>
        <div className={styles.searchContainer}>
          <input
            ref={inputRef}
            type="text"
            placeholder="بحث"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
            dir="rtl"
          />
          <SearchIcon className={styles.searchIcon} />

          {/* Dropdown results for regular search */}
          {showResults && (
            <div className={styles.searchDropdown}>
              {filteredResults.length > 0 ? (
                filteredResults.map((product, index) => (
                  <div
                    key={`${product.name}-${index}`}
                    className={`${styles.searchResultItem} ${
                      !product.inStock ? styles.outOfStock : ""
                    }`}
                    onClick={() =>
                      {
                        handleResultClick(product)
                        //console.log("Clicked product:", product);
                      }
                    }
                  >
                    <div>
                      <div className={styles.resultTitle}>
                        {product.name}
                        {!product.inStock && (
                          <span className={styles.outOfStockBadge}>
                            {" "}
                            {product.inStock}
                          </span>
                        )}
                      </div>
                      <div className={styles.resultCategory}>
                        {product.category}
                      </div>
                      <div className={styles.resultPrice}>
                        {formatPrice(product.price)}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className={styles.noResults}>
                  لا توجد نتائج للبحث "{searchTerm}"
                </div>
              )}
            </div>
          )}
        </div>
      </form>
    );
  }

  // Full-screen modal search
  return (
    <div className={`${styles.searchModal} ${isModal ? styles.active : ""}`}>
      <div className={styles.searchModalHeader}>
        <h2 className={styles.searchModalTitle}>البحث</h2>
        <button
          className={styles.closeButton}
          onClick={handleClose}
          type="button"
        >
          ✕
        </button>
      </div>

      <div className={styles.searchModalContent}>
        <form onSubmit={handleSearch} className={styles.searchForm}>
          <div className={styles.searchContainer}>
            <input
              ref={inputRef}
              type="text"
              placeholder="ابحث عن المنتجات الزراعية..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={styles.searchInput}
              dir="rtl"
            />
            <SearchIcon className={styles.searchIcon} />
          </div>
        </form>

        {/* Search Results */}
        {showResults && (
          <div className={styles.searchResults}>
            {filteredResults.length > 0 ? (
              filteredResults.map((product, index) => (
                <div
                  key={`${product.name}-${index}`}
                  className={`${styles.searchResultItem} ${
                    !product.inStock ? styles.outOfStock : ""
                  }`}
                  onClick={() => product.inStock && handleResultClick(product)}
                >
                  <div>
                    <div className={styles.resultTitle}>
                      {product.name}
                      {!product.inStock && (
                        <span className={styles.outOfStockBadge}>
                          {" "}
                          - غير متوفر
                        </span>
                      )}
                    </div>
                    <div className={styles.resultCategory}>
                      {product.category}
                    </div>
                    <div className={styles.resultPrice}>
                      {formatPrice(product.price)}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className={styles.noResults}>
                لا توجد نتائج للبحث "{searchTerm}"
              </div>
            )}
          </div>
        )}

        {/* Popular Searches - shown when no search term */}
        {!searchTerm && (
          <div className={styles.popularSearches}>
            <h3 className={styles.popularSearchesTitle}>البحث الشائع</h3>
            <div>
              {popularSearches.map((term, index) => (
                <span
                  key={index}
                  className={styles.popularTag}
                  onClick={() => handlePopularSearchClick(term)}
                >
                  {term}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchComponent;
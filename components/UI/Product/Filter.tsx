'use client';
import React, { useState, useEffect, memo, useCallback, useRef } from 'react';
import { fetchCategories } from '@/services/product/categories';
import { useTranslations } from 'next-intl';

//styles
import styles from '@/components/UI/Product/Filter.module.css';

interface FilterProps {
  getByCategory: (categories: string[]) => void;
  getByLetter: (letter: string) => void;
  selectedCategories?: string[];
  selectedLetter?: string;
  initialCategories?: string[];
  initialLetter?: string;
  disabled?: boolean;
}

// Helper function to format category name for display
const formatCategoryName = (categoryName: string): string => {
  if (categoryName.includes(' ')) {
    return categoryName;
  }
  
  return categoryName
    .replace(/[-_]/g, ' ')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

// 🚀 OPTIMIZATION: Memoize category item to prevent unnecessary re-renders
const CategoryItem = memo(({ 
  category, 
  checked, 
  onChange, 
  disabled 
}: {
  category: { id: string; label: string };
  checked: boolean;
  onChange: () => void;
  disabled: boolean;
}) => (
  <label
    className={`${styles.categoryItem} ${disabled ? styles.disabledItem : ''}`}
  >
    <span className={styles.categoryLabel}>
      {category.label}
    </span>
    <input
      type="checkbox"
      checked={checked}
      onChange={onChange}
      className={styles.checkbox}
      disabled={disabled}
    />
  </label>
));

CategoryItem.displayName = 'CategoryItem';

// 🚀 OPTIMIZATION: Memoize letter button to prevent unnecessary re-renders
const LetterButton = memo(({ 
  letter, 
  isActive, 
  isAll, 
  disabled, 
  onClick 
}: {
  letter: string;
  isActive: boolean;
  isAll: boolean;
  disabled: boolean;
  onClick: () => void;
}) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`
      ${styles.letterButton}
      ${isActive ? styles.active : ''}
      ${isAll ? styles.all : ''}
      ${disabled ? styles.disabledButton : ''}
    `}
  >
    {letter}
  </button>
));

LetterButton.displayName = 'LetterButton';

function Filter({ 
  getByCategory, 
  getByLetter,
  selectedCategories: propSelectedCategories,
  selectedLetter: propSelectedLetter,
  initialCategories,
  initialLetter,
  disabled = false
}: FilterProps) {
  const t = useTranslations('products');

  // Detect current language
  const [currentLanguage, setCurrentLanguage] = useState<'ar' | 'en'>('ar');

  // Dynamic categories from API
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);
  const [isCategoriesLoading, setIsCategoriesLoading] = useState(true);
  const [categoriesError, setCategoriesError] = useState<string | null>(null);

  // 🔧 FIX: Use refs to prevent infinite loops
  const isInitialMount = useRef(true);
  const prevSelectedCategories = useRef<string[]>(propSelectedCategories || initialCategories || []);
  const prevSelectedLetter = useRef<string>(propSelectedLetter || initialLetter || t('all'));

  // Internal state - only use when props are not controlled
  const [internalSelectedCategories, setInternalSelectedCategories] = useState<string[]>(
    propSelectedCategories || initialCategories || []
  );
  const [internalSelectedLetter, setInternalSelectedLetter] = useState<string>(
    propSelectedLetter || initialLetter || t('all')
  );

  // 🔧 FIX: Use controlled state when props exist, otherwise use internal state
  const selectedCategories = propSelectedCategories !== undefined 
    ? propSelectedCategories 
    : internalSelectedCategories;
  
  const selectedLetter = propSelectedLetter !== undefined 
    ? propSelectedLetter 
    : internalSelectedLetter;

  // ============================================
  // 🚀 OPTIMIZED: Language detection with custom event
  // ============================================
  useEffect(() => {
    // Detect language once on mount
    const savedLang = localStorage.getItem('selectedLanguage');
    const htmlLang = document.documentElement.lang;
    const detectedLang = savedLang || htmlLang || 'ar';
    setCurrentLanguage(detectedLang === 'ar' ? 'ar' : 'en');

    // Listen for language changes via custom event
    const handleLangChange = (e: CustomEvent) => {
      setCurrentLanguage(e.detail.language === 'ar' ? 'ar' : 'en');
    };

    // @ts-ignore
    window.addEventListener('languageChange', handleLangChange);
    
    // Also listen to storage changes as fallback
    const handleStorageChange = () => {
      const newLang = localStorage.getItem('selectedLanguage');
      if (newLang) {
        setCurrentLanguage(newLang === 'ar' ? 'ar' : 'en');
      }
    };
    
    window.addEventListener('storage', handleStorageChange);

    return () => {
      // @ts-ignore
      window.removeEventListener('languageChange', handleLangChange);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // ============================================
  // 🔧 FIX: Load categories unconditionally
  // ============================================
  useEffect(() => {
    const loadCategories = async () => {
      try {
        setIsCategoriesLoading(true);
        setCategoriesError(null);
        
        //console.log('🔄 Loading categories...');
        
        // 🔧 FIX: Always fetch categories, not conditionally
        const categories = await fetchCategories();
        //console.log('✅ Categories loaded:', categories);
        setAvailableCategories(categories);
        
      } catch (error) {
        console.error('❌ Error loading categories:', error);
        setCategoriesError(error instanceof Error ? error.message : 'Failed to load categories');
        setAvailableCategories([]);
      } finally {
        setIsCategoriesLoading(false);
      }
    };

    loadCategories();
  }, []); // Only run once on mount

  // 🔧 FIX: Only sync props to internal state if they actually changed
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    if (propSelectedCategories !== undefined) {
      const currentCats = JSON.stringify([...propSelectedCategories].sort());
      const prevCats = JSON.stringify([...prevSelectedCategories.current].sort());
      
      if (currentCats !== prevCats) {
        prevSelectedCategories.current = propSelectedCategories;
        setInternalSelectedCategories(propSelectedCategories);
      }
    }
  }, [propSelectedCategories]);

  useEffect(() => {
    if (isInitialMount.current) {
      return;
    }

    if (propSelectedLetter !== undefined && propSelectedLetter !== prevSelectedLetter.current) {
      prevSelectedLetter.current = propSelectedLetter;
      setInternalSelectedLetter(propSelectedLetter);
    }
  }, [propSelectedLetter]);

  // Transform categories for display (memoized)
  const categories = React.useMemo(() => 
    availableCategories.map(categoryName => ({
      id: categoryName,
      label: formatCategoryName(categoryName)
    })),
    [availableCategories]
  );

  // Bilingual letters (memoized)
  const letters = React.useMemo(() => {
    const arabicLetters = [
      'الكل', 'أ', 'ب', 'ت', 'ث', 'ج', 'ح', 'خ', 'د', 'ذ',
      'ر', 'ز', 'س', 'ش', 'ص', 'ض', 'ط', 'ظ', 'ع', 'غ',
      'ف', 'ق', 'ك', 'ل', 'م', 'ن', 'ه', 'و', 'ي', 'ى'
    ];

    const englishLetters = [
      'All', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I',
      'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S',
      'T', 'U', 'V', 'W', 'X', 'Y', 'Z'
    ];

    return currentLanguage === 'ar' ? arabicLetters : englishLetters;
  }, [currentLanguage]);

  // Bilingual text (memoized)
  const table = React.useMemo(() => {
    const text = {
      ar: {
        activeFilters: 'فلاتر نشطة',
        clearAll: 'مسح الكل',
        type: 'النوع',
        selected: 'مُحدد',
        letter: 'الحرف',
        selectedLetter: 'الحرف المُحدد',
        showingAll: 'عرض جميع المنتجات',
        loading: 'جاري التحميل...',
        error: 'خطأ في تحميل الفئات',
        retry: 'إعادة المحاولة'
      },
      en: {
        activeFilters: 'Active Filters',
        clearAll: 'Clear All',
        type: 'Type',
        selected: 'Selected',
        letter: 'Letter',
        selectedLetter: 'Selected Letter',
        showingAll: 'Showing All Products',
        loading: 'Loading...',
        error: 'Error loading categories',
        retry: 'Retry'
      }
    };
    return text[currentLanguage];
  }, [currentLanguage]);

  // Helper function to check if "All" is selected
  const isAllLetter = useCallback((letter: string): boolean => {
    const normalizedLetter = letter.toLowerCase().trim();
    return normalizedLetter === 'all' || 
           normalizedLetter === 'الكل' || 
           normalizedLetter === 'كل';
  }, []);

  // 🔧 FIX: Debounced change handlers to prevent rapid updates
  const categoryChangeTimeout = useRef<NodeJS.Timeout | null>(null);
  
  const handleCategoryChange = useCallback((categoryId: string) => {
    if (disabled) return;

    const currentCategories = propSelectedCategories !== undefined 
      ? propSelectedCategories 
      : internalSelectedCategories;

    const updatedCategories = currentCategories.includes(categoryId)
      ? currentCategories.filter(id => id !== categoryId)
      : [...currentCategories, categoryId];
    
    // Update internal state immediately for UI responsiveness
    if (propSelectedCategories === undefined) {
      setInternalSelectedCategories(updatedCategories);
    }
    
    // 🔧 FIX: Debounce parent callback to prevent rapid API calls
    if (categoryChangeTimeout.current) {
      clearTimeout(categoryChangeTimeout.current);
    }
    
    categoryChangeTimeout.current = setTimeout(() => {
      getByCategory(updatedCategories);
    }, 300); // 300ms debounce
    
  }, [disabled, propSelectedCategories, internalSelectedCategories, getByCategory]);

  const handleLetterClick = useCallback((letter: string) => {
    if (disabled) return;

    // Update internal state immediately
    if (propSelectedLetter === undefined) {
      setInternalSelectedLetter(letter);
    }
    
    // Call parent callback
    getByLetter(letter);
  }, [disabled, propSelectedLetter, getByLetter]);

  const clearAllFilters = useCallback(() => {
    if (disabled) return;

    const allLabel = currentLanguage === 'ar' ? 'الكل' : 'All';
    
    if (propSelectedCategories === undefined) {
      setInternalSelectedCategories([]);
    }
    if (propSelectedLetter === undefined) {
      setInternalSelectedLetter(allLabel);
    }
    
    getByCategory([]);
    getByLetter(allLabel);
  }, [disabled, currentLanguage, propSelectedCategories, propSelectedLetter, getByCategory, getByLetter]);

  const retryLoadCategories = useCallback(async () => {
    try {
      setIsCategoriesLoading(true);
      setCategoriesError(null);
      
      const categories = await fetchCategories();
      setAvailableCategories(categories);
    } catch (error) {
      setCategoriesError(error instanceof Error ? error.message : 'Failed to load categories');
    } finally {
      setIsCategoriesLoading(false);
    }
  }, []);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (categoryChangeTimeout.current) {
        clearTimeout(categoryChangeTimeout.current);
      }
    };
  }, []);

  const isAllSelected = isAllLetter(selectedLetter);

  return (
    <div className={`${styles.filterContainer} ${disabled ? styles.disabled : ''}`}>
      {/* Categories Section */}
      <div className={styles.categoriesSection}>
        <h2 className={styles.sectionTitle}>{table.type}</h2>

        {/* Loading State */}
        {isCategoriesLoading && (
          <div className={styles.loadingState}>
            <div className={styles.loadingSpinner}></div>
            <p>{table.loading}</p>
          </div>
        )}

        {/* Error State */}
        {categoriesError && !isCategoriesLoading && (
          <div className={styles.errorState}>
            <p className={styles.errorMessage}>{table.error}</p>
            <button 
              onClick={retryLoadCategories} 
              className={styles.retryButton}
            >
              {table.retry}
            </button>
          </div>
        )}

        {/* Categories List */}
        {!isCategoriesLoading && !categoriesError && (
          <div className={styles.categoriesList}>
            {categories.length === 0 ? (
              <p className={styles.noCategories}>{t('emptyFilter')}</p>
            ) : (
              categories.map((category) => (
                <CategoryItem
                  key={category.id}
                  category={category}
                  checked={selectedCategories.includes(category.id)}
                  onChange={() => handleCategoryChange(category.id)}
                  disabled={disabled}
                />
              ))
            )}
          </div>
        )}
      </div>

      {/* Letters Section */}
      <div className={styles.lettersSection}>
        <h2 className={styles.sectionTitle}>{table.letter}</h2>
        <div className={styles.lettersGrid}>
          {letters.map((letter) => {
            const isActive = 
              isAllLetter(letter) && isAllLetter(selectedLetter)
                ? true 
                : selectedLetter === letter;
            
            return (
              <LetterButton
                key={letter}
                letter={letter}
                isActive={isActive}
                isAll={isAllLetter(letter)}
                disabled={disabled}
                onClick={() => handleLetterClick(letter)}
              />
            );
          })}
        </div>
      </div>

      {/* Loading state overlay */}
      {disabled && (
        <div className={styles.loadingOverlay}>
          <div className={styles.loadingSpinner}></div>
        </div>
      )}
    </div>
  );
}

export default memo(Filter);
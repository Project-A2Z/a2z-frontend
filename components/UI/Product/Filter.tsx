'use client';
import React, { useState, useEffect, memo, useCallback, useRef } from 'react';
import { fetchCategories } from '@/services/product/categories';
import { useTranslations, useLocale } from 'next-intl';

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
  <label className={`${styles.categoryItem} ${disabled ? styles.disabledItem : ''}`}>
    <span className={styles.categoryLabel}>{category.label}</span>
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
  const locale = useLocale(); // ← single source of truth for language
  const currentLanguage = locale === 'ar' ? 'ar' : 'en'; // ← derived, never stale

  const allLabel = currentLanguage === 'ar' ? 'الكل' : 'All';

  const [availableCategories, setAvailableCategories] = useState<string[]>([]);
  const [isCategoriesLoading, setIsCategoriesLoading] = useState(true);
  const [categoriesError, setCategoriesError] = useState<string | null>(null);

  const isInitialMount = useRef(true);
  const prevSelectedCategories = useRef<string[]>(propSelectedCategories || initialCategories || []);
  const prevSelectedLetter = useRef<string>(propSelectedLetter || initialLetter || allLabel);

  const [internalSelectedCategories, setInternalSelectedCategories] = useState<string[]>(
    propSelectedCategories || initialCategories || []
  );
  const [internalSelectedLetter, setInternalSelectedLetter] = useState<string>(
    propSelectedLetter || initialLetter || allLabel // ← correct label from start
  );

  const selectedCategories = propSelectedCategories !== undefined
    ? propSelectedCategories
    : internalSelectedCategories;

  const selectedLetter = propSelectedLetter !== undefined
    ? propSelectedLetter
    : internalSelectedLetter;

  // Load categories once on mount
  useEffect(() => {
    const loadCategories = async () => {
      try {
        setIsCategoriesLoading(true);
        setCategoriesError(null);
        const categories = await fetchCategories();
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
  }, []);

  // Sync prop changes to internal state
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
    if (isInitialMount.current) return;
    if (propSelectedLetter !== undefined && propSelectedLetter !== prevSelectedLetter.current) {
      prevSelectedLetter.current = propSelectedLetter;
      setInternalSelectedLetter(propSelectedLetter);
    }
  }, [propSelectedLetter]);

  const categories = React.useMemo(() =>
    availableCategories.map(categoryName => ({
      id: categoryName,
      label: formatCategoryName(categoryName)
    })),
    [availableCategories]
  );

  // Letters derived directly from locale — always correct, no async delay
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

  const table = React.useMemo(() => ({
    ar: {
      activeFilters: 'فلاتر نشطة', clearAll: 'مسح الكل', type: 'النوع',
      selected: 'مُحدد', letter: 'الحرف', selectedLetter: 'الحرف المُحدد',
      showingAll: 'عرض جميع المنتجات', loading: 'جاري التحميل...',
      error: 'خطأ في تحميل الفئات', retry: 'إعادة المحاولة'
    },
    en: {
      activeFilters: 'Active Filters', clearAll: 'Clear All', type: 'Type',
      selected: 'Selected', letter: 'Letter', selectedLetter: 'Selected Letter',
      showingAll: 'Showing All Products', loading: 'Loading...',
      error: 'Error loading categories', retry: 'Retry'
    }
  }[currentLanguage]), [currentLanguage]);

  const isAllLetter = useCallback((letter: string): boolean => {
    const normalized = letter.toLowerCase().trim();
    return normalized === 'all' || normalized === 'الكل' || normalized === 'كل';
  }, []);

  const categoryChangeTimeout = useRef<NodeJS.Timeout | null>(null);

  const handleCategoryChange = useCallback((categoryId: string) => {
    if (disabled) return;
    const current = propSelectedCategories !== undefined
      ? propSelectedCategories
      : internalSelectedCategories;

    const updated = current.includes(categoryId)
      ? current.filter(id => id !== categoryId)
      : [...current, categoryId];

    if (propSelectedCategories === undefined) setInternalSelectedCategories(updated);

    if (categoryChangeTimeout.current) clearTimeout(categoryChangeTimeout.current);
    categoryChangeTimeout.current = setTimeout(() => getByCategory(updated), 300);
  }, [disabled, propSelectedCategories, internalSelectedCategories, getByCategory]);

  const handleLetterClick = useCallback((letter: string) => {
    if (disabled) return;
    if (propSelectedLetter === undefined) setInternalSelectedLetter(letter);
    getByLetter(letter);
  }, [disabled, propSelectedLetter, getByLetter]);

  const clearAllFilters = useCallback(() => {
    if (disabled) return;
    if (propSelectedCategories === undefined) setInternalSelectedCategories([]);
    if (propSelectedLetter === undefined) setInternalSelectedLetter(allLabel);
    getByCategory([]);
    getByLetter(allLabel);
  }, [disabled, allLabel, propSelectedCategories, propSelectedLetter, getByCategory, getByLetter]);

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

  useEffect(() => {
    return () => {
      if (categoryChangeTimeout.current) clearTimeout(categoryChangeTimeout.current);
    };
  }, []);

  // const isAllSelected = isAllLetter(selectedLetter);

  return (
    <div className={`${styles.filterContainer} ${disabled ? styles.disabled : ''}`}>
      {/* Categories Section */}
      <div className={styles.categoriesSection}>
        <h2 className={styles.sectionTitle}>{table.type}</h2>

        {isCategoriesLoading && (
          <div className={styles.loadingState}>
            <div className={styles.loadingSpinner}></div>
            <p>{table.loading}</p>
          </div>
        )}

        {categoriesError && !isCategoriesLoading && (
          <div className={styles.errorState}>
            <p className={styles.errorMessage}>{table.error}</p>
            <button onClick={retryLoadCategories} className={styles.retryButton}>
              {table.retry}
            </button>
          </div>
        )}

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
            const isActive = isAllLetter(letter) && isAllLetter(selectedLetter)
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

      {disabled && (
        <div className={styles.loadingOverlay}>
          <div className={styles.loadingSpinner}></div>
        </div>
      )}
    </div>
  );
}

export default memo(Filter);
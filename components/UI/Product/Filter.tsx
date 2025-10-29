'use client';
import React, { useState, useEffect } from 'react';
import FilterIcon from './../../../public/icons/Filter.svg';
import { Button } from './../Buttons/Button';
import styles from './Filter.module.css';

interface FilterProps {
  getByCategory: (categories: string[]) => void;
  getByLetter: (letter: string) => void;
  selectedCategories?: string[];
  selectedLetter?: string;
  initialCategories?: string[];
  initialLetter?: string;
  disabled?: boolean;
}

function Filter({ 
  getByCategory, 
  getByLetter,
  selectedCategories: propSelectedCategories,
  selectedLetter: propSelectedLetter,
  initialCategories,
  initialLetter,
  disabled = false
}: FilterProps) {
  // Detect current language
  const [currentLanguage, setCurrentLanguage] = useState<'ar' | 'en'>('ar');

  // Internal state with fallback to props
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    propSelectedCategories || initialCategories || []
  );
  const [selectedLetter, setSelectedLetter] = useState<string>(
    propSelectedLetter || initialLetter || 'الكل'
  );

  // Detect language changes
  useEffect(() => {
    const detectLanguage = () => {
      const htmlLang = document.documentElement.lang;
      const savedLang = localStorage.getItem('selectedLanguage');
      const detectedLang = savedLang || htmlLang || 'ar';
      setCurrentLanguage(detectedLang === 'ar' ? 'ar' : 'en');
    };

    detectLanguage();

    // Listen for language changes
    const observer = new MutationObserver(detectLanguage);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['lang']
    });

    // Also listen for storage changes
    window.addEventListener('storage', detectLanguage);

    return () => {
      observer.disconnect();
      window.removeEventListener('storage', detectLanguage);
    };
  }, []);

  // Update internal state when props change
  useEffect(() => {
    if (propSelectedCategories !== undefined) {
      setSelectedCategories(propSelectedCategories);
    }
  }, [propSelectedCategories]);

  useEffect(() => {
    if (propSelectedLetter !== undefined) {
      setSelectedLetter(propSelectedLetter);
    }
  }, [propSelectedLetter]);

  // Bilingual category options
  const categories = [
    { id: 'general', label: { ar: 'كيميائيات عامة', en: 'General Chemicals' } },
    { id: 'cleaners', label: { ar: 'كيميائيات منظفات', en: 'Cleaning Chemicals' } },
    { id: 'pesticides', label: { ar: 'كيميائيات مبيدات', en: 'Pesticides' } },
    { id: 'paints', label: { ar: 'كيميائيات رابعة', en: 'Paints & Coatings' } },
    { id: 'cosmetics', label: { ar: 'كيميائيات مستحضرات التجميل', en: 'Cosmetics' } },
    { id: 'water-treatment', label: { ar: 'كيميائيات معالجة المياه', en: 'Water Treatment' } },
    { id: 'construction', label: { ar: 'كيميائيات مواد البناء', en: 'Construction Materials' } },
    { id: 'vegetables', label: { ar: 'كيميائيات الخضراء', en: 'Agricultural Chemicals' } },
    { id: 'lab-equipment', label: { ar: 'أجهزة مستلزمات المعامل', en: 'Lab Equipment' } }
  ];

  // Bilingual letters - "الكل" means show all products
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

  const letters = currentLanguage === 'ar' ? arabicLetters : englishLetters;

  // Bilingual text
  const text = {
    ar: {
      activeFilters: 'فلاتر نشطة',
      clearAll: 'مسح الكل',
      type: 'النوع',
      selected: 'مُحدد',
      letter: 'الحرف',
      selectedLetter: 'الحرف المُحدد',
      showingAll: 'عرض جميع المنتجات'
    },
    en: {
      activeFilters: 'Active Filters',
      clearAll: 'Clear All',
      type: 'Type',
      selected: 'Selected',
      letter: 'Letter',
      selectedLetter: 'Selected Letter',
      showingAll: 'Showing All Products'
    }
  };

  const t = text[currentLanguage];

  // Helper function to check if "All" is selected
  const isAllLetter = (letter: string): boolean => {
    const normalizedLetter = letter.toLowerCase().trim();
    return normalizedLetter === 'all' || 
           normalizedLetter === 'الكل' || 
           normalizedLetter === 'كل';
  };

  const handleCategoryChange = (categoryId: string) => {
    if (disabled) return;

    const updatedCategories = selectedCategories.includes(categoryId)
      ? selectedCategories.filter(id => id !== categoryId)
      : [...selectedCategories, categoryId];
    
    setSelectedCategories(updatedCategories);
    getByCategory(updatedCategories);
  };

  const handleLetterClick = (letter: string) => {
    if (disabled) return;

    // Store the selected letter as-is for display purposes
    setSelectedLetter(letter);
    
    // Send to parent component - parent should handle "All"/"الكل" to show all products
    getByLetter(letter);
  };

  const clearAllFilters = () => {
    if (disabled) return;

    setSelectedCategories([]);
    const allLabel = currentLanguage === 'ar' ? 'الكل' : 'All';
    setSelectedLetter(allLabel);
    getByCategory([]);
    getByLetter(allLabel); // Send "All" or "الكل" to show all products
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (selectedCategories.length > 0) count += selectedCategories.length;
    // Don't count "All" as an active filter
    if (!isAllLetter(selectedLetter)) count += 1;
    return count;
  };

  const activeFiltersCount = getActiveFiltersCount();

  // Check if "all" is selected
  const isAllSelected = isAllLetter(selectedLetter);

  return (
    <div className={`${styles.filterContainer} ${disabled ? styles.disabled : ''}`}>
    
      

      {/* Categories Section */}
      <div className={styles.categoriesSection}>
        <h2 className={styles.sectionTitle}>{t.type}</h2>
        <div className={styles.categoriesList}>
          {categories.map((category) => (
            <label
              key={category.id}
              className={`${styles.categoryItem} ${disabled ? styles.disabledItem : ''}`}
            >
              <span className={styles.categoryLabel}>
                {category.label[currentLanguage]}
              </span>
              <input
                type="checkbox"
                checked={selectedCategories.includes(category.id)}
                onChange={() => handleCategoryChange(category.id)}
                className={styles.checkbox}
                disabled={disabled}
              />
            </label>
          ))}
        </div>

        {/* Selected categories display */}
        {selectedCategories.length > 0 && (
          <div className={styles.selectedCategoriesDisplay}>
            <span className={styles.selectedLabel}>{t.selected}:</span>
            <div className={styles.selectedTags}>
              {selectedCategories.map(categoryId => {
                const category = categories.find(cat => cat.id === categoryId);
                return category ? (
                  <span 
                    key={categoryId} 
                    className={styles.selectedTag}
                    onClick={() => !disabled && handleCategoryChange(categoryId)}
                  >
                    {category.label[currentLanguage]}
                    <span className={styles.removeTag}>×</span>
                  </span>
                ) : null;
              })}
            </div>
          </div>
        )}
      </div>

      {/* Letters Section */}
      <div className={styles.lettersSection}>
        <h2 className={styles.sectionTitle}>{t.letter}</h2>
        <div className={styles.lettersGrid}>
          {letters.map((letter) => {
            // Check if this letter is the selected one
            const isActive = 
              isAllLetter(letter) && isAllLetter(selectedLetter)
                ? true 
                : selectedLetter === letter;
            
            return (
              <button
                key={letter}
                onClick={() => handleLetterClick(letter)}
                disabled={disabled}
                className={`
                  ${styles.letterButton}
                  ${isActive ? styles.active : ''}
                  ${isAllLetter(letter) ? styles.all : ''}
                  ${disabled ? styles.disabledButton : ''}
                `}
              >
                {letter}
              </button>
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

export default Filter;
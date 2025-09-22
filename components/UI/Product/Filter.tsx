'use client';
import React, { useState, useEffect } from 'react';
import FilterIcon from './../../../public/icons/Filter.svg';
import { Button } from './../Buttons/Button';
import styles from './Filter.module.css';

interface FilterProps {
  getByCategory: (categories: string[]) => void;
  getByLetter: (letter: string) => void;
  selectedCategories?: string[]; // Optional prop to show current state
  selectedLetter?: string; // Optional prop to show current state
  initialCategories?: string[]; // Alternative prop name
  initialLetter?: string; // Alternative prop name
  disabled?: boolean; // To disable filters during loading
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
  // Internal state with fallback to props
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    propSelectedCategories || initialCategories || []
  );
  const [selectedLetter, setSelectedLetter] = useState<string>(
    propSelectedLetter || initialLetter || 'كل'
  );

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

  // Category options in Arabic - these should ideally come from the API
  const categories = [
    { id: 'general', label: 'كيميائيات عامة' },
    { id: 'cleaners', label: 'كيميائيات منظفات' },
    { id: 'pesticides', label: 'كيميائيات مبيدات' },
    { id: 'paints', label: 'كيميائيات رابعة' },
    { id: 'cosmetics', label: 'كيميائيات مستحضرات التجميل' },
    { id: 'water-treatment', label: 'كيميائيات معالجة المياه' },
    { id: 'construction', label: 'كيميائيات مواد البناء' },
    { id: 'vegetables', label: 'كيميائيات الخضراء' },
    { id: 'lab-equipment', label: 'أجهزة مستلزمات المعامل' }
  ];

  // Arabic letters
  const letters = [
    'كل', 'أ', 'ب', 'ت', 'ث', 'ج', 'ح', 'خ', 'د', 'ذ',
    'ر', 'ز', 'س', 'ش', 'ص', 'ض', 'ط', 'ظ', 'ع', 'غ',
    'ف', 'ق', 'ك', 'ل', 'م', 'ن', 'ه', 'و', 'ي', 'ى'
  ];

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

    setSelectedLetter(letter);
    getByLetter(letter);
  };

  const clearAllFilters = () => {
    if (disabled) return;

    setSelectedCategories([]);
    setSelectedLetter('كل');
    getByCategory([]);
    getByLetter('كل');
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (selectedCategories.length > 0) count += selectedCategories.length;
    if (selectedLetter !== 'كل') count += 1;
    return count;
  };

  const activeFiltersCount = getActiveFiltersCount();

  return (
    <div className={`${styles.filterContainer} ${disabled ? styles.disabled : ''}`}>
      {/* Filter Header with Clear Option */}
      {activeFiltersCount > 0 && (
        <div className={styles.filterHeader}>
          <div className={styles.activeFiltersCount}>
            فلاتر نشطة: {activeFiltersCount}
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={clearAllFilters}
            disabled={disabled}
          >
            مسح الكل
          </Button>
        </div>
      )}

      {/* Categories Section */}
      <div className={styles.categoriesSection}>
        <h2 className={styles.sectionTitle}>النوع</h2>
        <div className={styles.categoriesList}>
          {categories.map((category) => (
            <label
              key={category.id}
              className={`${styles.categoryItem} ${disabled ? styles.disabledItem : ''}`}
            >
              <span className={styles.categoryLabel}>{category.label}</span>
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
            <span className={styles.selectedLabel}>مُحدد:</span>
            <div className={styles.selectedTags}>
              {selectedCategories.map(categoryId => {
                const category = categories.find(cat => cat.id === categoryId);
                return category ? (
                  <span 
                    key={categoryId} 
                    className={styles.selectedTag}
                    onClick={() => handleCategoryChange(categoryId)}
                  >
                    {category.label}
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
        <h2 className={styles.sectionTitle}>الحرف</h2>
        <div className={styles.lettersGrid}>
          {letters.map((letter) => (
            <button
              key={letter}
              onClick={() => handleLetterClick(letter)}
              disabled={disabled}
              className={`
                ${styles.letterButton}
                ${selectedLetter === letter ? styles.active : ''}
                ${letter === 'كل' ? styles.all : ''}
                ${disabled ? styles.disabledButton : ''}
              `}
            >
              {letter}
            </button>
          ))}
        </div>
        
        {/* Current letter display */}
        {selectedLetter !== 'كل' && (
          <div className={styles.currentLetterDisplay}>
            الحرف المُحدد: <strong>{selectedLetter}</strong>
          </div>
        )}
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
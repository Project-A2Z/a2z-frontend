'use client';
import React, { useState } from 'react';
import  FilterIcon  from './../../../public/icons/Filter.svg';
import {Button} from './../Buttons/Button'
import styles from './Filter.module.css';

interface FilterProps {
  getByCategory: (categories: string[]) => void;
  getByLetter: (letter: string) => void;
}

function Filter({ getByCategory, getByLetter }: FilterProps) {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedLetter, setSelectedLetter] = useState<string>('كل');

  // Category options in Arabic
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
    const updatedCategories = selectedCategories.includes(categoryId)
      ? selectedCategories.filter(id => id !== categoryId)
      : [...selectedCategories, categoryId];

      console.log(categories);
   
    setSelectedCategories(updatedCategories);
    getByCategory(updatedCategories);
  };

  const handleLetterClick = (letter: string) => {
    setSelectedLetter(letter);
    getByLetter(letter);
  };

  return (
    <div className={styles.filterContainer}>
        {/* <Bu className={styles.filterbtn}>
            <FilterIcon className={styles.filterIcon} />
            <h2 className={styles.filterTitle}>فلتر</h2>
        </div> */}
      {/* Categories Section */}
      <div className={styles.categoriesSection}>
        <h2 className={styles.sectionTitle}>النوع</h2>
        <div className={styles.categoriesList}>
          {categories.map((category) => (
            <label
              key={category.id}
              className={styles.categoryItem}
            >
              <span className={styles.categoryLabel}>{category.label}</span>
              <input
                type="checkbox"
                checked={selectedCategories.includes(category.id)}
                onChange={() => handleCategoryChange(category.id)}
                className={styles.checkbox}
              />
            </label>
          ))}
        </div>
      </div>

      {/* Letters Section */}
      <div className={styles.lettersSection}>
        <h2 className={styles.sectionTitle}>الحرف</h2>
        <div className={styles.lettersGrid}>
          {letters.map((letter) => (
            <button
              key={letter}
              onClick={() => handleLetterClick(letter)}
              className={`
                ${styles.letterButton}
                ${selectedLetter === letter ? styles.active : ''}
                ${letter === 'كل' ? styles.all : ''}
              `}
            >
              {letter}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Filter;
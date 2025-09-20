"use client";
import ProductSlider from "@/components/UI/Product/ProductSlider";
import Filter from "@/components/UI/Product/Filter";
import { Button } from "./../../../../components/UI/Buttons/Button"; 
import { products, getByFirstLetter, getByCategory } from './../../../../public/Test_data/products';
import { useState, useEffect } from 'react';
import style from './Product.module.css';
import FilterIcon from './../../../../public/icons/Filter.svg'; 

export default function ProductSection() {
  const [filteredProducts, setFilteredProducts] = useState(products);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedLetter, setSelectedLetter] = useState<string>('كل');
  
  // Mobile filter modal states
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [tempSelectedCategories, setTempSelectedCategories] = useState<string[]>([]);
  const [tempSelectedLetter, setTempSelectedLetter] = useState<string>('كل');

  const handleCategoryFilter = (categories: string[]) => {
    setSelectedCategories(categories);
  };

  const handleLetterFilter = (letter: string) => {
    setSelectedLetter(letter);
  };

  // Temporary filter handlers for modal
  const handleTempCategoryFilter = (categories: string[]) => {
    setTempSelectedCategories(categories);
  };

  const handleTempLetterFilter = (letter: string) => {
    setTempSelectedLetter(letter);
  };

  // Apply filters whenever selection changes
  useEffect(() => {
    let filtered = products;

    // Apply category filter
    if (selectedCategories.length > 0) {
      filtered = getByCategory(selectedCategories);
    }

    // Apply letter filter
    if (selectedLetter && selectedLetter !== 'كل') {
      filtered = filtered.filter(product => 
        getByFirstLetter(selectedLetter).some(p => p.name === product.name)
      );
    }

    setFilteredProducts(filtered);
  }, [selectedCategories, selectedLetter]);

  // Open filter modal and initialize temp values
  const openFilterModal = () => {
    setTempSelectedCategories([...selectedCategories]);
    setTempSelectedLetter(selectedLetter);
    setIsFilterModalOpen(true);
    // Prevent body scroll
    document.body.style.overflow = 'hidden';
  };

  // Close filter modal and restore body scroll
  const closeFilterModal = () => {
    setIsFilterModalOpen(false);
    document.body.style.overflow = 'unset';
  };

  // Apply temporary filters
  const applyFilters = () => {
    setSelectedCategories([...tempSelectedCategories]);
    setSelectedLetter(tempSelectedLetter);
    closeFilterModal();
  };

  // Cancel filters (revert to previous state)
  const cancelFilters = () => {
    closeFilterModal();
  };

  return (
    <div className={style.containerSection}>
      {/* <div className={style.title}>
        <h2 className={style.titleText}>منتجاتنا و خدماتنا</h2>
        <p className={style.titleDesc}>جميع الكيميائيات في مكان واحد</p>
      </div> */}

      {/* Mobile Filter Button */}
      <div className={style.mobileFilterButton}>
        <Button 
          variant="custom" 
          size="md" 
          onClick={openFilterModal}
          rightIcon={
            <FilterIcon/>
          }
          rounded={true}
        >
          فيلتر
        </Button>
      </div>

      <div className={style.container}>
        <ProductSlider products={filteredProducts} />
        <Filter 
          getByCategory={handleCategoryFilter} 
          getByLetter={handleLetterFilter} 
        />
      </div>

      {/* Mobile Filter Modal */}
      {isFilterModalOpen && (
        <div className={style.filterModal}>
          <div className={style.filterModalContent}>
            {/* Modal Header */}
            <div className={style.filterModalHeader}>
              <h3>الفلاتر</h3>
              
            </div>

            {/* Filter Content */}
            <div className={style.filterModalBody}>
              <Filter 
                getByCategory={handleTempCategoryFilter} 
                getByLetter={handleTempLetterFilter}
                // initialCategories={tempSelectedCategories}
                // initialLetter={tempSelectedLetter}
              />
            </div>

            {/* Modal Footer */}
            <div className={style.filterModalFooter}>
              <Button 
                variant="outline" 
                size="lg" 
                fullWidth
                onClick={cancelFilters}
              >
                إلغاء
              </Button>
              <Button 
                variant="primary" 
                size="lg" 
                fullWidth
                onClick={applyFilters}
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
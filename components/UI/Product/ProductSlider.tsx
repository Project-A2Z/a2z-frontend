"use client"
import { useState, useRef } from 'react';
import Card from './../Card/Card'; // Adjust the import path as needed
import styles from './ProductSlider.module.css';

// Types
interface Product {
  name: string;
  category: string;
  price: number;
  status: boolean | string;
  img: any; // StaticImageData or false
}

interface ProductSliderProps {
  products: Product[];
  title?: string;
  itemsPerPage?: number; // Changed from itemsPerView to itemsPerPage
  columns?: number;
  rows?: number;
}

function ProductSlider({ 
  products, 
  title = "المنتجات المميزة",
  itemsPerPage = 20, // 4 columns × 5 rows = 20 items per page
  columns = 4,
  rows = 5
}: ProductSliderProps) {
  const [currentPage, setCurrentPage] = useState(0);
  const sliderRef = useRef<HTMLDivElement>(null);

  // Calculate total pages
  const totalPages = Math.ceil(products.length / itemsPerPage);
  
  // Get current page products
  const getCurrentPageProducts = () => {
    const startIndex = currentPage * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return products.slice(startIndex, endIndex);
  };

  const nextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages - 1));
  };

  const prevPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 0));
  };

  const goToPage = (pageIndex: number) => {
    setCurrentPage(pageIndex);
  };

  const currentProducts = getCurrentPageProducts();

  return (
    <div className={styles.sliderContainer}>
      
      <div className={styles.gridWrapper}>
        <div 
          className={styles.productGrid}
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${columns}, 1fr)`,
            gridTemplateRows: `repeat(${rows}, 1fr)`,
            gap: '16px',
            minHeight: `${rows * 300}px` // Adjust based on your card height
          }}
        >
          {currentProducts.map((product, index) => (
            <div key={`${product.name}-${currentPage}-${index}`} className={styles.gridItem}>
              <Card
                productId={(currentPage * itemsPerPage + index).toString()}
                productImg={product.img || '/images/placeholder.jpg'}
                productName={product.name}
                productCategory={product.category}
                productPrice={product.price.toString()}
                available={typeof product.status === 'boolean' ? product.status : false}
              />
            </div>
          ))}
          
          {/* Fill empty slots if needed */}
          {Array.from({ length: itemsPerPage - currentProducts.length }).map((_, index) => (
            <div key={`empty-${index}`} className={styles.emptySlot} />
          ))}
        </div>
      </div>

      {/* Bottom Pagination */}
      {totalPages > 1 && (
        <div className={styles.bottomPagination}>
          <div className={styles.paginationInfo}>
            <span>عرض {currentPage * itemsPerPage + 1} إلى {Math.min((currentPage + 1) * itemsPerPage, products.length)} من {products.length}</span>
          </div>
          
          <div className={styles.paginationControls}>
            <button
              className={`${styles.paginationArrow} ${currentPage === 0 ? styles.disabled : ''}`}
              onClick={prevPage}
              disabled={currentPage === 0}
            >
             <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg> 
            </button>
            
            <div className={styles.pageNumbers}>
              {/* Show first page */}
              {currentPage > 2 && (
                <>
                  <button
                    className={styles.pageNumber}
                    onClick={() => goToPage(0)}
                  >
                    1
                  </button>
                  {currentPage > 3 && <span className={styles.ellipsis}>...</span>}
                </>
              )}
              
              {/* Show pages around current page */}
              {Array.from({ length: totalPages }).map((_, index) => {
                if (index >= currentPage - 1 && index <= currentPage + 1) {
                  return (
                    <button
                      key={index}
                      className={`${styles.pageNumber} ${currentPage === index ? styles.active : ''}`}
                      onClick={() => goToPage(index)}
                    >
                      {index + 1}
                    </button>
                  );
                }
                return null;
              })}

              {/* Show "من" only between current page and last page */}
              {currentPage < totalPages - 2 && (
                <span className={styles.ellipsis}>من</span>
              )}
              
              {/* Show last page */}
              {currentPage < totalPages - 3 && (
                <>
                  {currentPage < totalPages - 4 && <span className={styles.ellipsis}>...</span>}
                  <button
                    className={styles.pageNumber}
                    onClick={() => goToPage(totalPages - 1)}
                  >
                    {totalPages}
                  </button>
                </>
              )}
            </div>
            
            <button
              className={`${styles.paginationArrow} ${currentPage >= totalPages - 1 ? styles.disabled : ''}`}
              onClick={nextPage}
              disabled={currentPage >= totalPages - 1}
            >
              
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProductSlider;
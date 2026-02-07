"use client";
import React, { useState, useEffect } from 'react';
import { fetchCategories } from '@/services/product/categories';

const CategoriesMenu = () => {
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await fetchCategories();
        setCategories(data);
      } catch (error) {
        console.error('Failed to load categories:', error);
      } finally {
        setLoading(false);
      }
    };

    loadCategories();
  }, []);

  if (loading) {
    return (
      <div className="w-full sm:w-[80%] md:w-[60%] lg:w-[23%] min-h-0 gap-4 flex flex-col items-start justify-start">
        <h3 className="font-beiruti font-semibold text-base sm:text-xl md:text-2xl leading-none text-secondary1 text-left">
          فئات
        </h3>
        <div className="text-sm text-black87">جاري التحميل...</div>
      </div>
    );
  }

  return (
    <div className="w-full sm:w-[80%] md:w-[60%] lg:w-[23%] min-h-0 gap-4 flex flex-col items-start justify-start">
      <h3 className="font-beiruti font-semibold text-base sm:text-xl md:text-2xl leading-none text-secondary1 text-left">
        فئات
      </h3>
      <nav className="w-full flex flex-row flex-wrap justify-start items-start gap-x-4 gap-y-2 sm:gap-y-3 md:flex md:flex-col md:items-start md:justify-start md:gap-2">
        {categories.map((category, index) => (
          <span
            key={index}
            className="text-left text-sm text-black87"
          >
            {category}
          </span>
        ))}
      </nav>
    </div>
  );
};

export default React.memo(CategoriesMenu);
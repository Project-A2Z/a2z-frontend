import React from 'react';
const CategoriesSection = () => {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-secondary1 mb-6">فئات</h3>
        <nav className="flex flex-col space-y-3">
          <a href="/categories/general-chemicals" className="text-gray-200 hover:text-green-400 transition-colors text-sm cursor-pointer">
            كيماويات عامة
          </a>
          <a href="/categories/cleaning-chemicals" className="text-gray-200 hover:text-green-400 transition-colors text-sm cursor-pointer">
            كيماويات منظفات
          </a>
          <a href="/categories/pesticides" className="text-gray-200 hover:text-green-400 transition-colors text-sm cursor-pointer">
            كيماويات مبيدات
          </a>
          <a href="/categories/agricultural-chemicals" className="text-gray-200 hover:text-green-400 transition-colors text-sm cursor-pointer">
            كيماويات زراعية
          </a>
          <a href="/categories/cosmetics-chemicals" className="text-gray-200 hover:text-green-400 transition-colors text-sm cursor-pointer">
            كيماويات مستحضرات التجميل
          </a>
          <a href="/categories/water-treatment" className="text-gray-200 hover:text-green-400 transition-colors text-sm cursor-pointer">
            كيماويات معالجة المياه
          </a>
          <a href="/categories/construction-materials" className="text-gray-200 hover:text-green-400 transition-colors text-sm cursor-pointer">
            كيماويات مواد البناء
          </a>
          <a href="/categories/vegetables" className="text-gray-200 hover:text-green-400 transition-colors text-sm cursor-pointer">
            كيماويات الخضراء
          </a>
          <a href="/categories/laboratory-equipment" className="text-gray-200 hover:text-green-400 transition-colors text-sm cursor-pointer">
            أجهزة مستلزمات المعامل
          </a>
        </nav>
      </div>
    );
  };
export default React.memo(CategoriesSection);
 
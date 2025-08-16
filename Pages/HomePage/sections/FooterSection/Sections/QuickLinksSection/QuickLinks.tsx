import React from 'react';
const QuickLinks = () => {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-secondary1 mb-6">روابط سريعة</h3>
        <nav className="flex flex-col space-y-3">
          <a href="/" className="text-gray-200 hover:text-green-400 transition-colors text-sm cursor-pointer">
            الرئيسية
          </a>
          <a href="/services" className="text-gray-200 hover:text-green-400 transition-colors text-sm cursor-pointer">
            الخدمات
          </a>
          <a href="/products" className="text-gray-200 hover:text-green-400 transition-colors text-sm cursor-pointer">
            المنتجات
          </a>
          <a href="/about" className="text-gray-200 hover:text-green-400 transition-colors text-sm cursor-pointer">
            من نحن
          </a>
          <a href="/contact" className="text-gray-200 hover:text-green-400 transition-colors text-sm cursor-pointer">
            تواصل معنا
          </a>
        </nav>
      </div>
    );
  };
export default React.memo(QuickLinks); 
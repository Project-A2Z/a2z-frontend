"use client";

import React, { useRef, useEffect, useState } from 'react';
import productsData from './productsData.json';

interface ProductItem {
  name: string;
  description: string;
}

interface TabData {
  id: string;
  label: string;
  title: string;
  subtitle: string;
  items: ProductItem[];
}

const ProductsSection = () => {
  const [activeTab, setActiveTab] = useState('chemicals');

  const activeTabData = productsData.tabs.find((tab) => tab.id === activeTab) as TabData | undefined;

  // Split items into 3 columns
  const getColumns = (items: ProductItem[]) => {
    const itemsPerColumn = Math.ceil(items.length / 3);
    return [
      items.slice(0, itemsPerColumn),
      items.slice(itemsPerColumn, 2 * itemsPerColumn),
      items.slice(2 * itemsPerColumn),
    ];
  };

  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [indicatorStyle, setIndicatorStyle] = useState({ width: 0, left: 0 });

  useEffect(() => {
    const activeIndex = productsData.tabs.findIndex((tab) => tab.id === activeTab);
    const activeTabElement = tabRefs.current[activeIndex];

    if (activeTabElement) {
      setIndicatorStyle({
        width: activeTabElement.offsetWidth,
        left: activeTabElement.offsetLeft,
      });
    }
  }, [activeTab]);

  return (
    <section className="w-full bg-white py-4 sm:py-8 lg:py-12" dir="rtl">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 mb-6 sm:mb-8 lg:mb-12">
        {/* Main Header */}
        <h2
          className="text-lg sm:text-xl lg:text-2xl font-semibold text-secondary1 text-center pb-3 sm:pb-4 border-b border-gray-200"
          style={{
            fontFamily: 'Beiruti',
            fontWeight: 600,
            lineHeight: '100%',
            letterSpacing: '0%',
          }}
        >
          المنتجات
        </h2>

        {/* Tabs Navigation */}
        <div className="relative flex flex-wrap justify-center gap-2 sm:gap-8 mt-6 sm:mt-8 border-b border-gray-200 pb-4">
          {productsData.tabs.map((tab, index) => (
            <button
              key={tab.id}
              ref={(el) => {
                if (el) tabRefs.current[index] = el;
              }}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 sm:px-6 py-2 sm:py-3 text-xs sm:text-sm font-medium transition-colors duration-300 whitespace-nowrap relative ${
                activeTab === tab.id
                  ? 'text-primary'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
              style={{ fontFamily: 'Beiruti' }}
            >
              {tab.label}
            </button>
          ))}

          {/* Sliding border indicator */}
          <span
            className="absolute bottom-0 h-1 bg-primary transition-all duration-500 ease-out"
            style={{
              width: `${indicatorStyle.width}px`,
              left: `${indicatorStyle.left}px`,
            }}
          />
        </div>

        {/* Tab Content */}
        <div className="mt-6 sm:mt-8">
          {activeTabData && (
            <div className="w-full rounded-2xl border border-[#F0F0F0] p-4 sm:p-6">
              {/* Section subtitle header */}
              <p
                className="font-semibold text-sm sm:text-base text-right text-black mb-4 sm:mb-6"
                style={{ fontFamily: 'Beiruti' }}
              >
                {activeTab === 'chemicals'
                  ? 'كيماويات صناعة المنظفات ومستحضرات التجميل'
                  : activeTabData.subtitle}
              </p>

              {activeTab === 'chemicals' && (
                <p
                  className="font-semibold text-sm sm:text-base text-right text-secondary1 mb-6 sm:mb-8"
                  style={{ fontFamily: 'Beiruti' }}
                >
                  {activeTabData.subtitle}
                </p>
              )}

              {/* 3-Column Grid Layout */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4">
                {getColumns(activeTabData.items as ProductItem[]).map((column, colIndex) => (
                  <div key={colIndex} className="flex flex-col gap-8 ">
                    {column.map((item, index) => (
                      <div key={index} className="flex items-start gap-2 text-right border border-black8 rounded-lg p-3">
                        <span className="text-emerald-500 flex-shrink-0 mt-1">●</span>
                        <div className="flex flex-col gap-1">
                          <span
                            className="text-xs sm:text-sm font-semibold text-gray-800 leading-snug"
                            style={{ fontFamily: 'Beiruti' }}
                          >
                            {item.name}
                          </span>
                          <span
                            className="text-xs text-gray-400 leading-relaxed"
                            style={{ fontFamily: 'Beiruti' }}
                          >
                            {item.description}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default React.memo(ProductsSection);
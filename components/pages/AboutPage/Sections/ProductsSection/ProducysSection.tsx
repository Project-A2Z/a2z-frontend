"use client";

import React,{ useRef, useEffect, useState } from 'react';
import productsData from './productsData.json';

const ProductsSection = () => {
  const [activeTab, setActiveTab] = useState('chemicals');

  const activeTabData = productsData.tabs.find(tab => tab.id === activeTab);

  // Function to split items into 3 columns for the chemicals tab
  const getColumns = (items: string[]) => {
    const itemsPerColumn = Math.ceil(items.length / 3);
    return [
      items.slice(0, itemsPerColumn),
      items.slice(itemsPerColumn, 2 * itemsPerColumn),
      items.slice(2 * itemsPerColumn)
    ];
  };

  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
const [indicatorStyle, setIndicatorStyle] = useState({ width: 0, left: 0 });

useEffect(() => {
  const activeIndex = productsData.tabs.findIndex(tab => tab.id === activeTab);
  const activeTabElement = tabRefs.current[activeIndex];
  
  if (activeTabElement) {
    setIndicatorStyle({
      width: activeTabElement.offsetWidth,
      left: activeTabElement.offsetLeft,
    });
  }
}, [activeTab, productsData.tabs]);

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
            letterSpacing: '0%'
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
            <>
              {/* Chemicals Tab - Special Layout */}
              {activeTab === 'chemicals' && (
                <div className="flex flex-col gap-4 w-full mx-auto rounded-2xl border border-[#F0F0F0] p-4 sm:p-6">
                  <h2 className="font-[Beiruti] font-semibold text-sm sm:text-base leading-none tracking-normal text-right text-black/87">
                    تعمل الشركة في الكيماويات مثل :
                  </h2>

                  <div className="flex flex-col gap-4">
                    <p className="font-[Beiruti] font-semibold text-sm sm:text-base leading-none tracking-normal text-right text-secondary1 mb-4 sm:mb-6">
                      {activeTabData.title}
                    </p>
                    
                    {/* Three Column Layout */}
                    <div className="flex flex-col sm:flex-row justify-between gap-4">
                      {getColumns(activeTabData.items).map((column, colIndex) => (
                        <div key={colIndex} className="flex-1 bg-white rounded-lg p-3 sm:p-4">
                          <ul className="space-y-2 sm:space-y-3">
                            {column.map((item, index) => (
                              <li key={index} className="flex items-center gap-2 text-gray-700">
                                <span className="text-emerald-500 flex-shrink-0">●</span>
                                <span className="text-xs sm:text-sm leading-relaxed text-right">{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Cards Section for Chemicals */}
                  {/* <div className="flex flex-col sm:flex-row flex-wrap justify-between gap-4 mt-6 sm:mt-8 lg:mt-12">
                    {activeTabData.cards && activeTabData.cards.map((card, cardIndex) => (
                      <div key={cardIndex} className="bg-white rounded-lg p-4 sm:p-6 w-full sm:w-[48%] lg:w-[23%]">
                        <h2 className="font-[Beiruti] font-medium text-sm sm:text-base leading-none tracking-normal text-secondary1 text-right mb-4 sm:mb-6">
                          {card.title}
                        </h2>
                        <ul className="space-y-2 sm:space-y-3">
                          {card.items.map((item, index) => (
                            <li key={index} className="flex items-start gap-2 text-right">
                              <span className="text-emerald-500 text-lg leading-none mt-0.5">●</span>
                              <span className="text-xs sm:text-sm leading-relaxed flex-1 text-black87">
                                {item}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div> */}
                </div>
              )}

              {/* Other Tabs - Simple Card Layout */}
              {activeTab !== 'chemicals' && (
                <div className="flex justify-center">
                  <div className="flex flex-col w-full sm:w-[48%] lg:w-[31%]">
                    <div className="flex gap-3 sm:gap-4 w-full bg-white rounded-lg shadow-lg p-4 sm:p-6 flex-col">
                      <p className="font-[Beiruti] font-medium text-xs sm:text-sm leading-none tracking-normal text-right text-black87 mb-3 sm:mb-4">
                        {activeTabData.subtitle}
                      </p>
                      <div className="flex-1 overflow-y-auto">
                        <ul className="space-y-2 sm:space-y-3">
                          {activeTabData.items.map((item, index) => (
                            <li key={index} className="flex items-center gap-2 text-right">
                              <span className="text-emerald-500 flex-shrink-0">●</span>
                              <span className="font-[Beiruti] font-medium text-xs sm:text-sm leading-none tracking-normal text-black87">
                                {item}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </section>
  );
};

export default React.memo(ProductsSection);
"use client";

import React, { useRef, useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
// import { getLocale } from '@/services/api/language';

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
  const t = useTranslations('about-us.products');
  // const locale = getLocale();
  

  // ✅ Fix 1: removed the broken `t.raw('tabs.items')` line
  const tabs = t.raw('tabs') as TabData[] || [];

  const activeTabData = tabs.find((tab) => tab.id === activeTab) as TabData | undefined;

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
    const activeIndex = tabs.findIndex((tab) => tab.id === activeTab);
    const activeTabElement = tabRefs.current[activeIndex];
    if (activeTabElement) {
      setIndicatorStyle({
        width: activeTabElement.offsetWidth,
        left: activeTabElement.offsetLeft,
      });
    }
  }, [activeTab]);

  return (
    // ✅ Fix 3: dynamic dir based on locale
    <section className="w-full bg-white py-4 sm:py-8 lg:py-12" >
      <div className="justify-self-center connected align-middle">
        <h2
          className="text-lg sm:text-xl lg:text-2xl font-semibold text-secondary1 text-center pb-3 sm:pb-4 border-b border-gray-200"
          style={{ fontFamily: 'Beiruti', fontWeight: 600, lineHeight: '100%', letterSpacing: '0%' }}
        >
          {t('title')}
        </h2>

        <div className="relative flex justify-center gap-1 sm:gap-0 mt-6 sm:mt-8 border-b border-gray-200 pb-4">
          {tabs.map((tab, index) => (
            <button
              key={tab.id}
              ref={(el) => { if (el) tabRefs.current[index] = el; }}
              onClick={() => setActiveTab(tab.id)}
              className={`pr-2 sm:px-6 py-2 sm:py-3 text-xs sm:text-xs font-medium transition-colors duration-300 whitespace-nowrap relative ${
                activeTab === tab.id ? 'text-primary' : 'text-gray-600 hover:text-gray-800'
              }`}
              style={{ fontFamily: 'Beiruti' }}
            >
              {tab.label}
            </button>
          ))}
          <span
            className="absolute bottom-0 h-1 bg-primary transition-all duration-500 ease-out"
            style={{ width: `${indicatorStyle.width}px`, left: `${indicatorStyle.left}px` }}
          />
        </div>

        <div className="mt-6 sm:mt-8">
          {activeTabData && (
            <div className="w-full rounded-2xl border border-[#F0F0F0] p-4 sm:p-6">
              {/* ✅ Fix 2: use activeTabData.title instead of hardcoded Arabic */}
              <p
                className="font-semibold text-sm sm:text-base text-right text-black mb-4 sm:mb-6"
                style={{ fontFamily: 'Beiruti' }}
              >
                {activeTabData.title}
              </p>

              <p
                className="font-semibold text-sm sm:text-base text-right text-secondary1 mb-6 sm:mb-8"
                style={{ fontFamily: 'Beiruti' }}
              >
                {activeTabData.subtitle}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4">
                {getColumns(activeTabData.items).map((column, colIndex) => (
                  <div key={colIndex} className="flex flex-col gap-8">
                    {column.map((item, index) => (
                      <div key={index} className="flex items-start gap-2 text-right border border-black8 rounded-lg p-3">
                        <span className="text-emerald-500 flex-shrink-0 mt-1">●</span>
                        <div className="flex flex-col gap-1">
                          <span className="text-xs sm:text-sm font-semibold text-gray-800 leading-snug" style={{ fontFamily: 'Beiruti' }}>
                            {item.name}
                          </span>
                          <span className="text-xs text-gray-400 leading-relaxed" style={{ fontFamily: 'Beiruti' }}>
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
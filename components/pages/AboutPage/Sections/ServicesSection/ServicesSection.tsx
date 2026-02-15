"use client";

import React from 'react';
import ProductsSection from '../ProductsSection/ProducysSection';
import CardSection from '../cardsSection/CardsSection';

const ServicesSection = () => {
  return (
    <section className="w-full bg-white py-4 sm:py-8 lg:py-12" dir="rtl">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 ">
        {/* Products Section */}
        <div>
          <ProductsSection />
        </div>
      </div>

      {/* Card Section - All data from ProductsData.json */}
      {/* <CardSection /> */}
    </section>
  );
};

export default React.memo(ServicesSection);
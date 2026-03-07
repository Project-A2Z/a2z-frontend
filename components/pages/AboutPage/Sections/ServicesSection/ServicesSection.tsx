"use client";

import React from 'react';
import ProductsSection from '../ProductsSection/ProducysSection';
const ServicesSection = () => {
  return (
    <section
      className="w-full bg-white py-4 sm:py-8 lg:py-12   sm:mx-0 sm:px-0 "
      dir="rtl"
    >
      <div className=" mx-auto ">
        <div>
          <ProductsSection />
        </div>
      </div>
    </section>
  );
};
export default React.memo(ServicesSection);
import React from 'react';

import ContactSection from './Sections/ContactSection/ContactSection';
import QuickLinks from './Sections/QuickLinksSection/QuickLinks';
import CategoriesSection from './Sections/CategoriesSection/CategoriesSection';
import AboutUsSection from './Sections/AboutUsSection/AboutUsSection';

const Footer = () => {
  return (
    <footer 
  className="relative p-12 bg-white border-t border-[#D6D6D6] h-[457px]"
  dir="rtl"
>
  {/* Background Pattern */}
  <div className="absolute inset-0 opacity-[0.24] bg-[url('/acessts/footerBacground.jpg')] bg-repeat bg-auto"></div>

  <div className="relative max-w-[1440px] mx-auto">
    {/* Main Footer Content */}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
      <AboutUsSection /> 
      <CategoriesSection />
      <QuickLinks />
      <ContactSection />
    </div>
    {/* Copyright */}
    <div className="mt-8 pt-8 border-t border-[#D6D6D6] text-center">
      <p className="text-gray-300 text-sm">
        © 2025 جميع الحقوق محفوظة
      </p>
    </div>
  </div>
</footer>
  );
};

export default React.memo(Footer);

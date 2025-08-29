import React from 'react';
import styles from './Footer.module.css';
import ContactSection from './Sections/ContactSection/ContactSection';
import QuickLinks from './Sections/QuickLinksSection/QuickLinks';
import CategoriesSection from './Sections/CategoriesSection/CategoriesSection';
import AboutUsSection from './Sections/AboutUsSection/AboutUsSection';
import MobileNavigation from './Sections/MobileNavigation/MobileNavigation';

const Footer = () => {
  return (
    <footer className="w-full b rotate-0 opacity-100 top-[2851px]  border-black16 border-t-[1px] p-4 pb-20 sm:p-6 md:p-8 lg:p-12 gap-4 sm:gap-6 lg:gap-8 mt-[200px] relative">
      {/* Background Pattern */}
      <div className={`inset-0 ${styles.background} absolute inset-0 bg-cover bg-center bg-no-repeat opacity-20 pointer-events-none z-0`} ></div>
      {/* FooterOverlay  */}
      {/* <div className="absolute inset-0 bg-black/25"></div> */}

      <div className="relative z-10 max-w-[1440px] mx-auto">
        {/* Main Footer Content */}
        <div className="w-full sm:w-[95%] lg:w-[93%] min-h-0 sm:min-h-[220px] lg:h-[32vh] flex flex-col sm:flex-row justify-start sm:justify-around gap-3 sm:gap-4 lg:gap-0">
          <AboutUsSection /> 
          <QuickLinks />
          <CategoriesSection />
          <ContactSection />
        </div>

        {/* Copyright */}
        <div className="mt-6 sm:mt-8 pt-5 sm:pt-8 border-t border-black16 text-center bg-orange-300">
          <p className="text-black font-beiruti font-medium text-xs sm:text-sm leading-none tracking-normal text-center">
            © 2025 جميع الحقوق محفوظة
          </p>
        </div>
      </div>
      {/* Mobile Navigation - Only visible on small devices */}
      <MobileNavigation />
    </footer>
  );
};

export default React.memo(Footer);


/*
<div className="mt-6 sm:mt-8">
        
          <div className="relative w-full overflow-hidden">
            <div className="absolute -top-6 left-0 right-0 h-6 bg-white z-[1]"></div>
            <svg viewBox="0 0 1440 120" className="relative w-full h-14 sm:h-20 text-white z-[2]" preserveAspectRatio="none">
              <path d="M0,40 C240,100 480,100 720,60 C960,20 1200,20 1440,60 L1440,120 L0,120 Z" fill="currentColor" />
            </svg>
          </div>
          <div className="bg-white pt-3 sm:pt-5 pb-4 text-center border-t border-black16">
            <p className="text-gray-600 font-beiruti font-medium text-xs sm:text-sm leading-none tracking-normal text-center">
              © 2025 جميع الحقوق محفوظة
            </p>
          </div>
        </div>
*/
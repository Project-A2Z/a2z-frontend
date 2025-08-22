import React from 'react';
import styles from './Footer.module.css';
import ContactSection from './Sections/ContactSection/ContactSection';
import QuickLinks from './Sections/QuickLinksSection/QuickLinks';
import CategoriesSection from './Sections/CategoriesSection/CategoriesSection';
import AboutUsSection from './Sections/AboutUsSection/AboutUsSection';

const Footer = () => {
  return (
    <footer className="w-full h-screen rotate-0 opacity-100 top-[2851px] border-black16 border-t-[1px] p-12 gap-8 mt-[200px]  " >
      {/* Background Pattern */}
      <div className={`inset-0 ${styles.background} absolute inset-0 bg-cover bg-center bg-no-repeat opacity-20`} ></div>
      {/* FooterOverlay  */}
      {/* <div className="absolute inset-0 bg-black/25"></div> */}

      <div className="relative max-w-[1440px] mx-auto">
        {/* Main Footer Content */}
        <div className=" w-[93%] h-[32vh] flex flex-row justify-between ">
          <ContactSection />
          <QuickLinks />
          <CategoriesSection />
          <AboutUsSection /> 
        </div>

        {/* Copyright */}
        <div className="mt-8 pt-8 border-t border-black16 text-center">
          <p className="text-black font-beiruti font-medium text-sm leading-none tracking-normal text-center">
            © 2025 جميع الحقوق محفوظة
          </p>
        </div>
      </div>

    </footer>
  );
};

export default React.memo(Footer);

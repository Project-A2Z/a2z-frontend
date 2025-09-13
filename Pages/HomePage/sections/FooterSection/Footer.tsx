import React from 'react';
import styles from './Footer.module.css';
import ContactSection from './Sections/ContactSection/ContactSection';
import QuickLinks from './Sections/QuickLinksSection/QuickLinks';
import CategoriesSection from './Sections/CategoriesSection/CategoriesSection';
import AboutUsSection from './Sections/AboutUsSection/AboutUsSection';
import MobileNavigation from './Sections/MobileNavigation/MobileNavigation';

const Footer = () => {
  return (
    <footer className={styles.footer}>
      {/* Background Pattern */}
      <div className={styles.background}></div>
      
      {/* Footer Overlay - Uncomment if needed */}
      {/* <div className={styles.footerOverlay}></div> */}

      <div className={styles.container}>
        {/* Main Footer Content */}
        <div className={styles.mainContent}>
          <AboutUsSection /> 
          <QuickLinks />
          <CategoriesSection />
          <ContactSection />
        </div>

        {/* Copyright */}
        <div className={styles.copyright}>
          <p className={styles.copyrightText}>
            © 2025 جميع الحقوق محفوظة
          </p>
        </div>
      </div>

      {/* Mobile Navigation - Only visible on small devices */}
      {/* <MobileNavigation /> */}
    </footer>
  );
};

export default React.memo(Footer);
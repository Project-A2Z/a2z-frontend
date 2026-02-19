import React, { useState, useEffect } from 'react';
import ContactSection from './Sections/ContactSection/ContactSection';
import QuickLinks from './Sections/QuickLinksSection/QuickLinks';
import CategoriesSection from './Sections/CategoriesSection/CategoriesSection';
import AboutUsSection from './Sections/AboutUsSection/AboutUsSection';
import dynamic from 'next/dynamic';


import CopyrightSection from "./Sections/CopyrightSection/copyright";

// Dynamically import FloatingChat with SSR disabled
const FloatingChat = dynamic(
  () => import('@/components/UI/FloatingChat/FloatingChat'),
  { ssr: false }
);

const Footer = () => {
  const [isChatOpen, setIsChatOpen] = useState(false);

  const [year, setYear] = useState<number | null>(null)

  useEffect(() => {
    setYear(new Date().getFullYear())
  }, [])

  const handleContactClick = () => {
    setIsChatOpen(true);
  };

  const handleChatClose = () => {
    setIsChatOpen(false);
  };

  return (
    <footer className="relative w-full min-h-[300px] md:min-h-[400px] overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 flex items-center justify-center z-0">
        <div className="relative w-full h-full">
          <div 
            className="absolute inset-0"
            style={{
              backgroundImage: 'url(/acessts/footerBackground2.jpg)', 
              backgroundSize: 'contain',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
              opacity: 0.2 
            }}
          ></div>
          {/* Gradient Overlay */}
          {/* <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-black/70"></div> */}
        </div>
      </div>
      <div className="absolute top-0 left-1/2 w-[90%] h-px bg-gray-200 -translate-x-1/2 -translate-y-1/2"></div>

      <div className="relative z-10 max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 h-full flex flex-col mt-[-20px]" >
        
        {/* Main Footer Content */}
        <div className="w-full lg:w-[93%] mx-auto flex-1 flex flex-col lg:flex-row justify-between items-start gap-10 lg:gap-4 py-8">
          <AboutUsSection /> 
          <CategoriesSection />
          <QuickLinks onContactClick={handleContactClick} />
          <ContactSection />
        </div>
           
        {/* Copyright */}
        {/* <div className="w-full py-4 border-t border-gray-200 text-center mb-[120px] relative">
          <div className="absolute top-0 left-1/2 w-[90%] h-px bg-gray-200 -translate-x-1/2 -translate-y-1/2"></div>
          <p className="text-black87 font-beiruti font-medium text-sm">
             {year ?? '\u00A0'} جميع الحقوق محفوظة
          </p>
          <p className="text-black87 font-beiruti font-medium text-sm">
             تم تطوير الموقع من قبل أكسورا
          </p>
        </div> */}
        <CopyrightSection />
      </div>
      
      {/* Floating Chat */}
      <FloatingChat 
        isOpen={isChatOpen} 
        onOpenChange={handleChatClose}
      />
    </footer>
  );
};

export default React.memo(Footer);



"use client";
import React from 'react';
import { useState } from "react";
import Link from "next/link";
import { useTranslations } from 'next-intl';

interface QuickLinksProps {
  onContactClick?: () => void;
}

const QuickLinks = ({ onContactClick }: QuickLinksProps) => {
  const t = useTranslations('footer.quickLinks');

  const [links] = useState([
    { href: "/", labelKey: "home" },
    { href: "/", labelKey: "products" },
    { href: "/about", labelKey: "about" },
    { href: "#", labelKey: "contact" },
  ]);

  return (
    <div className="w-full sm:w-[80%] md:w-[60%] lg:w-[23%] min-h-0 sm:min-h-[160px] md:min-h-[140px] lg:h-[20vh]">
      <div className="w-full">
        <h3
          className="text-secondary1 text-right"
          style={{
            fontFamily: 'Beiruti', fontWeight: 600, fontStyle: 'SemiBold',
            fontSize: '16px', lineHeight: '100%', letterSpacing: '0%',
            marginBottom: '18px', width: '91px', height: '19px'
          }}
        >
          {t('title')}
        </h3>
      </div>
      <nav className="w-full flex flex-row flex-wrap items-start justify-start gap-4 sm:gap-3 text-left sm:flex sm:flex-col">
        {links.map((link, index) => (
          <div key={index}>
            {link.labelKey === "contact" ? (
              <button
                onClick={(e) => { e.preventDefault(); onContactClick?.(); }}
                className="text-black87 hover:text-green-400 transition-colors text-sm sm:text-sm cursor-pointer block py-1 sm:py-0 w-full text-right"
              >
                {t(`links.${link.labelKey}`)}
              </button>
            ) : (
              <Link
                href={link.href}
                className="text-black87 hover:text-green-400 transition-colors text-sm sm:text-sm cursor-pointer text-left block py-1 sm:py-0"
              >
                {t(`links.${link.labelKey}`)}
              </Link>
            )}
          </div>
        ))}
      </nav>
    </div>
  );
};

export default React.memo(QuickLinks);
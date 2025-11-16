"use client";
import React from 'react'
import { useState } from "react";
import Link from "next/link";

interface QuickLinksProps {
  onContactClick?: () => void;
}

const QuickLinks = ({ onContactClick }: QuickLinksProps) => {
  const [links] = useState([
    { href: "/", label: "الرئيسية" },
    // { href: "/services", label: "الخدمات" },
    { href: "/", label: "المنتجات" },
    { href: "/about", label: "من نحن" },
    { href: "#", label: "تواصل معنا" }, 
  ]);

  return (
    <div className="w-full sm:w-[80%] md:w-[60%] lg:w-[23%] min-h-0 sm:min-h-[160px] md:min-h-[140px] lg:h-[20vh]">
      <div className="w-full">
        <h3 
          className="text-secondary1 text-right"
          style={{
            fontFamily: 'Beiruti',
            fontWeight: 600,
            fontStyle: 'SemiBold',
            fontSize: '16px',
            lineHeight: '100%',
            letterSpacing: '0%',
            marginBottom: '18px',
            width: '91px',
            height: '19px'
          }}
        >
          روابط سريعة
        </h3>
      </div>
      <nav className="w-full flex flex-row flex-wrap items-start justify-start gap-4 sm:gap-3 text-left sm:flex sm:flex-col">        
        {links.map((link, index) => (
          <div key={index}>
            {link.label === "تواصل معنا" ? (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  onContactClick?.();
                }}
                className="text-black87 hover:text-green-400 transition-colors text-sm sm:text-sm cursor-pointer text-left block py-1 sm:py-0 w-full text-right"
              >
                {link.label}
              </button>
            ) : (
              <Link
                href={link.href}
                className="text-black87 hover:text-green-400 transition-colors text-sm sm:text-sm cursor-pointer text-left block py-1 sm:py-0"
              >
                {link.label}
              </Link>
            )}
          </div>
        ))}
      </nav>
    </div>
  );
}
export default React.memo( QuickLinks);
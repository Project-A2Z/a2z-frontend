"use client";
import React from 'react'
import { useState } from "react";
import Link from "next/link";

const QuickLinks = ()=> {
  const [links] = useState([
    { href: "/", label: "الرئيسية" },
    { href: "/services", label: "الخدمات" },
    { href: "/products", label: "المنتجات" },
    { href: "/about", label: "من نحن" },
    { href: "/contact", label: "تواصل معنا" },
  ]);

  return (
    <div className="w-full sm:w-[80%] md:w-[60%] lg:w-[23%] min-h-0 sm:min-h-[160px] md:min-h-[140px] lg:h-[20vh]">
      <h3 className="font-beiruti font-semibold text-base sm:text-xl md:text-2xl leading-none text-secondary1 text-right sm:text-right mb-2 sm:mb-5 md:mb-6 lg:mb-7">روابط سريعة</h3>
        <nav className="w-full flex flex-row flex-wrap items-start justify-start gap-3 text-left sm:flex sm:flex-col ">        
        {links.map((link, index) => (
          <Link
            key={index}
            href={link.href}
            className="text-black87 hover:text-green-400 transition-colors text-sm cursor-pointer text-left"
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
export default React.memo( QuickLinks);
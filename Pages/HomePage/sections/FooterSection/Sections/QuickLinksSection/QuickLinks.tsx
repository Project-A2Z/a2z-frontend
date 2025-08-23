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
    <div className="w-[23%] h-[20vh]">
      <h3 className="font-beiruti font-semibold text-2xl leading-none text-secondary1 text-right mb-7">روابط سريعة</h3>
             <nav className="w-full flex flex-row flex-wrap items-center justify-start gap-x-6 gap-y-2 text-right md:flex-col md:items-start md:justify-start md:gap-0 md:space-y-3">        
        {links.map((link, index) => (
          <Link
            key={index}
            href={link.href}
            className="text-black87 hover:text-green-400 transition-colors text-sm cursor-pointer text-right"
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
export default React.memo( QuickLinks);
"use client";
import React from 'react'
import { useState } from "react";
import Link from "next/link";

const  CategoriesMenu = () =>{
  const [categories] = useState([
    { href: "/categories/general-chemicals", label: "كيماويات عامة" },
    { href: "/categories/cleaning-chemicals", label: "كيماويات منظفات" },
    { href: "/categories/cosmetics-chemicals", label: "كيماويات مستحضرات التجميل" },
    { href: "/categories/pesticides", label: "كيماويات مبيدات" },
    { href: "/categories/agricultural-chemicals", label: "كيماويات زراعية" },
   
    { href: "/categories/water-treatment", label: "كيماويات معالجة المياه" },
    { href: "/categories/construction-materials", label: "كيماويات مواد البناء" },
    { href: "/categories/vegetables", label: "كيماويات الخضراء" },
    { href: "/categories/laboratory-equipment", label: "أجهزة مستلزمات المعامل" },
  ]);

  return (
    <div className="w-full sm:w-[80%] md:w-[60%] lg:w-[23%] min-h-0 gap-4 flex flex-col items-start justify-start">
      <div className="w-full">
        <h3 
          className="font-beiruti font-semibold text-[16px] leading-[100%] text-secondary1 text-left"
          style={{
            width: '27px',
            height: '19px',
            fontFamily: 'Beiruti',
            fontWeight: 600,
            fontStyle: 'SemiBold',
            opacity: 1,
            transform: 'rotate(0deg)'
          }}
        >
          فئات
        </h3>
      </div>
      <nav className="w-full grid grid-cols-3 gap-x-1 gap-y-1.5 sm:gap-x-1.5 sm:gap-y-2 md:flex md:flex-col md:items-start md:gap-3">
        {categories.map((cat, index) => (
          <div key={index} className="w-full">
            <Link
              href={cat.href}
              className="hover:text-green-400 transition-colors  text-sm cursor-pointer text-black87 whitespace-nowrap block w-[159px] h-[19px] text-right opacity-100"
              style={{
                width: '159px',
                height: '19px',
                opacity: 1,
                transform: 'rotate(0deg)'
              }}
            >
              {cat.label}
            </Link>
          </div>
        ))}
      </nav>
    </div>
  );
}
export default React.memo(CategoriesMenu);
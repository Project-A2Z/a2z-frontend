"use client";
import React from 'react'
import { useState } from "react";
import Link from "next/link";

const  CategoriesMenu = () =>{
  const [categories] = useState([
    { href: "/categories/general-chemicals", label: "كيماويات عامة" },
    { href: "/categories/cleaning-chemicals", label: "كيماويات منظفات" },
    { href: "/categories/pesticides", label: "كيماويات مبيدات" },
    { href: "/categories/agricultural-chemicals", label: "كيماويات زراعية" },
    { href: "/categories/cosmetics-chemicals", label: "كيماويات مستحضرات التجميل" },
    { href: "/categories/water-treatment", label: "كيماويات معالجة المياه" },
    { href: "/categories/construction-materials", label: "كيماويات مواد البناء" },
    { href: "/categories/vegetables", label: "كيماويات الخضراء" },
    { href: "/categories/laboratory-equipment", label: "أجهزة مستلزمات المعامل" },
  ]);

  return (
    <div className="w-full sm:w-[80%] md:w-[60%] lg:w-[23%] min-h-0 gap-4 flex flex-col items-start justify-start">
      <h3 className="font-beiruti font-semibold text-base sm:text-xl md:text-2xl leading-none text-secondary1 text-left">فئات</h3>
      <nav className="w-full flex flex-row flex-wrap justify-start items-start gap-x-4 gap-y-2 sm:gap-y-3 md:flex md:flex-col md:items-start md:justify-start md:gap-2">
        {categories.map((cat, index) => (
          <p
            key={index}
            // href={cat.href}
            className="hover:text-green-400 transition-colors text-left text-sm cursor-pointer text-black87"
          >
            {cat.label}
          </p>
        ))}
      </nav>
    </div>
  );
}
export default React.memo(CategoriesMenu);
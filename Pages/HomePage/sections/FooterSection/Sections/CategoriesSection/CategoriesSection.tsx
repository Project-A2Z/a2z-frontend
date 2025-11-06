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
      <h3 className="font-beiruti font-semibold text-base sm:text-xl md:text-2xl leading-none text-secondary1 text-left bg-blue-500">فئات</h3>
      <nav className="w-full grid grid-cols-3 gap-x-6 gap-y-3 sm:grid-cols-3 md:grid-cols-1">
        {categories.map((cat, index) => (
          <div key={index} className="min-w-0">
            <Link
              href={cat.href}
              className="hover:text-green-400 transition-colors text-right text-sm cursor-pointer text-black87 whitespace-nowrap block overflow-visible"
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
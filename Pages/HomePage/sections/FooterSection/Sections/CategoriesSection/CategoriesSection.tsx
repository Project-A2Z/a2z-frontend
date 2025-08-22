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
    <div className="h-[100%] w-[20%]  gap-6   flex flex-col items-end justify-end ">
      <h3 className="font-beiruti font-semibold text-2xl leading-none text-secondary1  ">فئات</h3>
      <nav className="flex flex-col gap-2 ">
        {categories.map((cat, index) => (
          <Link
            key={index}
            href={cat.href}
            className=" hover:text-green-400 transition-colors text-right text-sm cursor-pointer items-end justify-end text-black87"
          >
            {cat.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
export default React.memo(CategoriesMenu);
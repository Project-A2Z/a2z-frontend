import React from "react";
import HeroSection from "@/Pages/AboutPage/Sections/HeroSection/HeroSection";
import ServicesSection from "@/Pages/AboutPage/Sections/ServicesSection/ServicesSection";

import { generateSEO } from "@/config/seo.config";

export const metadata = generateSEO({
  title: "من نحن",
  description:
    "شركة متخصصة في جميع انواع الكيماويات وخاصة كيماويات البناء الحديث والدهانات المتخصصة وكيماويات الصباغة والتجهيز والمواد المساعدة وكيماويات صناعة المنظفات ومستحضرات التجميل",
  url: "/about",
});

export default function AboutPage() {
  return (
    <div className="w-full  max-w-[380px] sm:max-w-[768px]  lg:max-w-[1024px] xl:max-w-[1360px] min-h-[4840px] sm:min-h-[3500px] lg:min-h-[2741px] mx-auto mt-[250px] sm:mt-[80px] lg:mt-[185px] mb-[30px] sm:mb-[40px] lg:mb-[50px] rounded-[24px] border border-solid border-black8 p-4 sm:p-6 lg:p-10 xl:p-[40px] flex flex-col gap-6 sm:gap-8 lg:gap-[40px] bg-white text-black87">
      <HeroSection />
      <ServicesSection />
    </div>
  );
}

"use client";

import { div, p } from 'motion/react-client';

import React, { useState } from 'react';

const ServicesSection = () => {
  const chemicals1 = [
    "كاربابول",
    "أسكوربيك أسيد",
    "شمع النحل",
    "اللانولين",
    "شمع برافين",
    "ألوان غذائية وصناعية",
    "اسبرتام",
    "سوربات بوتاسيوم",
    "جليسرول مونو ستيارات",
    "بيتاكاروتين",
    "دكستروز مونو هيدريت",
    "زانتان جم",
    "سوربيتول 70",
    "بنزوات صوديوم",
    "فانيلين",
    "صوديوم كاربوكسي ميثيل سيليلوز",
    "زيت صابون",
    "قلقونية",
    "كيروزوت",
    "كلوريد أمونيوم - رابع كلوريد أمونيوم",
    "هيدروجين بيروكسيد \"ماء الأكسجين\"",
    "سيتيل الكحول \"لانت 16\"",
    "سيتو ستييريل الكحول \"لانت O\"",
    "فازلين",
    "كمبرلان (K.D)",
    "جليسرين",
    "زيت البرافين",
    "زيت خروع",
    "مصدف",
    "استياريك أسيد",
    "ميثيل براين صوديوم",
    "بروبيل براين صوديوم",
    "فينوكس ايثانول",
    "ناسوتا (B) P.V.P",
    "أيزوبروبانول",
    "صوديوم تراي بولي فوسفات",
    "صوديوم لوريل ايثر سلفات",
    "هيدروكسيد صوديوم قشور",
    "بيكربونات صوديوم ... صناعي / دوائي",
    "كبريتات صوديوم (سلفات صوديوم) لامائية",
    "حامض سلفونيك - ألكيل بنزين سلفونيك أسيد",
    "بيركلورو ايثيلين - فينول - ليثوبون 28 و 30%",
    "فينول كريستال",
    "كلوريد صوديوم (ملح مغسول - غذائي - ملح أقراص - ملح خام)",
    "بيوتيل اسيتات",
    "ايزوبروبانول",
    "سيكلوهيكسانون",
    "ايثانول امين (مونو - داي - تراي)",
    "ايثيلين جليكول",
    "تكسابون N70",
    "هيدرازين",
    "كلور \"سائل - بودرة\"",
    "أكسيد تيتانيوم",
    "كبريتات نحاس \"زراعي - صناعي\""
  ];
  const items = [
    'كيماويات معالجة الفعاليات',
    'كيماويات معالجة ابراج التبريد',
    'كيماويات معالجة للبيلرات',
    'كيماويات معالجة مياه الشرب',
    'كيماويات معالجة الصرف الصحي',
    'كيماويات معالجة الصرف الصناعي'
  ];
  const items2 = [
    'صوديوم تنائي سلفونات',
    'صوديوم لحتو سلفونات',
    'صوديوم هايلمين سلفونات',
    'بولي ايروكسيلات',
    'جليكونات الصوديوم',
    'كلورايد الكالسيوم',
    'موليس',
    'فيناس',
    'فورمالين',
    'تيريث الصوديوم',
    'ثيوكبريتات الصوديوم',
    'تراي ايثانول امين',
    'فورمات الكالسيوم',
    'سيمياتول-NPg',
    'مانع ومزيح للرواعه'
  ];
  const items3 = [
    'المفعلله',
    'الصناعيه',
    'الزراعيه',
    'الخامات التغذينيه',
    'المبيدات والمطهرات الخاصه للمزارع',
    'كيماويات السيارات'
  ];
  const items4 = [
    'صودا كاويه - صودا اش - كربونات صوديوم',
    'صودا كاويه - صدريوكسيد صوديوم',
    'ح.ل - حامض الاستيك',
    'حامض الفورميك',
    'بيروكسيد الهيدروجين',
    'بولي فينيل الكحول',
    'بولي فينيل استات',
    'نشا معدل',
    'ملح جلوبر-كبريتات صوديوم',
    'ملح طعام-كلوريد صوديوم',
    'مواد الازاله عسر المياه',
    'Carrier LHT',
    'Levell.CO',
    'Levell.PSD',
    'Levell.PS',
    'Fix.CO',
    'Dispersol',
    'Sequestering',
    'Silitex 330'
  ];
  const supplies = [
    "الأثاثات المكتبية والفندقية",
    "تجهيزات ومستلزمات المعامل",
    "الأجهزة والإحتياجات الخاصة بالمعامل الكيماوية",
    "توريدات محطات الخرسانة الجاهزة وشركات المقاولات",
    "أجهزة وأدوات محطات الخرسانة الجاهزة",
    "المحطات المتخصصة والعمل ضد الحمولة والاحتكاك والثقوبات",
    "أجهزة ومعدات محطات معالجة المياه والصرف الصناعي والصحي",
    "قطع الغيار والعدد والأدوات",
    "أجهزة القياس الميكانيكية والكهربائية",
    "تنفيذ وتوريد محطات معالجة المياه للفرق والفنادق السياحية"
  ];
  const services = [
    "الكيماويات الإنشائية وإضافات الخرسانة الجاهزة",
    "كيماويات التسرب والصيانة والمواد المساعدة",
    "معالجة المياه والصرف الصناعي والصحي",
    "تصنيع المنظفات الصناعية",
    "تطبيق نظم الجودة"
  ];
  const downloadClients = [
    "الشركات والمؤسسات",
    "العينات والمنظمات",
    "شركات النظافة والخدمات",
    "الفنادق والمنشآت السياحية"
  ];

  const totalItems = chemicals1.length;
  const itemsPerColumn = Math.ceil(totalItems / 3);
  const column1 = chemicals1.slice(0, itemsPerColumn);
  const column2 = chemicals1.slice(itemsPerColumn, 2 * itemsPerColumn);
  const column3 = chemicals1.slice(2 * itemsPerColumn);

  return (
    <section className="w-full bg-white py-4 sm:py-8 lg:py-12" dir="rtl">
      {/* Main Header */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 mb-6 sm:mb-8 lg:mb-12">
        <h2 
          className="text-lg sm:text-xl lg:text-2xl font-semibold text-secondary1 text-center pb-3 sm:pb-4 border-b border-gray-200"
          style={{
            fontFamily: 'Beiruti',
            fontWeight: 600,
            lineHeight: '100%',
            letterSpacing: '0%'
          }}
        >
          الكيماويات
        </h2>

        <div className="flex flex-col gap-4 w-full mx-auto rounded-2xl border border-[#F0F0F0] p-4 sm:p-6">
          <h2 className="font-[Beiruti] font-semibold text-sm sm:text-base leading-none tracking-normal text-right text-black/87">
            تعمل الشركة في الكيماويات مثل :
          </h2>

          <div className="flex flex-col gap-4">
            <p className="font-[Beiruti] font-semibold text-sm sm:text-base leading-none tracking-normal text-right text-secondary1 mb-4 sm:mb-6">
              كيماويات صيانة المنظفات ومستحضرات التجميل
            </p>
            <div className="flex flex-col sm:flex-row justify-between gap-4">
              <div className="flex-1 bg-white rounded-lg p-3 sm:p-4">
                <ul className="space-y-2 sm:space-y-3">
                  {column1.map((item, index) => (
                    <li key={index} className="flex items-center gap-2 text-gray-700">
                      <span className="text-emerald-500 flex-shrink-0">●</span>
                      <span className="text-xs sm:text-sm leading-relaxed text-right">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex-1 bg-white rounded-lg p-3 sm:p-4">
                <ul className="space-y-2 sm:space-y-3">
                  {column2.map((item, index) => (
                    <li key={index + itemsPerColumn} className="flex items-center gap-2 text-gray-700">
                      <span className="text-emerald-500 flex-shrink-0">●</span>
                      <span className="text-xs sm:text-sm leading-relaxed text-right">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex-1 bg-white rounded-lg p-3 sm:p-4">
                <ul className="space-y-2 sm:space-y-3">
                  {column3.map((item, index) => (
                    <li key={index + 2 * itemsPerColumn} className="flex items-center gap-2 text-gray-700">
                      <span className="text-emerald-500 flex-shrink-0">●</span>
                      <span className="text-xs sm:text-sm leading-relaxed text-right">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Cards Section */}
          <div className="flex flex-col sm:flex-row flex-wrap justify-between gap-4 mt-6 sm:mt-8 lg:mt-12">
            {/* Card 1 */}
            <div className="bg-white rounded-lg p-4 sm:p-6 w-full sm:w-[48%] lg:w-[23%]">
              <h2 className="font-[Beiruti] font-medium text-sm sm:text-base leading-none tracking-normal text-secondary1 text-right mb-4 sm:mb-6">
                كيماويات معالجة المياه والصرف الصناعي
              </h2>
              <ul className="space-y-2 sm:space-y-3">
                {items.map((item, index) => (
                  <li key={index} className="flex items-start gap-2 text-right">
                    <span className="text-emerald-500 text-lg leading-none mt-1">●</span>
                    <span className="text-xs sm:text-sm leading-relaxed flex-1 text-black87">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Card 2 */}
            <div className="bg-white rounded-lg p-4 sm:p-6 w-full sm:w-[48%] lg:w-[23%]">
              <h2 className="font-[Beiruti] font-medium text-sm sm:text-base leading-none tracking-normal text-secondary1 text-right mb-4 sm:mb-6 whitespace-nowrap">
                كيماويات المياه والمنظفات المتخصصة
              </h2>
              <ul className="space-y-2 sm:space-y-3">
                {items2.map((item, index) => (
                  <li key={index} className="flex items-start gap-2 text-right">
                    <span className="text-emerald-500 text-lg leading-none mt-0.5">●</span>
                    <span className="text-xs sm:text-sm leading-relaxed flex-1 text-black87 whitespace-nowrap">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Card 3 */}
            <div className="bg-white rounded-lg p-4 sm:p-6 w-full sm:w-[48%] lg:w-[23%]">
              <h2 className="font-[Beiruti] font-medium text-sm sm:text-base leading-none tracking-normal text-secondary1 text-right mb-4 sm:mb-6">
                كيماويات وخامات متنوعه
              </h2>
              <ul className="space-y-2 sm:space-y-3">
                {items3.map((item, index) => (
                  <li key={index} className="flex items-start gap-2 text-right">
                    <span className="text-emerald-500 text-lg leading-none mt-0.5">●</span>
                    <span className="text-xs sm:text-sm leading-relaxed flex-1 text-black87">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Card 4 */}
            <div className="bg-white rounded-lg p-4 sm:p-6 w-full sm:w-[48%] lg:w-[23%]">
              <h2 className="font-[Beiruti] font-medium text-sm sm:text-base leading-none tracking-normal text-secondary1 text-right mb-4 sm:mb-6">
                كيماويات النسيج والمواد المساعدة
              </h2>
              <ul className="space-y-2 sm:space-y-3">
                {items4.map((item, index) => (
                  <li key={index} className="flex items-start gap-2 text-right">
                    <span className="text-emerald-500 text-lg leading-none mt-0.5">●</span>
                    <span className="text-xs sm:text-sm leading-relaxed flex-1 text-black87">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Last Section */}
      <div className="flex flex-col sm:flex-row flex-wrap justify-between gap-4 container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section 1 */}
        <div className="flex flex-col w-full sm:w-[48%] lg:w-[31%]">
          <h2 className="font-[Beiruti] font-medium text-sm sm:text-base leading-none tracking-normal text-secondary1 text-center mb-4 sm:mb-6 whitespace-nowrap">
            التوريدات العامة
          </h2>
          <div className="flex gap-3 sm:gap-4 w-full bg-white rounded-lg shadow-lg p-4 sm:p-6 flex-col">
            <p className="font-[Beiruti] font-medium text-xs sm:text-sm leading-none tracking-normal text-right text-black87 mb-3 sm:mb-4 whitespace-nowrap">
              تعمل الشركة في مجال التوريدات العامة مثل:
            </p>
            <div className="flex-1 overflow-y-auto">
              <ul className="space-y-2 sm:space-y-3">
                {services.map((item, index) => (
                  <li key={index} className="flex items-center gap-2 text-right">
                    <span className="text-emerald-500 flex-shrink-0">●</span>
                    <span className="font-[Beiruti] font-medium text-xs sm:text-sm leading-none tracking-normal text-black87 whitespace-nowrap">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Section 2 */}
        <div className="flex flex-col w-full sm:w-[48%] lg:w-[31%]">
          <h2 className="font-[Beiruti] font-medium text-sm sm:text-base leading-none tracking-normal text-secondary1  mb-4 sm:mb-6 whitespace-nowrap text-center">
            استشارات صناعية وبيئية
          </h2>
          <div className="flex gap-3 sm:gap-4 w-full bg-white rounded-lg shadow-lg p-4 sm:p-6 flex-col">
            <p className="font-[Beiruti] font-medium text-xs sm:text-sm leading-none tracking-normal text-right text-black87 mb-3 sm:mb-4 whitespace-nowrap">
            A2Z لديها خبراء ذوو خبرة عالية في هذه المجالات  :
              </p>
            <div className="flex-1 overflow-y-auto">
              <ul className="space-y-2 sm:space-y-3">
                {services.map((item, index) => (
                  <li key={index} className="flex items-center gap-2 text-right">
                    <span className="text-emerald-500 flex-shrink-0">●</span>
                    <span className="font-[Beiruti] font-medium text-xs sm:text-sm leading-none tracking-normal text-black87 whitespace-nowrap">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Section 3 */}
        <div className="flex flex-col w-full sm:w-[48%] lg:w-[31%]">
          <h2 className="font-[Beiruti] font-medium text-sm sm:text-base leading-none tracking-normal text-secondary1 text-center mb-4 sm:mb-6 whitespace-nowrap">
            منظفات ومستحضرات تجميل
          </h2>
          <div className="flex gap-3 sm:gap-4 w-full bg-white rounded-lg shadow-lg p-4 sm:p-6 flex-col">
            <p className="font-[Beiruti] font-medium text-xs sm:text-sm leading-none tracking-normal text-right text-black87 mb-3 sm:mb-4 whitespace-nowrap">
              تقوم الشركة بتوريد جميع أنواع المنظفات لعملاءها من :
            </p>
            <div className="flex-1 overflow-y-auto">
              <ul className="space-y-2 sm:space-y-3">
                {downloadClients.map((item, index) => (
                  <li key={index} className="flex items-center gap-2 text-right">
                    <span className="text-emerald-500 flex-shrink-0">●</span>
                    <span className="font-[Beiruti] font-medium text-xs sm:text-sm leading-none tracking-normal text-black87 whitespace-nowrap">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default React.memo(ServicesSection);
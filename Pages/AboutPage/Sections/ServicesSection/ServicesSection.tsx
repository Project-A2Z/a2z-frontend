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
      ]
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
    
    
      const totalItems = chemicals1.length;
      const itemsPerColumn = Math.ceil(totalItems / 3);
      const column1 = chemicals1.slice(0, itemsPerColumn);
      const column2 = chemicals1.slice(itemsPerColumn, 2 * itemsPerColumn);
      const column3 = chemicals1.slice(2 * itemsPerColumn);

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

  return (
    <section className="w-full bg-white py-8 sm:py-12 lg:py-16" dir="rtl">
      {/* Main Header */}
      <div className="max-w-[380px] sm:max-w-[768px]  lg:max-w-[1024px] xl:max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 mb-8 sm:mb-12">
        <h2 
          className="text-xl font-semibold text-primary text-center pb-4 border-gray-200"
          style={{
            fontFamily: 'Beiruti',
            fontWeight: 600,
            fontSize: '20px',
            lineHeight: '100%',
            letterSpacing: '0%'
          }}
        >
          الكيماويات
        </h2>

        <div className="flex flex-col  bg-blue-500 gap-4 aspect-[1280/1571] w-full max-w-[1280px] mx-auto rounded-3xl border border-[#F0F0F0] p-6  rotate-0 opacity-100">
            <h2 className="font-[Beiruti] font-semibold text-base leading-none tracking-normal text-right text-black/87 w-[177px] h-[19px] rotate-0 opacity-100">
                تعمل الشركة في الكيماويات مثل :
            </h2>

            <div className="flex flex-col gap-4 aspect-[1232/684] w-full max-w-[1232px] mx-auto rotate-0 opacity-100">
                <p className="font-[Beiruti] font-semibold text-base leading-none tracking-normal text-right text-emerald-600 mb-8 w-[260px] h-[19px] rotate-0 opacity-100">
                    كيماويات صيانة المنظفات ومستحضرات التجميل
                </p>
                <div className="flex justify-between gap-4 aspect-[1232/649] w-full max-w-[1232px] mx-auto rotate-0 opacity-100">
                    <div className="flex-1 bg-white rounded-lg p-4">
                        <ul className="space-y-3">
                            {column1.map((item, index) => (
                            <li key={index} className="flex items-center gap-2 text-gray-700">
                                <span className="text-emerald-500 flex-shrink-0">●</span>
                                <span className="text-sm leading-relaxed text-right">{item}</span>
                            </li>
                            ))}
                        </ul>
                    </div>
                    <div className="flex-1 bg-white rounded-lg p-4">
                        <ul className="space-y-3">
                            {column2.map((item, index) => (
                            <li key={index + itemsPerColumn} className="flex items-center gap-2 text-gray-700">
                                <span className="text-emerald-500 flex-shrink-0">●</span>
                                <span className="text-sm leading-relaxed text-right">{item}</span>
                            </li>
                            ))}
                        </ul>
                    </div>
                    <div className="flex-1 bg-white rounded-lg p-4">
                        <ul className="space-y-3">
                            {column3.map((item, index) => (
                            <li key={index + 2 * itemsPerColumn} className="flex items-center gap-2 text-gray-700">
                                <span className="text-emerald-500 flex-shrink-0">●</span>
                                <span className="text-sm leading-relaxed text-right">{item}</span>
                            </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div> 
        </div>

        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4" dir="rtl">
                <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-sm border-t-4 border-l-4 border-blue-500">
                    {/* Header */}
                    <h2 className="text-emerald-600 font-bold text-lg mb-6 text-right">
                    كيماويات معالجة المياه والصرف الصناعي
                    </h2>
                    
                    {/* List Items */}
                    <ul className="space-y-3">
                    {items.map((item, index) => (
                        <li key={index} className="flex items-start gap-3 text-right">
                        <span className="text-emerald-500 text-xl leading-none mt-1">●</span>
                        <span className="text-gray-700 text-base leading-relaxed flex-1">
                            {item}
                        </span>
                        </li>
                    ))}
                    </ul>
            </div>
            {/* 2222 */}
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4" dir="rtl">
                <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-sm border-2 border-dotted border-emerald-400">
                    {/* Header */}
                    <h2 className="text-emerald-600 font-bold text-lg mb-6 text-right leading-tight">
                    كيماويات المياه والمنظفات المتخصصة
                    </h2>
                    
                    {/* List Items */}
                    <ul className="space-y-3">
                    {items2.map((item, index) => (
                        <li key={index} className="flex items-start gap-3 text-right">
                        <span className="text-emerald-500 text-xl leading-none mt-0.5">●</span>
                        <span className="text-gray-700 text-base leading-relaxed flex-1">
                            {item}
                        </span>
                        </li>
                    ))}
                    </ul>
                </div>
            </div>
            {/* 3333 */}
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4" dir="rtl">
                <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-sm border-2 border-dotted border-blue-400">
                    {/* Header */}
                    <h2 className="text-emerald-600 font-bold text-lg mb-8 text-center leading-tight">
                    كيماويات وخامات متنوعه
                    </h2>
                    
                    {/* List Items */}
                    <ul className="space-y-4">
                    {items3.map((item, index) => (
                        <li key={index} className="flex items-start gap-3 text-right">
                        <span className="text-emerald-500 text-xl leading-none mt-0.5">●</span>
                        <span className="text-gray-700 text-base leading-relaxed flex-1">
                            {item}
                        </span>
                        </li>
                    ))}
                    </ul>
                </div>
            </div>
            {/* 4444 */}
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4" dir="rtl">
                <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-sm border-2 border-dotted border-gray-300">
                    {/* Header */}
                    <h2 className="text-emerald-600 font-bold text-lg mb-6 text-right leading-tight">
                    كيماويات النسيج والمواد المساعدة
                    </h2>
                    
                    {/* List Items */}
                    <ul className="space-y-3">
                    {items4.map((item, index) => (
                        <li key={index} className="flex items-start gap-3 text-right">
                        <span className="text-emerald-500 text-xl leading-none mt-0.5">●</span>
                        <span className="text-gray-700 text-sm leading-relaxed flex-1">
                            {item}
                        </span>
                        </li>
                    ))}
                    </ul>
                </div>
                </div>
        </div>
    </div>

      
      {/* last section */}
      <div className="flex justify-between items-start aspect-[1280/457] w-full max-w-[1280px] mx-auto bg-red-500">
       
        <div className="flex flex-col items-center justify-center p-4 bg-gray-50"  dir="rtl">
             <h2 className="font-[Beiruti] font-semibold text-xl leading-none tracking-normal w-[105px] h-[24px] rotate-0 opacity-100 text-emerald-600 text-center mb-6 text-primary">              
                  التوريدات العامة
            </h2>
            <div className="flex gap-4 w-[394px] aspect-[394/457] bg-blue-500 rounded-2xl shadow-lg p-8 flex flex-col">
                <p className="font-[Beiruti] font-semibold text-base leading-none tracking-normal text-right text-black/87 w-[232px] h-[19px] rotate-0 opacity-100 text-sm text-gray-700 mb-4">
                    تعمل الشركة في مجال التوريدات العامة مثل:
                </p>
                
                <div className="flex-1 overflow-y-auto">
                    <ul className="space-y-3">
                        {services.map((item, index) => (
                        <li key={index} className="flex items-center gap-2 text-gray-700">
                            <span className="text-emerald-500 flex-shrink-0">●</span>
                            <span className="text-sm leading-relaxed">{item}</span>
                        </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>

        <div className="flex flex-col items-center justify-center p-4 bg-gray-50"  dir="rtl">
            <h2 className="font-[Beiruti] font-semibold text-xl leading-none tracking-normal w-[160px] h-[24px] rotate-0 opacity-100 text-emerald-600 text-center mb-6 text-primary">              
                استشارات صناعية وبيئية   
            </h2>
            <div className="flex gap-4 w-[602px] aspect-[602/282] bg-black rounded-2xl shadow-lg p-8 flex flex-col">
                <p className="font-[Beiruti] font-semibold text-base leading-none tracking-normal text-right text-black/87 w-[554px] h-[19px] rotate-0 opacity-100 text-sm text-gray-700 mb-4">
                    تتميز شركه ايه تو زد بوجود فريق عمل من المتخصصين والإستشاريين ذوي الخبرات الكبيرة في المجالات الأتية :
                </p>
                
                <div className="flex-1 overflow-y-auto">
                    <ul className="space-y-3">
                        {services.map((item, index) => (
                        <li key={index} className="flex items-center gap-2 text-gray-700">
                            <span className="text-emerald-500 flex-shrink-0">●</span>
                            <span className="text-sm leading-relaxed">{item}</span>
                        </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>

        <div className="flex flex-col items-center justify-center p-4 bg-gray-50"  dir="rtl">
            <h2 className="font-[Beiruti] font-semibold text-xl leading-none tracking-normal w-[193px] h-[24px] rotate-0 opacity-100 text-emerald-600 text-center mb-6 text-primary">              
                منظفات ومستحضرات تجميل  
            </h2>
            <div className="flex gap-4 w-[337px] aspect-[337/247] bg-yellow-500 rounded-2xl shadow-lg p-8 flex flex-col">
                <p className="font-[Beiruti] font-semibold text-base leading-none tracking-normal text-right text-black/87 w-[289px] h-[19px] rotate-0 opacity-100 text-sm text-gray-700 mb-4">
                    تقوم الشركة بتوريد جميع أنواع المنظفات لعملاءها من :               
                 </p>
                
                <div className="flex-1 overflow-y-auto">
                    <ul className="space-y-3">
                        {downloadClients.map((item, index) => (
                        <li key={index} className="flex items-center gap-2 text-gray-700">
                            <span className="text-emerald-500 flex-shrink-0">●</span>
                            <span className="text-sm leading-relaxed">{item}</span>
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

export default ServicesSection;

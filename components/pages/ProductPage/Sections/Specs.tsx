"use client";
import React from "react";
import { useTranslations } from "next-intl";
import { getLocale } from "@/services/api/language";

type Props = {
  specs: String[];
};

const Specs: React.FC<Props> = ({ specs }) => {
  const t = useTranslations("specs");
  const isRTL = getLocale() === "ar";


  if (!specs?.length) return null;

  return (
    <section className="bg-white rounded-2xl border shadow-sm p-4 sm:p-6" style={{direction: isRTL ? 'rtl' : 'ltr' , textAlign : isRTL ? 'right' : 'left'}}>
      <h2 className=" text-lg sm:text-xl font-bold text-black87 mb-3 sm:mb-4" style={{textAlign : isRTL ? 'right' : 'left'}}>
        {t("title")}
      </h2>
      <ul className=" list-disc list-inside space-y-2 sm:space-y-2.5 text-black60 leading-relaxed">
        {specs.map((s, idx) => {
          const line = s?.trim() || "";
          return (
            <li key={idx} className="marker:text-black40">
              <span className="text-[13px] sm:text-base">{line}</span>
            </li>
          );
        })}
      </ul>
    </section>
  );
};

export default React.memo(Specs);
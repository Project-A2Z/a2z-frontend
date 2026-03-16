"use client";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

export default function CopyrightSection() {
  const t = useTranslations('footer.copyright');
  const [year, setYear] = useState<number | null>(null);

  useEffect(() => {
    setYear(new Date().getFullYear());
  }, []);

  return (
    <div className="w-full py-4 border-t border-gray-200 text-center relative">
      <div className="absolute top-0 left-1/2 w-[90%] h-px bg-gray-200 -translate-x-1/2 -translate-y-1/2" />
      <p className="text-black87 font-beiruti font-medium text-base">
        {year ?? "\u00A0"}{'@'} {t('rights')}
      </p>
      <p className="text-black87 font-beiruti font-medium text-base">
        {t('developer')}
      </p>
    </div>
  );
}
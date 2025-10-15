"use client";
import React from 'react';

export type Spec = { label: string; value: string };

type Props = {
  specs: Spec[];
};

const Specs: React.FC<Props> = ({ specs }) => {
  if (!specs?.length) return null;
  return (
    <section className="bg-white rounded-2xl border shadow-sm p-4 sm:p-6">
      <h2 className="text-right text-lg sm:text-xl font-bold text-black87 mb-3 sm:mb-4">مواصفات المنتج</h2>
      <ul className="text-right list-disc list-inside space-y-2 sm:space-y-2.5 text-black60 leading-relaxed">
        {specs.map((s, idx) => {
          const line = s.value?.trim() ? `${s.value}` : `${s.label}`;
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

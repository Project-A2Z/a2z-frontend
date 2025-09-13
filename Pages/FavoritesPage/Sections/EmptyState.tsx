"use client";
import React from 'react';
import { useRouter } from 'next/navigation';

const EmptyState: React.FC = () => {
  const router = useRouter();
  return (
    <section className="flex flex-col items-center justify-center py-16">
      <img
        src="/acessts/Frame 1321314963.png"
        alt="لا يوجد منتجات في المفضلة"
        className="w-64 h-auto mb-6"
      />
      <p className="text-black60 mb-6">لا يوجد منتجات فالمفضلة</p>
      <button
        onClick={() => router.push('/product')}
        className="px-6 py-2 rounded-full bg-primary text-white hover:bg-primary/90"
      >
        اذهب للتسوق
      </button>
    </section>
  );
};

export default EmptyState;

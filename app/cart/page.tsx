'use client';

import dynamic from 'next/dynamic';
import { Suspense } from 'react';

// Dynamically import the CartPage component with SSR disabled
const CartPage = dynamic(() => import('@/pages/CartPage/CartPage'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-white font-beiruti mt-[93px] flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="mt-4 text-lg text-gray-700">جاري تحميل السلة...</p>
      </div>
    </div>
  ),
});

export default function Cart() {
  return (
    <main className="min-h-screen bg-gray-50">
      <Suspense fallback={
        <div className="min-h-screen bg-white font-beiruti mt-[93px] flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="mt-4 text-lg text-gray-700">جاري تحميل السلة...</p>
          </div>
        </div>
      }>
        <CartPage />
      </Suspense>
    </main>
  );
}
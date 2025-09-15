"use client";
import React from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/UI/Buttons';

const EmptyState: React.FC = () => {
  const router = useRouter();
  return (
    <section className="flex flex-col items-center justify-center py-16">
      <Image
        src="/acessts/rafiki.png"
        alt="لا يوجد منتجات في المفضلة"
        width={256}
        height={256}
        className="w-64 h-auto mb-6"
        priority
      />
      <p className="text-black60 mb-6">لا يوجد منتجات فالمفضلة</p>
      <Button
        onClick={() => router.push('/products')}
        className="px-6 py-2 rounded-full bg-primary text-white hover:bg-primary/90"
      >
        اذهب للتسوق
      </Button>
    </section>
  );
};

export default EmptyState;

"use client";
import React, { useEffect, useMemo } from 'react';
import FavoritesList, { FavoriteItem } from './Sections/FavoritesList';
import RelatedProducts from '@/components/UI/RelatedProducts/RelatedProducts';
import { useFavorites } from '@/services/favorites/FavoritesContext';
import ActionEmptyState from '@/components/UI/EmptyStates/ActionEmptyState';
import { isAuthenticated } from '@/utils/auth';
import { useRouter } from 'next/navigation';

// In a real app this would come from API or global store
const FavoritesPage: React.FC<{ items?: FavoriteItem[] }> = ({ items }) => {
  const { items: favItems, remove } = useFavorites();
  const list = useMemo(() => items ?? favItems, [items, favItems]);
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login');
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-background font-beiruti mt-[93px]">
      <div className="max-w-6xl mx-auto px-4 py-6 space-y-8">
        <header className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-black87">المفضلة</h1>
        </header>

        {/* Content */}
        {list.length === 0 ? (
          <section className="flex flex-col items-center justify-center py-16">
            <ActionEmptyState
              imageSrc="/icons/empty-cart.png"
              imageAlt="لا يوجد منتجات في المفضلة"
              message="لا يوجد منتجات فالمفضلة"
              actionLabel="اذهب للتسوق"
              actionHref="/"
              imageClassName="w-64 h-auto mb-6"
            />
          </section>
        ) : (
          <FavoritesList items={list} onRemove={remove} />
        )}

        {/* Related products */}
        <section>
          {/* <h2 className="text-xl font-bold text-black87 mb-4">منتجات قد تعجبك</h2> */}
          <RelatedProducts />
        </section>
      </div>
    </div>
  );
};

export default React.memo(FavoritesPage);

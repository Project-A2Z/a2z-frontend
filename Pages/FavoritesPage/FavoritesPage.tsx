"use client";
import React, { useMemo } from 'react';
import EmptyState from './Sections/EmptyState';
import FavoritesList, { FavoriteItem } from './Sections/FavoritesList';
import RelatedProducts from '../CartPage/Sections/RelatedProducts';
import { useFavorites } from '@/services/favorites/FavoritesContext';

// In a real app this would come from API or global store
const FavoritesPage: React.FC<{ items?: FavoriteItem[] }> = ({ items }) => {
  const { items: favItems, remove } = useFavorites();
  const list = useMemo(() => items ?? favItems, [items, favItems]);

  return (
    <div className="min-h-screen bg-background font-beiruti mt-[93px]">
      <div className="max-w-6xl mx-auto px-4 py-6 space-y-8">
        <header className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-black87">المفضلة</h1>
        </header>

        {/* Content */}
        {list.length === 0 ? (
          <EmptyState />
        ) : (
          <FavoritesList items={list} onRemove={remove} />
        )}

        {/* Related products (منتجات قد تعجبك) */}
        <section>
          <h2 className="text-xl font-bold text-black87 mb-4">منتجات قد تعجبك</h2>
          <RelatedProducts />
        </section>
      </div>
    </div>
  );
};

export default FavoritesPage;

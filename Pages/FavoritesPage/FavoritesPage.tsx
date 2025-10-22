"use client";
import React, { useEffect, useMemo } from 'react';
import FavoritesList, { FavoriteItem } from './Sections/FavoritesList';
import RelatedProducts from '@/components/UI/RelatedProducts/RelatedProducts';
import { useFavorites } from '@/services/favorites/FavoritesContext';
import ActionEmptyState from '@/components/UI/EmptyStates/ActionEmptyState';
import { isAuthenticated } from '@/utils/auth';
import { useRouter } from 'next/navigation';
import { UserStorage } from '@/services/auth/login';
import { LogIn } from 'lucide-react';

// In a real app this would come from API or global store
const FavoritesPage: React.FC<{ items?: FavoriteItem[] }> = ({ items }) => {
  const { items: favItems, remove, loading, error } = useFavorites();
  const list = useMemo(() => items ?? favItems, [items, favItems]);
  const router = useRouter();

  useEffect(() => {
    // Check authentication using UserStorage
    const user = UserStorage.getUser();
    const token = UserStorage.getToken();
    const isUserAuthenticated = user !== null && token !== null;

    if (!isUserAuthenticated) {
      // User is not authenticated, redirect to login
      console.log('❌ User not authenticated, redirecting to login...');
      router.push('/login?redirect=/favorites');
      return;
    }

    console.log('✅ User authenticated:', user?.firstName, user?.lastName);
  }, [router]);

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-background font-beiruti mt-[93px]">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-gray-600">جاري التحميل...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show error state if there's an authentication error
  if (error && error.includes('تسجيل الدخول')) {
    return (
      <div className="min-h-screen bg-background font-beiruti mt-[93px]">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-center py-16">
            <div className="text-center bg-red-50 border border-red-200 rounded-lg p-8 max-w-md">
              <LogIn className="w-16 h-16 mx-auto mb-4 text-red-500" />
              <h2 className="text-xl font-bold text-red-800 mb-2">يرجى تسجيل الدخول</h2>
              <p className="text-red-600 mb-6">{error}</p>
              <button
                onClick={() => router.push('/login?redirect=/favorites')}
                className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2 mx-auto"
              >
                <LogIn className="w-4 h-4" />
                تسجيل الدخول
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show error state for other errors
  if (error) {
    return (
      <div className="min-h-screen bg-background font-beiruti mt-[93px]">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-center py-16">
            <div className="text-center bg-red-50 border border-red-200 rounded-lg p-8 max-w-md">
              <h2 className="text-xl font-bold text-red-800 mb-2">حدث خطأ</h2>
              <p className="text-red-600 mb-6">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors"
              >
                إعادة المحاولة
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background font-beiruti mt-[93px]">
      <div className="max-w-6xl mx-auto px-4 py-6 space-y-8">
        <header className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-black87">المفضلة</h1>
          {list.length > 0 && (
            <span className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
              {list.length} منتج
            </span>
          )}
        </header>

        {/* Content */}
        {list.length === 0 ? (
          <section className="flex flex-col items-center justify-center py-16">
            <ActionEmptyState
              imageSrc="/icons/empty-cart.png"
              imageAlt="لا يوجد منتجات في المفضلة"
              message="لا يوجد منتجات في المفضلة"
              actionLabel="تصفح المنتجات"
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

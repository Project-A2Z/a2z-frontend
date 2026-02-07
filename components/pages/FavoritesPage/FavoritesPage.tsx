"use client";
import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { UserStorage } from '@/services/auth/login';
import { LogIn, Loader2 } from 'lucide-react';

// Dynamically import components with SSR disabled
const FavoritesList = dynamic(
  () => import('./Sections/FavoritesList').then(mod => mod.default),
  { ssr: false, loading: () => <div>جاري التحميل...</div> }
);

const ActionEmptyState = dynamic(
  () => import('@/components/UI/EmptyStates/ActionEmptyState').then(mod => mod.default),
  { ssr: false, loading: () => <div>جاري التحميل...</div> }
);

const RelatedProducts = dynamic(
  () => import('@/components/UI/RelatedProducts/RelatedProducts').then(mod => mod.default),
  { ssr: false, loading: () => <div>جاري تحميل المنتجات المتعلقة...</div> }
);

// Import the FavoritesProvider and useFavorites hook
import { FavoritesProvider, useFavorites } from '@/services/favorites/FavoritesContext';

// Define the FavoriteItem type
type FavoriteItem = {
  id: number | string;
  name: string;
  price: number;
  image: string;
};

// Main component that wraps everything with FavoritesProvider
const FavoritesPageWrapper: React.FC<{ items?: FavoriteItem[] }> = ({ items }) => {
  return (
    <FavoritesProvider>
      <FavoritesPageContent items={items} />
    </FavoritesProvider>
  );
};

// Inner component that uses the useFavorites hook
const FavoritesPageContent: React.FC<{ items?: FavoriteItem[] }> = ({ items }) => {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const { items: favItems, remove, loading, error } = useFavorites();
  
  // Initialize on client side
  useEffect(() => {
    setIsMounted(true);
    setIsClient(true);
    
    const user = UserStorage.getUser();
    const token = UserStorage.getToken();
    const isUserAuthenticated = user !== null && token !== null;
    
    if (!isUserAuthenticated) {
      router.push('/login?redirect=/favorites');
    }
  }, [router]);
  
  // Don't render anything during SSR or if not mounted yet
  if (typeof window === 'undefined' || !isMounted || !isClient) {
    return null;
  }

  // Show loading state with a more visible spinner
  if (loading) {
    return (
      <div className="min-h-screen bg-background font-beiruti mt-[93px] flex items-center justify-center">
        <div className="flex flex-col items-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
          <p className="text-lg text-gray-600">جاري تحميل المفضلة...</p>
        </div>
      </div>
    );
  }
  
  // Show error state if there's an authentication error
  if (error?.includes('تسجيل الدخول')) {
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

  // Combine server and client items if needed
  const list = items ?? favItems;

  // Show empty state
  if (favItems.length === 0) {
    return (
      <div className="min-h-screen bg-background font-beiruti mt-[93px]">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <header className="mb-8">
            <h1 className="text-2xl font-bold text-black87">المفضلة</h1>
          </header>
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
          <RelatedProducts />
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
          <span className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
            {favItems.length} منتج
          </span>
        </header>

        {/* Favorites List */}
        <FavoritesList items={favItems} onRemove={remove} />

        {/* Related products */}
        <section>
          <RelatedProducts />
        </section>
      </div>
    </div>
  );
};

// Export the wrapper component
export default FavoritesPageWrapper;
"use client";
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
// import { isAuthenticated } from '@/utils/auth';
import  AuthenticationError  from "@/services/Utils/alertHandler";
import { wishlistService } from '@/services/api/wishlist';
import { UserStorage } from '@/services/auth/login';

export type FavoriteItem = {
  id: number | string;
  name: string;
  price: number;
  image: string;
};

type FavoritesContextValue = {
  items: FavoriteItem[];
  add: (item: FavoriteItem) => void;
  remove: (id: number | string) => void;
  toggle: (item: FavoriteItem) => void;
  isFavorite: (id: number | string | undefined) => boolean;
  clear: () => void;
  loading: boolean;
  error: string | null;
};

const FavoritesContext = createContext<FavoritesContextValue | undefined>(undefined);

const STORAGE_KEY = "a2z:favorites";

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<FavoriteItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);

        // Check if user is authenticated using UserStorage
        const user = UserStorage.getUser();
        const token = UserStorage.getToken();
        const isUserAuthenticated = user !== null && token !== null;

        if (isUserAuthenticated) {
          try {
            const res = await wishlistService.getAll();
            //console.log('🔍 Raw API Response:', res);

            const list = res?.data?.wishItems ?? [];
            //console.log('🔍 Wishlist items:', list);

            if (list.length > 0) {
              //console.log('🔍 First item structure:', list[0]);
              //console.log('🔍 First item productId:', list[0]?.productId);
            }

            const mapped: FavoriteItem[] = list.map((w: any) => {
              // According to API documentation, productId should be populated with product details
              const p = w.productId || {};
              //console.log('🔍 Product data for item:', w._id, p);

              const images = p.imageList || p.images || [];
              const img = Array.isArray(images) ? (images[0] || '/acessts/NoImage.jpg') : (images || '/acessts/NoImage.jpg');

              return {
                id: String(p._id ?? w.productId?._id ?? w._id),
                name: p.name || p.title || 'منتج',
                price: Number(p.price) || 0,
                image: typeof img === 'string' ? img : (img?.url || '/acessts/NoImage.jpg'),
              };
            });
            setItems(mapped);
            //console.log('✅ Mapped favorites:', mapped);
            return;
          } catch (e: any) {
            console.warn('Failed to load wishlist from backend:', e);
            if (e?.response?.status === 404) {
              //console.log('ℹ️ Wishlist not found (404) - starting with empty list');
              setItems([]);
              return;
            }
            if (e instanceof AuthenticationError) {
              setError('يرجى تسجيل الدخول لعرض قائمة المفضلة');
            } else if (e?.name === 'AuthenticationError') {
              setError('يرجى تسجيل الدخول لعرض قائمة المفضلة');
            } else if (e?.message?.includes('تسجيل الدخول')) {
              setError('يرجى تسجيل الدخول لعرض قائمة المفضلة');
            } else {
              setError('فشل في تحميل قائمة المفضلة');
            }
          }
        } else {
          // User not authenticated, try to load from localStorage as fallback
          try {
            const raw = typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null;
            if (raw) {
              const parsed = JSON.parse(raw) as FavoriteItem[];
              if (Array.isArray(parsed)) {
                setItems(parsed);
                //console.log('✅ Wishlist loaded from localStorage:', parsed.length, 'items');
              }
            }
          } catch (e) {
            console.warn('Failed to load wishlist from localStorage:', e);
          }
        }
      } catch (error: any) {
        console.error('Error loading favorites:', error);
        setError('حدث خطأ في تحميل قائمة المفضلة');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  useEffect(() => {
    try {
      if (typeof window !== "undefined") {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
      }
    } catch {}
  }, [items]);

  const add = useCallback(async (item: FavoriteItem) => {
    // Check if already in favorites to avoid duplicate API calls
    const alreadyInFavorites = items.some(p => p.id === item.id);
    if (alreadyInFavorites) {
      return; // Already in favorites, no need to add again
    }

    // Optimistic update
    setItems(prev => [item, ...prev]);
    setError(null);

    // Sync with backend if authenticated
    if (wishlistService.isAuthenticated()) {
      try {
        const res = await wishlistService.add(String(item.id));
        
        // Success or already exists (treated as success)
        if (res.status === 'success' || res.wasAlreadyAdded) {
          // Refresh the list to ensure consistency
          const freshList = await wishlistService.getAll();
          const mapped = (freshList.data?.wishItems || []).map((w: any) => ({
            id: String(w.productId?._id || w.productId || w._id),
            name: w.productId?.name || 'منتج',
            price: w.productId?.price || 0,
            image: Array.isArray(w.productId?.imageList) 
              ? (w.productId.imageList[0] || '/acessts/NoImage.jpg')
              : (w.productId?.imageList || '/acessts/NoImage.jpg')
          }));
          setItems(mapped);
        }
      } catch (e: any) {
        // For 409 (already exists) or 404 (not found) errors, just refresh the list
        if (e?.response?.status === 409 || e?.response?.status === 404) {
          try {
            const freshList = await wishlistService.getAll();
            const mapped = (freshList.data?.wishItems || []).map((w: any) => ({
              id: String(w.productId?._id || w.productId || w._id),
              name: w.productId?.name || 'منتج',
              price: w.productId?.price || 0,
              image: Array.isArray(w.productId?.imageList) 
                ? (w.productId.imageList[0] || '/acessts/NoImage.jpg')
                : (w.productId?.imageList || '/acessts/NoImage.jpg')
            }));
            setItems(mapped);
            return;
          } catch (refreshError) {
            console.error('Failed to refresh wishlist:', refreshError);
          }
        }

        // For other errors, show appropriate message
        console.error('Failed to add to wishlist:', e);
        setItems(prev => prev.filter(p => p.id !== item.id)); // Revert optimistic update
        
        if (e?.response?.status === 401) {
          setError('يرجى تسجيل الدخول لإضافة منتج للمفضلة');
        } else {
          setError('فشل في إضافة المنتج للمفضلة: ' + (e?.message || 'حدث خطأ غير متوقع'));
        }
      }
    } else {
      // User not authenticated, show error message and revert optimistic update
      setError('يرجى تسجيل الدخول لإضافة منتج للمفضلة');
      setItems(prev => prev.filter(p => p.id !== item.id));
    }
  }, []);

  const remove = useCallback(async (id: number | string) => {
    // Store the item being removed for potential rollback
    const itemToRemove = items.find(item => item.id === id);
    
    // Optimistic update
    setItems(prev => prev.filter(p => p.id !== id));
    setError(null);

    if (!wishlistService.isAuthenticated()) {
      setError('يرجى تسجيل الدخول لحذف منتج من المفضلة');
      if (itemToRemove) {
        setItems(prev => [...prev, itemToRemove].sort((a, b) => 
          a.name.localeCompare(b.name)
        ));
      }
      return;
    }

    try {
      await wishlistService.remove(String(id));
      
      // On success, refresh the list to ensure consistency
      const freshList = await wishlistService.getAll();
      const mapped = (freshList.data?.wishItems || []).map((w: any) => ({
        id: String(w.productId?._id || w.productId || w._id),
        name: w.productId?.name || 'منتج',
        price: w.productId?.price || 0,
        image: Array.isArray(w.productId?.imageList) 
          ? (w.productId.imageList[0] || '/acessts/NoImage.jpg')
          : (w.productId?.imageList || '/acessts/NoImage.jpg')
      }));
      setItems(mapped);
    } catch (e: any) {
      console.error('Failed to remove from wishlist:', e);
      
      // For 404 (not found) or 409 (conflict) errors, just refresh the list
      if (e?.response?.status === 404 || e?.response?.status === 409) {
        try {
          const freshList = await wishlistService.getAll();
          const mapped = (freshList.data?.wishItems || []).map((w: any) => ({
            id: String(w.productId?._id || w.productId || w._id),
            name: w.productId?.name || 'منتج',
            price: w.productId?.price || 0,
            image: Array.isArray(w.productId?.imageList) 
              ? (w.productId.imageList[0] || '/acessts/NoImage.jpg')
              : (w.productId?.imageList || '/acessts/NoImage.jpg')
          }));
          setItems(mapped);
          return;
        } catch (refreshError) {
          console.error('Failed to refresh wishlist:', refreshError);
        }
      }
      
      // Re-add the item if it exists
      if (itemToRemove) {
        setItems(prev => [...prev, itemToRemove].sort((a, b) => 
          a.name.localeCompare(b.name)
        ));
      }
      
      if (e?.response?.status === 401) {
        setError('يرجى تسجيل الدخول لحذف منتج من المفضلة');
      } else {
        setError('فشل في حذف المنتج من المفضلة: ' + (e?.message || 'حدث خطأ غير متوقع'));
      }
    }
  }, [items]);

  const toggle = useCallback((item: FavoriteItem) => {
    setItems(prev => {
      const exists = prev.some(p => p.id === item.id);
      setError(null);

      // fire API side-effect without changing function type
      if (wishlistService.isAuthenticated()) {
        if (exists) {
          void wishlistService.remove(String(item.id)).catch(err => {
            console.error('Failed to remove wishlist item:', err);
            if (err?.response?.status === 404) {
              //console.log('ℹ️ Item not found in wishlist (404) - this is expected if already removed');
              return; // Don't show error for 404 (item not found)
            }
            if (err instanceof AuthenticationError) {
              setError('يرجى تسجيل الدخول لحذف منتج من المفضلة');
            } else if (err?.name === 'AuthenticationError') {
              setError('يرجى تسجيل الدخول لحذف منتج من المفضلة');
            } else if (err?.message?.includes('تسجيل الدخول')) {
              setError('يرجى تسجيل الدخول لحذف منتج من المفضلة');
            } else {
              setError('فشل في حذف المنتج من المفضلة');
            }
          });
        } else {
          void wishlistService.add(String(item.id)).catch(err => {
            console.error('Failed to add wishlist item:', err);
            if (err?.response?.status === 409) {
              //console.log('ℹ️ Item already exists in wishlist (409) - this is expected');
              return; // Don't show error for 409
            }
            if (err?.status === 'error' && err?.message?.includes('موجود بالفعل')) {
              //console.log('ℹ️ Item already exists in wishlist - this is expected');
              return; // Don't show error for conflict
            }
            if (err instanceof AuthenticationError) {
              setError('يرجى تسجيل الدخول لإضافة منتج للمفضلة');
            } else if (err?.name === 'AuthenticationError') {
              setError('يرجى تسجيل الدخول لإضافة منتج للمفضلة');
            } else if (err?.message?.includes('تسجيل الدخول')) {
              setError('يرجى تسجيل الدخول لإضافة منتج للمفضلة');
            } else {
              setError('فشل في إضافة المنتج للمفضلة');
            }
          });
        }
      } else {
        // User not authenticated
        setError('يرجى تسجيل الدخول لتعديل قائمة المفضلة');
      }
      return exists ? prev.filter(p => p.id !== item.id) : [item, ...prev];
    });
  }, []);

  const isFavorite = useCallback((id: number | string | undefined) => {
    if (id === undefined) return false;
    return items.some(p => p.id === id);
  }, [items]);

  const clear = useCallback(() => {
    setItems([]);
    setError(null);
    wishlistService.clearCache();
    // Also clear from backend if authenticated
    if (wishlistService.isAuthenticated()) {
      // Note: We don't have a clear all method in wishlistService yet
      // This would be a future enhancement
    }
  }, []);

  const value = useMemo(() => ({
    items,
    add,
    remove,
    toggle,
    isFavorite,
    clear,
    loading,
    error
  }), [items, add, remove, toggle, isFavorite, clear, loading, error]);

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
}

export function useFavorites() {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error("useFavorites must be used within FavoritesProvider");
  return ctx;
}
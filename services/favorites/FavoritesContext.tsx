"use client";
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { isAuthenticated } from '@/utils/auth';
import { wishlistService } from '@/services/api/wishlist';

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
};

const FavoritesContext = createContext<FavoritesContextValue | undefined>(undefined);

const STORAGE_KEY = "a2z:favorites";

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<FavoriteItem[]>([]);

  useEffect(() => {
    const load = async () => {
      // If user is authenticated, load from backend, else fallback to localStorage
      if (isAuthenticated()) {
        try {
          const res = await wishlistService.getAll();
          const list = res?.data?.wishItems ?? [];
          const mapped: FavoriteItem[] = list.map((w: any) => {
            const p = w.productId || {};
            const images = p.imageList || p.images || [];
            const img = Array.isArray(images) ? (images[0] || '/acessts/NoImage.jpg') : (images || '/acessts/NoImage.jpg');
            return {
              id: String(p._id ?? w.productId ?? w._id),
              name: p.name || p.title || 'منتج',
              price: Number(p.price) || 0,
              image: typeof img === 'string' ? img : (img?.url || '/acessts/NoImage.jpg'),
            };
          });
          setItems(mapped);
          return;
        } catch (e) {
          // fallback to local storage on error
          console.warn('Failed to load wishlist from backend, falling back to local', e);
        }
      }
      try {
        const raw = typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null;
        if (raw) {
          const parsed = JSON.parse(raw) as FavoriteItem[];
          if (Array.isArray(parsed)) setItems(parsed);
        }
      } catch {}
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

  const add = useCallback((item: FavoriteItem) => {
    // optimistic update
    setItems(prev => (prev.some(p => p.id === item.id) ? prev : [item, ...prev]));
    // sync with backend if authenticated
    if (isAuthenticated()) {
      void wishlistService
        .add(String(item.id))
        .then((res: any) => {
          // If backend says conflict (already exists), keep optimistic state and do nothing
          if (res?.status === 'conflict') {
            return;
          }
        })
        .catch((e: any) => {
          // If 409 bubbled as an error, also ignore and keep optimistic state
          if (e?.response?.status === 409) return;
          console.error('Failed to add to wishlist', e);
          // revert on real failure
          setItems(prev => prev.filter(p => p.id !== item.id));
        });
    }
  }, []);

  const remove = useCallback((id: number | string) => {
    // optimistic update
    setItems(prev => prev.filter(p => p.id !== id));
    if (isAuthenticated()) {
      void wishlistService.remove(String(id)).catch((e) => {
        console.error('Failed to remove from wishlist', e);
        // best-effort: re-add is not possible without full product; rely on next refresh
      });
    }
  }, []);

  const toggle = useCallback((item: FavoriteItem) => {
    setItems(prev => {
      const exists = prev.some(p => p.id === item.id);
      // fire API side-effect without changing function type
      if (isAuthenticated()) {
        if (exists) {
          void wishlistService.remove(String(item.id)).catch(err => console.error('Failed to remove wishlist item', err));
        } else {
          void wishlistService.add(String(item.id)).catch(err => console.error('Failed to add wishlist item', err));
        }
      }
      return exists ? prev.filter(p => p.id !== item.id) : [item, ...prev];
    });
  }, []);

  const isFavorite = useCallback((id: number | string | undefined) => {
    if (id === undefined) return false;
    return items.some(p => p.id === id);
  }, [items]);

  const clear = useCallback(() => setItems([]), []);

  const value = useMemo(() => ({ items, add, remove, toggle, isFavorite, clear }), [items, add, remove, toggle, isFavorite, clear]);

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
}

export function useFavorites() {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error("useFavorites must be used within FavoritesProvider");
  return ctx;
}

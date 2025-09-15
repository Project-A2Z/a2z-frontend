"use client";
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

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
    try {
      const raw = typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null;
      if (raw) {
        const parsed = JSON.parse(raw) as FavoriteItem[];
        if (Array.isArray(parsed)) setItems(parsed);
      }
    } catch {}
  }, []);

  useEffect(() => {
    try {
      if (typeof window !== "undefined") {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
      }
    } catch {}
  }, [items]);

  const add = useCallback((item: FavoriteItem) => {
    setItems(prev => {
      if (prev.some(p => p.id === item.id)) return prev;
      return [item, ...prev];
    });
  }, []);

  const remove = useCallback((id: number | string) => {
    setItems(prev => prev.filter(p => p.id !== id));
  }, []);

  const toggle = useCallback((item: FavoriteItem) => {
    setItems(prev => (prev.some(p => p.id === item.id) ? prev.filter(p => p.id !== item.id) : [item, ...prev]));
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

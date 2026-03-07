// services/product/categories.ts - Category service with smart caching

import { Api, API_ENDPOINTS } from './../api/endpoints';

export interface Category {
  id: string;
  name: string;
  nameAr?: string;
  nameEn?: string;
  slug?: string;
  description?: string;
  image?: string;
  productsCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CategoriesResponse {
  status: string;
  length: number;
  data: string[]; // Array of category names
}

// Cache structure for categories
interface CategoryCache {
  categories: string[];
  timestamp: number;
}

// Global cache per language
const categoriesCacheMap: Record<string, CategoryCache> = {};
let isLoadingCategories = false;
let pendingCategoryPromises: Array<{ resolve: (value: string[]) => void; reject: (error: any) => void }> = [];

const CACHE_DURATION = 60 * 60 * 1000; // 1 hour
const MIN_REQUEST_INTERVAL = 10000; // 10 seconds
let lastCategoryRequestTime = 0;

// Request config — no auth required for this endpoint
const getRequestConfig = (revalidate: number = 60) => ({
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  next: {
    revalidate,
    tags: ['categories'],
  },
});

// Build URL with optional lang param
const buildCategoryUrl = (lang?: 'ar' | 'en'): string => {
  const base = `${Api}${API_ENDPOINTS.PRODUCTS.CATEGORY}`;
  return lang ? `${base}?lang=${lang}` : base;
};

// ============================================
// FETCH ALL CATEGORIES WITH CACHING
// ============================================
export const fetchCategories = async (lang?: 'ar' | 'en'): Promise<string[]> => {
  const now = Date.now();
  const cacheKey = lang ?? 'default';
  const cachedEntry = categoriesCacheMap[cacheKey];

  // Return cached data if available and not expired
  if (cachedEntry && now - cachedEntry.timestamp < CACHE_DURATION) {
    return [...cachedEntry.categories];
  }

  // If already loading, wait for the existing request
  if (isLoadingCategories) {
    return new Promise((resolve, reject) => {
      pendingCategoryPromises.push({ resolve, reject });
    });
  }

  // Rate limiting
  if (lastCategoryRequestTime && now - lastCategoryRequestTime < MIN_REQUEST_INTERVAL) {
    const waitTime = MIN_REQUEST_INTERVAL - (now - lastCategoryRequestTime);
    await new Promise(resolve => setTimeout(resolve, waitTime));
  }

  isLoadingCategories = true;
  lastCategoryRequestTime = now;

  const url = buildCategoryUrl(lang);

  const doFetch = () =>
    fetch(url, { method: 'GET', ...getRequestConfig() });

  try {
    let response = await doFetch();

    // Handle rate limiting
    if (response.status === 429) {
      console.warn('⏱️ Rate limited, using cached data if available');
      if (cachedEntry?.categories) {
        isLoadingCategories = false;
        const cachedData = [...cachedEntry.categories];
        pendingCategoryPromises.forEach(({ resolve }) => resolve(cachedData));
        pendingCategoryPromises = [];
        return cachedData;
      }

      const retryAfter = Math.min(30000, Math.pow(2, 1) * 5000);
      await new Promise(resolve => setTimeout(resolve, retryAfter));
      response = await doFetch();

      if (response.status === 429 && cachedEntry?.categories) {
        isLoadingCategories = false;
        const cachedData = [...cachedEntry.categories];
        pendingCategoryPromises.forEach(({ resolve }) => resolve(cachedData));
        pendingCategoryPromises = [];
        return cachedData;
      }
    }

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    const data: CategoriesResponse = await response.json();
    const categories = data.data || [];

    categoriesCacheMap[cacheKey] = { categories, timestamp: now };

    isLoadingCategories = false;
    pendingCategoryPromises.forEach(({ resolve }) => resolve(categories));
    pendingCategoryPromises = [];

    return categories;

  } catch (error) {
    console.error('❌ Error fetching categories:', error);

    if (cachedEntry?.categories) {
      isLoadingCategories = false;
      const cachedData = [...cachedEntry.categories];
      pendingCategoryPromises.forEach(({ resolve }) => resolve(cachedData));
      pendingCategoryPromises = [];
      return cachedData;
    }

    isLoadingCategories = false;
    pendingCategoryPromises.forEach(({ reject }) => reject(error));
    pendingCategoryPromises = [];
    throw error;
  }
};

// ============================================
// CLEAR CATEGORIES CACHE
// ============================================
export const clearCategoriesCache = (lang?: 'ar' | 'en') => {
  if (lang) {
    delete categoriesCacheMap[lang];
  } else {
    Object.keys(categoriesCacheMap).forEach(k => delete categoriesCacheMap[k]);
  }
};

// ============================================
// GET CACHE INFO
// ============================================
export const getCategoriesCacheInfo = (lang?: 'ar' | 'en') => {
  const cacheKey = lang ?? 'default';
  const entry = categoriesCacheMap[cacheKey];
  return {
    hasCache: !!entry,
    cacheSize: entry?.categories.length || 0,
    cacheAge: entry ? Date.now() - entry.timestamp : 0,
    isLoading: isLoadingCategories,
    pendingRequests: pendingCategoryPromises.length,
  };
};
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

// Global cache for categories
let categoriesCache: CategoryCache | null = null as CategoryCache | null;
let isLoadingCategories = false;
let pendingCategoryPromises: Array<{ resolve: (value: string[]) => void; reject: (error: any) => void }> = [];

const CACHE_DURATION = 60 * 60 * 1000; // 1 hour
const MIN_REQUEST_INTERVAL = 10000; // 10 seconds
let lastCategoryRequestTime = 0;

// Request config
const getRequestConfig = (revalidate: number = 60) => ({
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...(process.env.API_KEY && { 'Authorization': `Bearer ${process.env.API_KEY}` }),
  },
  next: { 
        revalidate, 
        tags: ['categories'] 
      },
});

// ============================================
// FETCH ALL CATEGORIES WITH CACHING
// ============================================
export const fetchCategories = async (): Promise<string[]> => {
  const now = Date.now();

  // Return cached data if available and not expired
  if (categoriesCache && (now - categoriesCache.timestamp) < CACHE_DURATION) {
    // console.log('✅ Using cached categories');
    return [...categoriesCache.categories]; // Return a copy
  }

  // If already loading, wait for the existing request
  if (isLoadingCategories) {
    // console.log('⏳ Waiting for existing categories request...');
    return new Promise((resolve, reject) => {
      pendingCategoryPromises.push({ resolve, reject });
    });
  }

  // Rate limiting
  if (lastCategoryRequestTime && (now - lastCategoryRequestTime) < MIN_REQUEST_INTERVAL) {
    const waitTime = MIN_REQUEST_INTERVAL - (now - lastCategoryRequestTime);
    // console.log(`⏱️ Rate limiting: waiting ${waitTime}ms before making request`);
    await new Promise(resolve => setTimeout(resolve, waitTime));
  }

  // Start new loading process
  isLoadingCategories = true;
  lastCategoryRequestTime = now;

  try {
    // console.log('🔄 Fetching categories from API...');

    const response = await fetch(`${Api}${API_ENDPOINTS.PRODUCTS.CATEGORY}`, {
      method: 'GET',
      ...getRequestConfig(),
    });

    // Handle rate limiting
    if (response.status === 429) {
      console.warn('⏱️ Rate limited, using cached data if available');
      if (categoriesCache && categoriesCache.categories) {
        isLoadingCategories = false;
        const cachedData = [...categoriesCache.categories];
        pendingCategoryPromises.forEach(({ resolve }) => resolve(cachedData));
        pendingCategoryPromises = [];
        return cachedData;
      }

      // Retry with exponential backoff
      const retryAfter = Math.min(30000, Math.pow(2, 1) * 5000);
      // console.log(`⏳ Retrying after ${retryAfter}ms due to rate limiting`);
      await new Promise(resolve => setTimeout(resolve, retryAfter));

      const retryResponse = await fetch(`${Api}${API_ENDPOINTS.PRODUCTS.CATEGORY}`, {
        method: 'GET',
        ...getRequestConfig(),
      });

      if (retryResponse.status === 429 && categoriesCache && categoriesCache.categories) {
        isLoadingCategories = false;
        const cachedData = [...categoriesCache.categories];
        pendingCategoryPromises.forEach(({ resolve }) => resolve(cachedData));
        pendingCategoryPromises = [];
        return cachedData;
      }

      if (!retryResponse.ok) {
        throw new Error(`API Error: ${retryResponse.status} ${retryResponse.statusText}`);
      }

      const data: CategoriesResponse = await retryResponse.json();
      const categories = data.data || [];

      // Update cache
      categoriesCache = {
        categories,
        timestamp: now
      };

      // console.log(`✅ Successfully fetched ${categories.length} categories on retry`);

      isLoadingCategories = false;
      pendingCategoryPromises.forEach(({ resolve }) => resolve(categories));
      pendingCategoryPromises = [];

      return categories;
    }

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    const data: CategoriesResponse = await response.json();
    const categories = data.data || [];

    // Update cache
    categoriesCache = {
      categories,
      timestamp: now
    };

    // console.log(`✅ Successfully fetched ${categories.length} categories`);

    isLoadingCategories = false;
    pendingCategoryPromises.forEach(({ resolve }) => resolve(categories));
    pendingCategoryPromises = [];

    return categories;

  } catch (error) {
    console.error('❌ Error fetching categories:', error);

    // Return cached data as fallback
    if (categoriesCache && categoriesCache.categories) {
      // console.log('🔄 Using cached categories as fallback');
      isLoadingCategories = false;
      const cachedData = [...categoriesCache.categories];
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
export const clearCategoriesCache = () => {
  categoriesCache = null;
  // console.log('🗑️ Categories cache cleared');
};

// ============================================
// GET CACHE INFO
// ============================================
export const getCategoriesCacheInfo = () => {
  return {
    hasCache: !!categoriesCache,
    cacheSize: categoriesCache?.categories.length || 0,
    cacheAge: categoriesCache ? Date.now() - categoriesCache.timestamp : 0,
    isLoading: isLoadingCategories,
    pendingRequests: pendingCategoryPromises.length
  };
};
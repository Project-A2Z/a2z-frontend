// services/product/products.ts - Updated with category-based caching

import {Api , API_ENDPOINTS} from './../api/endpoints'

const DEFAULT_LANGUAGE = 'ar';

export interface Product {
  id: string | number;
  name: string;
  nameAr?: string;
  nameEn?: string;
  description?: string;
  descriptionAr?: string;
  descriptionEn?: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  image: string;
  images?: (string)[];
  imageList?: (string)[]; 
  category: string;
  categoryId?: string | number;
  brand?: string;
  brandId?: string | number;
  inStock: boolean;
  stockQuantity?: number;
  rating?: number;
  reviewsCount?: number;
  tags?: string[];
  specifications?: Record<string, any>;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProductsResponse {
  data: Product[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  filters?: {
    categories: string[];
    brands: string[];
    priceRange: {
      min: number;
      max: number;
    };
  };
}

export interface ProductFilters {
  category?: string | string[];
  brand?: string | string[];
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  featured?: boolean;
  page?: number;
  limit?: number;
  sortBy?: 'name' | 'price' | 'rating' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
  lang?: string;
}

// Lightweight image URL validation
const isValidImageUrl = (url: string): boolean => {
  if (!url || typeof url !== 'string' || url.trim() === '') {
    return false;
  }
  
  if (url.includes('example.com') || (!url.startsWith('http://') && !url.startsWith('https://'))) {
    return false;
  }
  
  const imageExtensions = /\.(jpg|jpeg|png|gif|webp|svg|bmp)(\?|$)/i;
  const cloudServices = /(cloudinary|amazonaws|imgix|unsplash|pexels)/i;
  return imageExtensions.test(url) || cloudServices.test(url);
};

// Process product images
const processProductImagesStatic = (product: any): Product => {
  const imageList = product.imageList || [];
  const fallbackImages = product.images || [];
  const fallbackImage = product.image || '';
  
  const allImages: string[] = [];
  
  if (imageList.length > 0) {
    allImages.push(...imageList.filter((img: any): img is string => img && typeof img === 'string'));
  }
  
  if (fallbackImages.length > 0) {
    allImages.push(...fallbackImages.filter((img: any): img is string => img && typeof img === 'string'));
  }
  
  if (fallbackImage && !allImages.includes(fallbackImage)) {
    allImages.push(fallbackImage);
  }

  const uniqueImages = [...new Set(allImages)].filter(img => isValidImageUrl(img));
  
  return {
    ...product,
    id: product.id ?? product._id ?? '',
    name: product.nameAr || product.name || '',
    description: product.descriptionAr || product.description || '',
    category: product.category || '',
    price: product.price || 0,
    image: uniqueImages.length > 0 ? uniqueImages[0] : '',
    images: uniqueImages.length > 0 ? uniqueImages : [],
    imageList: uniqueImages.length > 0 ? uniqueImages : [],
    inStock: product.inStock !== undefined ? product.inStock : true,
  };
};

// Request config
const getRequestConfig = () => ({
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...(process.env.API_KEY && { 'Authorization': `Bearer ${process.env.API_KEY}` }),
  },
});

// ============================================
// CACHE STRUCTURE
// ============================================
interface CategoryCacheEntry {
  categoryName: string;
  products: Product[];
  timestamp: number;
}

// Global caches
let globalProductsCache: Product[] | null = null; // For all products
let categoryCaches: Map<string, CategoryCacheEntry> = new Map(); // For individual categories
let cacheTimestamp: number = 0;
let isLoadingProducts = false;
let pendingPromises: Array<{ resolve: (value: Product[]) => void; reject: (error: any) => void }> = [];
let lastRequestTime = 0;

const CACHE_DURATION = 60 * 60 * 1000; 
const MIN_REQUEST_INTERVAL = 15000; 

// ============================================
// FETCH ALL PRODUCTS (Global Cache)
// ============================================
export const getProductsWithState = async (): Promise<Product[]> => {
  const now = Date.now();

  // Return cached data if available and not expired
  if (globalProductsCache && (now - cacheTimestamp) < CACHE_DURATION) {
    console.log('✅ Using cached products');
    return globalProductsCache;
  }

  // If already loading, wait for the existing request
  if (isLoadingProducts) {
    console.log('⏳ Waiting for existing products request...');
    return new Promise((resolve, reject) => {
      pendingPromises.push({ resolve, reject });
    });
  }

  // Rate limiting
  if (lastRequestTime && (now - lastRequestTime) < MIN_REQUEST_INTERVAL) {
    const waitTime = MIN_REQUEST_INTERVAL - (now - lastRequestTime);
    console.log(`⏱️ Rate limiting: waiting ${waitTime}ms before making request`);
    await new Promise(resolve => setTimeout(resolve, waitTime));
  }

  // Start new loading process
  isLoadingProducts = true;
  lastRequestTime = now;

  try {
    console.log('🔄 Fetching fresh products from API...');

    const response = await fetch(`${Api}/${API_ENDPOINTS.PRODUCTS.LIST}`, {
      method: 'GET',
      ...getRequestConfig(),
    });

    // Handle rate limiting
    if (response.status === 429) {
      console.warn('⏱️ Rate limited, using cached data if available');
      if (globalProductsCache) {
        isLoadingProducts = false;
        pendingPromises.forEach(({ resolve }) => resolve(globalProductsCache!));
        pendingPromises = [];
        return globalProductsCache;
      }

      const retryAfter = Math.min(30000, Math.pow(2, 1) * 5000);
      console.log(`⏳ Retrying after ${retryAfter}ms due to rate limiting`);
      await new Promise(resolve => setTimeout(resolve, retryAfter));

      const retryResponse = await fetch(`${Api}/${API_ENDPOINTS.PRODUCTS.LIST}`, {
        method: 'GET',
        ...getRequestConfig(),
      });

      if (retryResponse.status === 429) {
        if (globalProductsCache) {
          isLoadingProducts = false;
          pendingPromises.forEach(({ resolve }) => resolve(globalProductsCache!));
          pendingPromises = [];
          return globalProductsCache;
        }
        throw new Error('Service temporarily unavailable due to rate limiting. Please try again later.');
      }

      if (!retryResponse.ok) {
        throw new Error(`API Error: ${retryResponse.status} ${retryResponse.statusText}`);
      }

      const data: ProductsResponse = await retryResponse.json();
      const products = (data.data || []).map(product => processProductImagesStatic(product));

      globalProductsCache = products;
      cacheTimestamp = now;

      isLoadingProducts = false;
      pendingPromises.forEach(({ resolve }) => resolve(products));
      pendingPromises = [];

      return products;
    }

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    const data: ProductsResponse = await response.json();
    const products = (data.data || []).map(product => processProductImagesStatic(product));

    globalProductsCache = products;
    cacheTimestamp = now;

    console.log(`✅ Successfully fetched ${products.length} products`);

    isLoadingProducts = false;
    pendingPromises.forEach(({ resolve }) => resolve(products));
    pendingPromises = [];

    return products;

  } catch (error) {
    console.error('❌ Error fetching products:', error);

    if (globalProductsCache) {
      console.log('🔄 Using cached products as fallback');
      isLoadingProducts = false;
      pendingPromises.forEach(({ resolve }) => resolve(globalProductsCache!));
      pendingPromises = [];
      return globalProductsCache;
    }

    if (error instanceof Error && error.message.includes('temporarily unavailable')) {
      isLoadingProducts = false;
      pendingPromises.forEach(({ reject }) => reject(new Error('Service temporarily unavailable due to high demand. Please try again in a few minutes.')));
      pendingPromises = [];
      return [];
    }

    isLoadingProducts = false;
    pendingPromises.forEach(({ reject }) => reject(error));
    pendingPromises = [];
    throw error;
  }
};

// ============================================
// FETCH PRODUCTS BY CATEGORY (Smart Caching)
// ============================================
export const fetchProductsByCategory = async (categoryName: string): Promise<Product[]> => {
  const now = Date.now();

  // Check if we have a valid cache for this specific category
  const cachedCategory = categoryCaches.get(categoryName);
  if (cachedCategory && (now - cachedCategory.timestamp) < CACHE_DURATION) {
    console.log(`✅ Using cached products for category: ${categoryName}`);
    return cachedCategory.products;
  }

  // If there's a cache for a different category, clear it
  if (categoryCaches.size > 0) {
    const cachedCategoryName = Array.from(categoryCaches.keys())[0];
    if (cachedCategoryName !== categoryName) {
      console.log(`🗑️ Clearing cache for old category: ${cachedCategoryName}`);
      categoryCaches.delete(cachedCategoryName);
    }
  }

  try {
    console.log(`🔄 Fetching products for category: ${categoryName}`);

    // Build filter URL
    const filterUrl = `${Api}/${API_ENDPOINTS.PRODUCTS.LIST}?category=${encodeURIComponent(categoryName)}`;

    const response = await fetch(filterUrl, {
      method: 'GET',
      ...getRequestConfig(),
    });

    if (response.status === 429) {
      console.warn('⏱️ Rate limited');
      if (cachedCategory) {
        return cachedCategory.products;
      }
      throw new Error('Service temporarily unavailable. Please try again later.');
    }

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    const data: ProductsResponse = await response.json();
    const products = (data.data || []).map(product => processProductImagesStatic(product));

    // Cache the products for this category
    categoryCaches.set(categoryName, {
      categoryName,
      products,
      timestamp: now
    });

    console.log(`✅ Cached ${products.length} products for category: ${categoryName}`);

    return products;

  } catch (error) {
    console.error(`❌ Error fetching products for category ${categoryName}:`, error);

    // Return cached data as fallback
    if (cachedCategory) {
      console.log('🔄 Using cached category data as fallback');
      return cachedCategory.products;
    }

    throw error;
  }
};

// ============================================
// FETCH ALL PRODUCTS (with optional filtering)
// ============================================
export const fetchAllProducts = async (filters: Omit<ProductFilters, 'page' | 'limit'> = {}): Promise<ProductsResponse> => {
  try {
    let products: Product[];

    // If category filter is specified, use category-specific cache
    if (filters.category && typeof filters.category === 'string') {
      products = await fetchProductsByCategory(filters.category);
    } else {
      // Otherwise, use global products cache
      products = await getProductsWithState();
    }

    // Apply additional filters
    let filteredProducts = products;

    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filteredProducts = filteredProducts.filter(p =>
        p.name.toLowerCase().includes(searchTerm) ||
        p.description?.toLowerCase().includes(searchTerm)
      );
    }

    if (filters.minPrice !== undefined) {
      filteredProducts = filteredProducts.filter(p => p.price >= filters.minPrice!);
    }

    if (filters.maxPrice !== undefined) {
      filteredProducts = filteredProducts.filter(p => p.price <= filters.maxPrice!);
    }

    if (filters.inStock !== undefined) {
      filteredProducts = filteredProducts.filter(p => p.inStock === filters.inStock);
    }

    return {
      data: filteredProducts,
      pagination: {
        page: 1,
        limit: filteredProducts.length,
        total: filteredProducts.length,
        totalPages: 1
      },
      filters: {
        categories: [...new Set(products.map(p => p.category))],
        brands: [],
        priceRange: {
          min: Math.min(...products.map(p => p.price)),
          max: Math.max(...products.map(p => p.price))
        }
      }
    };
  } catch (error) {
    console.error('Error in fetchAllProducts:', error);

    // Fallback to global cache
    if (globalProductsCache) {
      console.log('🔄 Using global cached products as fallback');
      return {
        data: globalProductsCache,
        pagination: {
          page: 1,
          limit: globalProductsCache.length,
          total: globalProductsCache.length,
          totalPages: 1
        },
        filters: {
          categories: [...new Set(globalProductsCache.map(p => p.category))],
          brands: [],
          priceRange: {
            min: Math.min(...globalProductsCache.map(p => p.price)),
            max: Math.max(...globalProductsCache.map(p => p.price))
          }
        }
      };
    }

    if (error instanceof Error && error.message.includes('temporarily unavailable')) {
      return {
        data: [],
        pagination: {
          page: 1,
          limit: 0,
          total: 0,
          totalPages: 0
        },
        filters: {
          categories: [],
          brands: [],
          priceRange: {
            min: 0,
            max: 0
          }
        }
      };
    }

    throw error;
  }
};

// ============================================
// FETCH PRODUCTS WITH PAGINATION
// ============================================
export const fetchProducts = async (filters: ProductFilters = {}): Promise<ProductsResponse> => {
  try {
    let products: Product[];

    // Use category-specific cache if category filter is specified
    if (filters.category && typeof filters.category === 'string') {
      products = await fetchProductsByCategory(filters.category);
    } else {
      products = await getProductsWithState();
    }

    // Apply filters
    let filteredProducts = products;

    if (filters.category && Array.isArray(filters.category)) {
      filteredProducts = filteredProducts.filter(p => filters.category!.includes(p.category));
    }

    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filteredProducts = filteredProducts.filter(p =>
        p.name.toLowerCase().includes(searchTerm) ||
        p.description?.toLowerCase().includes(searchTerm)
      );
    }

    if (filters.minPrice !== undefined) {
      filteredProducts = filteredProducts.filter(p => p.price >= filters.minPrice!);
    }

    if (filters.maxPrice !== undefined) {
      filteredProducts = filteredProducts.filter(p => p.price <= filters.maxPrice!);
    }

    // Apply pagination
    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

    return {
      data: paginatedProducts,
      pagination: {
        page,
        limit,
        total: filteredProducts.length,
        totalPages: Math.ceil(filteredProducts.length / limit)
      },
      filters: {
        categories: [...new Set(products.map(p => p.category))],
        brands: [],
        priceRange: {
          min: Math.min(...products.map(p => p.price)),
          max: Math.max(...products.map(p => p.price))
        }
      }
    };
  } catch (error) {
    console.error('Error in fetchProducts:', error);
    throw error;
  }
};

// ============================================
// CLIENT-SIDE PAGINATION HELPER
// ============================================
export const paginateProducts = (
  products: Product[], 
  page: number = 1, 
  limit: number = 20
): ProductsResponse => {
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedData = products.slice(startIndex, endIndex);
  
  return {
    data: paginatedData,
    pagination: {
      page,
      limit,
      total: products.length,
      totalPages: Math.ceil(products.length / limit)
    }
  };
};

// ============================================
// SEARCH PRODUCTS
// ============================================
export const searchProducts = async (
  query: string,
  filters: Omit<ProductFilters, 'search'> = {}
): Promise<ProductsResponse> => {
  try {
    return await fetchProducts({ ...filters, search: query });
  } catch (error) {
    console.error('Error searching products:', error);
    throw error;
  }
};

// ============================================
// FETCH FEATURED PRODUCTS
// ============================================
export const fetchFeaturedProducts = async (
  filters: ProductFilters = {}
): Promise<ProductsResponse> => {
  try {
    return await fetchProducts({ ...filters, featured: true });
  } catch (error) {
    console.error('Error fetching featured products:', error);
    throw error;
  }
};

// ============================================
// UTILITY FUNCTIONS
// ============================================
export const getProductImages = (product: Product): string[] => {
  if (product.imageList && product.imageList.length > 0) {
    return product.imageList.filter(img => img !== null && isValidImageUrl(img)) as string[];
  }
  
  if (product.images && product.images.length > 0) {
    return product.images.filter(img => img !== null && isValidImageUrl(img)) as string[];
  }
  
  if (product.image && isValidImageUrl(product.image)) {
    return [product.image];
  }
  
  return [];
};

export const getProductPrimaryImage = (product: Product): string | null => {
  const images = getProductImages(product);
  return images.length > 0 ? images[0] : null;
};

export const getByCategory = (categories: string[] | null | undefined, allProducts: Product[] | null | undefined): Product[] => {
  if (!categories || !categories.length || !allProducts) return allProducts || [];
  
  return allProducts.filter(product => 
    categories.some(category => 
      product.category === category || 
      product.categoryId === category
    )
  );
};

export const getByFirstLetter = (letter: string | null | undefined, allProducts: Product[] | null | undefined): Product[] => {
  if (!letter || letter === 'كل' || !allProducts) return allProducts || [];
  
  return allProducts.filter(product => 
    product.name && (
      product.name.charAt(0) === letter ||
      product.name.charAt(0).toLowerCase() === letter.toLowerCase()
    )
  );
};

// ============================================
// CACHE MANAGEMENT
// ============================================
export const clearProductsCache = () => {
  globalProductsCache = null;
  cacheTimestamp = 0;
  console.log('🗑️ Global products cache cleared');
};

export const clearCategoryCache = (categoryName?: string) => {
  if (categoryName) {
    categoryCaches.delete(categoryName);
    console.log(`🗑️ Cache cleared for category: ${categoryName}`);
  } else {
    categoryCaches.clear();
    console.log('🗑️ All category caches cleared');
  }
};

export const clearAllCaches = () => {
  clearProductsCache();
  clearCategoryCache();
  console.log('🗑️ All caches cleared');
};

export const getCacheInfo = () => {
  return {
    global: {
      hasCache: !!globalProductsCache,
      cacheSize: globalProductsCache?.length || 0,
      cacheAge: cacheTimestamp ? Date.now() - cacheTimestamp : 0,
      isLoading: isLoadingProducts,
      pendingRequests: pendingPromises.length
    },
    categories: {
      count: categoryCaches.size,
      entries: Array.from(categoryCaches.entries()).map(([name, cache]) => ({
        name,
        productsCount: cache.products.length,
        cacheAge: Date.now() - cache.timestamp
      }))
    }
  };
};
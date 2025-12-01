// services/product/products.ts - Updated with category-based caching and pagination

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
  
  // Unit type fields
  IsKG?: boolean;
  IsTON?: boolean;
  IsLITER?: boolean;
  IsCUBIC_METER?: boolean;
  stockQty?: number;
  PurchasePrice?: number;
}

export interface ProductsResponse {
  data: Product[];
  length?: number;
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

export const getProductUnitLabel = (product: Product): string => {
  if (product.IsKG) return 'كجم';
  if (product.IsTON) return 'طن';
  if (product.IsLITER) return 'لتر';
  if (product.IsCUBIC_METER) return 'متر مكعب';
  return '';
};

export const getProductUnitFullLabel = (product: Product): string => {
  if (product.IsKG) return 'كيلوجرام';
  if (product.IsTON) return 'طن';
  if (product.IsLITER) return 'لتر';
  if (product.IsCUBIC_METER) return 'متر مكعب';
  return '';
};

export const hasUnitPricing = (product: Product): boolean => {
  return !!(product.IsKG || product.IsTON || product.IsLITER || product.IsCUBIC_METER);
};

export const formatPriceWithUnit = (price: number | string, product: Product): string => {
  const formattedPrice = typeof price === 'string' 
    ? parseFloat(price.replace(/[^0-9.]/g, '')).toLocaleString('ar-EG')
    : price.toLocaleString('ar-EG');
  
  const unit = getProductUnitLabel(product);
  
  if (unit) {
    return `${formattedPrice} ج.م / ${unit}`;
  }
  
  return `${formattedPrice} ج.م`;
};

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

const getRequestConfig = (revalidate: number = 60) => ({
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...(process.env.API_KEY && { 'Authorization': `Bearer ${process.env.API_KEY}` }),
  },
  next: { 
    revalidate, 
    tags: ['products'] 
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

let globalProductsCache: Product[] | null = null;
let categoryCaches: Map<string, CategoryCacheEntry> = new Map();
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
  const now: number = Date.now();

  if (globalProductsCache && (now - cacheTimestamp) < CACHE_DURATION) {
    return globalProductsCache;
  }

  if (isLoadingProducts) {
    return new Promise((resolve, reject) => {
      pendingPromises.push({ resolve, reject });
    });
  }

  if (lastRequestTime && (now - lastRequestTime) < MIN_REQUEST_INTERVAL) {
    const waitTime: number = MIN_REQUEST_INTERVAL - (now - lastRequestTime);
    await new Promise<void>(resolve => setTimeout(resolve, waitTime));
  }

  isLoadingProducts = true;
  lastRequestTime = now;

  try {
    const response: Response = await fetch(`${Api}/${API_ENDPOINTS.PRODUCTS.LIST}`, {
      method: 'GET',
      ...getRequestConfig(),
    });

    if (response.status === 429) {
      if (globalProductsCache) {
        isLoadingProducts = false;
        pendingPromises.forEach(({ resolve }) => resolve(globalProductsCache!));
        pendingPromises = [];
        return globalProductsCache;
      }

      const retryAfter: number = Math.min(30000, Math.pow(2, 1) * 5000);
      await new Promise<void>(resolve => setTimeout(resolve, retryAfter));

      const retryResponse: Response = await fetch(`${Api}/${API_ENDPOINTS.PRODUCTS.LIST}`, {
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
      const products: Product[] = (data.data || []).map(product => processProductImagesStatic(product));

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
    const products: Product[] = (data.data || []).map(product => processProductImagesStatic(product));

    globalProductsCache = products;
    cacheTimestamp = now;

    isLoadingProducts = false;
    pendingPromises.forEach(({ resolve }) => resolve(products));
    pendingPromises = [];

    return products;

  } catch (error) {
    console.error('❌ Error fetching products:', error);

    if (globalProductsCache) {
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
  const now: number = Date.now();

  const cachedCategory = categoryCaches.get(categoryName);
  if (cachedCategory && (now - cachedCategory.timestamp) < CACHE_DURATION) {
    return cachedCategory.products;
  }

  if (categoryCaches.size > 0) {
    const cachedCategoryName = Array.from(categoryCaches.keys())[0];
    if (cachedCategoryName !== categoryName) {
      categoryCaches.delete(cachedCategoryName);
    }
  }

  try {
    const filterUrl: string = `${Api}/${API_ENDPOINTS.PRODUCTS.LIST}?category=${encodeURIComponent(categoryName)}`;

    const response: Response = await fetch(filterUrl, {
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
    const products: Product[] = (data.data || []).map(product => processProductImagesStatic(product));

    categoryCaches.set(categoryName, {
      categoryName,
      products,
      timestamp: now
    });

    return products;

  } catch (error) {
    console.error(`❌ Error fetching products for category ${categoryName}:`, error);

    if (cachedCategory) {
      return cachedCategory.products;
    }

    throw error;
  }
};

// ============================================
// FETCH PRODUCTS WITH PAGINATION FROM API
// ============================================
export const fetchProductsFromAPI = async (
  page: number = 1, 
  limit: number = 20, 
  category?: string
): Promise<ProductsResponse> => {
  const now: number = Date.now();

  if (lastRequestTime && (now - lastRequestTime) < MIN_REQUEST_INTERVAL) {
    const waitTime: number = MIN_REQUEST_INTERVAL - (now - lastRequestTime);
    await new Promise<void>((resolve) => setTimeout(resolve, waitTime));
  }

  lastRequestTime = now;

  try {
    let url: string = `${Api}/${API_ENDPOINTS.PRODUCTS.LIST}?page=${page}&limit=${limit}`;
    
    if (category) {
      url += `&category=${encodeURIComponent(category)}`;
    }

    const response: Response = await fetch(url, {
      method: 'GET',
      ...getRequestConfig(),
    });

    if (response.status === 429) {
      console.warn('⏱️ Rate limited');
      throw new Error('Service temporarily unavailable due to rate limiting. Please try again later.');
    }

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    const data: ProductsResponse = await response.json();
    
    const products: Product[] = (data.data || []).map((product: any) => 
      processProductImagesStatic(product)
    );

    const total: number = data.pagination?.total || data.length || products.length;
    const totalPages: number = Math.ceil(total / limit);

    return {
      data: products,
      pagination: {
        page,
        limit,
        total,
        totalPages
      },
      filters: data.filters || {
        categories: [...new Set(products.map((p: Product) => p.category))],
        brands: [],
        priceRange: {
          min: products.length > 0 ? Math.min(...products.map((p: Product) => p.price)) : 0,
          max: products.length > 0 ? Math.max(...products.map((p: Product) => p.price)) : 0
        }
      }
    };

  } catch (error) {
    console.error('❌ Error fetching paginated products:', error);
    throw error;
  }
};

// ============================================
// FETCH ALL PRODUCTS WITH SMART ROUTING
// ============================================
export const fetchAllProducts = async (
  filters: ProductFilters = {} 
): Promise<ProductsResponse> => {
  try {
    const page: number = filters.page || 1;
    const limit: number = filters.limit || 20;

    const needsClientSideFiltering: boolean = Boolean(
      filters.search || 
      filters.minPrice !== undefined || 
      filters.maxPrice !== undefined || 
      filters.inStock !== undefined ||
      (Array.isArray(filters.category) && filters.category.length > 1)
    );

    if (!needsClientSideFiltering) {
      const category: string | undefined = typeof filters.category === 'string' 
        ? filters.category 
        : undefined;
      return await fetchProductsFromAPI(page, limit, category);
    }

    let products: Product[];

    if (filters.category && typeof filters.category === 'string') {
      products = await fetchProductsByCategory(filters.category);
    } else {
      products = await getProductsWithState();
    }

    let filteredProducts: Product[] = products;

    if (Array.isArray(filters.category) && filters.category.length > 0) {
      filteredProducts = filteredProducts.filter((p: Product) => 
        (filters.category as string[]).includes(p.category) || 
        (p.categoryId && (filters.category as string[]).includes(p.categoryId as string))
      );
    }

    if (filters.search) {
      const searchTerm: string = filters.search.toLowerCase();
      filteredProducts = filteredProducts.filter((p: Product) =>
        p.name.toLowerCase().includes(searchTerm) ||
        (p.description?.toLowerCase().includes(searchTerm) ?? false)
      );
    }

    if (filters.minPrice !== undefined) {
      filteredProducts = filteredProducts.filter((p: Product) => p.price >= filters.minPrice!);
    }

    if (filters.maxPrice !== undefined) {
      filteredProducts = filteredProducts.filter((p: Product) => p.price <= filters.maxPrice!);
    }

    if (filters.inStock !== undefined) {
      filteredProducts = filteredProducts.filter((p: Product) => p.inStock === filters.inStock);
    }

    const total: number = filteredProducts.length;
    const totalPages: number = Math.ceil(total / limit);

    const startIndex: number = (page - 1) * limit;
    const endIndex: number = startIndex + limit;
    const paginatedProducts: Product[] = filteredProducts.slice(startIndex, endIndex);

    return {
      data: paginatedProducts,
      pagination: {
        page,
        limit,
        total,
        totalPages
      },
      filters: {
        categories: [...new Set(products.map((p: Product) => p.category))],
        brands: [],
        priceRange: {
          min: products.length > 0 ? Math.min(...products.map((p: Product) => p.price)) : 0,
          max: products.length > 0 ? Math.max(...products.map((p: Product) => p.price)) : 0
        }
      }
    };

  } catch (error) {
    console.error('Error in fetchAllProducts:', error);

    if (globalProductsCache) {
      const page: number = filters.page || 1;
      const limit: number = filters.limit || 20;
      const startIndex: number = (page - 1) * limit;
      const endIndex: number = startIndex + limit;
      const paginatedCache: Product[] = globalProductsCache.slice(startIndex, endIndex);

      return {
        data: paginatedCache,
        pagination: {
          page,
          limit,
          total: globalProductsCache.length,
          totalPages: Math.ceil(globalProductsCache.length / limit)
        },
        filters: {
          categories: [...new Set(globalProductsCache.map((p: Product) => p.category))],
          brands: [],
          priceRange: {
            min: globalProductsCache.length > 0 
              ? Math.min(...globalProductsCache.map((p: Product) => p.price)) 
              : 0,
            max: globalProductsCache.length > 0 
              ? Math.max(...globalProductsCache.map((p: Product) => p.price)) 
              : 0
          }
        }
      };
    }

    if (error instanceof Error && error.message.includes('temporarily unavailable')) {
      return {
        data: [],
        pagination: {
          page: 1,
          limit: 20,
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

    if (filters.category && typeof filters.category === 'string') {
      products = await fetchProductsByCategory(filters.category);
    } else {
      products = await getProductsWithState();
    }

    let filteredProducts: Product[] = products;

    if (filters.category && Array.isArray(filters.category)) {
      filteredProducts = filteredProducts.filter((p: Product) => 
        (filters.category as string[]).includes(p.category)
      );
    }

    if (filters.search) {
      const searchTerm: string = filters.search.toLowerCase();
      filteredProducts = filteredProducts.filter((p: Product) =>
        p.name.toLowerCase().includes(searchTerm) ||
        (p.description?.toLowerCase().includes(searchTerm) ?? false)
      );
    }

    if (filters.minPrice !== undefined) {
      filteredProducts = filteredProducts.filter((p: Product) => p.price >= filters.minPrice!);
    }

    if (filters.maxPrice !== undefined) {
      filteredProducts = filteredProducts.filter((p: Product) => p.price <= filters.maxPrice!);
    }

    const page: number = filters.page || 1;
    const limit: number = filters.limit || 20;
    const startIndex: number = (page - 1) * limit;
    const endIndex: number = startIndex + limit;
    const paginatedProducts: Product[] = filteredProducts.slice(startIndex, endIndex);

    return {
      data: paginatedProducts,
      pagination: {
        page,
        limit,
        total: filteredProducts.length,
        totalPages: Math.ceil(filteredProducts.length / limit)
      },
      filters: {
        categories: [...new Set(products.map((p: Product) => p.category))],
        brands: [],
        priceRange: {
          min: products.length > 0 ? Math.min(...products.map((p: Product) => p.price)) : 0,
          max: products.length > 0 ? Math.max(...products.map((p: Product) => p.price)) : 0
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
  const startIndex: number = (page - 1) * limit;
  const endIndex: number = startIndex + limit;
  const paginatedData: Product[] = products.slice(startIndex, endIndex);
  
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
    return product.imageList.filter((img): img is string => img !== null && isValidImageUrl(img));
  }
  
  if (product.images && product.images.length > 0) {
    return product.images.filter((img): img is string => img !== null && isValidImageUrl(img));
  }
  
  if (product.image && isValidImageUrl(product.image)) {
    return [product.image];
  }
  
  return [];
};

export const getProductPrimaryImage = (product: Product): string | null => {
  const images: string[] = getProductImages(product);
  return images.length > 0 ? images[0] : null;
};

export const getByCategory = (categories: string[] | null | undefined, allProducts: Product[] | null | undefined): Product[] => {
  if (!categories || !categories.length || !allProducts) return allProducts || [];
  
  return allProducts.filter((product: Product) => 
    categories.some((category: string) => 
      product.category === category || 
      product.categoryId === category
    )
  );
};

export const getByFirstLetter = (letter: string | null | undefined, allProducts: Product[] | null | undefined): Product[] => {
  if (!letter || letter === 'كل' || !allProducts) return allProducts || [];
  
  return allProducts.filter((product: Product) => 
    product.name && (
      product.name.charAt(0) === letter ||
      product.name.charAt(0).toLowerCase() === letter.toLowerCase()
    )
  );
};

// ============================================
// CACHE MANAGEMENT
// ============================================
export const clearProductsCache = (): void => {
  globalProductsCache = null;
  cacheTimestamp = 0;
};

export const clearCategoryCache = (categoryName?: string): void => {
  if (categoryName) {
    categoryCaches.delete(categoryName);
  } else {
    categoryCaches.clear();
  }
};

export const clearAllCaches = (): void => {
  clearProductsCache();
  clearCategoryCache();
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
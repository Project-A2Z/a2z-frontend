// services/product/products.ts - Updated with proper pagination

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

// Global state for products with fallback mechanism
let globalProductsCache: Product[] | null = null;
let cacheTimestamp: number = 0;
let isLoadingProducts = false;
let pendingPromises: Array<{ resolve: (value: Product[]) => void; reject: (error: any) => void }> = [];

const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

// Centralized product fetching with state management and fallbacks
export const getProductsWithState = async (): Promise<Product[]> => {
  // Return cached data if available and not expired
  if (globalProductsCache && (Date.now() - cacheTimestamp) < CACHE_DURATION) {
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

  // Start new loading process
  isLoadingProducts = true;

  try {
    console.log('🔄 Fetching fresh products from API...');

    const response = await fetch(`${Api}/${API_ENDPOINTS.PRODUCTS.LIST}`, {
      method: 'GET',
      ...getRequestConfig(),
    });

    // Handle rate limiting gracefully
    if (response.status === 429) {
      console.warn('⏱️ Rate limited, using cached data if available');
      if (globalProductsCache) {
        isLoadingProducts = false;
        pendingPromises.forEach(({ resolve }) => resolve(globalProductsCache!));
        pendingPromises = [];
        return globalProductsCache;
      }
      throw new Error('Rate limited and no cached data available');
    }

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    const data: ProductsResponse = await response.json();
    const products = (data.data || []).map(product => processProductImagesStatic(product));

    // Update global cache
    globalProductsCache = products;
    cacheTimestamp = Date.now();

    console.log(`✅ Successfully fetched ${products.length} products`);

    // Resolve all pending promises
    isLoadingProducts = false;
    pendingPromises.forEach(({ resolve }) => resolve(products));
    pendingPromises = [];

    return products;

  } catch (error) {
    console.error('❌ Error fetching products:', error);

    // Return cached data as fallback
    if (globalProductsCache) {
      console.log('🔄 Using cached products as fallback');
      isLoadingProducts = false;
      pendingPromises.forEach(({ resolve }) => resolve(globalProductsCache!));
      pendingPromises = [];
      return globalProductsCache;
    }

    // No cached data available
    console.warn('⚠️ No cached data available');
    isLoadingProducts = false;
    pendingPromises.forEach(({ reject }) => reject(error));
    pendingPromises = [];
    throw error;
  }
};

// ============================================
// FETCH ALL PRODUCTS (No Pagination - for client-side pagination)
// ============================================
export const fetchAllProducts = async (filters: Omit<ProductFilters, 'page' | 'limit'> = {}): Promise<ProductsResponse> => {
  try {
    // Use the centralized state management for products
    const products = await getProductsWithState();

    // Apply filters if provided
    let filteredProducts = products;
    if (filters.category) {
      filteredProducts = filteredProducts.filter(p => p.category === filters.category);
    }
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filteredProducts = filteredProducts.filter(p =>
        p.name.toLowerCase().includes(searchTerm) ||
        p.description?.toLowerCase().includes(searchTerm)
      );
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

    // Return cached data if available
    if (globalProductsCache) {
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

    throw error;
  }
};

// ============================================
// FETCH PRODUCTS WITH SERVER-SIDE PAGINATION
// ============================================
export const fetchProducts = async (filters: ProductFilters = {}): Promise<ProductsResponse> => {
  try {
    // Use the centralized state management for products
    const products = await getProductsWithState();

    // Apply pagination
    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedProducts = products.slice(startIndex, endIndex);

    // Apply filters if provided
    let filteredProducts = paginatedProducts;
    if (filters.category) {
      const categories = Array.isArray(filters.category) ? filters.category : [filters.category];
      filteredProducts = filteredProducts.filter(p => categories.includes(p.category));
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

    return {
      data: filteredProducts,
      pagination: {
        page,
        limit,
        total: filteredProducts.length,
        totalPages: Math.ceil(products.length / limit)
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

    // Return cached data if available
    if (globalProductsCache) {
      const page = filters.page || 1;
      const limit = filters.limit || 20;
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedProducts = globalProductsCache.slice(startIndex, endIndex);

      return {
        data: paginatedProducts,
        pagination: {
          page,
          limit,
          total: globalProductsCache.length,
          totalPages: Math.ceil(globalProductsCache.length / limit)
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
// FETCH BY CATEGORY
// ============================================
export const fetchProductsByCategory = async (
  categoryId: string | number,
  filters: Omit<ProductFilters, 'category'> = {}
): Promise<ProductsResponse> => {
  try {
    return await fetchProducts({ ...filters, category: String(categoryId) });
  } catch (error) {
    console.error('Error fetching products by category:', error);
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

export const withErrorHandling = <T extends (...args: any[]) => Promise<any>>(
  fn: T
): T => {
  return (async (...args: Parameters<T>) => {
    try {
      return await fn(...args);
    } catch (error) {
      console.error(`API Error in ${fn.name}:`, error);
      
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
      } as ProductsResponse;
    }
  }) as T;
};
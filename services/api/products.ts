import apiClient from './client';

// Check if we're on the server or client
const isServer = typeof window === 'undefined';

export interface Review {
  _id: string;
  userId: string;
  productId: string;
  description: string;
  rateNum: number;
  date: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface Product {
  _id: string;
  name: string;
  nameAr?: string;
  nameEn?: string;
  description?: string;
  descriptionAr?: string;
  descriptionEn?: string;
  price: number;
  imageList: string[];
  image?: string;
  images?: string[];
  category: string;
  categoryId?: string;
  brand?: string;
  brandId?: string;
  stockQty: number;
  stockType: 'unit' | 'kg' | 'ton';
  averageRate?: number;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: any;
}

export interface ProductFilters {
  page?: number;
  limit?: number;
  fields?: string;
  category?: string;
  name?: string;
  price?: {
    gte?: number;
    lte?: number;
  };
  [key: string]: any;
}

export interface ApiResponse<T> {
  status: string;
  data: T;
  message?: string;
  length?: number;
}

// Client-side cache for rate limiting prevention
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

class ClientCache<T> {
  private cache = new Map<string, CacheEntry<T>>();

  set(key: string, data: T, ttlMs: number = 5 * 60 * 1000) { // 5 minutes default
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttlMs
    });
  }

  get(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  clear() {
    this.cache.clear();
  }

  delete(key: string) {
    this.cache.delete(key);
  }

  // Clean expired entries - public method
  public cleanup() {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
      }
    }
  }
}

// Global cleanup - run every 5 minutes
if (typeof window !== 'undefined') {
  setInterval(() => {
    productsCache.cleanup();
    productDetailCache.cleanup();
    console.log('🧹 Products cache cleanup completed');
  }, 5 * 60 * 1000); // 5 minutes
}

// Global cache instances
const productsCache = new ClientCache<ApiResponse<Product[]>>();
const productDetailCache = new ClientCache<ApiResponse<Product>>();

// Generate cache key for products list
function getProductsCacheKey(filters: ProductFilters): string {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      if (typeof value === 'object') {
        Object.entries(value).forEach(([subKey, subValue]) => {
          if (subValue !== undefined) {
            params.append(`${key}[${subKey}]`, String(subValue));
          }
        });
      } else {
        params.append(key, String(value));
      }
    }
  });
  return `products:${params.toString()}`;
}

// Generate cache key for product detail
function getProductCacheKey(id: string): string {
  return `product:${id}`;
}

async function fetchWithRetry<T>(requestFn: () => Promise<T>, maxRetries = 3): Promise<T> {
  let lastError: any;
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await requestFn();
    } catch (error: any) {
      lastError = error;

      // Enhanced error detection for different types of failures
      if (error.response?.status === 429) {
        // Rate limiting - use longer delays
        const retryAfter = error.response?.headers?.['retry-after'];
        const delay = retryAfter ? parseInt(retryAfter) * 1000 : Math.min(30000, Math.pow(2, i) * 2000);
        console.warn(`Rate limited - retrying in ${delay}ms (attempt ${i + 1}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, delay));
      } else if (error.message?.includes('socket hang up') || error.message?.includes('fetch failed')) {
        // Network errors - use shorter delays with exponential backoff
        const delay = Math.min(10000, Math.pow(2, i) * 1000);
        console.warn(`Network error - retrying in ${delay}ms (attempt ${i + 1}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, delay));
      } else if (error.response?.status >= 500) {
        // Server errors - retry with medium delays
        const delay = Math.min(15000, Math.pow(2, i) * 1500);
        console.warn(`Server error - retrying in ${delay}ms (attempt ${i + 1}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        // Client errors (4xx) - don't retry
        throw error;
      }
    }
  }

  // After all retries failed, provide a more graceful error
  if (lastError?.response?.status === 429) {
    throw new Error('Service temporarily unavailable due to high demand. Please try again in a few minutes.');
  } else if (lastError?.message?.includes('socket hang up') || lastError?.message?.includes('fetch failed')) {
    throw new Error('Connection timeout. Please check your internet connection and try again.');
  } else if (lastError?.response?.status >= 500) {
    throw new Error('Server temporarily unavailable. Please try again in a few minutes.');
  }

  throw new Error(`Request failed after ${maxRetries} attempts: ${lastError?.message || 'Unknown error'}`);
}

// Client-side version of getProducts
const getProductsClient = async (filters: ProductFilters) => {
  try {
    const request = () => apiClient.get('/products', { params: filters });
    return await fetchWithRetry(() => request().then(res => res.data));
  } catch (error: any) {
    console.error('API fetch failed:', error.message);
    // For rate limiting, provide graceful fallback
    if (error.message?.includes('temporarily unavailable')) {
      return {
        status: 'error',
        data: [],
        message: 'Products temporarily unavailable due to high demand. Please try again in a few minutes.'
      };
    }
    // For network errors, provide fallback
    if (error.message?.includes('fetch failed') || 
        error.message?.includes('ENOTFOUND') || 
        error.message?.includes('timeout')) {
      return {
        status: 'error',
        data: [],
        message: 'Unable to load products. Please check your connection and try again.'
      };
    }
    throw error;
  }
};

export const productService = {
  async getProducts(filters: ProductFilters = {}): Promise<ApiResponse<Product[]>> {
    // Client-side cache check first
    const cacheKey = getProductsCacheKey(filters);
    const cachedData = productsCache.get(cacheKey);

    if (cachedData) {
      console.log(`✅ Using cached products data (${filters.page || 1})`);
      return cachedData;
    }

    // Use client-side fetch
    const result = await getProductsClient(filters);

    // Store in client cache for future requests (5 minutes TTL)
    productsCache.set(cacheKey, result, 5 * 60 * 1000);
    return result;
  },

  async getProductById(id: string): Promise<ApiResponse<Product>> {
    if (!id) {
      throw new Error('Product ID is required');
    }

    // Client-side cache check first
    const cacheKey = getProductCacheKey(id);
    const cachedData = productDetailCache.get(cacheKey);

    if (cachedData) {
      console.log(`✅ Using cached product data for ${id}`);
      return cachedData;
    }

    try {
      console.log(`🔄 Fetching product ${id}...`);
      const request = () => apiClient.get<ApiResponse<Product>>(`/products/${id}`);
      const result = await fetchWithRetry(() => request().then(res => res.data));

      // Store in client cache for future requests
      productDetailCache.set(cacheKey, result, 10 * 60 * 1000); // 10 minutes for product details

      return result;
    } catch (error: any) {
      console.error(`❌ Error fetching product ${id}:`, error.message);

      // For rate limiting, provide a more graceful error message
      if (error.message?.includes('temporarily unavailable')) {
        return {
          status: 'error',
          data: {} as Product,
          message: 'Product temporarily unavailable. Please try again in a few minutes.'
        };
      }

      // For network errors, provide fallback
      if (error.message?.includes('fetch failed') || error.message?.includes('ENOTFOUND') || error.message?.includes('timeout') || error.message?.includes('socket hang up')) {
        return {
          status: 'error',
          data: {} as Product,
          message: 'Unable to load product details. Please check your connection and try again.'
        };
      }

      // For 404 errors, provide specific message
      if (error.response?.status === 404) {
        return {
          status: 'error',
          data: {} as Product,
          message: 'Product not found.'
        };
      }

      throw error;
    }
  },

  // Method to clear cache when needed (e.g., after mutations)
  clearCache() {
    productsCache.clear();
    productDetailCache.clear();
    console.log('🧹 Products cache cleared');
  },

  // Method to clear specific cache entry
  clearProductCache(id: string) {
    productDetailCache.delete(getProductCacheKey(id));
    console.log(`🧹 Product cache cleared for ${id}`);
  }
};

export default productService;
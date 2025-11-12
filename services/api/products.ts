import apiClient from './client';

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

  set(key: string, data: T, ttlMs: number = 5 * 60 * 1000) {
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
  }, 5 * 60 * 1000);

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

      if (error.response?.status === 429) {
        const retryAfter = error.response?.headers?.['retry-after'];
        const delay = retryAfter ? parseInt(retryAfter) * 1000 : Math.min(30000, Math.pow(2, i) * 2000);
        await new Promise(resolve => setTimeout(resolve, delay));
      } else if (error.message?.includes('socket hang up') || error.message?.includes('fetch failed')) {
        const delay = Math.min(10000, Math.pow(2, i) * 1000);
        await new Promise(resolve => setTimeout(resolve, delay));
      } else if (error.response?.status >= 500) {
        const delay = Math.min(15000, Math.pow(2, i) * 1500);
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        throw error;
      }
    }
  }

  if (lastError?.response?.status === 429) {
    throw new Error('Service temporarily unavailable due to high demand. Please try again in a few minutes.');
  } else if (lastError?.message?.includes('socket hang up') || lastError?.message?.includes('fetch failed')) {
    throw new Error('Connection timeout. Please check your internet connection and try again.');
  } else if (lastError?.response?.status >= 500) {
    throw new Error('Server temporarily unavailable. Please try again in a few minutes.');
  }

  throw new Error(`Request failed after ${maxRetries} attempts: ${lastError?.message || 'Unknown error'}`);
}

const getProductsClient = async (filters: ProductFilters) => {
  try {
    const request = () => apiClient.get('/products', { params: filters });
    return await fetchWithRetry(() => request().then(res => res.data));
  } catch (error: any) {
    if (error.message?.includes('temporarily unavailable')) {
      return {
        status: 'error',
        data: [],
        message: 'Products temporarily unavailable due to high demand. Please try again in a few minutes.'
      };
    }
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
    const cacheKey = getProductsCacheKey(filters);
    const cachedData = productsCache.get(cacheKey);

    if (cachedData) {

      return cachedData;
    }

    const result = await getProductsClient(filters);
    productsCache.set(cacheKey, result, 5 * 60 * 1000);
    return result;
  },

  async getProductById(id: string): Promise<ApiResponse<Product>> {
    if (!id) {
      throw new Error('Product ID is required');
    }

    const cacheKey = getProductCacheKey(id);

    // Check regular cache
    const cachedData = productDetailCache.get(cacheKey);
    if (cachedData) {

      return cachedData;
    }

    try {

      const request = () => apiClient.get<ApiResponse<Product>>(`/products/${id}`);
      const result = await fetchWithRetry(() => request().then(res => res.data));

      productDetailCache.set(cacheKey, result, 10 * 60 * 1000);

      return result;
    } catch (error: any) {
      if (error.message?.includes('temporarily unavailable')) {
        return {
          status: 'error',
          data: {} as Product,
          message: 'Product temporarily unavailable. Please try again in a few minutes.'
        };
      }

      if (error.message?.includes('fetch failed') || error.message?.includes('ENOTFOUND') || error.message?.includes('timeout') || error.message?.includes('socket hang up')) {
        return {
          status: 'error',
          data: {} as Product,
          message: 'Unable to load product details. Please check your connection and try again.'
        };
      }

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

  // Method to update product cache directly (called by review service)
  updateProductCache(id: string, data: ApiResponse<Product>) {
    const cacheKey = getProductCacheKey(id);
    productDetailCache.set(cacheKey, data, 10 * 60 * 1000);
  },

  // Method to get cached product data without fetching
  getCachedProduct(id: string): ApiResponse<Product> | null {
    const cacheKey = getProductCacheKey(id);
    return productDetailCache.get(cacheKey);
  },

  clearCache() {
    productsCache.clear();
    productDetailCache.clear();

  },

  clearProductCache(id: string) {
    productDetailCache.delete(getProductCacheKey(id));

  }
};

export default productService;
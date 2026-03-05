import apiClient from './client';
import { Api } from './endpoints';

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

// ── New structures matching the updated backend ──────────────────────────────

export interface ProductUnit {
  _id: string;
  name: string;          // e.g. "piece", "kg", "liter"
  conversionRate: number;
  base: string;          // e.g. "piece"
  id: string;
}

export interface AttributeValue {
  _id: string;
  attributeId: {
    _id: string;
    name: string;        // e.g. "Color", "Size"
    id: string;
  };
  value: string;         // e.g. "Blue", "Black"
  id: string;
}

export interface AttributeLink {
  _id: string;
  variantId: string;
  attributeValueId: AttributeValue;
  id: string;
}

export interface ProductVariant {
  _id: string;
  productId: string;
  sku: string;
  unitId: ProductUnit;
  price: number;
  totalQuantity: number;
  inventory: any[];
  attributeLinks: AttributeLink[];
  id: string;
}


export interface ReviewSummary {
  averageRate: number;
  totalReviews: number;
  rateDistribution: {   // keys are "1" – "5"
    [star: string]: number;
  };
}

// ── Main Product interface ───────────────────────────────────────────────────

export interface Product {
  _id: string;
  name: string;
  nameAr?: string;
  nameEn?: string;
  description?: string;
  descriptionAr?: string;
  descriptionEn?: string;
  imageList: string[];
  image?: string;
  images?: string[];
  category: string;
  categoryId?: string;
  brand?: string;
  brandId?: string;

  // Replaced flat price/stock/unitFlags with variants array
  productVariants: ProductVariant[];

  // Kept for backward compat; backends may still send it
  price?: number;
  stockQty?: number;
  averageRate?: number;

  // New fields
  advProduct?: string[];
  productReview?: any[];
  reviewSummary?: ReviewSummary;

  createdAt?: string;
  updatedAt?: string;
  __v?: number;
  id?: string;
  [key: string]: any;
}

// ── Helper: derive a flat "first available" price & stock from variants ───────
export function getDefaultVariant(product: Product): ProductVariant | null {
  return product.productVariants?.[0] ?? null;
}

export function getProductPrice(product: Product): number {
  return getDefaultVariant(product)?.price ?? product.price ?? 0;
}

export function getProductStock(product: Product): number {
  if (!product.productVariants?.length) return product.stockQty ?? 0;
  return product.productVariants.reduce((sum, v) => sum + (v.totalQuantity ?? 0), 0);
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

// ── Client-side cache ────────────────────────────────────────────────────────

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

class ClientCache<T> {
  private cache = new Map<string, CacheEntry<T>>();

  set(key: string, data: T, ttlMs: number = 5 * 60 * 1000) {
    this.cache.set(key, { data, timestamp: Date.now(), ttl: ttlMs });
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

  clear() { this.cache.clear(); }
  delete(key: string) { this.cache.delete(key); }

  public cleanup() {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) this.cache.delete(key);
    }
  }
}

if (typeof window !== 'undefined') {
  setInterval(() => {
    productsCache.cleanup();
    productDetailCache.cleanup();
  }, 5 * 60 * 1000);
}

const productsCache = new ClientCache<ApiResponse<Product[]>>();
const productDetailCache = new ClientCache<ApiResponse<Product>>();

function getProductsCacheKey(filters: ProductFilters): string {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      if (typeof value === 'object') {
        Object.entries(value).forEach(([subKey, subValue]) => {
          if (subValue !== undefined) params.append(`${key}[${subKey}]`, String(subValue));
        });
      } else {
        params.append(key, String(value));
      }
    }
  });
  return `products:${params.toString()}`;
}

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
      return { status: 'error', data: [], message: 'Products temporarily unavailable. Please try again in a few minutes.' };
    }
    if (error.message?.includes('fetch failed') || error.message?.includes('ENOTFOUND') || error.message?.includes('timeout')) {
      return { status: 'error', data: [], message: 'Unable to load products. Please check your connection and try again.' };
    }
    throw error;
  }
};

// ── ISR-compatible fetch functions ───────────────────────────────────────────

/**
 * Fetch products with Next.js fetch API for ISR support.
 * The response now contains `data` which is an array of products
 * each with a `productVariants` array.
 */
export async function fetchProductsISR(
  filters: ProductFilters = {},
  revalidate: number = 60
): Promise<ApiResponse<Product[]>> {
  const BASE_URL = Api ?? 'https://a2z-backend--dkreq.fly.dev/app/v1';

  const params = new URLSearchParams();
  params.set('lang', 'en');

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      if (typeof value === 'object') {
        Object.entries(value).forEach(([subKey, subValue]) => {
          if (subValue !== undefined) params.append(`${key}[${subKey}]`, String(subValue));
        });
      } else {
        params.append(key, String(value));
      }
    }
  });

  const url = `${BASE_URL}/products?${params.toString()}`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      next: { revalidate, tags: ['products'] },
    });

    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
  } catch (error: any) {
    console.error('Error fetching products (ISR):', error);
    return { status: 'error', data: [], message: 'Unable to load products. Please try again later.' };
  }
}

/**
 * Fetch a single product by ID for ISR.
 * NOTE: The backend now returns `{ status, product }` (not `{ status, data }`).
 * We normalise this into the standard ApiResponse shape here.
 */
export async function fetchProductByIdISR(
  id: string,
  revalidate: number = 3600
): Promise<ApiResponse<Product>> {
  if (!id) throw new Error('Product ID is required');

  const BASE_URL = Api ?? 'https://a2z-backend--dkreq.fly.dev/app/v1';
  const url = `${BASE_URL}/products/${id}?lang=en`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      next: { revalidate, tags: ['products', `product-${id}`] },
    });

    if (!response.ok) {
      if (response.status === 404) return { status: 'error', data: {} as Product, message: 'Product not found.' };
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const raw = await response.json();

    // Backend changed: top-level key is `product`, not `data`
    return {
      status: raw.status ?? 'success',
      data: raw.product ?? raw.data ?? ({} as Product),
      message: raw.message,
    };
  } catch (error: any) {
    console.error(`Error fetching product ${id} (ISR):`, error);
    return { status: 'error', data: {} as Product, message: 'Unable to load product details. Please try again later.' };
  }
}

// ── Client-side service ──────────────────────────────────────────────────────

export const productService = {
  async getProducts(filters: ProductFilters = {}): Promise<ApiResponse<Product[]>> {
    if (!isServer) {
      const cacheKey = getProductsCacheKey(filters);
      const cachedData = productsCache.get(cacheKey);
      if (cachedData) return cachedData;

      const result = await getProductsClient(filters);
      productsCache.set(cacheKey, result, 5 * 60 * 1000);
      return result;
    }
    return await getProductsClient(filters);
  },

  async getProductById(id: string): Promise<ApiResponse<Product>> {
    if (!id) throw new Error('Product ID is required');

    if (!isServer) {
      const cacheKey = getProductCacheKey(id);
      const cachedData = productDetailCache.get(cacheKey);
      if (cachedData) return cachedData;
    }

    try {
      const request = () => apiClient.get<any>(`/products/${id}`);
      const raw = await fetchWithRetry(() => request().then(res => res.data));

      // Normalise: backend returns `product` key, not `data`
      const result: ApiResponse<Product> = {
        status: raw.status ?? 'success',
        data: raw.product ?? raw.data ?? ({} as Product),
        message: raw.message,
      };

      if (!isServer) {
        productDetailCache.set(getProductCacheKey(id), result, 10 * 60 * 1000);
      }

      return result;
    } catch (error: any) {
      if (error.message?.includes('temporarily unavailable')) {
        return { status: 'error', data: {} as Product, message: 'Product temporarily unavailable. Please try again in a few minutes.' };
      }
      if (
        error.message?.includes('fetch failed') ||
        error.message?.includes('ENOTFOUND') ||
        error.message?.includes('timeout') ||
        error.message?.includes('socket hang up')
      ) {
        return { status: 'error', data: {} as Product, message: 'Unable to load product details. Please check your connection and try again.' };
      }
      if (error.response?.status === 404) {
        return { status: 'error', data: {} as Product, message: 'Product not found.' };
      }
      throw error;
    }
  },

  updateProductCache(id: string, data: ApiResponse<Product>) {
    if (!isServer) productDetailCache.set(getProductCacheKey(id), data, 10 * 60 * 1000);
  },

  getCachedProduct(id: string): ApiResponse<Product> | null {
    if (isServer) return null;
    return productDetailCache.get(getProductCacheKey(id));
  },

  clearCache() {
    if (!isServer) { productsCache.clear(); productDetailCache.clear(); }
  },

  clearProductCache(id: string) {
    if (!isServer) productDetailCache.delete(getProductCacheKey(id));
  },
};

export default productService;
import apiClient from './client'; 

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

const url = 'https://a2z-backend.fly.dev/app/v1/';


async function fetchWithRetry<T>(requestFn: () => Promise<T>, maxRetries = 3): Promise<T> {
  let lastError: any;
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await requestFn();
    } catch (error: any) {
      lastError = error;
      if (error.response?.status === 429 || error.message?.includes('fetch failed')) {
        const retryAfter = error.response?.headers?.['retry-after'] || Math.pow(2, i) * 1000;
        console.warn(`Request failed (retry in ${retryAfter}ms)...`);
        await new Promise(resolve => setTimeout(resolve, parseInt(retryAfter as string)));
      } else {
        throw error;
      }
    }
  }
  throw new Error(`Max retries exceeded: ${lastError?.message || 'Unknown error'}`);
}

export const productService = {
  async getProducts(filters: ProductFilters = {}): Promise<ApiResponse<Product[]>> {
    try {
      const request = () => apiClient.get<ApiResponse<Product[]>>(url + 'products', { 
        params: filters 
      });
      return await fetchWithRetry(() => request().then(res => res.data));
    } catch (error: any) {
      console.error('API fetch failed:', error.message); // Log مرة واحدة
      if (error.message?.includes('fetch failed') || error.message?.includes('ENOTFOUND')) {
        return { status: 'error', data: [], message: 'Service temporarily unavailable' }; // Fallback
      }
      if (error.message?.includes('Rate limited') || error.message?.includes('429')) {
        return { status: 'error', data: [], message: 'Rate limited - Try again later' };
      }
      throw error;
    }
  },

  async getProductById(id: string): Promise<ApiResponse<Product>> {
    try {
      if (!id) {
        throw new Error('Product ID is required');
      }
      const request = () => apiClient.get<ApiResponse<Product>>(url + `products/${id}`);
      return await fetchWithRetry(() => request().then(res => res.data));
    } catch (error: any) {
      console.error(`Error fetching product ${id}:`, error.message);
      if (error.message?.includes('fetch failed')) {
        throw new Error('Product fetch failed - Service unavailable');
      }
      throw error;
    }
  },

  
};

export default productService;
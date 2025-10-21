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

export const productService = {
  async getProducts(filters: ProductFilters = {}): Promise<ApiResponse<Product[]>> {
    try {
      const request = () => apiClient.get<ApiResponse<Product[]>>('/products', {
        params: filters
      });
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
      if (error.message?.includes('fetch failed') || error.message?.includes('ENOTFOUND') || error.message?.includes('timeout')) {
        return {
          status: 'error',
          data: [],
          message: 'Unable to load products. Please check your connection and try again.'
        };
      }

      throw error;
    }
  },

  async getProductById(id: string): Promise<ApiResponse<Product>> {
    try {
      if (!id) {
        throw new Error('Product ID is required');
      }

      console.log(`🔄 Fetching product ${id}...`);
      const request = () => apiClient.get<ApiResponse<Product>>(`/products/${id}`);
      return await fetchWithRetry(() => request().then(res => res.data));
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


};

export default productService;
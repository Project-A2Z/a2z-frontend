import apiClient from './client';
import { UserStorage } from '../auth/login';

export interface WishItemResponse {
  _id: string;
  userId: string;
  productId: any;
  createdAt: string;
  updatedAt: string;
}

export interface WishlistResponse {
  status: string;
  data: {
    count: number;
    wishItems: WishItemResponse[];
  };
  message?: string;
}

// Client-side cache for wishlist
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

class ClientCache<T> {
  private cache = new Map<string, CacheEntry<T>>();

  set(key: string, data: T, ttlMs: number = 2 * 60 * 1000) { // 2 minutes default for wishlist
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

  // Get all cache keys for filtering
  getKeys(): string[] {
    return Array.from(this.cache.keys());
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

// Make debug function available globally for testing
if (typeof window !== 'undefined') {
  (window as any).testWishlistAuth = () => {
    // Simple auth check without importing
    const userData = localStorage.getItem('user_data');
    const token = localStorage.getItem('auth_token');
    const user = userData ? JSON.parse(userData) : null;

    //console.log('🔍 Auth Debug:', {
    //   user: user ? { id: user._id, email: user.email } : null,
    //   token: token ? token.substring(0, 50) + '...' : null,
    //   hasToken: !!token,
    //   hasUser: !!user
    // });
    return { user, token: token?.substring(0, 20) + '...' };
  };
}

// Global cache instance for wishlist
const wishlistCache = new ClientCache<WishlistResponse>();

// Cache key for wishlist
function getWishlistCacheKey(params?: Record<string, any>): string {
  const query = params ? new URLSearchParams(params).toString() : '';
  return `wishlist${query ? `?${query}` : ""}`;
}

// Authentication helper functions
function checkAuthentication(): { isAuthenticated: boolean; token: string | null; user: any } {
  const user = UserStorage.getUser();
  const token = UserStorage.getToken();

  return {
    isAuthenticated: user !== null && token !== null,
    token,
    user
  };
}

// Error for unauthenticated users
export class AuthenticationError extends Error {
  constructor(message: string = 'يرجى تسجيل الدخول أولاً') {
    super(message);
    this.name = 'AuthenticationError';
  }
}

export const wishlistService = {
  async getAll(params?: Record<string, any>) {
    const auth = checkAuthentication();

    if (!auth.isAuthenticated) {
      throw new AuthenticationError('يرجى تسجيل الدخول لعرض قائمة المفضلة');
    }

    //console.log('🔄 Getting wishlist:', { userId: auth.user._id, token: auth.token?.substring(0, 20) + '...' });

    // Debug token structure
    if (auth.token) {
      try {
        const tokenParts = auth.token.split('.');
        if (tokenParts.length === 3) {
          const payload = JSON.parse(atob(tokenParts[1]));
          //console.log('🔍 Token payload:', payload);
        }
      } catch (e) {
        console.warn('⚠️ Could not decode token:', e);
      }
    }

    // Client-side cache check first
    const cacheKey = getWishlistCacheKey(params);
    const cachedData = wishlistCache.get(cacheKey);

    if (cachedData) {
      //console.log(`✅ Using cached wishlist data`);
      return cachedData;
    }

    try {
      //console.log('🔄 Calling API: GET /wish-items/');
      const res = await apiClient.get('/wish-items/', { params });

      // Store in client cache for future requests
      wishlistCache.set(cacheKey, res.data);

      //console.log('✅ Successfully loaded wishlist:', res.data);
      return res.data; // { status, data: { count, wishItems: [...] } }
    } catch (error: any) {
      // Check if this is a network error (no response from server)
      const isNetworkError = !error.response && (error.request || error.message);

      if (isNetworkError) {
        console.warn('🌐 Network error - unable to connect to server:', error.message);

        // For network errors, return empty wishlist (user can still use local storage)
        return {
          status: 'success',
          data: {
            count: 0,
            wishItems: []
          }
        };
      }

      // Don't log 404 as error when wishlist doesn't exist yet - it's expected
      if (error?.response?.status !== 404) {
        console.error('❌ Wishlist API failed:', error?.response?.status, error?.response?.data);

        // Log detailed error information
        if (error?.response) {
          console.error('❌ Response Status:', error.response.status);
          console.error('❌ Response Data:', error.response.data);
          console.error('❌ Response Headers:', error.response.headers);
        }

        if (error?.config) {
          console.error('❌ Request URL:', error.config.url);
          console.error('❌ Request Method:', error.config.method);
          console.error('❌ Request Headers:', error.config.headers);
          console.error('❌ Request Data:', error.config.data);
        }
      }

      // If wishlist doesn't exist (404), return empty data instead of throwing
      if (error?.response?.status === 404) {
        //console.log('ℹ️ Wishlist not found (404) - returning empty wishlist');
        return {
          status: 'success',
          data: {
            count: 0,
            wishItems: []
          }
        };
      }

      throw error;
    }
  },

  async add(productId: string) {
    const auth = checkAuthentication();

    if (!auth.isAuthenticated) {
      throw new AuthenticationError('يرجى تسجيل الدخول لإضافة منتج للمفضلة');
    }

    //console.log('🔄 Adding to wishlist:', { productId, userId: auth.user._id, token: auth.token?.substring(0, 20) + '...' });

    // Debug token structure
    if (auth.token) {
      try {
        const tokenParts = auth.token.split('.');
        if (tokenParts.length === 3) {
          const payload = JSON.parse(atob(tokenParts[1]));
          //console.log('🔍 Token payload:', payload);
        }
      } catch (e) {
        console.warn('⚠️ Could not decode token:', e);
      }
    }

    try {
      //console.log('🔄 Calling API: POST /wish-items/');
      const res = await apiClient.post('/wish-items/', { productId });

      // Clear wishlist cache since data changed
      wishlistCache.clear();

      //console.log('✅ Successfully added to wishlist:', res.data);
      return res.data; // { status, data: { wishItem } }
    } catch (err: any) {
      // Check if this is a network error (no response from server)
      const isNetworkError = !err.response && (err.request || err.message);

      if (isNetworkError) {
        console.warn('🌐 Network error - unable to connect to server:', err.message);

        // For network errors during add, return conflict to keep optimistic update
        return {
          status: 'conflict',
          message: 'Network error - item may already exist',
        } as any;
      }

      // Don't log 409 as error - it's expected behavior
      if (err?.response?.status !== 409 && err?.response?.status !== 404) {
        console.error('❌ Add to wishlist failed:', err?.response?.status, err?.response?.data);

        // Log detailed error information
        if (err?.response) {
          console.error('❌ Response Status:', err.response.status);
          console.error('❌ Response Data:', err.response.data);
          console.error('❌ Response Headers:', err.response.headers);
        }

        if (err?.config) {
          console.error('❌ Request URL:', err.config.url);
          console.error('❌ Request Method:', err.config.method);
          console.error('❌ Request Headers:', err.config.headers);
          console.error('❌ Request Data:', err.config.data);
        }
      }

      // 409 = conflict (already exists in wishlist) - this is expected behavior, not an error
      if (err?.response?.status === 409) {
        //console.log('ℹ️ Item already exists in wishlist (409 Conflict) - this is expected behavior');
        return {
          status: 'error',
          message: 'المنتج موجود بالفعل في قائمة الأمنيات',
          data: null
        } as any;
      }

      // If the new endpoint doesn't work (404), try the old endpoint as fallback
      if (err?.response?.status === 404) {
        //console.log('🔄 Trying old wishlist endpoint: /wishlist/add');
        try {
          const res = await apiClient.post('/wishlist/add', { productId });
          wishlistCache.clear();
          //console.log('✅ Successfully added to wishlist (old endpoint):', res.data);
          return res.data;
        } catch (fallbackError: any) {
          console.error('❌ Both endpoints failed:', {
            newEndpoint: err?.response?.status,
            oldEndpoint: fallbackError?.response?.status,
            newData: err?.response?.data,
            oldData: fallbackError?.response?.data
          });
          throw err;
        }
      }

      throw err;
    }
  },

  async remove(productId: string) {
    const auth = checkAuthentication();

    if (!auth.isAuthenticated) {
      throw new AuthenticationError('يرجى تسجيل الدخول لحذف منتج من المفضلة');
    }

    //console.log('🔄 Removing from wishlist:', { productId, userId: auth.user._id, token: auth.token?.substring(0, 20) + '...' });

    try {
      //console.log('🔄 Calling API: DELETE /wish-items/:productId');
      const res = await apiClient.delete(`/wish-items/${productId}`);

      // Clear wishlist cache since data changed
      wishlistCache.clear();

      //console.log('✅ Successfully removed from wishlist:', res.data);
      return res.data; // { status, message }
    } catch (err: any) {
      // Check if this is a network error (no response from server)
      const isNetworkError = !err.response && (err.request || err.message);

      if (isNetworkError) {
        console.warn('🌐 Network error - unable to connect to server:', err.message);

        // For network errors during removal, return success (optimistic update)
        return { status: 'success', message: 'تم حذف المنتج من المفضلة' };
      }

      // Don't log 404 as error when item doesn't exist - it's expected
      if (err?.response?.status !== 404) {
        console.error('❌ Remove from wishlist failed:', err?.response?.status, err?.response?.data);
      }

      // If the new endpoint doesn't work, try the old endpoint as fallback
      if (err?.response?.status === 404) {
        //console.log('🔄 Trying old wishlist endpoint: /wishlist/remove/:id');
        try {
          const res = await apiClient.delete(`/wishlist/remove/${productId}`);
          wishlistCache.clear();
          //console.log('✅ Successfully removed from wishlist (old endpoint):', res.data);
          return res.data;
        } catch (fallbackError: any) {
          // If both endpoints fail with 404, don't throw error - just return success
          if (fallbackError?.response?.status === 404) {
            //console.log('ℹ️ Item not found in wishlist (404) - treating as successful removal');
            wishlistCache.clear();
            return { status: 'success', message: 'تم حذف المنتج من المفضلة' };
          }

          console.error('❌ Both endpoints failed:', {
            newEndpoint: err?.response?.status,
            oldEndpoint: fallbackError?.response?.status,
            newData: err?.response?.data,
            oldData: fallbackError?.response?.data
          });
          throw err;
        }
      }

      throw err;
    }
  },

  // Convenience: add-if-missing, otherwise remove (idempotent toggle)
  async toggle(productId: string) {
    const auth = checkAuthentication();

    if (!auth.isAuthenticated) {
      throw new AuthenticationError('يرجى تسجيل الدخول لتعديل قائمة المفضلة');
    }

    const added = await this.add(productId);
    if (added?.status === 'conflict') {
      const removed = await this.remove(productId);
      return { status: 'removed', data: removed?.data } as any;
    }
    return { status: 'added', data: (added as any)?.data } as any;
  },

  // Method to clear wishlist cache
  clearCache() {
    wishlistCache.clear();
    //console.log('🧹 Wishlist cache cleared');
  },

  // Helper method to check if user is authenticated
  isAuthenticated() {
    return checkAuthentication().isAuthenticated;
  },

  // Helper method to get current user
  getCurrentUser() {
    return UserStorage.getUser();
  },

  // Helper method to get auth token
  getAuthToken() {
    return UserStorage.getToken();
  }
};

export default wishlistService;

// Make debug function available globally for testing
if (typeof window !== 'undefined') {
  (window as any).debugWishlistAPI = async () => {
    try {
      const { UserStorage } = await import('../auth/login');
      const user = UserStorage.getUser();
      const token = UserStorage.getToken();

      if (!user || !token) {
        //console.log('❌ Not authenticated');
        return { authenticated: false };
      }

      //console.log('🔍 Testing wishlist endpoints...');
      const axios = (await import('./client')).default;

      const results: any = {
        authenticated: true,
        user: user._id,
        token: token.substring(0, 20) + '...',
        endpoints: {}
      };

      // Test wish-items endpoints (based on documentation)
      try {
        //console.log('🔍 Testing GET /wish-items/');
        const getRes = await axios.get('/wish-items/');
        results.endpoints.wish_items_get = { status: getRes.status, data: getRes.data };
      } catch (err: any) {
        const isNetworkError = !err.response && (err.request || err.message);
        if (isNetworkError) {
          results.endpoints.wish_items_get = { error: 'Network Error', message: err.message };
        } else if (err?.response?.status !== 404) {
          results.endpoints.wish_items_get = { error: err.response?.status, data: err.response?.data };
        } else {
          results.endpoints.wish_items_get = { status: 404, message: 'Wishlist not found (expected for new users)' };
        }
      }

      try {
        //console.log('🔍 Testing POST /wish-items/');
        const postRes = await axios.post('/wish-items/', { productId: 'test-123' });
        results.endpoints.wish_items_add = { status: postRes.status, data: postRes.data };
      } catch (err: any) {
        const isNetworkError = !err.response && (err.request || err.message);
        if (isNetworkError) {
          results.endpoints.wish_items_add = { error: 'Network Error', message: err.message };
        } else if (err?.response?.status !== 409) {
          results.endpoints.wish_items_add = { error: err.response?.status, data: err.response?.data };
        } else {
          results.endpoints.wish_items_add = { status: 409, message: 'Conflict (expected for existing items)' };
        }
      }

      // Test old wishlist endpoints as fallback
      try {
        //console.log('🔍 Testing GET /wishlist');
        const getRes = await axios.get('/wishlist');
        results.endpoints.wishlist_get = { status: getRes.status, data: getRes.data };
      } catch (err: any) {
        if (err?.response?.status !== 404) {
          results.endpoints.wishlist_get = { error: err.response?.status, data: err.response?.data };
        } else {
          results.endpoints.wishlist_get = { status: 404, message: 'Old endpoint not found (expected)' };
        }
      }

      try {
        //console.log('🔍 Testing POST /wishlist/add');
        const postRes = await axios.post('/wishlist/add', { productId: 'test-123' });
        results.endpoints.wishlist_add = { status: postRes.status, data: postRes.data };
      } catch (err: any) {
        if (err?.response?.status !== 409 && err?.response?.status !== 404) {
          results.endpoints.wishlist_add = { error: err.response?.status, data: err.response?.data };
        } else {
          results.endpoints.wishlist_add = { status: err.response?.status, message: 'Expected response for old endpoint' };
        }
      }

      try {
        //console.log('🔍 Testing DELETE /wishlist/remove/test-123');
        const deleteRes = await axios.delete('/wishlist/remove/test-123');
        results.endpoints.wishlist_remove = { status: deleteRes.status, data: deleteRes.data };
      } catch (err: any) {
        if (err?.response?.status !== 404) {
          results.endpoints.wishlist_remove = { error: err.response?.status, data: err.response?.data };
        } else {
          results.endpoints.wishlist_remove = { status: 404, message: 'Old endpoint not found (expected)' };
        }
      }

      //console.log('🔍 Debug results:', results);
      return results;
    } catch (err) {
      console.error('❌ Debug failed:', err);
      return { error: err };
    }
  };

  // Clear all caches and localStorage
  (window as any).resetFavorites = () => {
    // Clear localStorage
    localStorage.removeItem('a2z:favorites');

    // Clear API caches
    import('./products').then(({ productService }) => productService.clearCache()).catch(() => {});
    import('./reviews').then(({ reviewService }) => reviewService.clearCache()).catch(() => {});
    import('./wishlist').then(({ wishlistService }) => wishlistService.clearCache()).catch(() => {});

    //console.log('🧹 All favorites data cleared. Please refresh the page.');
  };
}

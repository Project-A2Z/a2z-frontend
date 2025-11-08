// services/orders/orderService.ts
import { API_ENDPOINTS, Api } from '../api/endpoints';

// Order Types matching your API response
export interface OrderAddress {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  address: string;
  city: string;
  region: string;
}

// Product interface
export interface Product {
  _id: string;
  category: string;
  name: string;
  description: string;
  imageList: string[];
  price: number;
  PurchasePrice: number;
  stockQty: number;
  stockType: string;
  advProduct: any[];
  averageRate: number;
  createdAt: string;
  updatedAt: string;
  __v: number;
  id: string;
}

// Updated CartItem interface to match your actual data structure
export interface CartItem {
  _id: string;
  cartId: string;
  productId: Product;
  itemQty: number;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface Cart {
  _id: string;
  userId: string;
  totalQty: number;
  totalPrice: number;
  isBecomeOrder: boolean;
  createdAt: string;
  updatedAt: string;
  __v: number;
  items: CartItem[];
  id: string;
}

export interface PaymentDetails {
  _id: string;
  userId: string;
  orderId: string;
  paymentStatus: 'paid' | 'pending' | 'failed';
  paymentWay: 'online' | 'cash';
  paymentWith: 'instaPay' | 'credit_card' | 'debit_card';
  type: 'revenues' | 'refund';
  NumOperation: string;
  image: string;
  totalPrice: number;
  operationIds: string[];
  createdAt: string;
  updatedAt: string;
  __v: number;
  id: string;
}

export interface OrderItem {
  _id: string;
  cartId: Cart;  // Changed from string to Cart object
  userId: string;
  orderId: string;
  status: 'Under review' | 'reviewed' | 'prepared' | 'shipped' | 'delivered' | 'cancelled';
  address: OrderAddress;
  deliveryPrice: number;
  deliveryDate: string | null;
  createdAt: string;
  updatedAt: string;
  __v: number;
  paymentDetails?: PaymentDetails;
  id: string;
}

export interface OrdersResponse {
  status: string;
  length: number;
  data: OrderItem[];
}

// Transform API order to component-friendly format
export interface TransformedOrder {
  id: string;
  orderNumber: string;
  status: 'Under review' | 'reviewed' | 'prepared' | 'shipped' | 'delivered' | 'cancelled';
  date: string;
  total: number;
  items: number;
}


// Cache entry interface
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

class OrderService {
  private baseUrl = Api;
  
  // In-memory cache
  private cache: Map<string, CacheEntry<any>> = new Map();
  
  // Cache configuration (in milliseconds)
  private readonly CACHE_DURATION = {
    ORDERS_LIST: 5 * 60 * 1000,      // 5 minutes for orders list
    ORDER_DETAILS: 10 * 60 * 1000,   // 10 minutes for order details
    ORDER_TRACKING: 2 * 60 * 1000,   // 2 minutes for tracking (more frequent updates)
  };

  /**
   * Get authentication token from localStorage
   * Try multiple possible token keys
   */
  private getAuthToken(): string | null {
    if (typeof window === 'undefined') return null;
    
    const token = localStorage.getItem('auth_token') || 
                  localStorage.getItem('token') ||
                  localStorage.getItem('accessToken');
    
    //console.log('🔑 Token retrieved:', token ? `${token.substring(0, 20)}...` : 'null');
    
    return token;
  }

  /**
   * Get user data from localStorage to extract token
   */
  private getUserData(): any {
    if (typeof window === 'undefined') return null;
    
    try {
      const userData = localStorage.getItem('user_data');
      if (userData) {
        const parsed = JSON.parse(userData);
        //console.log('👤 User data found:', {
        //   hasToken: !!parsed.token,
        //   hasAccessToken: !!parsed.accessToken,
        //   keys: Object.keys(parsed)
        // });
        return parsed;
      }
    } catch (error) {
      //console.error('Error parsing user data:', error);
    }
    
    return null;
  }

  /**
   * Get the best available token from all sources
   */
  private getBestToken(): string | null {
    let token = this.getAuthToken();
    
    if (!token) {
      const userData = this.getUserData();
      token = userData?.token || userData?.accessToken || userData?.auth_token;
    }
    
    //console.log('🎯 Best token selected:', token ? 'Found' : 'Not found');
    
    return token;
  }

  /**
   * Set cache entry
   */
  private setCache<T>(key: string, data: T, duration: number): void {
    const now = Date.now();
    this.cache.set(key, {
      data,
      timestamp: now,
      expiresAt: now + duration,
    });
    //console.log(`💾 Cache set for key: ${key}, expires in ${duration / 1000}s`);
  }

  /**
   * Get cache entry if valid
   */
  private getCache<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      //console.log(`❌ Cache miss for key: ${key}`);
      return null;
    }

    const now = Date.now();
    if (now > entry.expiresAt) {
      //console.log(`⏰ Cache expired for key: ${key}`);
      this.cache.delete(key);
      return null;
    }

    //console.log(`✅ Cache hit for key: ${key}`);
    return entry.data as T;
  }

  /**
   * Clear cache by key or pattern
   */
  clearCache(pattern?: string): void {
    if (!pattern) {
      this.cache.clear();
      //console.log('🗑️ All cache cleared');
      return;
    }

    let cleared = 0;
    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.delete(key);
        cleared++;
      }
    }
    //console.log(`🗑️ Cleared ${cleared} cache entries matching: ${pattern}`);
  }

  /**
   * Invalidate orders cache (useful after creating/updating orders)
   */
  invalidateOrdersCache(): void {
    this.clearCache('orders');
  }

  /**
   * Get user orders from API with caching
   */
  async getUserOrders(forceRefresh: boolean = false): Promise<OrderItem[]> {
    const cacheKey = 'orders_list';

    // Check cache first (unless force refresh)
    if (!forceRefresh) {
      const cachedData = this.getCache<OrderItem[]>(cacheKey);
      if (cachedData) {
        return cachedData;
      }
    }

    try {
      const token = this.getBestToken();
      
      //console.log('📡 Fetching orders...');
      //console.log('🔗 URL:', `${this.baseUrl}${API_ENDPOINTS.USERS.ORDERS}`);
      //console.log('🔑 Using token:', token ? 'Found' : 'Not found');
      
      if (!token) {
        //console.error('❌ No authentication token found in localStorage');
        //console.log('📦 LocalStorage contents:', {
        //   auth_token: localStorage.getItem('auth_token'),
        //   token: localStorage.getItem('token'),
        //   user_data: localStorage.getItem('user_data'),
        //   refresh_token: localStorage.getItem('refresh_token'),
        // });
        throw new Error('Authentication token not found. Please login again.');
      }

      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      };
      
      //console.log('📤 Request headers:', {
      //   Authorization: `Bearer ${token.substring(0, 20)}...`,
      //   'Content-Type': 'application/json'
      // });

      const response = await fetch(`${this.baseUrl}${API_ENDPOINTS.USERS.ORDERS}`, {
        method: 'GET',
        headers,
      });

      //console.log('📥 Response status:', response.status);
      //console.log('📥 Response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        if (response.status === 401) {
          //console.error('❌ 401 Unauthorized - Token may be expired or invalid');
          
          const errorText = await response.text();
          //console.error('Error response:', errorText);
          
          localStorage.removeItem('auth_token');
          localStorage.removeItem('token');
          
          throw new Error('Session expired. Please login again.');
        }
        if (response.status === 403) {
          //console.error('❌ 403 Forbidden - Insufficient permissions');
          throw new Error('You do not have permission to view orders');
        }
        
        const errorText = await response.text();
        //console.error('❌ Error response:', errorText);
        throw new Error(`Failed to fetch orders: ${response.statusText}`);
      }

      const data: OrdersResponse = await response.json();
      //console.log('✅ Orders fetched successfully:', data.length, 'orders');
      
      const orders = data.data || [];
      
      // Cache the result
      this.setCache(cacheKey, orders, this.CACHE_DURATION.ORDERS_LIST);
      
      return orders;
    } catch (error) {
      //console.error('💥 Error fetching user orders:', error);
      throw error;
    }
  }

  /**
   * Transform API orders to component format
   */
  transformOrders(apiOrders: OrderItem[]): TransformedOrder[] {
    return apiOrders.map(order => ({
      id: order._id,
      orderNumber: order.orderId,
      status: order.status,
      date: order.createdAt,
      total: order.deliveryPrice,
      items: 1,
    }));
  }

  /**
   * Get order details by ID with caching
   */
  async getOrderDetails(orderId: string, forceRefresh: boolean = false): Promise<OrderItem> {
    const cacheKey = `order_details_${orderId}`;

    // Check cache first
    if (!forceRefresh) {
      const cachedData = this.getCache<OrderItem>(cacheKey);
      if (cachedData) {
        return cachedData;
      }
    }

    try {
      const token = this.getBestToken();
      
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const url = `${this.baseUrl}${API_ENDPOINTS.ORDERS.DETAILS.replace(':id', orderId)}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Session expired. Please login again.');
        }
        throw new Error(`Failed to fetch order details: ${response.statusText}`);
      }

      const data = await response.json();
      const orderDetails = data.data;
      
      // Cache the result
      this.setCache(cacheKey, orderDetails, this.CACHE_DURATION.ORDER_DETAILS);
      
      return orderDetails;
    } catch (error) {
      //console.error('Error fetching order details:', error);
      throw error;
    }
  }

  /**
   * Cancel an order (invalidates cache)
   */
  async cancelOrder(orderId: string): Promise<boolean> {
    try {
      const token = this.getBestToken();
      
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const url = `${this.baseUrl}${API_ENDPOINTS.ORDERS.CANCEL.replace(':id', orderId)}`;
      
      const response = await fetch(url, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Session expired. Please login again.');
        }
        throw new Error(`Failed to cancel order: ${response.statusText}`);
      }

      // Invalidate related caches
      this.clearCache(`order_details_${orderId}`);
      this.clearCache('orders_list');
      
      return true;
    } catch (error) {
      //console.error('Error canceling order:', error);
      throw error;
    }
  }

  /**
   * Track order by ID with caching
   */
  async trackOrder(orderId: string, forceRefresh: boolean = false): Promise<any> {
    const cacheKey = `order_tracking_${orderId}`;

    // Check cache first
    if (!forceRefresh) {
      const cachedData = this.getCache<any>(cacheKey);
      if (cachedData) {
        return cachedData;
      }
    }

    try {
      const token = this.getBestToken();
      
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const url = `${this.baseUrl}${API_ENDPOINTS.ORDERS.TRACK.replace(':id', orderId)}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Session expired. Please login again.');
        }
        throw new Error(`Failed to track order: ${response.statusText}`);
      }

      const data = await response.json();
      const trackingData = data.data;
      
      // Cache with shorter duration (tracking updates more frequently)
      this.setCache(cacheKey, trackingData, this.CACHE_DURATION.ORDER_TRACKING);
      
      return trackingData;
    } catch (error) {
      //console.error('Error tracking order:', error);
      throw error;
    }
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { total: number; expired: number; valid: number } {
    const now = Date.now();
    let expired = 0;
    let valid = 0;

    for (const entry of this.cache.values()) {
      if (now > entry.expiresAt) {
        expired++;
      } else {
        valid++;
      }
    }

    return {
      total: this.cache.size,
      expired,
      valid,
    };
  }

  /**
   * Debug helper - log all auth-related localStorage items
   */
  debugAuth(): void {
    //console.log('🔍 Authentication Debug Info:');
    // console.log('📦 LocalStorage:', {
    //   auth_token: localStorage.getItem('auth_token'),
    //   token: localStorage.getItem('token'),
    //   accessToken: localStorage.getItem('accessToken'),
    //   refresh_token: localStorage.getItem('refresh_token'),
    //   user_data: localStorage.getItem('user_data'),
    // });
    
    const userData = this.getUserData();
    if (userData) {
      //console.log('👤 User data keys:', Object.keys(userData));
    }
    
    const bestToken = this.getBestToken();
    //console.log('🎯 Best token:', bestToken ? `${bestToken.substring(0, 20)}...` : 'Not found');
    
    // Cache stats
    const stats = this.getCacheStats();
    //console.log('💾 Cache stats:', stats);
  }
}

export const orderService = new OrderService();
export default orderService;
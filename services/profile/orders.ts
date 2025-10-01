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

export interface OrderItem {
  _id: string;
  cartId: string;
  userId: string;
  orderId: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'loaded' | 'reviewed';
  address: OrderAddress;
  deliveryPrice: number;
  deliveryDate: string;
  createdAt: string;
  updatedAt: string;
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
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'loaded' | 'reviewed';
  date: string;
  total: number;
  items: number;
}

class OrderService {
  private baseUrl = Api;

  /**
   * Get authentication token from localStorage
   * Try multiple possible token keys
   */
  private getAuthToken(): string | null {
    if (typeof window === 'undefined') return null;
    
    // Try different possible token storage keys
    const token = localStorage.getItem('auth_token') || 
                  localStorage.getItem('token') ||
                  localStorage.getItem('accessToken');
    
    console.log('🔑 Token retrieved:', token ? `${token.substring(0, 20)}...` : 'null');
    
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
        console.log('👤 User data found:', {
          hasToken: !!parsed.token,
          hasAccessToken: !!parsed.accessToken,
          keys: Object.keys(parsed)
        });
        return parsed;
      }
    } catch (error) {
      console.error('Error parsing user data:', error);
    }
    
    return null;
  }

  /**
   * Get the best available token from all sources
   */
  private getBestToken(): string | null {
    // First try direct token
    let token = this.getAuthToken();
    
    // If not found, try from user_data object
    if (!token) {
      const userData = this.getUserData();
      token = userData?.token || userData?.accessToken || userData?.auth_token;
    }
    
    console.log('🎯 Best token selected:', token ? 'Found' : 'Not found');
    
    return token;
  }

/**
 * Get user orders from API
 */
async getUserOrders(): Promise<OrderItem[]> {
  try {
    const token = this.getBestToken();
    
    console.log('📡 Fetching orders...');
    console.log('🔗 URL:', `${this.baseUrl}${API_ENDPOINTS.USERS.ORDERS}`);
    console.log('🔑 Using token:', token ? 'Found' : 'Not found');
    
    if (!token) {
      console.error('❌ No authentication token found in localStorage');
      console.log('📦 LocalStorage contents:', {
        auth_token: localStorage.getItem('auth_token'),
        token: localStorage.getItem('token'),
        user_data: localStorage.getItem('user_data'),
        refresh_token: localStorage.getItem('refresh_token'),
      });
      throw new Error('Authentication token not found. Please login again.');
    }

    // FIXED: Use Bearer prefix consistently with login service
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
    
    console.log('📤 Request headers:', {
      Authorization: `Bearer ${token.substring(0, 20)}...`,
      'Content-Type': 'application/json'
    });

    const response = await fetch(`${this.baseUrl}${API_ENDPOINTS.USERS.ORDERS}`, {
      method: 'GET',
      headers,
    //   credentials: 'include',
    });

    console.log('📥 Response status:', response.status);
    console.log('📥 Response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      if (response.status === 401) {
        console.error('❌ 401 Unauthorized - Token may be expired or invalid');
        
        // Try to get error details
        const errorText = await response.text();
        console.error('Error response:', errorText);
        
        // Clear invalid tokens
        localStorage.removeItem('auth_token');
        localStorage.removeItem('token');
        
        throw new Error('Session expired. Please login again.');
      }
      if (response.status === 403) {
        console.error('❌ 403 Forbidden - Insufficient permissions');
        throw new Error('You do not have permission to view orders');
      }
      
      const errorText = await response.text();
      console.error('❌ Error response:', errorText);
      throw new Error(`Failed to fetch orders: ${response.statusText}`);
    }

    const data: OrdersResponse = await response.json();
    console.log('✅ Orders fetched successfully:', data.length, 'orders');
    
    return data.data || [];
  } catch (error) {
    console.error('💥 Error fetching user orders:', error);
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
   * Get order details by ID
   */
  async getOrderDetails(orderId: string): Promise<OrderItem> {
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
      return data.data;
    } catch (error) {
      console.error('Error fetching order details:', error);
      throw error;
    }
  }

  /**
   * Cancel an order
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

      return true;
    } catch (error) {
      console.error('Error canceling order:', error);
      throw error;
    }
  }

  /**
   * Track order by ID
   */
  async trackOrder(orderId: string): Promise<any> {
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
      return data.data;
    } catch (error) {
      console.error('Error tracking order:', error);
      throw error;
    }
  }

  /**
   * Debug helper - log all auth-related localStorage items
   */
  debugAuth(): void {
    console.log('🔍 Authentication Debug Info:');
    console.log('📦 LocalStorage:', {
      auth_token: localStorage.getItem('auth_token'),
      token: localStorage.getItem('token'),
      accessToken: localStorage.getItem('accessToken'),
      refresh_token: localStorage.getItem('refresh_token'),
      user_data: localStorage.getItem('user_data'),
    });
    
    const userData = this.getUserData();
    if (userData) {
      console.log('👤 User data keys:', Object.keys(userData));
    }
    
    const bestToken = this.getBestToken();
    console.log('🎯 Best token:', bestToken ? `${bestToken.substring(0, 20)}...` : 'Not found');
  }
}

export const orderService = new OrderService();
export default orderService;
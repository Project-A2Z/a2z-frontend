import apiClient from './client';
import { toast } from 'react-toastify';
import { buildUrl } from './endpoints';

export interface CartItem {
  _id?: string;
  productId: string;
  quantity: number;
  unit: string;
}

interface ClientCartItem extends CartItem {
  unit: string;
}

let clientCartItems: ClientCartItem[] = [];

export const setClientCartItems = (items: ClientCartItem[]) => {
  clientCartItems = items;
};

export const getClientCartItems = (): ClientCartItem[] => {
  return clientCartItems;
};

export const checkProductUnitConflict = (productId: string, newUnit: string): boolean => {
  const existingItem = clientCartItems.find(item => item.productId === productId);
  
  if (existingItem && existingItem.unit !== newUnit) {
    toast.error('هذا المنتج موجود بالفعل في عربة التسوق بوحدة مختلفة. لا يمكن إضافة نفس المنتج بوحدة أخرى.', {
      position: "top-center",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
    return true;
  }
  
  return false;
};

// Helper function to check if user is authenticated
const isAuthenticated = (): boolean => {
  if (typeof window === 'undefined') return false;
  const token = localStorage.getItem('auth_token');
  return !!token;
};

// Helper function to handle auth errors
const handleAuthError = (error: any) => {
  if (error?.response?.status === 401) {
    localStorage.removeItem('auth_token');
    toast.error('الرجاء تسجيل الدخول أولاً', {
      position: "top-center",
      autoClose: 5000,
    });
    // Redirect to login
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
    return true;
  }
  return false;
};

export const cartService = {
  // Get current user's cart
  async getCart() {
    try {
      // Check authentication before making request
      if (!isAuthenticated()) {
        console.warn('User not authenticated - cart operations require login');
        return {
          status: 'error',
          data: { cart: { items: [] } },
          message: 'Please log in to access your cart'
        };
      }

      const response = await apiClient.get('/carts');
      
      const items = response.data?.data?.cart?.items || [];
      
      const mappedItems: ClientCartItem[] = items.map((i: any) => {
        const productId = i.productId._id || i.productId;
        
        const storedItem = localStorage.getItem(`cart_item_${productId}`);
        let unit = 'unit';
        if (storedItem) {
          try {
            unit = JSON.parse(storedItem).unit || 'unit';
          } catch (e) {
            console.error("Error parsing stored cart item:", e);
          }
        }

        return {
          _id: i._id,
          productId: productId,
          quantity: i.itemQty,
          unit: unit,
        };
      });
      
      setClientCartItems(mappedItems);
      return response.data;
    } catch (error: any) {
      if (handleAuthError(error)) return;
      
      console.error('Error fetching cart:', error);
      return {
        status: 'error',
        data: { cart: { items: [] } },
        message: error?.response?.data?.message || 'Failed to fetch cart'
      };
    }
  },

  // Add item to cart
  async addToCart(item: CartItem) {
    try {
      if (!isAuthenticated()) {
        toast.error('الرجاء تسجيل الدخول أولاً', {
          position: "top-center",
          autoClose: 5000,
        });
        window.location.href = '/login';
        return null;
      }

      const payload = { productId: item.productId, itemQty: item.quantity };
      const response = await apiClient.post('/cartItems/', payload);
      
      toast.success('تم إضافة المنتج إلى عربة التسوق', {
        position: "top-center",
        autoClose: 3000,
      });
      
      return response.data;
    } catch (error: any) {
      if (handleAuthError(error)) return null;
      
      console.error('Error adding to cart:', error);
      toast.error(error?.response?.data?.message || 'Failed to add item to cart');
      return null;
    }
  },

  // Update cart item quantity
  async updateCartItem(cartItemId: string, quantity: number | string) {
    try {
      if (!isAuthenticated()) {
        toast.error('الرجاء تسجيل الدخول أولاً', {
          position: "top-center",
          autoClose: 5000,
        });
        return null;
      }

      let safeQuantity = Number(quantity);
      
      if (isNaN(safeQuantity) || !isFinite(safeQuantity)) {
        safeQuantity = 1;
      }
      
      safeQuantity = Math.max(1, Math.min(safeQuantity, Number.MAX_SAFE_INTEGER));
      safeQuantity = Math.floor(safeQuantity);
      
      const url = buildUrl('/cartItems/:itemId', { itemId: cartItemId });
      const response = await apiClient.put(url, { 
        itemQty: safeQuantity 
      });
      return response.data;
    } catch (error: any) {
      if (handleAuthError(error)) return null;
      
      console.error('Error updating cart item:', error);
      toast.error('Failed to update item quantity');
      return null;
    }
  },

  // Remove item from cart
  async removeFromCart(cartItemId: string) {
    try {
      if (!isAuthenticated()) {
        toast.error('الرجاء تسجيل الدخول أولاً', {
          position: "top-center",
          autoClose: 5000,
        });
        return null;
      }

      const url = buildUrl('/cartItems/:itemId', { itemId: cartItemId });
      const response = await apiClient.delete(url);
      
      toast.success('تم حذف المنتج من عربة التسوق', {
        position: "top-center",
        autoClose: 3000,
      });
      
      return response.data;
    } catch (error: any) {
      if (handleAuthError(error)) return null;
      
      console.error('Error removing from cart:', error);
      toast.error('Failed to remove item from cart');
      return null;
    }
  },

  // Clear the entire cart
  async clearCart() {
    try {
      if (!isAuthenticated()) {
        toast.error('الرجاء تسجيل الدخول أولاً', {
          position: "top-center",
          autoClose: 5000,
        });
        return null;
      }

      const response = await apiClient.delete('/carts');
      toast.success('تم مسح عربة التسوق', {
        position: "top-center",
        autoClose: 3000,
      });
      return response.data;
    } catch (error: any) {
      if (handleAuthError(error)) return null;
      
      console.error('Error clearing cart:', error);
      toast.error('Failed to clear cart');
      return null;
    }
  },

  // Get cart item count
  async getCartItemCount() {
    try {
      if (!isAuthenticated()) {
        return 0;
      }

      try {
        const response = await apiClient.get('/cart/count');
        return response.data.count;
      } catch {
        const cart = await cartService.getCart();
        const items = Array.isArray(cart?.data?.cart?.items) ? cart.data.cart.items : [];
        return items.reduce((sum: number, it: any) => sum + (Number(it.itemQty) || 0), 0);
      }
    } catch (error: any) {
      console.error('Error getting cart count:', error);
      return 0;
    }
  }
};

export default cartService;
import apiClient from './client';
import { toast } from 'react-toastify'; // Assuming a toast/alert library is available

import { buildUrl } from './endpoints';

export interface CartItem {
  _id?: string; // Optional ID, as it might not be present before adding
  productId: string;
  quantity: number;
  // The unit is not returned by the API, so we must rely on client-side storage for validation
  // Additional fields like price, name, etc. will be populated from the server
}

// Interface for the client-side cart item with the unit information
interface ClientCartItem extends CartItem {
  unit: string;
}

// Client-side state for the cart (for validation purposes)
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
    // Product is already in the cart with a different unit
    toast.error('هذا المنتج موجود بالفعل في عربة التسوق بوحدة مختلفة. لا يمكن إضافة نفس المنتج بوحدة أخرى.', {
      position: "top-center",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    });
    return true; // Conflict found
  }
  
  return false; // No conflict
};



export const cartService = {
  // Get current user's cart
  async getCart() {
    const response = await apiClient.get('/carts');
    
    // Based on cart-api.md, the structure is response.data.data.cart.items
    const items = response.data?.data?.cart?.items || [];
    
    // Update client-side cart state for validation
    const mappedItems: ClientCartItem[] = items.map((i: any) => {
      // The productId can be an object with _id or just the string ID
      const productId = i.productId._id || i.productId;
      
      // Retrieve the unit from localStorage, which was stored in Overview.tsx
      const storedItem = localStorage.getItem(`cart_item_${productId}`);
      let unit = 'unit'; // Default unit if not found
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
        quantity: i.itemQty, // itemQty is the quantity field from backend
        unit: unit, // The unit retrieved from localStorage
      };
    });
    setClientCartItems(mappedItems);
    
    return response.data;
  },

  // Add item to cart
  async addToCart(item: CartItem) {
    // The backend only accepts productId and itemQty based on cartitem-api.md
    const payload = { productId: item.productId, itemQty: item.quantity };
    const response = await apiClient.post('/cartItems/', payload);
    
    // The calling component (Overview.tsx) is responsible for calling getCart()
    // to refresh the client-side state for validation.
    
    return response.data;
  },

  // Update cart item quantity
  async updateCartItem(cartItemId: string, quantity: number | string) {
    // Ensure quantity is a valid number
    let safeQuantity = Number(quantity);
    
    // If conversion fails or results in NaN, default to 1
    if (isNaN(safeQuantity) || !isFinite(safeQuantity)) {
      safeQuantity = 1;
    }
    
    // Ensure quantity is at least 1 and within safe bounds
    safeQuantity = Math.max(1, Math.min(safeQuantity, Number.MAX_SAFE_INTEGER));
    
    // Ensure it's a whole number
    safeQuantity = Math.floor(safeQuantity);
    
    const url = buildUrl('/cartItems/:itemId', { itemId: cartItemId });
    const response = await apiClient.put(url, { 
      itemQty: safeQuantity 
    });
    return response.data;
  },

  // Remove item from cart
  async removeFromCart(cartItemId: string) {
    const url = buildUrl('/cartItems/:itemId', { itemId: cartItemId });
    const response = await apiClient.delete(url);
    return response.data;
  },

  // Clear the entire cart
  async clearCart() {
    const response = await apiClient.delete('/carts');
    return response.data;
  },

  // Get cart item count
  async getCartItemCount() {
    // If backend doesn't provide /cart/count, derive from cart items length
    try {
      const response = await apiClient.get('/cart/count');
      return response.data.count;
    } catch {
      const cart = await cartService.getCart();
      const items = Array.isArray(cart?.data?.cart?.items) ? cart.data.cart.items : [];
      return items.reduce((sum: number, it: any) => sum + (Number(it.itemQty) || 0), 0);
    }
  }
};

export default cartService;
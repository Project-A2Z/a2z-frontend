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

      let displayQuantity = i.itemQty;
      
      // Apply reverse conversion for display: divide by 1000 for 'ton' and 'cubic_meter'
      if (unit === 'ton' || unit === 'cubic_meter') {
        displayQuantity = i.itemQty / 1000;
      }

      return {
        _id: i._id,
        productId: productId,
        quantity: displayQuantity, // Use the converted quantity for display
        unit: unit, // The unit retrieved from localStorage
      };
    });
    setClientCartItems(mappedItems);
    
    return response.data;
  },

  // Add item to cart
  async addToCart(item: CartItem & { unit: string }) {
    let itemQty = item.quantity;
    
    // Apply conversion logic: multiply by 1000 for 'kg' and 'cubic_meter'
    if (item.unit === 'ton' || item.unit === 'cubic_meter') {
      // Apply conversion and ensure it's an integer before sending to the backend
      itemQty = Math.round(item.quantity * 1000);
    }
    
    // The backend only accepts productId and itemQty based on cartitem-api.md
    const payload = { productId: item.productId, itemQty: itemQty };
    const response = await apiClient.post('/cartItems/', payload);
    
    // The calling component (Overview.tsx) is responsible for calling getCart()
    // to refresh the client-side state for validation.
    
    return response.data;
  },

  // Update cart item quantity
  async updateCartItem(cartItemId: string, quantity: number) {
    // We need to know the unit to apply the conversion before sending to the backend
    // This requires a more complex lookup, but for now, we'll assume the quantity
    // being passed is the *display* quantity, and we need to convert it if it's a converted unit.
    // Since the unit is not passed here, we must rely on the clientCartItems state to get the unit.
    const existingItem = clientCartItems.find(item => item._id === cartItemId);
    let itemQty = quantity;

    if (existingItem && (existingItem.unit === 'ton' || existingItem.unit === 'cubic_meter')) {
      // Apply conversion and ensure it's an integer before sending to the backend
      itemQty = Math.round(quantity * 1000);
    }
    
    const url = buildUrl('/cartItems/:itemId', { itemId: cartItemId });
    const response = await apiClient.put(url, { itemQty: itemQty });
    
    // After successful update, we should refresh the client-side state
    await cartService.getCart();
    
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

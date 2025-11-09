import apiClient from './client';
import { buildUrl } from './endpoints';

export interface CartItem {
  productId: string;
  quantity: number;
  // Additional fields like price, name, etc. will be populated from the server
}

export const cartService = {
  // Get current user's cart
  async getCart() {
    const response = await apiClient.get('/carts');
    return response.data;
  },

  // Add item to cart
  async addToCart(item: CartItem) {
    const payload = { productId: item.productId, itemQty: item.quantity };
    const response = await apiClient.post('/cartItems/', payload);
    return response.data;
  },

  // Update cart item quantity
  async updateCartItem(cartItemId: string, quantity: number) {
    const url = buildUrl('/cartItems/:itemId', { itemId: cartItemId });
    const response = await apiClient.put(url, { itemQty: quantity });
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
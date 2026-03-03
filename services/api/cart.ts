import apiClient from './client';
import { toast } from 'react-toastify';
import { buildUrl } from './endpoints';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface CartItem {
  _id?: string;
  /** NEW: ProductVariant ObjectId (replaces productId) */
  variantId: string;
  quantity: number;
  unit: string;
  /** Optional: attribute value ObjectId (e.g. color, size) */
  attributeValueId?: string;
}

interface ClientCartItem extends CartItem {
  price?: number;
  /** Populated variant object returned by the API */
  variant?: {
    _id?: string;
    productId?: string;
    sku?: string;
    unitId?: string | { _id: string; name: string };
    price?: number;
    totalQuantity?: number;
    imageList?: string[];
    images?: string[];
  };
  /** Kept for display / legacy purposes */
  product?: {
    name?: string;
    title?: string;
    imageList?: string[];
    images?: string[];
    image?: string;
    thumbnail?: string;
    mainImage?: string;
    coverImage?: string;
    imageUrl?: string;
    stockQty?: number;
    quantity?: number;
    category?: string;
    price?: number;
  };
}

// ── In-memory cart cache ──────────────────────────────────────────────────────

let clientCartItems: ClientCartItem[] = [];

export const setClientCartItems = (items: ClientCartItem[]) => {
  clientCartItems = items;
};

export const getClientCartItems = (): ClientCartItem[] => clientCartItems;

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Prevents adding the same product variant with a different unit.
 * Uses variantId instead of productId.
 */
export const checkProductUnitConflict = (variantId: string, newUnit: string): boolean => {
  const existingItem = clientCartItems.find((item) => item.variantId === variantId);

  if (existingItem && existingItem.unit !== newUnit) {
    toast.error(
      'هذا المنتج موجود بالفعل في عربة التسوق بوحدة مختلفة. لا يمكن إضافة نفس المنتج بوحدة أخرى.',
      {
        position: 'top-center',
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      }
    );
    return true;
  }

  return false;
};

const isAuthenticated = (): boolean => {
  if (typeof window === 'undefined') return false;
  return !!localStorage.getItem('auth_token');
};

const handleAuthError = (error: any): boolean => {
  if (error?.response?.status === 401) {
    localStorage.removeItem('auth_token');
    toast.error('الرجاء تسجيل الدخول أولاً', { position: 'top-center', autoClose: 5000 });
    if (typeof window !== 'undefined') window.location.href = '/login';
    return true;
  }
  return false;
};

/** localStorage key for persisting unit choice per variant */
const variantStorageKey = (variantId: string) => `cart_variant_${variantId}`;

// ── Service ───────────────────────────────────────────────────────────────────

export const cartService = {
  // ── Get cart ───────────────────────────────────────────────────────────────
  async getCart() {
    try {
      if (!isAuthenticated()) {
        console.warn('User not authenticated – cart operations require login');
        return { status: 'error', data: { cart: { items: [] } }, message: 'Please log in' };
      }

      const response = await apiClient.get('/carts');
      const items: any[] = response.data?.data?.cart?.items ?? [];

      const mappedItems: ClientCartItem[] = items
        .filter((i) => i && (i.variantId?._id || i.variantId))
        .map((i): ClientCartItem | null => {
          // variantId may be a populated object or a plain string
          const variantData = i.variantId && typeof i.variantId === 'object' ? i.variantId : null;
          const variantId: string = variantData?._id || i.variantId || '';

          if (!variantId) {
            console.warn('Skipping cart item with invalid variantId:', i);
            return null;
          }

          // Restore unit from localStorage
          const stored = localStorage.getItem(variantStorageKey(variantId));
          let unit = 'unit';
          try {
            if (stored) unit = JSON.parse(stored).unit ?? 'unit';
          } catch {}

          // Convert quantity: ton / cubic_meter are stored × 1000 in the DB
          let displayQuantity = i.itemQty;
          if (unit === 'ton' || unit === 'cubic_meter') displayQuantity = i.itemQty / 1000;

          // Price from populated variant object
          let displayPrice = variantData?.price ?? i.price ?? 0;
          if (unit === 'ton' || unit === 'cubic_meter') displayPrice = displayPrice * 1000;

          return {
            _id: i._id,
            variantId,
            quantity: displayQuantity,
            unit,
            price: displayPrice,
            attributeValueId: i.attributeValueId,
            variant: variantData,
          };
        })
        .filter((item): item is ClientCartItem => item !== null);

      setClientCartItems(mappedItems);
      console.log('Processed cart items:', mappedItems);
      return response.data;
    } catch (error: any) {
      if (handleAuthError(error)) return;
      console.error('Error fetching cart:', error);
      return { status: 'error', data: { cart: { items: [] } }, message: error?.response?.data?.message ?? 'Failed to fetch cart' };
    }
  },

  // ── Add to cart ────────────────────────────────────────────────────────────
  async addToCart(item: CartItem) {
    try {
      if (!isAuthenticated()) {
        toast.error('الرجاء تسجيل الدخول أولاً', { position: 'top-center', autoClose: 5000 });
        window.location.href = '/login';
        return null;
      }

      // Persist unit choice so getCart() can restore it
      localStorage.setItem(
        variantStorageKey(item.variantId),
        JSON.stringify({ unit: item.unit })
      );

      // Multiply quantity for ton / cubic_meter
      let dbQuantity = item.quantity;
      if (item.unit === 'ton' || item.unit === 'cubic_meter') dbQuantity = item.quantity * 1000;

      const payload: Record<string, unknown> = {
        variantId: item.variantId,
        itemQty: dbQuantity,
      };
      if (item.attributeValueId) payload.attributeValueId = item.attributeValueId;

      console.log('Cart Service – addToCart payload:', payload);

      const response = await apiClient.post('/cartItems/', payload);

      toast.success('تم إضافة المنتج إلى عربة التسوق', { position: 'top-center', autoClose: 3000 });
      return response.data;
    } catch (error: any) {
      if (handleAuthError(error)) return null;
      console.error('Error adding to cart:', error);
      toast.error(error?.response?.data?.message ?? 'Failed to add item to cart');
      return null;
    }
  },

  // ── Update cart item ───────────────────────────────────────────────────────
  async updateCartItem(cartItemId: string, quantity: number | string) {
    try {
      if (!isAuthenticated()) {
        toast.error('الرجاء تسجيل الدخول أولاً', { position: 'top-center', autoClose: 5000 });
        return null;
      }

      let safeQuantity = Math.floor(Math.max(1, Math.min(Number(quantity) || 1, Number.MAX_SAFE_INTEGER)));

      // Find unit from in-memory cache
      const cartItem = clientCartItems.find((item) => item._id === cartItemId);
      const unit = cartItem?.unit ?? '';
      const stored = cartItem ? localStorage.getItem(variantStorageKey(cartItem.variantId)) : null;
      const resolvedUnit = (() => {
        try { return stored ? JSON.parse(stored).unit ?? unit : unit; } catch { return unit; }
      })();

      let dbQuantity = safeQuantity;
      if (resolvedUnit === 'ton' || resolvedUnit === 'cubic_meter') dbQuantity = safeQuantity * 1000;

      const url = buildUrl('/cartItems/:itemId', { itemId: cartItemId });
      console.log('Cart Service – updateCartItem:', { cartItemId, safeQuantity, resolvedUnit, dbQuantity });

      const response = await apiClient.put(url, { itemQty: dbQuantity });
      return response.data;
    } catch (error: any) {
      if (handleAuthError(error)) return null;
      console.error('Error updating cart item:', error);
      toast.error('Failed to update item quantity');
      return null;
    }
  },

  // ── Remove from cart ───────────────────────────────────────────────────────
  async removeFromCart(cartItemId: string) {
    try {
      if (!isAuthenticated()) {
        toast.error('الرجاء تسجيل الدخول أولاً', { position: 'top-center', autoClose: 5000 });
        return null;
      }

      const url = buildUrl('/cartItems/:itemId', { itemId: cartItemId });
      const response = await apiClient.delete(url);

      toast.success('تم حذف المنتج من عربة التسوق', { position: 'top-center', autoClose: 3000 });
      return response.data;
    } catch (error: any) {
      if (handleAuthError(error)) return null;
      console.error('Error removing from cart:', error);
      toast.error('Failed to remove item from cart');
      return null;
    }
  },

  // ── Clear cart ─────────────────────────────────────────────────────────────
  async clearCart() {
    try {
      if (!isAuthenticated()) {
        toast.error('الرجاء تسجيل الدخول أولاً', { position: 'top-center', autoClose: 5000 });
        return null;
      }

      const response = await apiClient.delete('/carts');
      toast.success('تم مسح عربة التسوق', { position: 'top-center', autoClose: 3000 });
      return response.data;
    } catch (error: any) {
      if (handleAuthError(error)) return null;
      console.error('Error clearing cart:', error);
      toast.error('Failed to clear cart');
      return null;
    }
  },

  // ── Cart item count ────────────────────────────────────────────────────────
  async getCartItemCount(): Promise<number> {
    try {
      if (!isAuthenticated()) return 0;
      try {
        const response = await apiClient.get('/cart/count');
        return response.data.count;
      } catch {
        const cart = await cartService.getCart();
        const items: any[] = cart?.data?.cart?.items ?? [];
        return items.reduce((sum: number, it: any) => sum + (Number(it.itemQty) || 0), 0);
      }
    } catch (error: any) {
      console.error('Error getting cart count:', error);
      return 0;
    }
  },
};

export default cartService;
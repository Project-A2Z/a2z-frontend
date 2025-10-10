import apiClient from './client';

export interface WishItemResponse {
  _id: string;
  userId: string;
  productId: any;
  createdAt: string;
  updatedAt: string;
}

export const wishlistService = {
  async getAll(params?: Record<string, any>) {
    const res = await apiClient.get('/wish-items/', { params });
    return res.data; // { status, data: { count, wishItems: [...] } }
  },

  async add(productId: string) {
    try {
      const res = await apiClient.post('/wish-items/', { productId });
      return res.data; // { status, data: { wishItem } }
    } catch (err: any) {
      // 409 = conflict (likely already exists). Let caller decide what to do.
      if (err?.response?.status === 409) {
        return {
          status: 'conflict',
          message: 'Item already in wishlist',
        } as any;
      }
      throw err;
    }
  },

  async remove(productId: string) {
    const res = await apiClient.delete(`/wish-items/${productId}`);
    return res.data; // { status, message }
  },

  // Convenience: add-if-missing, otherwise remove (idempotent toggle)
  async toggle(productId: string) {
    const added = await this.add(productId);
    if (added?.status === 'conflict') {
      const removed = await this.remove(productId);
      return { status: 'removed', data: removed?.data } as any;
    }
    return { status: 'added', data: (added as any)?.data } as any;
  },
};

export default wishlistService;

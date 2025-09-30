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
    const res = await apiClient.post('/wish-items/', { productId });
    return res.data; // { status, data: { wishItem } }
  },

  async remove(productId: string) {
    const res = await apiClient.delete(`/wish-items/${productId}`);
    return res.data; // { status, message }
  }
};

export default wishlistService;

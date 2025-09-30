// Fixed products.ts (service)
import apiClient from './client'; // Assuming client.ts exists and is configured with baseURL

export interface Product {
  _id: string;
  category: string;
  name: string;
  description?: string;
  imageList: string[];
  price: number;
  stockQty: number;
  stockType: 'unit' | 'kg' | 'ton';
  advProduct?: string[];
  weightUnit?: 'kg' | 'ton';
  averageRate?: number;
  createdAt?: string;
  updatedAt?: string;
  // Add any other fields like brand, specifications if they exist in backend
}

export interface ProductFilters {
  page?: number;
  limit?: number;
  sort?: string;
  fields?: string;
  category?: string;
  name?: string;
  price?: {
    gte?: number;
    lte?: number;
  };
  [key: string]: any; // For dynamic filtering
}

export interface ApiResponse<T> {
  status: string;
  data: T;
  message?: string;
  length?: number;
}

export const productService = {
  // Get all products with optional filters
  async getProducts(filters: ProductFilters = {}): Promise<ApiResponse<Product[]>> {
    const response = await apiClient.get<ApiResponse<Product[]>>('https://a2z-backend.fly.dev/app/v1/products', { 
      params: filters 
    });
    return response.data;
  },

  // Get a single product by ID - Fixed path to match API
  async getProductById(id: string): Promise<ApiResponse<{ product: Product; reviews?: any[] }>> {
    try {
      if (!id) {
        throw new Error('Product ID is required');
      }
      // Path fixed to /app/v1/products/:id
      const response = await apiClient.get<ApiResponse<{ product: Product; reviews?: any[] }>>(`https://a2z-backend.fly.dev/app/v1/products/${id}`);
      return response.data;
    } catch (error: any) {
      console.error(`Error fetching product with ID ${id}:`, error);
      throw error; // Re-throw to let the caller handle it
    }
  },

  // Create a new product (Admin only)
  async createProduct(productData: FormData): Promise<ApiResponse<{ product: Product }>> {
    const response = await apiClient.post<ApiResponse<{ product: Product }>>(
      'https://a2z-backend.fly.dev/app/v1/products',
      productData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  },

  // Update a product (Admin only) - Fixed path and content-type
  async updateProduct(id: string, productData: Partial<Product>): Promise<ApiResponse<{ product: Product }>> {
    const response = await apiClient.put<ApiResponse<{ product: Product }>>(
      `https://a2z-backend.fly.dev/app/v1/products/${id}`,
      productData,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data;
  },

  // Delete a product (Admin only) - Fixed path
  async deleteProduct(id: string): Promise<ApiResponse<null>> {
    const response = await apiClient.delete<ApiResponse<null>>(`https://a2z-backend.fly.dev/app/v1/products/${id}`);
    return response.data;
  },

  // Get product reviews - Assuming this endpoint exists; if not, use the reviews from getProductById
  async getProductReviews(productId: string): Promise<ApiResponse<{ reviews: any[] }>> {
    try {
      if (!productId) {
        throw new Error('Product ID is required to fetch reviews');
      }
      // If this endpoint doesn't exist, comment out and use reviews from getProductById
      // Assuming path based on previous code; adjust if backend has /app/v1/products/:id/reviews
      const response = await apiClient.get<ApiResponse<{ reviews: any[] }>>(
        `https://a2z-backend.fly.dev/app/v1/products/${productId}/reviews` // Fixed to match base URL pattern
      );
      return response.data;
    } catch (error: any) {
      console.error(`Error fetching reviews for product ${productId}:`, error);
      // Return empty reviews array instead of failing completely
      return { status: 'error', data: { reviews: [] } };
    }
  },
};

export default productService;
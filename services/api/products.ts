// Fixed products.ts (service)
import apiClient from './client'; // Assuming client.ts exists and is configured with baseURL

export interface Review {
  _id: string;
  userId: string;
  productId: string;
  description: string;
  rateNum: number;
  date: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

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
  productReview?: Review[]; // Added: Reviews are embedded in the product response
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

  // Get a single product by ID - Updated typing to ApiResponse<Product> since reviews are in product.productReview
  async getProductById(id: string): Promise<ApiResponse<Product>> {
    try {
      if (!id) {
        throw new Error('Product ID is required');
      }
      // Path fixed to /app/v1/products/:id
      const response = await apiClient.get<ApiResponse<Product>>(`https://a2z-backend.fly.dev/app/v1/products/${id}`);
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

  // Removed getProductReviews - Endpoint does not exist (returns 404); use product.productReview from getProductById instead
};

export default productService;
// services/product/products-optimized.ts

// Keep your existing API configuration
const API_BASE_URL = 'https://a2z-backend.fly.dev/app/v1';
const DEFAULT_LANGUAGE = 'ar';

// Keep all your existing types
export interface Product {
  id: string | number;
  name: string;
  nameAr?: string;
  nameEn?: string;
  description?: string;
  descriptionAr?: string;
  descriptionEn?: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  image: string;
  images?: string[];
  category: string;
  categoryId?: string | number;
  brand?: string;
  brandId?: string | number;
  inStock: boolean;
  stockQuantity?: number;
  rating?: number;
  reviewsCount?: number;
  tags?: string[];
  specifications?: Record<string, any>;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProductsResponse {
  data: Product[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  filters?: {
    categories: string[];
    brands: string[];
    priceRange: {
      min: number;
      max: number;
    };
  };
}

export interface ProductFilters {
  category?: string | string[];
  brand?: string | string[];
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  featured?: boolean;
  page?: number;
  limit?: number;
  sortBy?: 'name' | 'price' | 'rating' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
  lang?: string;
}

// Server-side function for Static Site Generation (SSG)
export async function getStaticProducts(): Promise<ProductsResponse> {
  try {
    const url = `${API_BASE_URL}/products`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      // No Next.js cache configuration here since this runs at build time
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch products: ${response.status} ${response.statusText}`);
    }

    const data: ProductsResponse = await response.json();
    
    return {
      data: (data.data || []).map(product => ({
        ...product,
        name: product.nameAr || product.name || '',
        description: product.descriptionAr || product.description || '',
        category: product.category || '',
        price: product.price || 0,
        image: product.image || '',
        inStock: product.inStock !== undefined ? product.inStock : true,
      })),
      pagination: data.pagination || {
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 1
      },
      filters: data.filters
    };
  } catch (error) {
    console.error('Error fetching static products:', error);
    return {
      data: [],
      pagination: {
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 1
      }
    };
  }
}

// Server-side function for Server-Side Rendering (SSR)
export async function getServerSideProducts(filters: ProductFilters = {}): Promise<ProductsResponse> {
  try {
    const url = `${API_BASE_URL}/products`;
    
    console.log('Server-side fetching products from:', url);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      // Server-side fetch doesn't use Next.js cache
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch products: ${response.status} ${response.statusText}`);
    }

    const data: ProductsResponse = await response.json();
    
    return {
      data: (data.data || []).map(product => ({
        ...product,
        name: product.nameAr || product.name || '',
        description: product.descriptionAr || product.description || '',
        category: product.category || '',
        price: product.price || 0,
        image: product.image || '',
        inStock: product.inStock !== undefined ? product.inStock : true,
      })),
      pagination: data.pagination || {
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 1
      },
      filters: data.filters
    };
  } catch (error) {
    console.error('Error fetching server-side products:', error);
    return {
      data: [],
      pagination: {
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 1
      }
    };
  }
}

// Optimized client-side function with better caching
export const fetchProducts = async (filters: ProductFilters = {}): Promise<ProductsResponse> => {
  try {
    const url = `${API_BASE_URL}/products`;
    
    console.log('Fetching products from:', url);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      // Enhanced caching for client-side requests
      next: { 
        revalidate: 300, // 5 minutes
        tags: ['products'] // For on-demand revalidation
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch products: ${response.status} ${response.statusText}`);
    }

    const data: ProductsResponse = await response.json();
    
    return {
      data: (data.data || []).map(product => ({
        ...product,
        name: product.nameAr || product.name || '',
        description: product.descriptionAr || product.description || '',
        category: product.category || '',
        price: product.price || 0,
        image: product.image || '',
        inStock: product.inStock !== undefined ? product.inStock : true,
      })),
      pagination: data.pagination || {
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 1
      },
      filters: data.filters
    };
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
};

// Keep all your existing functions
export const fetchProductsByCategory = async (
  categoryId: string | number,
  filters: Omit<ProductFilters, 'category'> = {}
): Promise<ProductsResponse> => {
  try {
    const url = `${API_BASE_URL}/products`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      next: { revalidate: 300 }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch products by category: ${response.status}`);
    }

    const data: ProductsResponse = await response.json();
    
    const filteredData = data.data ? data.data.filter(product => 
      product.categoryId === categoryId || product.category === categoryId
    ) : [];
    
    return {
      ...data,
      data: filteredData
    };
  } catch (error) {
    console.error('Error fetching products by category:', error);
    throw error;
  }
};

export const searchProducts = async (
  query: string,
  filters: Omit<ProductFilters, 'search'> = {}
): Promise<ProductsResponse> => {
  try {
    const url = `${API_BASE_URL}/products`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      next: { revalidate: 60 }
    });

    if (!response.ok) {
      throw new Error(`Failed to search products: ${response.status}`);
    }

    const data: ProductsResponse = await response.json();
    
    const filteredData = data.data ? data.data.filter(product => 
      product.name?.toLowerCase().includes(query.toLowerCase()) ||
      product.nameAr?.toLowerCase().includes(query.toLowerCase()) ||
      product.description?.toLowerCase().includes(query.toLowerCase()) ||
      product.category?.toLowerCase().includes(query.toLowerCase())
    ) : [];
    
    return {
      ...data,
      data: filteredData
    };
  } catch (error) {
    console.error('Error searching products:', error);
    throw error;
  }
};

export const fetchFeaturedProducts = async (
  filters: ProductFilters = {}
): Promise<ProductsResponse> => {
  try {
    const url = `${API_BASE_URL}/products`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      next: { revalidate: 600 }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch featured products: ${response.status}`);
    }

    const data: ProductsResponse = await response.json();
    
    const filteredData = data.data ? data.data.filter(product => 
      product.rating && product.rating >= 4
    ) : [];
    
    return {
      ...data,
      data: filteredData
    };
  } catch (error) {
    console.error('Error fetching featured products:', error);
    throw error;
  }
};

export const fetchCategories = async (lang: string = DEFAULT_LANGUAGE) => {
  try {
    const url = `${API_BASE_URL}/categories`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      next: { revalidate: 3600 }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch categories: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }
};

// Keep your existing utility functions
export const getByCategory = (categories: string[] | null | undefined, allProducts: Product[] | null | undefined): Product[] => {
  if (!categories || !categories.length || !allProducts) return allProducts || [];
  
  return allProducts.filter(product => 
    categories.some(category => 
      product.category === category || 
      product.categoryId === category
    )
  );
};

export const getByFirstLetter = (letter: string | null | undefined, allProducts: Product[] | null | undefined): Product[] => {
  if (!letter || letter === 'كل' || !allProducts) return allProducts || [];
  
  return allProducts.filter(product => 
    product.name && (
      product.name.charAt(0) === letter ||
      product.name.charAt(0).toLowerCase() === letter.toLowerCase()
    )
  );
};

export const withErrorHandling = <T extends (...args: any[]) => Promise<any>>(
  fn: T
): T => {
  return (async (...args: Parameters<T>) => {
    try {
      return await fn(...args);
    } catch (error) {
      console.error(`API Error in ${fn.name}:`, error);
      
      return {
        data: [],
        pagination: {
          page: 1,
          limit: 20,
          total: 0,
          totalPages: 0
        },
        filters: {
          categories: [],
          brands: [],
          priceRange: {
            min: 0,
            max: 0
          }
        }
      } as ProductsResponse;
      
    }
  }) as T;
};
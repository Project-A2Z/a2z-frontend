// services/product/products.ts - Updated with proper pagination

import {Api , API_ENDPOINTS} from './../api/endpoints'

const DEFAULT_LANGUAGE = 'ar';

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
  images?: (string)[];
  imageList?: (string)[]; 
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

// Lightweight image URL validation
const isValidImageUrl = (url: string): boolean => {
  if (!url || typeof url !== 'string' || url.trim() === '') {
    return false;
  }
  
  if (url.includes('example.com') || (!url.startsWith('http://') && !url.startsWith('https://'))) {
    return false;
  }
  
  const imageExtensions = /\.(jpg|jpeg|png|gif|webp|svg|bmp)(\?|$)/i;
  const cloudServices = /(cloudinary|amazonaws|imgix|unsplash|pexels)/i;
  return imageExtensions.test(url) || cloudServices.test(url);
};

// Process product images
const processProductImagesStatic = (product: any): Product => {
  const imageList = product.imageList || [];
  const fallbackImages = product.images || [];
  const fallbackImage = product.image || '';
  
  const allImages: string[] = [];
  
  if (imageList.length > 0) {
    allImages.push(...imageList.filter((img: any): img is string => img && typeof img === 'string'));
  }
  
  if (fallbackImages.length > 0) {
    allImages.push(...fallbackImages.filter((img: any): img is string => img && typeof img === 'string'));
  }
  
  if (fallbackImage && !allImages.includes(fallbackImage)) {
    allImages.push(fallbackImage);
  }

  const uniqueImages = [...new Set(allImages)].filter(img => isValidImageUrl(img));
  
  return {
    ...product,
    id: product.id ?? product._id ?? '',
    name: product.nameAr || product.name || '',
    description: product.descriptionAr || product.description || '',
    category: product.category || '',
    price: product.price || 0,
    image: uniqueImages.length > 0 ? uniqueImages[0] : '',
    images: uniqueImages.length > 0 ? uniqueImages : [],
    imageList: uniqueImages.length > 0 ? uniqueImages : [],
    inStock: product.inStock !== undefined ? product.inStock : true,
  };
};

// Request config
const getRequestConfig = () => ({
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...(process.env.API_KEY && { 'Authorization': `Bearer ${process.env.API_KEY}` }),
  },
});

// ============================================
// FETCH ALL PRODUCTS (No Pagination - for client-side pagination)
// ============================================
export const fetchAllProducts = async (filters: Omit<ProductFilters, 'page' | 'limit'> = {}): Promise<ProductsResponse> => {
  try {
    // Build query parameters
    const queryParams = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          queryParams.append(key, value.join(','));
        } else {
          queryParams.append(key, String(value));
        }
      }
    });
    
    const queryString = queryParams.toString();
    const url = queryString 
      ? `${Api}/${API_ENDPOINTS.PRODUCTS.LIST}?${queryString}`
      : `${Api}/${API_ENDPOINTS.PRODUCTS.LIST}`;
    
    console.log('Fetching all products from:', url);
    
    const config = getRequestConfig();
    
    const response = await fetch(url, {
      method: 'GET',
      ...config,
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch products: ${response.status} ${response.statusText}`);
    }

    const data: ProductsResponse = await response.json();
    
    const processedProducts = (data.data || []).map(product => processProductImagesStatic(product));
    
    console.log(`✅ Fetched ${processedProducts.length} total products`);
    
    return {
      data: processedProducts,
      pagination: {
        page: 1,
        limit: processedProducts.length,
        total: processedProducts.length,
        totalPages: 1
      },
      filters: data.filters
    };
  } catch (error) {
    console.error('Error fetching all products:', error);
    throw error;
  }
};

// ============================================
// FETCH PRODUCTS WITH SERVER-SIDE PAGINATION
// ============================================
export const fetchProducts = async (filters: ProductFilters = {}): Promise<ProductsResponse> => {
  try {
    // Default pagination
    const page = filters.page || 1;
    const limit = filters.limit || 20;
    
    // Build query parameters
    const queryParams = new URLSearchParams();
    
    Object.entries({ ...filters, page, limit }).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          queryParams.append(key, value.join(','));
        } else {
          queryParams.append(key, String(value));
        }
      }
    });
    
    const queryString = queryParams.toString();
    const url = queryString 
      ? `${Api}/${API_ENDPOINTS.PRODUCTS.LIST}?${queryString}`
      : `${Api}/${API_ENDPOINTS.PRODUCTS.LIST}`;
    
    console.log('Fetching products from:', url);
    
    const config = getRequestConfig();
    
    const response = await fetch(url, {
      method: 'GET',
      ...config,
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch products: ${response.status} ${response.statusText}`);
    }

    const data: ProductsResponse = await response.json();
    
    const processedProducts = (data.data || []).map(product => processProductImagesStatic(product));
    
    return {
      data: processedProducts,
      pagination: data.pagination || {
        page: page,
        limit: limit,
        total: processedProducts.length,
        totalPages: Math.ceil(processedProducts.length / limit)
      },
      filters: data.filters
    };
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
};

// ============================================
// CLIENT-SIDE PAGINATION HELPER
// ============================================
export const paginateProducts = (
  products: Product[], 
  page: number = 1, 
  limit: number = 20
): ProductsResponse => {
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedData = products.slice(startIndex, endIndex);
  
  return {
    data: paginatedData,
    pagination: {
      page,
      limit,
      total: products.length,
      totalPages: Math.ceil(products.length / limit)
    }
  };
};

// ============================================
// SEARCH PRODUCTS
// ============================================
export const searchProducts = async (
  query: string,
  filters: Omit<ProductFilters, 'search'> = {}
): Promise<ProductsResponse> => {
  try {
    return await fetchProducts({ ...filters, search: query });
  } catch (error) {
    console.error('Error searching products:', error);
    throw error;
  }
};

// ============================================
// FETCH BY CATEGORY
// ============================================
export const fetchProductsByCategory = async (
  categoryId: string | number,
  filters: Omit<ProductFilters, 'category'> = {}
): Promise<ProductsResponse> => {
  try {
    return await fetchProducts({ ...filters, category: String(categoryId) });
  } catch (error) {
    console.error('Error fetching products by category:', error);
    throw error;
  }
};

// ============================================
// FETCH FEATURED PRODUCTS
// ============================================
export const fetchFeaturedProducts = async (
  filters: ProductFilters = {}
): Promise<ProductsResponse> => {
  try {
    return await fetchProducts({ ...filters, featured: true });
  } catch (error) {
    console.error('Error fetching featured products:', error);
    throw error;
  }
};

// ============================================
// UTILITY FUNCTIONS
// ============================================
export const getProductImages = (product: Product): string[] => {
  if (product.imageList && product.imageList.length > 0) {
    return product.imageList.filter(img => img !== null && isValidImageUrl(img)) as string[];
  }
  
  if (product.images && product.images.length > 0) {
    return product.images.filter(img => img !== null && isValidImageUrl(img)) as string[];
  }
  
  if (product.image && isValidImageUrl(product.image)) {
    return [product.image];
  }
  
  return [];
};

export const getProductPrimaryImage = (product: Product): string | null => {
  const images = getProductImages(product);
  return images.length > 0 ? images[0] : null;
};

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
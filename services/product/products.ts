// services/product/products-optimized.ts (Performance optimized version)

const API_BASE_URL = 'https://a2z-backend.fly.dev/app/v1';
const DEFAULT_LANGUAGE = 'ar';

// Product interface (unchanged from original)
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
  image: string ;
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

// Lightweight image URL validation (no HTTP requests)
const isValidImageUrl = (url: string): boolean => {
  if (!url || typeof url !== 'string' || url.trim() === '') {
    return false;
  }
  
  // Check for obviously invalid URLs
  if (url.includes('example.com') || (!url.startsWith('http://') && !url.startsWith('https://'))) {
    return false;
  }
  
  // Check for common image extensions or cloud services
  const imageExtensions = /\.(jpg|jpeg|png|gif|webp|svg|bmp)(\?|$)/i;
  const cloudServices = /(cloudinary|amazonaws|imgix|unsplash|pexels)/i;
  
  return imageExtensions.test(url) || cloudServices.test(url);
};

// Fast image processing without HTTP validation (for build time)
const processProductImagesStatic = (product: any): Product => {

  const imageList = product.imageList || [];
  const fallbackImages = product.images || [];
  const fallbackImage = product.image || '';
  
  // Collect all possible images
  const allImages: string[] = [];
  
  if (imageList.length > 0) {
    allImages.push(...imageList.filter((img: any): img is string => img && typeof img === 'string'));
  }
  
  // Add fallback images
  if (fallbackImages.length > 0) {
    allImages.push(...fallbackImages.filter((img: any): img is string => img && typeof img === 'string'));
  }
  // Add single fallback image
  if (fallbackImage && !allImages.includes(fallbackImage)) {
    allImages.push(fallbackImage);
  }

  // Remove duplicates and filter with basic validation
  const uniqueImages = [...new Set(allImages)].filter(img => isValidImageUrl(img));
  
  return {
    ...product,
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

// Enhanced configuration for different environments
const getRequestConfig = () => ({
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    // Add any authentication headers if needed
    ...(process.env.API_KEY && { 'Authorization': `Bearer ${process.env.API_KEY}` }),
  },
});

// Fast server-side function for Static Site Generation (getStaticProps)
export async function getStaticProducts(): Promise<ProductsResponse> {
  const maxRetries = 2; // Reduced retries for faster builds
  let lastError: Error | null = null;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`🚀 Fetching static products (attempt ${attempt}/${maxRetries})...`);
      
      const url = `${API_BASE_URL}/products`;
      const config = getRequestConfig();
      
      // Set a reasonable timeout for build time
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 seconds
      
      const response = await fetch(url, {
        method: 'GET',
        signal: controller.signal,
        ...config,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data: ProductsResponse = await response.json();
      
      console.log(`✅ Successfully fetched ${data.data?.length || 0} products`);
      
      // Fast processing without HTTP image validation
      const processedProducts = (data.data || []).map(product => processProductImagesStatic(product));
      
      console.log(`⚡ Fast processing completed in milliseconds`);
      
      return {
        data: processedProducts,
        pagination: data.pagination || {
          page: 1,
          limit: processedProducts.length,
          total: processedProducts.length,
          totalPages: 1
        },
        filters: data.filters || {
          categories: [],
          brands: [],
          priceRange: { min: 0, max: 0 }
        }
      };
    } catch (error) {
      lastError = error as Error;
      console.error(`❌ Attempt ${attempt} failed:`, error);
      
      // Shorter wait time for build performance
      if (attempt < maxRetries) {
        const delay = attempt * 2000; // 2s, 4s
        console.log(`⏳ Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  console.error('❌ All attempts failed for static generation:', lastError);
  
  // Return empty but valid response to prevent build failure
  return {
    data: [],
    pagination: {
      page: 1,
      limit: 20,
      total: 0,
      totalPages: 1
    },
    filters: {
      categories: [],
      brands: [],
      priceRange: {
        min: 0,
        max: 0
      }
    }
  };
}

// Client-side image validation (lazy loading)
const validateImageUrl = async (url: string): Promise<boolean> => {
  if (!isValidImageUrl(url)) return false;
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

    const response = await fetch(url, {
      method: 'HEAD',
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (response.ok) {
      const contentType = response.headers.get('content-type');
      return !!(contentType && contentType.startsWith('image/'));
    }
    
    return false;
  } catch (error) {
    console.warn(`Image validation failed for ${url}:`, error);
    return false;
  }
};

// Client-side function with lazy image validation
export const fetchProducts = async (filters: ProductFilters = {}): Promise<ProductsResponse> => {
  try {
    const url = `${API_BASE_URL}/products`;
    const config = getRequestConfig();
    
    const response = await fetch(url, {
      method: 'GET',
      ...config,
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch products: ${response.status} ${response.statusText}`);
    }

    const data: ProductsResponse = await response.json();
    
    // Use fast processing for initial load
    const processedProducts = (data.data || []).map(product => processProductImagesStatic(product));
    
    return {
      data: processedProducts,
      pagination: data.pagination || {
        page: 1,
        limit: 20,
        total: data.data?.length || 0,
        totalPages: 1
      },
      filters: data.filters
    };
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
};

// Utility function for lazy image validation (use in components)
export const validateProductImages = async (products: Product[]): Promise<Product[]> => {
  console.log('🔍 Starting lazy image validation...');
  
  return Promise.all(
    products.map(async (product) => {
      const images = getProductImages(product);
      
      if (images.length === 0) return product;
      
      // Validate primary image only for performance
      const primaryImageValid = await validateImageUrl(images[0]);
      
      return {
        ...product,
        image: primaryImageValid ? images[0] : '',
      };
    })
  );
};

// Helper functions remain the same but optimized
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

// Fast category filtering
export const fetchProductsByCategory = async (
  categoryId: string | number,
  filters: Omit<ProductFilters, 'category'> = {}
): Promise<ProductsResponse> => {
  try {
    const allProducts = await fetchProducts(filters);
    
    const filteredData = allProducts.data.filter(product => 
      product.categoryId === categoryId || product.category === categoryId
    );
    
    return {
      ...allProducts,
      data: filteredData
    };
  } catch (error) {
    console.error('Error fetching products by category:', error);
    throw error;
  }
};

// Fast search
export const searchProducts = async (
  query: string,
  filters: Omit<ProductFilters, 'search'> = {}
): Promise<ProductsResponse> => {
  try {
    const allProducts = await fetchProducts(filters);
    
    const lowerQuery = query.toLowerCase();
    const filteredData = allProducts.data.filter(product => 
      product.name?.toLowerCase().includes(lowerQuery) ||
      product.nameAr?.toLowerCase().includes(lowerQuery) ||
      product.description?.toLowerCase().includes(lowerQuery) ||
      product.category?.toLowerCase().includes(lowerQuery)
    );
    
    return {
      ...allProducts,
      data: filteredData
    };
  } catch (error) {
    console.error('Error searching products:', error);
    throw error;
  }
};

// Fast featured products
export const fetchFeaturedProducts = async (
  filters: ProductFilters = {}
): Promise<ProductsResponse> => {
  try {
    const allProducts = await fetchProducts(filters);
    
    const filteredData = allProducts.data.filter(product => 
      product.rating && product.rating >= 4
    );
    
    return {
      ...allProducts,
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
    const config = getRequestConfig();
    
    const response = await fetch(url, {
      method: 'GET',
      ...config,
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

// Utility functions
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
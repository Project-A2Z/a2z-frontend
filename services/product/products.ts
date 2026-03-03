// services/product/products.ts - UPDATED for new backend structure

import { Api, API_ENDPOINTS } from './../api/endpoints';

const DEFAULT_LANGUAGE = 'ar';

// ============================================
// NEW INTERFACES - Matching updated backend
// ============================================

export interface Attribute {
  _id: string;
  name: string; // e.g. "Color"
  id: string;
}

export interface AttributeValue {
  _id: string;
  attributeId: Attribute;
  value: string; // e.g. "Blue", "Black"
  id: string;
}

export interface AttributeLink {
  _id: string;
  variantId: string;
  attributeValueId: AttributeValue;
  id: string;
}

export interface UnitId {
  _id: string;
  name: string;         // e.g. "piece"
  conversionRate: number; // e.g. 1
  base: string;         // e.g. "piece"
  id: string;
}

export interface ProductVariant {
  _id: string;
  productId: string;
  unitId: UnitId;
  price: number;
  totalQuantity: number;
  invetorys: any[];
  attributeLinks: AttributeLink[];
  id: string;
}

export interface Product {
  id: string | number;
  name: string;
  nameAr?: string;
  nameEn?: string;
  description?: string;
  descriptionAr?: string;
  descriptionEn?: string;

  // Derived from productVariants[0]
  price: number;
  originalPrice?: number;
  discount?: number;

  image: string;
  images?: string[];
  imageList?: string[];

  category: string;
  categoryId?: string | number;
  brand?: string;
  brandId?: string | number;

  // Derived: totalQuantity > 0
  inStock: boolean;
  stockQuantity?: number;

  // Derived from productReview
  rating?: number;
  reviewsCount?: number;

  tags?: string[];
  specifications?: Record<string, any>;
  createdAt?: string;
  updatedAt?: string;

  // Raw new backend fields
  productVariants?: ProductVariant[];
  productReview?: any[];

  // Unit type fields (derived from variant's unitId)
  IsKG?: boolean;
  IsTON?: boolean;
  IsLITER?: boolean;
  IsCUBIC_METER?: boolean;
  stockQty?: number;
  PurchasePrice?: number;
}

export interface ProductsResponse {
  data: Product[];
  length?: number;
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

// ============================================
// UNIT HELPERS (now derived from variant unitId)
// ============================================

export const getProductUnitLabel = (product: Product): string => {
  if (product.IsKG) return 'كجم';
  if (product.IsTON) return 'طن';
  if (product.IsLITER) return 'لتر';
  if (product.IsCUBIC_METER) return 'متر مكعب';
  // Fallback: read from first variant's unitId name
  const unitName = product.productVariants?.[0]?.unitId?.name?.toLowerCase();
  if (unitName === 'kg' || unitName === 'kilogram') return 'كجم';
  if (unitName === 'ton') return 'طن';
  if (unitName === 'liter' || unitName === 'litre') return 'لتر';
  if (unitName === 'cubic_meter' || unitName === 'cubicmeter') return 'متر مكعب';
  return unitName || '';
};

export const getProductUnitFullLabel = (product: Product): string => {
  if (product.IsKG) return 'كيلوجرام';
  if (product.IsTON) return 'طن';
  if (product.IsLITER) return 'لتر';
  if (product.IsCUBIC_METER) return 'متر مكعب';
  return product.productVariants?.[0]?.unitId?.name || '';
};

export const hasUnitPricing = (product: Product): boolean => {
  return !!(product.IsKG || product.IsTON || product.IsLITER || product.IsCUBIC_METER);
};

export const formatPriceWithUnit = (price: number | string, product: Product): string => {
  const formattedPrice = typeof price === 'string'
    ? parseFloat(price.replace(/[^0-9.]/g, '')).toLocaleString('ar-EG')
    : price.toLocaleString('ar-EG');

  const unit = getProductUnitLabel(product);
  return unit ? `${formattedPrice} ج.م / ${unit}` : `${formattedPrice} ج.م`;
};

// ============================================
// NEW HELPER: Get all attributes from variants
// ============================================

export const getProductAttributes = (product: Product): Record<string, string[]> => {
  const attrs: Record<string, string[]> = {};
  if (!product.productVariants) return attrs;

  for (const variant of product.productVariants) {
    for (const link of variant.attributeLinks || []) {
      const attrName = link.attributeValueId?.attributeId?.name || 'Unknown';
      const attrValue = link.attributeValueId?.value || '';
      if (!attrs[attrName]) attrs[attrName] = [];
      if (attrValue && !attrs[attrName].includes(attrValue)) {
        attrs[attrName].push(attrValue);
      }
    }
  }
  return attrs;
};

// ============================================
// NEW HELPER: Get variant by attribute selection
// ============================================

export const getVariantByAttributes = (
  product: Product,
  selectedAttrs: Record<string, string>
): ProductVariant | null => {
  if (!product.productVariants?.length) return null;

  return product.productVariants.find(variant => {
    return Object.entries(selectedAttrs).every(([attrName, attrValue]) => {
      return variant.attributeLinks?.some(
        link =>
          link.attributeValueId?.attributeId?.name === attrName &&
          link.attributeValueId?.value === attrValue
      );
    });
  }) || null;
};

// ============================================
// IMAGE HELPERS
// ============================================

const isValidImageUrl = (url: string): boolean => {
  if (!url || typeof url !== 'string' || url.trim() === '') return false;
  if (url.includes('example.com') || (!url.startsWith('http://') && !url.startsWith('https://'))) {
    return false;
  }
  const imageExtensions = /\.(jpg|jpeg|png|gif|webp|svg|bmp)(\?|$)/i;
  const cloudServices = /(cloudinary|amazonaws|imgix|unsplash|pexels)/i;
  return imageExtensions.test(url) || cloudServices.test(url);
};

// ============================================
// 🔄 UPDATED: processProductImagesStatic
// Now reads price/stock from productVariants
// ============================================

const processProductImagesStatic = (product: any): Product => {
  // --- Images (unchanged logic) ---
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

  // --- NEW: Derive price & stock from productVariants ---
  const variants: ProductVariant[] = product.productVariants || [];

  // Use the cheapest available variant as the "display price"
  const availableVariants = variants.filter(v => v.totalQuantity > 0);
  const primaryVariant = availableVariants.length > 0
    ? availableVariants.reduce((min, v) => v.price < min.price ? v : min, availableVariants[0])
    : variants[0] || null;

  const price = primaryVariant?.price ?? product.price ?? 0;
  const totalQuantity = variants.reduce((sum, v) => sum + (v.totalQuantity || 0), 0);
  const inStock = totalQuantity > 0;

  // --- NEW: Derive unit flags from variant unitId ---
  const unitName = primaryVariant?.unitId?.name?.toLowerCase() || '';
  const IsKG = unitName === 'kg' || unitName === 'kilogram' || product.IsKG;
  const IsTON = unitName === 'ton' || product.IsTON;
  const IsLITER = unitName === 'liter' || unitName === 'litre' || product.IsLITER;
  const IsCUBIC_METER = unitName === 'cubic_meter' || unitName === 'cubicmeter' || product.IsCUBIC_METER;

  // --- NEW: Derive reviews count from productReview ---
  const productReview: any[] = product.productReview || [];
  const reviewsCount = productReview.length;
  const rating = reviewsCount > 0
    ? productReview.reduce((sum: number, r: any) => sum + (r.rating || 0), 0) / reviewsCount
    : undefined;

  return {
    ...product,
    id: product.id ?? product._id ?? '',
    name: product.nameAr || product.name || '',
    description: product.descriptionAr || product.description || '',
    category: product.category || '',
    price,
    image: uniqueImages.length > 0 ? uniqueImages[0] : '',
    images: uniqueImages.length > 0 ? uniqueImages : [],
    imageList: uniqueImages.length > 0 ? uniqueImages : [],
    inStock,
    stockQuantity: totalQuantity,
    stockQty: totalQuantity,
    productVariants: variants,
    productReview,
    reviewsCount,
    rating,
    IsKG,
    IsTON,
    IsLITER,
    IsCUBIC_METER,
  };
};

// ============================================
// CACHE STRUCTURE (unchanged)
// ============================================

interface CategoryCacheEntry {
  categoryName: string;
  products: Product[];
  timestamp: number;
}

let globalProductsCache: Product[] | null = null;
let categoryCaches: Map<string, CategoryCacheEntry> = new Map();
let cacheTimestamp: number = 0;
let isLoadingProducts = false;
let pendingPromises: Array<{ resolve: (value: Product[]) => void; reject: (error: any) => void }> = [];
let lastRequestTime = 0;

const CACHE_DURATION = 5 * 60 * 1000;
const MIN_REQUEST_INTERVAL = 1000;

// ============================================
// REQUEST CONFIG
// ============================================

const getRequestConfig = (revalidate: number = 60, signal?: AbortSignal) => ({
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...(process.env.API_KEY && { 'Authorization': `Bearer ${process.env.API_KEY}` }),
  },
  next: { revalidate, tags: ['products'] },
  ...(signal && { signal }),
});

// ============================================
// 🔄 UPDATED: Parse API response
// Handles new { status, length, data } shape
// ============================================

const parseApiResponse = (raw: any): { data: Product[]; total: number } => {
  // New shape: { status: "success", length: 6, data: [...] }
  // Old shape: { data: [...], pagination: {...} }
  const rawData: any[] = raw.data || [];
  const total: number = raw.length ?? raw.pagination?.total ?? rawData.length;
  const products = rawData.map((p: any) => processProductImagesStatic(p));
  return { data: products, total };
};

// ============================================
// FETCH ALL PRODUCTS (Global Cache)
// ============================================

export const getProductsWithState = async (signal?: AbortSignal): Promise<Product[]> => {
  const now: number = Date.now();

  if (globalProductsCache && (now - cacheTimestamp) < CACHE_DURATION) {
    console.log('✅ Returning cached products:', globalProductsCache.length);
    return globalProductsCache;
  }

  if (signal?.aborted) throw new DOMException('Request aborted', 'AbortError');

  if (isLoadingProducts) {
    return new Promise((resolve, reject) => {
      pendingPromises.push({ resolve, reject });
      if (signal) {
        signal.addEventListener('abort', () => {
          const index = pendingPromises.findIndex(p => p.resolve === resolve);
          if (index > -1) {
            pendingPromises.splice(index, 1);
            reject(new DOMException('Request aborted', 'AbortError'));
          }
        });
      }
    });
  }

  if (lastRequestTime && (now - lastRequestTime) < MIN_REQUEST_INTERVAL) {
    const waitTime = MIN_REQUEST_INTERVAL - (now - lastRequestTime);
    await new Promise<void>(resolve => setTimeout(resolve, waitTime));
  }

  isLoadingProducts = true;
  lastRequestTime = now;

  try {
    console.log('🔄 Fetching all products from API...');

    const response = await fetch(`${Api}/${API_ENDPOINTS.PRODUCTS.LIST}`, {
      method: 'GET',
      ...getRequestConfig(60, signal),
    });

    if (response.status === 429) {
      if (globalProductsCache) {
        isLoadingProducts = false;
        pendingPromises.forEach(({ resolve }) => resolve(globalProductsCache!));
        pendingPromises = [];
        return globalProductsCache;
      }
      await new Promise<void>(resolve => setTimeout(resolve, 10000));
      throw new Error('Service temporarily unavailable due to rate limiting.');
    }

    if (!response.ok) throw new Error(`API Error: ${response.status} ${response.statusText}`);

    const raw = await response.json();
    const { data: products } = parseApiResponse(raw);

    globalProductsCache = products;
    cacheTimestamp = now;
    isLoadingProducts = false;
    pendingPromises.forEach(({ resolve }) => resolve(products));
    pendingPromises = [];

    console.log('✅ Fetched products successfully:', products.length);
    return products;

  } catch (error) {
    console.error('❌ Error fetching products:', error);

    if (error instanceof DOMException && error.name === 'AbortError') {
      isLoadingProducts = false;
      pendingPromises.forEach(({ reject }) => reject(error));
      pendingPromises = [];
      throw error;
    }

    if (globalProductsCache) {
      isLoadingProducts = false;
      pendingPromises.forEach(({ resolve }) => resolve(globalProductsCache!));
      pendingPromises = [];
      return globalProductsCache;
    }

    isLoadingProducts = false;
    pendingPromises.forEach(({ reject }) => reject(error));
    pendingPromises = [];
    throw error;
  }
};

// ============================================
// FETCH PRODUCTS BY CATEGORY
// ============================================

export const fetchProductsByCategory = async (
  categoryName: string,
  signal?: AbortSignal
): Promise<Product[]> => {
  const now = Date.now();

  const cachedCategory = categoryCaches.get(categoryName);
  if (cachedCategory && (now - cachedCategory.timestamp) < CACHE_DURATION) {
    console.log('✅ Returning cached category products:', categoryName, cachedCategory.products.length);
    return cachedCategory.products;
  }

  if (signal?.aborted) throw new DOMException('Request aborted', 'AbortError');

  try {
    console.log('🔄 Fetching products for category:', categoryName);

    const filterUrl = `${Api}/${API_ENDPOINTS.PRODUCTS.LIST}?category=${encodeURIComponent(categoryName)}`;
    const response = await fetch(filterUrl, { method: 'GET', ...getRequestConfig(60, signal) });

    if (response.status === 429) {
      if (cachedCategory) return cachedCategory.products;
      throw new Error('Service temporarily unavailable. Please try again later.');
    }

    if (!response.ok) throw new Error(`API Error: ${response.status} ${response.statusText}`);

    const raw = await response.json();
    const { data: products } = parseApiResponse(raw);

    categoryCaches.set(categoryName, { categoryName, products, timestamp: now });
    console.log('✅ Fetched category products:', categoryName, products.length);
    return products;

  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') throw error;
    if (cachedCategory) return cachedCategory.products;
    throw error;
  }
};

// ============================================
// FETCH PRODUCTS WITH PAGINATION FROM API
// ============================================

export const fetchProductsFromAPI = async (
  page: number = 1,
  limit: number = 20,
  category?: string,
  signal?: AbortSignal
): Promise<ProductsResponse> => {
  const now = Date.now();

  if (signal?.aborted) throw new DOMException('Request aborted', 'AbortError');

  if (lastRequestTime && (now - lastRequestTime) < MIN_REQUEST_INTERVAL) {
    const waitTime = MIN_REQUEST_INTERVAL - (now - lastRequestTime);
    await new Promise<void>(resolve => setTimeout(resolve, waitTime));
  }

  lastRequestTime = now;

  try {
    let url = `${Api}/${API_ENDPOINTS.PRODUCTS.LIST}?page=${page}&limit=${limit}`;
    if (category) url += `&category=${encodeURIComponent(category)}`;

    console.log('🔄 Fetching paginated products:', { page, limit, category });

    const response = await fetch(url, { method: 'GET', ...getRequestConfig(60, signal) });

    if (response.status === 429) throw new Error('Rate limited. Please try again later.');
    if (!response.ok) throw new Error(`API Error: ${response.status} ${response.statusText}`);

    const raw = await response.json();
    const { data: products, total } = parseApiResponse(raw);

    // Backend may not support pagination yet — handle both cases
    const paginatedProducts = products.slice((page - 1) * limit, page * limit);
    const effectiveTotal = total;
    const totalPages = Math.ceil(effectiveTotal / limit);

    console.log('✅ Fetched paginated products:', paginatedProducts.length, 'of', effectiveTotal);

    return {
      data: paginatedProducts,
      pagination: { page, limit, total: effectiveTotal, totalPages },
      filters: {
        categories: [...new Set(products.map((p: Product) => p.category))],
        brands: [],
        priceRange: {
          min: products.length > 0 ? Math.min(...products.map((p: Product) => p.price)) : 0,
          max: products.length > 0 ? Math.max(...products.map((p: Product) => p.price)) : 0,
        },
      },
    };

  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') throw error;
    throw error;
  }
};

// ============================================
// MAIN: fetchAllProducts
// ============================================

export const fetchAllProducts = async (
  filters: ProductFilters = {},
  signal?: AbortSignal
): Promise<ProductsResponse> => {
  try {
    console.log('📊 fetchAllProducts called with filters:', filters);

    const page = filters.page || 1;
    const limit = filters.limit || 20;

    if (signal?.aborted) throw new DOMException('Request aborted', 'AbortError');

    const needsClientSideFiltering = Boolean(
      filters.search ||
      filters.minPrice !== undefined ||
      filters.maxPrice !== undefined ||
      filters.inStock !== undefined ||
      (Array.isArray(filters.category) && filters.category.length > 1)
    );

    if (!needsClientSideFiltering) {
      const category = typeof filters.category === 'string' ? filters.category : undefined;
      return await fetchProductsFromAPI(page, limit, category, signal);
    }

    // Client-side filtering path
    let products: Product[];

    if (filters.category && typeof filters.category === 'string') {
      products = await fetchProductsByCategory(filters.category, signal);
    } else {
      products = await getProductsWithState(signal);
    }

    let filteredProducts = products;

    if (Array.isArray(filters.category) && filters.category.length > 0) {
      filteredProducts = filteredProducts.filter(p =>
        (filters.category as string[]).includes(p.category) ||
        (p.categoryId && (filters.category as string[]).includes(p.categoryId as string))
      );
    }

    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filteredProducts = filteredProducts.filter(p =>
        p.name.toLowerCase().includes(searchTerm) ||
        (p.description?.toLowerCase().includes(searchTerm) ?? false)
      );
    }

    if (filters.minPrice !== undefined) {
      filteredProducts = filteredProducts.filter(p => p.price >= filters.minPrice!);
    }

    if (filters.maxPrice !== undefined) {
      filteredProducts = filteredProducts.filter(p => p.price <= filters.maxPrice!);
    }

    if (filters.inStock !== undefined) {
      filteredProducts = filteredProducts.filter(p => p.inStock === filters.inStock);
    }

    const total = filteredProducts.length;
    const totalPages = Math.ceil(total / limit);
    const paginatedProducts = filteredProducts.slice((page - 1) * limit, page * limit);

    console.log('✅ Returning filtered products:', paginatedProducts.length, 'of', total);

    return {
      data: paginatedProducts,
      pagination: { page, limit, total, totalPages },
      filters: {
        categories: [...new Set(products.map(p => p.category))],
        brands: [],
        priceRange: {
          min: products.length > 0 ? Math.min(...products.map(p => p.price)) : 0,
          max: products.length > 0 ? Math.max(...products.map(p => p.price)) : 0,
        },
      },
    };

  } catch (error) {
    console.error('❌ Error in fetchAllProducts:', error);

    if (error instanceof DOMException && error.name === 'AbortError') {
      console.log('ℹ️ Request was cancelled');
      throw error;
    }

    if (globalProductsCache) {
      const page = filters.page || 1;
      const limit = filters.limit || 20;
      const paginatedCache = globalProductsCache.slice((page - 1) * limit, page * limit);
      console.log('⚠️ Returning cached data due to error');
      return {
        data: paginatedCache,
        pagination: {
          page, limit,
          total: globalProductsCache.length,
          totalPages: Math.ceil(globalProductsCache.length / limit),
        },
        filters: {
          categories: [...new Set(globalProductsCache.map(p => p.category))],
          brands: [],
          priceRange: {
            min: globalProductsCache.length > 0 ? Math.min(...globalProductsCache.map(p => p.price)) : 0,
            max: globalProductsCache.length > 0 ? Math.max(...globalProductsCache.map(p => p.price)) : 0,
          },
        },
      };
    }

    return {
      data: [],
      pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
      filters: { categories: [], brands: [], priceRange: { min: 0, max: 0 } },
    };
  }
};

// ============================================
// UTILITY FUNCTIONS
// ============================================

export const fetchProducts = async (
  filters: ProductFilters = {},
  signal?: AbortSignal
): Promise<ProductsResponse> => {
  try {
    let products: Product[];

    if (filters.category && typeof filters.category === 'string') {
      products = await fetchProductsByCategory(filters.category, signal);
    } else {
      products = await getProductsWithState(signal);
    }

    let filteredProducts = products;

    if (filters.category && Array.isArray(filters.category)) {
      filteredProducts = filteredProducts.filter(p =>
        (filters.category as string[]).includes(p.category)
      );
    }

    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filteredProducts = filteredProducts.filter(p =>
        p.name.toLowerCase().includes(searchTerm) ||
        (p.description?.toLowerCase().includes(searchTerm) ?? false)
      );
    }

    if (filters.minPrice !== undefined) {
      filteredProducts = filteredProducts.filter(p => p.price >= filters.minPrice!);
    }

    if (filters.maxPrice !== undefined) {
      filteredProducts = filteredProducts.filter(p => p.price <= filters.maxPrice!);
    }

    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const paginatedProducts = filteredProducts.slice((page - 1) * limit, page * limit);

    return {
      data: paginatedProducts,
      pagination: { page, limit, total: filteredProducts.length, totalPages: Math.ceil(filteredProducts.length / limit) },
      filters: {
        categories: [...new Set(products.map(p => p.category))],
        brands: [],
        priceRange: {
          min: products.length > 0 ? Math.min(...products.map(p => p.price)) : 0,
          max: products.length > 0 ? Math.max(...products.map(p => p.price)) : 0,
        },
      },
    };
  } catch (error) {
    console.error('Error in fetchProducts:', error);
    throw error;
  }
};

export const paginateProducts = (
  products: Product[],
  page: number = 1,
  limit: number = 20
): ProductsResponse => {
  const paginatedData = products.slice((page - 1) * limit, page * limit);
  return {
    data: paginatedData,
    pagination: { page, limit, total: products.length, totalPages: Math.ceil(products.length / limit) },
  };
};

export const searchProducts = async (
  query: string,
  filters: Omit<ProductFilters, 'search'> = {},
  signal?: AbortSignal
): Promise<ProductsResponse> => {
  return await fetchProducts({ ...filters, search: query }, signal);
};

export const fetchFeaturedProducts = async (
  filters: ProductFilters = {},
  signal?: AbortSignal
): Promise<ProductsResponse> => {
  return await fetchProducts({ ...filters, featured: true }, signal);
};

export const getProductImages = (product: Product): string[] => {
  if (product.imageList?.length) return product.imageList.filter((img): img is string => !!img && isValidImageUrl(img));
  if (product.images?.length) return product.images.filter((img): img is string => !!img && isValidImageUrl(img));
  if (product.image && isValidImageUrl(product.image)) return [product.image];
  return [];
};

export const getProductPrimaryImage = (product: Product): string | null => {
  const images = getProductImages(product);
  return images.length > 0 ? images[0] : null;
};

export const getByCategory = (categories: string[] | null | undefined, allProducts: Product[] | null | undefined): Product[] => {
  if (!categories?.length || !allProducts) return allProducts || [];
  return allProducts.filter(product =>
    categories.some(cat => product.category === cat || product.categoryId === cat)
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

// ============================================
// CACHE MANAGEMENT
// ============================================

export const clearProductsCache = (): void => {
  globalProductsCache = null;
  cacheTimestamp = 0;
  console.log('🗑️ Cleared products cache');
};

export const clearCategoryCache = (categoryName?: string): void => {
  if (categoryName) {
    categoryCaches.delete(categoryName);
  } else {
    categoryCaches.clear();
  }
};

export const clearAllCaches = (): void => {
  clearProductsCache();
  clearCategoryCache();
};

export const getCacheInfo = () => ({
  global: {
    hasCache: !!globalProductsCache,
    cacheSize: globalProductsCache?.length || 0,
    cacheAge: cacheTimestamp ? Date.now() - cacheTimestamp : 0,
    isLoading: isLoadingProducts,
    pendingRequests: pendingPromises.length,
  },
  categories: {
    count: categoryCaches.size,
    entries: Array.from(categoryCaches.entries()).map(([name, cache]) => ({
      name,
      productsCount: cache.products.length,
      cacheAge: Date.now() - cache.timestamp,
    })),
  },
});
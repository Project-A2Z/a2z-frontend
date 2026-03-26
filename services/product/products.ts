// services/product/products.ts - UPDATED for locale-aware caching

import { Api, API_ENDPOINTS } from './../api/endpoints';
import { getLangQueryParam, getLocale } from '../api/language';

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
// processProductImagesStatic
// ============================================

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

  const variants: ProductVariant[] = product.productVariants || [];
  const availableVariants = variants.filter(v => v.totalQuantity > 0);
  const primaryVariant = availableVariants.length > 0
    ? availableVariants.reduce((min, v) => v.price < min.price ? v : min, availableVariants[0])
    : variants[0] || null;

  const price = primaryVariant?.price ?? product.price ?? 0;
  const totalQuantity = variants.reduce((sum, v) => sum + (v.totalQuantity || 0), 0);
  const inStock = totalQuantity > 0;

  const unitName = primaryVariant?.unitId?.name?.toLowerCase() || '';
  const IsKG = unitName === 'kg' || unitName === 'kilogram' || product.IsKG;
  const IsTON = unitName === 'ton' || product.IsTON;
  const IsLITER = unitName === 'liter' || unitName === 'litre' || product.IsLITER;
  const IsCUBIC_METER = unitName === 'cubic_meter' || unitName === 'cubicmeter' || product.IsCUBIC_METER;

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
// CACHE STRUCTURE
// ============================================

interface CategoryCacheEntry {
  categoryName: string;
  products: Product[];
  timestamp: number;
}

// Locale-keyed caches — each language gets its own independent slot
let globalProductsCache: Map<string, Product[]> = new Map();
let cacheTimestamps: Map<string, number> = new Map();
let isLoadingProducts: Map<string, boolean> = new Map();
let pendingPromises: Map<string, Array<{ resolve: (value: Product[]) => void; reject: (error: any) => void }>> = new Map();

// Category cache key format: `${locale}:${categoryName}`
let categoryCaches: Map<string, CategoryCacheEntry> = new Map();

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
// PARSE API RESPONSE
// ============================================

const parseApiResponse = (raw: any): { data: Product[]; total: number } => {
  const rawData: any[] = raw.data || [];
  const total: number = raw.length ?? raw.pagination?.total ?? rawData.length;
  const products = rawData.map((p: any) => processProductImagesStatic(p));
  return { data: products, total };
};

// ============================================
// CLIENT-SIDE PAGINATION HELPER
// ============================================

const paginateLocally = (
  products: Product[],
  page: number,
  limit: number,
  category?: string
): ProductsResponse => {
  const filtered = category
    ? products.filter(p => p.category === category || p.categoryId === category)
    : products;

  const total = filtered.length;
  const totalPages = Math.ceil(total / limit);
  const data = filtered.slice((page - 1) * limit, page * limit);

  return {
    data,
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
};

// ============================================
// FETCH ALL PRODUCTS (Locale-aware Global Cache)
// ============================================

export const getProductsWithState = async (signal?: AbortSignal): Promise<Product[]> => {
  const now = Date.now();
  const locale = getLocale();
  const cacheKey = locale; // Each locale has its own cache slot

  const cached = globalProductsCache.get(cacheKey);
  const cachedAt = cacheTimestamps.get(cacheKey) ?? 0;

  if (cached && (now - cachedAt) < CACHE_DURATION) {
    return cached;
  }

  if (signal?.aborted) throw new DOMException('Request aborted', 'AbortError');

  if (isLoadingProducts.get(cacheKey)) {
    return new Promise((resolve, reject) => {
      const pending = pendingPromises.get(cacheKey) ?? [];
      pending.push({ resolve, reject });
      pendingPromises.set(cacheKey, pending);

      if (signal) {
        signal.addEventListener('abort', () => {
          const list = pendingPromises.get(cacheKey) ?? [];
          const index = list.findIndex(p => p.resolve === resolve);
          if (index > -1) {
            list.splice(index, 1);
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

  isLoadingProducts.set(cacheKey, true);
  lastRequestTime = now;

  const resolvePending = (products: Product[]) => {
    (pendingPromises.get(cacheKey) ?? []).forEach(({ resolve }) => resolve(products));
    pendingPromises.set(cacheKey, []);
    isLoadingProducts.set(cacheKey, false);
  };

  const rejectPending = (error: any) => {
    (pendingPromises.get(cacheKey) ?? []).forEach(({ reject }) => reject(error));
    pendingPromises.set(cacheKey, []);
    isLoadingProducts.set(cacheKey, false);
  };

  try {
    const langParam = getLangQueryParam(locale);
    const url = `${Api}/${API_ENDPOINTS.PRODUCTS.LIST}${langParam}`;

    const response = await fetch(url, {
      method: 'GET',
      ...getRequestConfig(60, signal),
    });

    if (response.status === 429) {
      if (cached) {
        resolvePending(cached);
        return cached;
      }
      await new Promise<void>(resolve => setTimeout(resolve, 10000));
      throw new Error('Service temporarily unavailable due to rate limiting.');
    }

    if (!response.ok) throw new Error(`API Error: ${response.status} ${response.statusText}`);

    const raw = await response.json();
    const { data: products } = parseApiResponse(raw);

    globalProductsCache.set(cacheKey, products);
    cacheTimestamps.set(cacheKey, now);
    resolvePending(products);
    return products;

  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      rejectPending(error);
      throw error;
    }
    if (cached) {
      resolvePending(cached);
      return cached;
    }
    rejectPending(error);
    throw error;
  }
};

// ============================================
// FETCH PRODUCTS BY CATEGORY (Locale-aware)
// ============================================

export const fetchProductsByCategory = async (
  categoryName: string,
  signal?: AbortSignal
): Promise<Product[]> => {
  const now = Date.now();
  const locale = getLocale();
  const cacheKey = `${locale}:${categoryName}`; // Locale-scoped category key

  const cachedCategory = categoryCaches.get(cacheKey);
  if (cachedCategory && (now - cachedCategory.timestamp) < CACHE_DURATION) {
    return cachedCategory.products;
  }

  if (signal?.aborted) throw new DOMException('Request aborted', 'AbortError');

  try {
    const langParam = getLangQueryParam(locale);
    const filterUrl = `${Api}/${API_ENDPOINTS.PRODUCTS.LIST}${langParam}&category=${encodeURIComponent(categoryName)}`;

    const response = await fetch(filterUrl, { method: 'GET', ...getRequestConfig(60, signal) });

    if (response.status === 429) {
      if (cachedCategory) return cachedCategory.products;
      throw new Error('Service temporarily unavailable. Please try again later.');
    }

    if (!response.ok) throw new Error(`API Error: ${response.status} ${response.statusText}`);

    const raw = await response.json();
    const { data: products } = parseApiResponse(raw);

    categoryCaches.set(cacheKey, { categoryName, products, timestamp: now });
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
    const locale = getLocale();
    const langParam = getLangQueryParam(locale);
    let url = `${Api}${API_ENDPOINTS.PRODUCTS.LIST}${langParam}&page=${page}&limit=${limit}`;
    console.log('🔄 Fetching products with pagination from API:', { page, limit, category, locale });
    if (category) url += `&category=${encodeURIComponent(category)}`;

    const response = await fetch(url, { method: 'GET', ...getRequestConfig(60, signal) });

    if (response.status === 429) throw new Error('Rate limited. Please try again later.');

    if (!response.ok) {
      console.warn(`⚠️ Server responded ${response.status} for paginated request — falling back to client-side pagination`);
      const allProducts = await getProductsWithState(signal);
      return paginateLocally(allProducts, page, limit, category);
    }

    const raw = await response.json();
    const { data: products, total } = parseApiResponse(raw);

    const paginatedProducts = products.slice((page - 1) * limit, page * limit);
    const totalPages = Math.ceil(total / limit);

    return {
      data: paginatedProducts,
      pagination: { page, limit, total, totalPages },
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

    console.warn('⚠️ fetchProductsFromAPI failed — falling back to client-side pagination:', error);
    const allProducts = await getProductsWithState(signal);
    return paginateLocally(allProducts, page, limit, category);
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
      throw error;
    }

    // Fallback: try to return any cached locale data
    const locale = getLocale();
    const cached = globalProductsCache.get(locale);

    if (cached) {
      const page = filters.page || 1;
      const limit = filters.limit || 20;
      const paginatedCache = cached.slice((page - 1) * limit, page * limit);
      return {
        data: paginatedCache,
        pagination: {
          page, limit,
          total: cached.length,
          totalPages: Math.ceil(cached.length / limit),
        },
        filters: {
          categories: [...new Set(cached.map(p => p.category))],
          brands: [],
          priceRange: {
            min: cached.length > 0 ? Math.min(...cached.map(p => p.price)) : 0,
            max: cached.length > 0 ? Math.max(...cached.map(p => p.price)) : 0,
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

export const clearProductsCache = (locale?: string): void => {
  if (locale) {
    globalProductsCache.delete(locale);
    cacheTimestamps.delete(locale);
  } else {
    globalProductsCache.clear();
    cacheTimestamps.clear();
  }
};

export const clearCategoryCache = (categoryName?: string, locale?: string): void => {
  if (categoryName) {
    // Clear both locale-specific and any legacy keys
    if (locale) {
      categoryCaches.delete(`${locale}:${categoryName}`);
    } else {
      categoryCaches.delete(`ar:${categoryName}`);
      categoryCaches.delete(`en:${categoryName}`);
      categoryCaches.delete(categoryName); // legacy fallback
    }
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
    locales: Array.from(globalProductsCache.keys()),
    entries: Array.from(globalProductsCache.entries()).map(([locale, products]) => ({
      locale,
      cacheSize: products.length,
      cacheAge: cacheTimestamps.has(locale) ? Date.now() - (cacheTimestamps.get(locale) ?? 0) : 0,
      isLoading: isLoadingProducts.get(locale) ?? false,
      pendingRequests: (pendingPromises.get(locale) ?? []).length,
    })),
  },
  categories: {
    count: categoryCaches.size,
    entries: Array.from(categoryCaches.entries()).map(([key, cache]) => ({
      key, // format: `${locale}:${categoryName}`
      name: cache.categoryName,
      productsCount: cache.products.length,
      cacheAge: Date.now() - cache.timestamp,
    })),
  },
});
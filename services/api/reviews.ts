import apiClient from "./client";

export interface ReviewUser {
  _id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
}

type RatingsDistribution = { stars: number; count: number }[];

export interface Review {
  _id: string;
  userId: ReviewUser;
  productId: string;
  description?: string;
  rateNum: number;
  date?: string;
  reply?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateReviewRequest {
  productId: string;
  description?: string;
  rateNum: number;
}

export interface UpdateReviewRequest {
  description?: string;
  rateNum?: number;
}

export interface ReplyRequest {
  reply: string;
}

export interface ApiResponse<T = any> {
  status: string;
  message: string;
  data?: T;
}

export interface ReviewsResponse {
  status: string;
  results?: number;
  data: { reviews: Review[] };
  message?: string;
}

export interface ReviewResponse {
  status: string;
  message: string;
  data: { review: Review };
}

// Client-side cache for reviews
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

class ClientCache<T> {
  private cache = new Map<string, CacheEntry<T>>();

  set(key: string, data: T, ttlMs: number = 3 * 60 * 1000) { // 3 minutes default for reviews
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttlMs
    });
  }

  get(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  clear() {
    this.cache.clear();
  }

  delete(key: string) {
    this.cache.delete(key);
  }

  // Get all cache keys for filtering
  getKeys(): string[] {
    return Array.from(this.cache.keys());
  }

  // Clean expired entries - public method
  public cleanup() {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
      }
    }
  }
}

// Global cleanup - run every 3 minutes for reviews
if (typeof window !== 'undefined') {
  setInterval(() => {
    // Clean expired entries from reviews cache
    reviewsCache.cleanup();

    // Clean expired entries from review detail cache
    reviewDetailCache.cleanup();

    //console.log('🧹 Reviews cache cleanup completed');
  }, 3 * 60 * 1000); // 3 minutes
}

// Global cache instances
const reviewsCache = new ClientCache<ReviewsResponse>();
const reviewDetailCache = new ClientCache<ReviewResponse>();

// Generate cache key for product reviews
function getReviewsCacheKey(productId: string, options?: any): string {
  const params = new URLSearchParams();
  if (options?.page) params.append("page", String(options.page));
  if (options?.limit) params.append("limit", String(options.limit));
  if (options?.sort) params.append("sort", options.sort);
  if (options?.fields) params.append("fields", options.fields);
  if (options?.rateNum?.gte !== undefined) params.append("rateNum[gte]", String(options.rateNum.gte));
  if (options?.rateNum?.lte !== undefined) params.append("rateNum[lte]", String(options.rateNum.lte));
  if (options?.description?.regex) params.append("description[regex]", options.description.regex);

  const query = params.toString();
  return `reviews:${productId}${query ? `?${query}` : ""}`;
}

// Generate cache key for single review
function getReviewCacheKey(reviewId: string): string {
  return `review:${reviewId}`;
}

class ReviewService {
  private baseUrl: string;

  constructor() {
    this.baseUrl =
      process.env.NEXT_PUBLIC_API_URL || "https://a2z-backend.fly.dev/app/v1";
  }

  private getAuthHeaders(token?: string) {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (token) headers.Authorization = `Bearer ${token}`;
    return headers;
  }

  // Add Review (POST /reviews)
  async addReview(
    reviewData: CreateReviewRequest,
    token?: string
  ): Promise<ReviewResponse> {
    try {
      const res = await apiClient.post<ReviewResponse>(
        `${this.baseUrl}/reviews`,
        reviewData,
        { headers: this.getAuthHeaders(token) }
      );
      
      // Clear cache for this product after adding a review
      this.clearProductReviewsCache(reviewData.productId);
      
      return res.data;
    } catch (error: any) {
      const message =
        error.response?.data?.message || "فشل في إضافة التعليق";
      if (error.response?.status === 409)
        throw new Error("لقد قمت بإضافة تقييم لهذا المنتج بالفعل");
      throw new Error(message);
    }
  }

  // Get Reviews for Product (GET /reviews/:productId)
  async getProductReviews(
    productId: string,
    options?: {
      page?: number;
      limit?: number;
      sort?: string;
      fields?: string;
      rateNum?: { gte?: number; lte?: number };
      description?: { regex?: string };
    }
  ): Promise<ReviewsResponse> {
    // Client-side cache check first
    const cacheKey = getReviewsCacheKey(productId, options);
    const cachedData = reviewsCache.get(cacheKey);

    if (cachedData) {
      //console.log(`✅ Using cached reviews data for product ${productId}`);
      return cachedData;
    }

    try {
      const params = new URLSearchParams();
      if (options?.page) params.append("page", String(options.page));
      if (options?.limit) params.append("limit", String(options.limit));
      if (options?.sort) params.append("sort", options.sort);
      if (options?.fields) params.append("fields", options.fields);
      if (options?.rateNum?.gte !== undefined) params.append("rateNum[gte]", String(options.rateNum.gte));
      if (options?.rateNum?.lte !== undefined) params.append("rateNum[lte]", String(options.rateNum.lte));
      if (options?.description?.regex) params.append("description[regex]", options.description.regex);

      const query = params.toString();
      const url = `${this.baseUrl}/reviews/${productId}${
        query ? `?${query}` : ""
      }`;

      const res = await apiClient.get<ReviewsResponse>(url);

      // Store in client cache for future requests
      reviewsCache.set(cacheKey, res.data);

      return res.data;
    } catch (error: any) {
      //console.error('❌ Error fetching reviews:', error);
      
      // Handle rate limiting
      if (error.response?.status === 429) {
        //console.warn('⚠️ Rate limit exceeded, returning empty reviews');
      } else if (error.response?.status === 404) {
        //console.warn('⚠️ Reviews endpoint not found, returning empty reviews');
      } else if (!error.response) {
        //console.warn('⚠️ Network error fetching reviews, returning empty reviews');
      }
      
      // Return empty reviews instead of throwing error to prevent app crashes
      return {
        status: 'success',
        results: 0,
        data: { reviews: [] },
        message: error.response?.data?.message || 'تعذر تحميل التعليقات'
      };
    }
  }

  // Update Review (PUT /reviews/:productId)
  async updateReview(
    productId: string,
    data: UpdateReviewRequest,
    token?: string
  ): Promise<ReviewResponse> {
    try {
      const res = await apiClient.put<ReviewResponse>(
        `${this.baseUrl}/reviews/${productId}`,
        data,
        { headers: this.getAuthHeaders(token) }
      );

      // Clear cache for this review and related product reviews
      this.clearProductReviewsCache(productId);

      return res.data;
    } catch (error: any) {
      // Handle specific error cases
      if (error.response?.status === 404) {
        throw new Error("لم يتم العثور على تقييمك لهذا المنتج");
      } else if (error.response?.status === 403) {
        throw new Error("غير مسموح لك بتعديل هذا التعليق");
      } else if (error.response?.status === 401) {
        throw new Error("انتهت صلاحية الجلسة، يرجى تسجيل الدخول مرة أخرى");
      } else if (error.response?.status === 400) {
        throw new Error("البيانات المرسلة غير صحيحة");
      }

      throw new Error(
        error.response?.data?.message || "فشل في تحديث التعليق"
      );
    }
  }

  // Check if review exists (GET /reviews/:reviewId)
  async getReview(
    reviewId: string,
    token?: string
  ): Promise<ReviewResponse> {
    try {
      const res = await apiClient.get<ReviewResponse>(
        `${this.baseUrl}/reviews/${reviewId}`,
        { headers: this.getAuthHeaders(token) }
      );
      return res.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "فشل في جلب التعليق"
      );
    }
  }

  // Delete Review (DELETE /reviews/:reviewId)
  async deleteReview(
    reviewId: string,
    productId: string,
    token?: string
  ): Promise<ApiResponse> {
    //console.log('🔧 ReviewService.deleteReview called with reviewId:', reviewId);
    
    try {
      const res = await apiClient.delete<ApiResponse>(
        `${this.baseUrl}/reviews/${reviewId}`,
        { headers: this.getAuthHeaders(token) }
      );

      //console.log('✅ Delete API response:', res.data);
      
      // Clear cache for this product after deleting a review
      this.clearProductReviewsCache(productId);

      return res.data;
    } catch (error: any) {
      //console.error('❌ Delete API error:', error.response?.status, error.response?.data);
      
      // Handle specific error cases
      if (error.response?.status === 404) {
        throw new Error("التعليق غير موجود أو تم حذفه بالفعل");
      } else if (error.response?.status === 403) {
        throw new Error("غير مسموح لك بحذف هذا التعليق");
      } else if (error.response?.status === 401) {
        throw new Error("انتهت صلاحية الجلسة، يرجى تسجيل الدخول مرة أخرى");
      }

      throw new Error(
        error.response?.data?.message || "فشل في حذف التعليق"
      );
    }
  }

  // Reply to Review (PUT /reviews/reply/:reviewId) - Operation Only
  async replyToReview(
    reviewId: string,
    replyData: ReplyRequest,
    token?: string
  ): Promise<ReviewResponse> {
    try {
      const res = await apiClient.put<ReviewResponse>(
        `${this.baseUrl}/reviews/reply/${reviewId}`,
        replyData,
        { headers: this.getAuthHeaders(token) }
      );

      // Clear cache for this review since it was updated with a reply
      reviewDetailCache.delete(getReviewCacheKey(reviewId));

      return res.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "فشل في إضافة الرد"
      );
    }
  }

  // Helper method to clear product reviews cache
  private clearProductReviewsCache(productId: string) {
    // Clear all cached entries for this product
    const keys = reviewsCache.getKeys();
    for (const key of keys) {
      if (key.startsWith(`reviews:${productId}`)) {
        reviewsCache.delete(key);
      }
    }
    //console.log(`🧹 Reviews cache cleared for product ${productId}`);
  }

  // Public method to clear all reviews cache
  clearCache() {
    reviewsCache.clear();
    reviewDetailCache.clear();
    //console.log('🧹 Reviews cache cleared');
  }

  calculateRatingsDistribution(reviews: Review[]): RatingsDistribution {
  const distribution: RatingsDistribution = [
    { stars: 5, count: 0 },
    { stars: 4, count: 0 },
    { stars: 3, count: 0 },
    { stars: 2, count: 0 },
    { stars: 1, count: 0 }
  ];

  reviews.forEach(review => {
    if (review.rateNum >= 1 && review.rateNum <= 5) {
      const index = 5 - review.rateNum; // 5 stars -> index 0, 1 star -> index 4
      distribution[index].count++;
    }
  });

  return distribution;
}

calculateAverageRating(reviews: Review[]): number {
  if (reviews.length === 0) return 0;
  
  const sum = reviews.reduce((acc, review) => acc + review.rateNum, 0);
  return Number((sum / reviews.length).toFixed(1));
}

getTotalReviewCount(reviews: Review[]): number {
  return reviews.length;
}
}

export const reviewService = new ReviewService();
// src/services/api/reviews.ts
import apiClient from './client';

// Review types based on API documentation
export interface ReviewUser {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
}

export interface Review {
  _id: string;
  userId: ReviewUser;
  productId: string;
  description: string;
  rateNum: number;
  date: string;
  reply?: string;
  createdAt: string;
  updatedAt: string;
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
  results: number;
  data: {
    reviews: Review[];
  };
}

export interface ReviewResponse {
  status: string;
  message: string;
  data: {
    review: Review;
  };
}

export interface GetAllReviewsResponse {
  status: string;
  results: number;
  data: {
    reviews: Review[];
  };
}

class ReviewService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://a2z-backend.fly.dev/app/v1';
  }

  private getAuthHeaders(token?: string) {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    return headers;
  }

  async addReview(reviewData: CreateReviewRequest, token?: string): Promise<ReviewResponse> {
    try {
      const response = await apiClient.post<ReviewResponse>(
        `${this.baseUrl}/reviews`,
        reviewData,
        {
          headers: this.getAuthHeaders(token),
        }
      );
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || 'فشل في إضافة التعليق';
      if (error.response?.status === 409) {
        throw new Error('لقد قمت بإضافة تقييم لهذا المنتج بالفعل');
      }
      throw new Error(message);
    }
  }

  async getAllReviews(token?: string): Promise<GetAllReviewsResponse> {
    try {
      const response = await apiClient.get<GetAllReviewsResponse>(
        `${this.baseUrl}/reviews`,
        {
          headers: this.getAuthHeaders(token),
        }
      );
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'فشل في جلب جميع التعليقات');
    }
  }

  async getProductReviews(
    productId: string,
    options?: {
      page?: number;
      limit?: number;
      sort?: string;
      fields?: string;
      rateNum?: {
        gte?: number;
        lte?: number;
      };
      description?: {
        regex?: string;
      };
    }
  ): Promise<ReviewsResponse> {
    try {
      const params = new URLSearchParams();
      if (options?.page) params.append('page', options.page.toString());
      if (options?.limit) params.append('limit', options.limit.toString());
      if (options?.sort) params.append('sort', options.sort);
      if (options?.fields) params.append('fields', options.fields);
      if (options?.rateNum?.gte !== undefined) {
        params.append('rateNum[gte]', options.rateNum.gte.toString());
      }
      if (options?.rateNum?.lte !== undefined) {
        params.append('rateNum[lte]', options.rateNum.lte.toString());
      }
      if (options?.description?.regex) {
        params.append('description[regex]', options.description.regex);
      }

      const queryString = params.toString();
      const url = `${this.baseUrl}/reviews/product/${productId}${queryString ? `?${queryString}` : ''}`;

      const response = await apiClient.get<ReviewsResponse>(url);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'فشل في جلب تعليقات المنتج');
    }
  }

  async updateReview(
    reviewId: string,
    reviewData: UpdateReviewRequest,
    token?: string
  ): Promise<ReviewResponse> {
    try {
      const response = await apiClient.put<ReviewResponse>(
        `${this.baseUrl}/reviews/${reviewId}`,
        reviewData,
        {
          headers: this.getAuthHeaders(token),
        }
      );
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'فشل في تحديث التعليق');
    }
  }

  async deleteReview(reviewId: string, token?: string): Promise<ApiResponse> {
    try {
      const response = await apiClient.delete<ApiResponse>(
        `${this.baseUrl}/reviews/${reviewId}`,
        {
          headers: this.getAuthHeaders(token),
        }
      );
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'فشل في حذف التعليق');
    }
  }

  async replyToReview(
    reviewId: string,
    replyData: ReplyRequest,
    token?: string
  ): Promise<ReviewResponse> {
    try {
      const response = await apiClient.put<ReviewResponse>(
        `${this.baseUrl}/reviews/reply/${reviewId}`,
        replyData,
        {
          headers: this.getAuthHeaders(token),
        }
      );
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'فشل في إضافة الرد');
    }
  }

  calculateRatingsDistribution(reviews: Partial<Review>[]): { stars: number; count: number }[] {
    const distribution = [1, 2, 3, 4, 5].map((stars) => ({
      stars,
      count: reviews.filter((review) => Math.round(review.rateNum || 0) === stars).length,
    }));
    return distribution;
  }

  calculateAverageRating(reviews: Partial<Review>[]): number {
    if (reviews.length === 0) return 0;
    const totalRating = reviews.reduce((sum, review) => sum + (review.rateNum || 0), 0);
    return Math.round((totalRating / reviews.length) * 10) / 10;
  }

  getTotalReviewCount(reviews: Partial<Review>[]): number {
    return reviews.length;
  }
}

export const reviewService = new ReviewService();
import apiClient from "./client";

export interface ReviewUser {
  _id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
}

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
  results: number;
  data: { reviews: Review[] };
}

export interface ReviewResponse {
  status: string;
  message: string;
  data: { review: Review };
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
      return res.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "فشل في جلب تعليقات المنتج"
      );
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
      return res.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "فشل في تحديث التعليق"
      );
    }
  }

  // Delete Review (DELETE /reviews/:productId)
  async deleteReview(
    productId: string,
    token?: string
  ): Promise<ApiResponse> {
    try {
      const res = await apiClient.delete<ApiResponse>(
        `${this.baseUrl}/reviews/${productId}`,
        { headers: this.getAuthHeaders(token) }
      );
      return res.data;
    } catch (error: any) {
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
      return res.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "فشل في إضافة الرد"
      );
    }
  }
}

export const reviewService = new ReviewService();

import apiClient from './client';

// Review types based on API documentation
export interface Review {
  _id: string;
  userId: string;
  productId: string;
  description?: string;
  rateNum: number;
  date: string;
  createdAt: string;
  updatedAt: string;
  user?: {
    _id: string;
    firstName: string;
    lastName: string;
    image?: string;
  };
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

export interface ApiResponse<T> {
  status: string;
  message?: string;
  data: T;
}

export interface ReviewsResponse {
  status: string;
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

class ReviewService {
  // Add a new review
  async addReview(reviewData: CreateReviewRequest): Promise<ApiResponse<{ review: Review }>> {
    const response = await apiClient.post<ApiResponse<{ review: Review }>>(
      'https://a2z-backend.fly.dev/app/v1/reviews/',
      reviewData,
      {
        headers: {
          'Content-Type': 'application/json',
          // Authorization header should be handled by axios interceptor
        },
      }
    );
    return response.data;
  }

  // Get reviews for a specific product
  async getProductReviews(
    productId: string,
    options?: {
      page?: number;
      limit?: number;
      sort?: string;
      order?: 'asc' | 'desc';
      minRate?: number;
      maxRate?: number;
    }
  ): Promise<ReviewsResponse> {
    const params = new URLSearchParams();

    if (options?.page) params.append('page', options.page.toString());
    if (options?.limit) params.append('limit', options.limit.toString());
    if (options?.sort) params.append('sort', options.sort);
    if (options?.order) params.append('order', options.order);
    if (options?.minRate) params.append('minRate', options.minRate.toString());
    if (options?.maxRate) params.append('maxRate', options.maxRate.toString());

    const queryString = params.toString();
    const baseUrl = 'https://a2z-backend.fly.dev/app/v1';
    const url = `${baseUrl}/reviews/${productId}${queryString ? `?${queryString}` : ''}`;

    const response = await apiClient.get<ReviewsResponse>(url);
    return response.data;
  }

  // Update an existing review
  async updateReview(
    productId: string,
    reviewData: UpdateReviewRequest
  ): Promise<ApiResponse<{ review: Review }>> {
    const response = await apiClient.put<ApiResponse<{ review: Review }>>(
      `https://a2z-backend.fly.dev/app/v1/reviews/${productId}`,
      reviewData,
      {
        headers: {
          'Content-Type': 'application/json',
          // Authorization header should be handled by axios interceptor
        },
      }
    );
    return response.data;
  }

  // Helper method to calculate ratings distribution from reviews
  calculateRatingsDistribution(reviews: Review[]): { stars: number; count: number }[] {
    const distribution = [1, 2, 3, 4, 5].map(stars => ({
      stars,
      count: reviews.filter(review => Math.round(review.rateNum) === stars).length
    }));

    return distribution;
  }

  // Helper method to calculate average rating from reviews
  calculateAverageRating(reviews: Review[]): number {
    if (reviews.length === 0) return 0;

    const totalRating = reviews.reduce((sum, review) => sum + review.rateNum, 0);
    return totalRating / reviews.length;
  }

  // Helper method to get total review count
  getTotalReviewCount(reviews: Review[]): number {
    return reviews.length;
  }
}

export const reviewService = new ReviewService();

import apiClient from './client';

/**
 * Interface for Inquiry data structure
 */
export interface InquiryData {
  id?: string;
  name: string;
  description: string;
  phoneNumber: string;
  email: string;
  status?: 'pending' | 'in_progress' | 'resolved' | 'rejected';
  createdAt?: string;
  updatedAt?: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Get auth token from localStorage (optional)
 */
const getAuthToken = (): string | null => {
  return localStorage.getItem('authToken'); // Optional; sends if available
};

/**
 * Service for handling inquiry-related API calls
 */
export const checkBackendHealth = async () => {
  try {
    //console.log('Initiating health check...');
    
    // Test root endpoint directly
    try {
      const headers: { [key: string]: string } = {};
      const token = getAuthToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      const response = await fetch('https://a2z-backend.fly.dev/', {
        method: 'GET',
        headers,
      });
      const data = await response.json();
      //console.log('Root endpoint check successful:', response.status, response.statusText);
      return {
        status: 'success',
        data,
        statusCode: response.status,
        statusText: response.statusText
      };
    } catch (error: any) {
      //console.warn('Root endpoint failed, trying /health...', error);
      
      const headers: { [key: string]: string } = {};
      const token = getAuthToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      const healthResponse = await fetch('https://a2z-backend.fly.dev/health', {
        method: 'GET',
        headers,
      });
      const healthData = await healthResponse.json();
      //console.log('Health endpoint check successful:', healthResponse.status, healthResponse.statusText);
      
      return {
        status: 'success',
        data: healthData,
        statusCode: healthResponse.status,
        statusText: 'Health endpoint is accessible',
        warning: 'Root endpoint failed but health is accessible'
      };
    }
  } catch (error: any) {
    console.error('Health check completely failed:', {
      message: error.message,
      code: error.code,
      response: {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data
      }
    });
    
    return {
      status: 'error',
      message: error.message || 'Unknown error during health check',
      code: error.code,
      statusCode: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data
    };
  }
};

export const inquiryService = {
  /**
   * Create a new inquiry
   */
  async createInquiry(data: Omit<InquiryData, 'id' | 'status' | 'createdAt' | 'updatedAt'>) {
    const requestData = {
      name: data.name.trim(),
      phoneNumber: data.phoneNumber.trim(),
      email: data.email.trim(),
      description: data.description.trim()
    };

    //console.log('Sending inquiry data to https://a2z-backend.fly.dev/app/v1/inquiries:', JSON.stringify(requestData, null, 2));
    
    try {
      const headers: { [key: string]: string } = {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      };
      const token = getAuthToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch('https://a2z-backend.fly.dev/app/v1/inquiries', {
        method: 'POST',
        headers,
        body: JSON.stringify(requestData),
        // timeout: 10000,
      });

      if (!response.ok) {
        const errorData = await response.json();
        // console.error('API Error Response:', {
        //   status: response.status,
        //   statusText: response.statusText,
        //   data: errorData,
        //   fullResponse: JSON.stringify(errorData, null, 2)
        // });
        throw new Error(errorData.message || `خطأ في الخادم (${response.status})`);
      }

      const responseData = await response.json();
      //console.log('Inquiry created successfully:', responseData);
      return responseData;
    } catch (error: any) {
      console.error('Error in createInquiry:', {
        name: error.name,
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        fullError: JSON.stringify(error, null, 2)
      }
    );

      if (error.message.includes("Can't find /app/v1/")) {
        throw new Error('المسار /app/v1/inquiries غير متوفر على الخادم. تأكد من أن الخادم يدعم هذا المسار.');
      }
      
      if (error.response?.status === 422) {
        const validationError = new Error('خطأ في التحقق من صحة البيانات');
        validationError.name = 'ValidationError';
        (validationError as any).cause = error.response?.data?.errors || [];
        throw validationError;
      }
      
      if (error.response?.status === 400) {
        const message = error.response?.data?.message || 'البيانات المرسلة غير صالحة. تحقق من الحقول.';
        throw new Error(message);
      }
      
      throw this.handleApiError(error);
    }
  },

  /**
   * Get a single inquiry by ID
   */
  async getInquiryById(id: string) {
    try {
      const headers: { [key: string]: string } = {};
      const token = getAuthToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      const response = await apiClient.get<InquiryData>(`/app/v1/inquiries/${id}`, { headers });
      return response.data;
    } catch (error) {
      //console.error(`Error fetching inquiry ${id}:`, error);
      throw this.handleApiError(error);
    }
  },

  /**
   * Get all inquiries with pagination and filtering
   */
  async getAllInquiries(params?: PaginationParams & { status?: string }) {
    try {
      const headers: { [key: string]: string } = {};
      const token = getAuthToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      const response = await apiClient.get<PaginatedResponse<InquiryData>>('/app/v1/inquiries', { params, headers });
      return response.data;
    } catch (error) {
      //console.error('Error fetching inquiries:', error);
      throw this.handleApiError(error);
    }
  },

  /**
   * Handle API errors consistently
   */
  handleApiError(error: any): Error {
    if (error.response) {
      const { status, data } = error.response;
      // console.error('API Error Response:', {
      //   status,
      //   data,
      //   fullResponse: JSON.stringify(data, null, 2)
      // });
      
      if (status === 401) {
        return new Error('غير مصرح. يرجى تسجيل الدخول مرة أخرى.');
      }
      
      if (status === 400 && data?.message) {
        return new Error(data.message);
      }
      
      if (status === 404) {
        return new Error('لم يتم العثور على المورد المطلوب');
      }
      
      return new Error(data?.message || `خطأ في الخادم (${status})`);
    } else if (error.request) {
      //console.error('No response received:', error.request);
      return new Error('تعذر الاتصال بالخادم. يرجى التحقق من اتصالك بالإنترنت والمحاولة مرة أخرى.');
    } else {
      //console.error('Request setup error:', error.message);
      return new Error(error.message || 'حدث خطأ غير متوقع');
    }
  }
};
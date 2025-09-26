// services/auth/register.ts
import { API_ENDPOINTS, Api } from './../api/endpoints';

// Types
export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phoneNumber: string;
}

export interface User {
  _id: string;
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  image: string | null;
  phoneNumber: string;
  department: string | null;
  salary: number | null;
  dateOfSubmission: string | null;
  isVerified: boolean;
  address: any[];
  createdAt: string;
  updatedAt: string;
  __v: number;
  EmailVerificationToken?: string;
  EmailVerificationExpires?: string;
}

export interface RegisterResponse {
  status: string;
  message: string;
  data: {
    user: User;
    token?: string;
    refreshToken?: string;
  };
}

export interface RegisterError {
  status: string;
  message: string;
  errors?: Record<string, string>;
}

// Storage keys
const STORAGE_KEYS = {
  USER: 'user_data',
  TOKEN: 'auth_token',
  REFRESH_TOKEN: 'refresh_token',
} as const;

// User state management class
class UserStorage {
  // Save user data to localStorage
  static saveUser(user: User): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    }
  }

  // Get user data from localStorage
  static getUser(): User | null {
    if (typeof window !== 'undefined') {
      const userData = localStorage.getItem(STORAGE_KEYS.USER);
      return userData ? JSON.parse(userData) : null;
    }
    return null;
  }

  // Remove user data from localStorage - FIXED THE TYPO
  static removeUser(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEYS.USER);
      localStorage.removeItem(STORAGE_KEYS.TOKEN);
      localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
    }
  }

  // Update user data
  static updateUser(updates: Partial<User>): void {
    const currentUser = this.getUser();
    if (currentUser) {
      const updatedUser = { ...currentUser, ...updates };
      this.saveUser(updatedUser);
    }
  }

  // Check if user is logged in
  static isLoggedIn(): boolean {
    return this.getUser() !== null;
  }

  // Save auth token
  static saveToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.TOKEN, token);
    }
  }

  // Get auth token
  static getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(STORAGE_KEYS.TOKEN);
    }
    return null;
  }

  // Save refresh token
  static saveRefreshToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, token);
    }
  }

  // Get refresh token
  static getRefreshToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
    }
    return null;
  }
}

// API Configuration
const API_BASE_URL = Api;

// Enhanced Register function with better error handling
export const registerUser = async (userData: RegisterRequest): Promise<RegisterResponse> => {
  console.log('🚀 Starting registration...');
  console.log('🔧 API Base URL:', API_BASE_URL);
  console.log('🔧 Register endpoint:', API_ENDPOINTS.AUTH.REGISTER);
  console.log('🔧 Full URL:', `${API_BASE_URL}${API_ENDPOINTS.AUTH.REGISTER}`);
  console.log('📤 User data:', {
    ...userData,
    password: '[HIDDEN]'
  });

  try {
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.AUTH.REGISTER}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    console.log('📥 Raw response:', response);
    console.log('📊 Response status:', response.status);
    console.log('📊 Response ok:', response.ok);
    console.log('📊 Response headers:', Object.fromEntries(response.headers.entries()));

    // Try to parse response data
    let data;
    const contentType = response.headers.get('content-type');
    console.log('📋 Content-Type:', contentType);

    try {
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const textData = await response.text();
        console.log('📄 Non-JSON response:', textData);
        // Try to parse as JSON anyway (sometimes servers send JSON without proper header)
        try {
          data = JSON.parse(textData);
        } catch {
          data = { message: textData };
        }
      }
      console.log('📄 Parsed response data:', data);
    } catch (parseError) {
      console.error('❌ Failed to parse response:', parseError);
      throw new Error('Server returned invalid response format');
    }

    if (!response.ok) {
      console.log('❌ Registration failed with status:', response.status);
      
      // Enhanced error handling for different status codes
      let errorMessage = 'Registration failed';
      let errorDetails = {};

      switch (response.status) {
        case 400:
          console.log('🔍 400 Bad Request - analyzing response...');
          if (data) {
            errorMessage = data.message || data.error || 'Invalid request data';
            errorDetails = data.errors || data.validationErrors || data.data || {};
            
            // Common 400 error scenarios
            if (typeof data === 'string') {
              errorMessage = data;
            } else if (data.message) {
              errorMessage = data.message;
            } else if (data.error) {
              errorMessage = data.error;
            }
          } else {
            errorMessage = 'Bad request - please check your input data';
          }
          break;
          
        case 409:
          errorMessage = data?.message || 'Email already exists - please use a different email';
          break;
          
        case 422:
          errorMessage = data?.message || 'Validation failed - please check your input';
          errorDetails = data?.errors || {};
          break;
          
        case 500:
          errorMessage = 'Server error - please try again later';
          break;
          
        default:
          errorMessage = data?.message || `Unexpected error (${response.status})`;
      }

      console.log('🔍 Final error message:', errorMessage);
      console.log('🔍 Error details:', errorDetails);

      // Create comprehensive error object
      const error = new Error(errorMessage) as any;
      error.status = response.status;
      error.response = {
        status: response.status,
        statusText: response.statusText,
        data: data,
        headers: Object.fromEntries(response.headers.entries()),
      };
      error.errors = errorDetails;

      throw error;
    }

    // Success case
    console.log('✅ Registration successful!');
    console.log('🎉 Response data:', data);

    // Save user data to localStorage after successful registration
    if (data.status === 'success' && data.data?.user) {
      console.log('💾 Saving user data to localStorage...');
      UserStorage.saveUser(data.data.user);
      
      // If there's a token in the response, save it
      if (data.data.token) {
        console.log('🔑 Saving auth token...');
        UserStorage.saveToken(data.data.token);
      }
      if (data.data.refreshToken) {
        console.log('🔄 Saving refresh token...');
        UserStorage.saveRefreshToken(data.data.refreshToken);
      }
    }

    return data;

  } catch (error: any) {
    console.error('❌ Registration error:', error);
    
    // Handle network errors
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      const networkError = new Error('Network error - please check your internet connection') as any;
      networkError.original = error;
      throw networkError;
    }
    
    // Re-throw the error so it can be handled by the component
    throw error;
  }
};

// Debug function to test API connectivity
export const debugApiConnection = async (): Promise<any> => {
  console.log('🔍 Testing API connection...');
  
  try {
    // Test basic connectivity
    const healthUrl = `${API_BASE_URL}/health`; // Adjust this endpoint as needed
    console.log('🏥 Testing health endpoint:', healthUrl);
    
    const response = await fetch(healthUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });
    
    console.log('🏥 Health check response:', {
      status: response.status,
      ok: response.ok,
      headers: Object.fromEntries(response.headers.entries()),
    });
    
    let data;
    try {
      data = await response.json();
    } catch {
      data = await response.text();
    }
    
    console.log('🏥 Health check data:', data);
    
    return { status: response.status, ok: response.ok, data };
  } catch (error) {
    console.error('❌ Health check failed:', error);
    return { error: error};
  }
};

// Test the registration endpoint specifically
export const debugRegistrationEndpoint = async (): Promise<any> => {
  console.log('🔍 Testing registration endpoint...');
  
  const testData = {
    firstName: 'Test',
    lastName: 'User',
    email: 'test@example.com',
    password: 'testpassword123',
    phoneNumber: '+1234567890'
  };
  
  console.log('🧪 Test data:', { ...testData, password: '[HIDDEN]' });
  console.log('🌐 Full URL:', `${API_BASE_URL}${API_ENDPOINTS.AUTH.REGISTER}`);
  
  try {
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.AUTH.REGISTER}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(testData),
    });
    
    console.log('🧪 Test response status:', response.status);
    console.log('🧪 Test response headers:', Object.fromEntries(response.headers.entries()));
    
    let data;
    try {
      data = await response.json();
    } catch {
      data = await response.text();
    }
    
    console.log('🧪 Test response data:', data);
    
    return {
      status: response.status,
      ok: response.ok,
      data: data,
      headers: Object.fromEntries(response.headers.entries())
    };
  } catch (error) {
    console.error('❌ Registration endpoint test failed:', error);
    return { error: error };
  }
};

interface VerifyEmailRequest {
  email: string;
  OTP: string;
  type: string;
}

interface VerifyEmailResponse {
  success: boolean;
  message: string;
  // Add other response properties based on your API response structure
  data?: any;
}

export const verifyEmail = async (
  code: string,
  email: string
): Promise<VerifyEmailResponse> => {
  try {
    const url = `${Api}${API_ENDPOINTS.AUTH.VERIFY_EMAIL}`;
    
    const requestBody: VerifyEmailRequest = {
      email,
      OTP: code,
      type: "EmailVerification"
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: VerifyEmailResponse = await response.json();
    return data;

  } catch (error) {
    console.error('Email verification failed:', error);
    
    // Return a standardized error response
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Email verification failed',
    };
  }
};

interface ResendVerificationCodeRequest {
  email: string;
}
export const resendVerificationCode = async (email: string): Promise<any> => {
  console.log('📤 Resending verification code...');
  console.log('📧 Email:', email);
  
  try {
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.AUTH.ACTIVE_CODE}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    console.log('📥 Resend response status:', response.status);
    console.log('📥 Resend response headers:', Object.fromEntries(response.headers.entries()));

    let data;
    try {
      data = await response.json();
    } catch (parseError) {
      console.error('❌ Failed to parse resend response:', parseError);
      const textData = await response.text();
      console.log('📄 Raw resend response:', textData);
      throw new Error('Invalid response format from server');
    }

    console.log('📄 Resend response data:', data);

    if (!response.ok) {
      console.log('❌ Resend failed with status:', response.status);
      
      let errorMessage = 'Failed to resend verification code';
      
      switch (response.status) {
        case 400:
          errorMessage = data?.message || 'Invalid email address';
          break;
        case 404:
          errorMessage = 'Email address not found';
          break;
        case 409:
          errorMessage = 'Email is already verified';
          break;
        case 429:
          errorMessage = 'Too many requests. Please wait before trying again';
          break;
        default:
          errorMessage = data?.message || `Failed to resend code (${response.status})`;
      }
      
      const error = new Error(errorMessage) as any;
      error.status = response.status;
      error.data = data;
      throw error;
    }

    console.log('✅ Verification code resent successfully!');
    return data;
    
  } catch (error: any) {
    console.error('❌ Resend verification error:', error);
    
    // Handle network errors
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      const networkError = new Error('Network error - please check your internet connection') as any;
      networkError.original = error;
      throw networkError;
    }
    
    throw error;
  }
};

// Utility functions
export const getCurrentUser = (): User | null => {
  return UserStorage.getUser();
};

export const updateCurrentUser = (updates: Partial<User>): void => {
  UserStorage.updateUser(updates);
};

export const logout = (): void => {
  UserStorage.removeUser();
};

export const isUserLoggedIn = (): boolean => {
  return UserStorage.isLoggedIn();
};

export const getAuthToken = (): string | null => {
  return UserStorage.getToken();
};

export const isEmailVerified = (): boolean => {
  const user = UserStorage.getUser();
  return user?.isVerified || false;
};

// Export the UserStorage class for direct usage if needed
export { UserStorage };

// Default export
export default {
  registerUser,
  verifyEmail,
  resendVerificationCode,
  getCurrentUser,
  updateCurrentUser,
  logout,
  isUserLoggedIn,
  getAuthToken,
  isEmailVerified,
  UserStorage,
  debugApiConnection,
  debugRegistrationEndpoint,
};
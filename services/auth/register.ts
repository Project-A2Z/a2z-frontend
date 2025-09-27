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
  status: string;
  success: boolean;
  message: string;
  
  // data?: any;
}

export const verifyEmail = async (
  code: string,
  email: string
): Promise<VerifyEmailResponse> => {
  try {
    const url = `${Api}${API_ENDPOINTS.AUTH.VERIFY_EMAIL}`;

    console.log('url : ' , url)
    
    const requestBody: VerifyEmailRequest = {
      email,
      OTP: code,
      type: "EmailVerification"
    };

    console.log('requestBody : ' , requestBody)

    const response = await fetch(url, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    // Parse response data first
    let data;
    try {
      data = await response.json();
    } catch (parseError) {
      console.error('❌ Failed to parse verification response:', parseError);
      throw new Error('Invalid response format from server');
    }

    console.log('data : ' , data);

    if (!response.ok) {
      console.error('❌ Verification request failed with status:', response.status);
      
      // Even if the HTTP status is not ok, check if the data contains success info
      // Some APIs return success data with non-200 status codes
      if (data && (data.success === true || data.status === 'success')) {
        console.log('✅ Email verification successful despite HTTP status!');
        return data;
      }
      
      // Handle different error status codes
      let errorMessage = 'Email verification failed';
      
      switch (response.status) {
        case 400:
          errorMessage = data?.message || 'Invalid verification code or email';
          break;
        case 404:
          errorMessage = 'Verification code not found or expired';
          break;
        case 409:
          errorMessage = 'Email is already verified';
          break;
        default:
          errorMessage = data?.message || `Verification failed (${response.status})`;
      }
      
      throw new Error(errorMessage);
    }

    // Check for successful verification in response data
    if (data.success === true || data.status === 'success') {
      console.log('✅ Email verification successful!');
      
      // Update user verification status in localStorage if user data is returned
      if (data.data?.user) {
        UserStorage.updateUser({ isVerified: true });
      }
      
      return data;
    } else {
      console.error('❌ Email verification failed:', data.message);
      throw new Error(data.message || 'Email verification failed');
    }

  } catch (error) {
    console.error('❌ Email verification failed:', error);
    
    
    
    // Return a standardized error response for caught errors
    throw error;
  }
};

// interface ResendVerificationCodeRequest {
//   email: string;
// }
// Types for the API request and response
interface ResendOTPRequest {
  email: string;
  type: 'EmailVerification' | 'passwordReset';
}

interface ResendOTPResponse {
  status: string;
  message: string;
}

// Custom error class for API errors
class APIError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'APIError';
  }
}

// Configuration for different environments
const API_CONFIG = {
  // Use production URL - change this based on your environment
  baseUrl: 'https://a2z-backend.fly.dev',
  // For development, you might want to use: 'http://localhost:3000'
  endpoints: {
    primary: '/app/v1/users/OTPResend'
  }
};

/**
 * Resends verification code to the specified email
 * @param email - The email address to send the verification code to
 * @param type - Type of verification (defaults to 'EmailVerification')
 * @param baseUrl - Optional custom base URL (defaults to localhost:3000)
 * @returns Promise<ResendOTPResponse>
 * @throws APIError when the request fails
 */
export async function resendVerificationCode(
  email: string,
  type: 'EmailVerification' | 'passwordReset' = 'EmailVerification',
  baseUrl: string = API_CONFIG.baseUrl
): Promise<ResendOTPResponse> {
  const requestBody: ResendOTPRequest = {
    email,
    type
  };

  // Try the primary endpoint first
  const primaryUrl = `${baseUrl}${API_CONFIG.endpoints.primary}`;
  
  try {
    console.log(`🔄 Attempting to call: ${primaryUrl}`);
    console.log(`📧 Request body:`, requestBody);
    
    const response = await fetch(primaryUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });

    console.log(`📡 Response status: ${response.status}`);
    
    if (!response.ok) {
      // Log the response for debugging
      let errorText = '';
      try {
        errorText = await response.text();
        console.log(`❌ Error response:`, errorText);
      } catch (e) {
        console.log(`❌ Could not read error response`);
      }
      
      throw new APIError(
        response.status,
        `HTTP error! status: ${response.status}. Response: ${errorText}`
      );
    }

    const data: ResendOTPResponse = await response.json();
    console.log(`✅ Success response:`, data);
    return data;

  } catch (error) {
    if (error instanceof APIError) {
      throw error;
    }
    
    // Handle network errors or other fetch errors
    console.error(`🚨 Network error:`, error);
    throw new APIError(
      0,
      `Network error: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Debug function to test different endpoint variations
 * Use this to find the correct endpoint if the main function fails
 */
export async function debugEndpoints(
  email: string,
  type: 'EmailVerification' | 'passwordReset' = 'EmailVerification',
  baseUrl: string = API_CONFIG.baseUrl
): Promise<void> {
  const requestBody: ResendOTPRequest = { email, type };
  
  console.log(`🔍 Testing different endpoint variations for: ${email}`);
  
  const allEndpoints = [API_CONFIG.endpoints.primary, '/users/OTPResend', '/auth/OTPResend', '/users/OTPResendCode' ];
  
  for (const endpoint of allEndpoints) {
    const url = `${baseUrl}${endpoint}`;
    console.log(`\n🧪 Testing: ${url}`);
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });
      
      console.log(`   Status: ${response.status}`);
      
      if (response.ok) {
        const data = await response.json();
        console.log(`   ✅ SUCCESS! This endpoint works:`, data);
        console.log(`   Use this URL: ${url}`);
        return;
      } else {
        const errorText = await response.text().catch(() => 'Could not read response');
        console.log(`   ❌ Failed: ${errorText}`);
      }
    } catch (error) {
      console.log(`   🚨 Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  console.log(`\n❌ None of the endpoints worked. Check your server configuration.`);
}

// Usage examples:

// Example 1: Resend email verification code
async function example1() {
  try {
    const result = await resendVerificationCode('ahmed@example.com');
    console.log('Success:', result.message);
  } catch (error) {
    if (error instanceof APIError) {
      console.error(`API Error (${error.status}):`, error.message);
    } else {
      console.error('Unexpected error:', error);
    }
  }
}

// Example 2: Resend password reset code
async function example2() {
  try {
    const result = await resendVerificationCode('user@example.com', 'passwordReset');
    console.log('Password reset code sent:', result.message);
  } catch (error) {
    if (error instanceof APIError) {
      console.error(`Failed to send password reset code:`, error.message);
    }
  }
}

// Example 3: With async/await in a React component or similar
export const handleResendCode = async (userEmail: string) => {
  try {
    const response = await resendVerificationCode(userEmail, 'EmailVerification');
    
    // Show success message to user
    alert(response.message);
    
    return response;
  } catch (error) {
    if (error instanceof APIError) {
      // Handle different error status codes
      switch (error.status) {
        case 400:
          alert('Invalid email address or request');
          break;
        case 404:
          alert('User not found');
          break;
        case 429:
          alert('Too many requests. Please wait before trying again');
          break;
        default:
          alert('Failed to send verification code. Please try again');
      }
    } else {
      alert('Network error. Please check your connection');
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
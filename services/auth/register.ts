// services/auth/register.ts
import { API_ENDPOINTS, Api } from './../api/endpoints';
import AlertHandler from './../Utils/alertHandler';

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
  static saveUser(user: User): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    }
  }

  static getUser(): User | null {
    if (typeof window !== 'undefined') {
      const userData = localStorage.getItem(STORAGE_KEYS.USER);
      return userData ? JSON.parse(userData) : null;
    }
    return null;
  }

  static removeUser(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEYS.USER);
      localStorage.removeItem(STORAGE_KEYS.TOKEN);
      localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
    }
  }

  static updateUser(updates: Partial<User>): void {
    const currentUser = this.getUser();
    if (currentUser) {
      const updatedUser = { ...currentUser, ...updates };
      this.saveUser(updatedUser);
    }
  }

  static isLoggedIn(): boolean {
    return this.getUser() !== null;
  }

  static saveToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.TOKEN, token);
    }
  }

  static getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(STORAGE_KEYS.TOKEN);
    }
    return null;
  }

  static saveRefreshToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, token);
    }
  }

  static getRefreshToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
    }
    return null;
  }
}

const API_BASE_URL = Api;

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

    let data;
    const contentType = response.headers.get('content-type');
    console.log('📋 Content-Type:', contentType);

    try {
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const textData = await response.text();
        console.log('📄 Non-JSON response:', textData);
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
      
      let errorMessage = 'Registration failed';
      let errorDetails = {};

      switch (response.status) {
        case 400:
          console.log('🔍 400 Bad Request - analyzing response...');
          if (data) {
            errorMessage = data.message || data.error || 'Invalid request data';
            errorDetails = data.errors || data.validationErrors || data.data || {};
            
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

    console.log('✅ Registration successful!');
    console.log('🎉 Response data:', data);

    if (data.status === 'success' && data.data?.user) {
      console.log('💾 Saving user data to localStorage...');
      UserStorage.saveUser(data.data.user);
      
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
    
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      const networkError = new Error('Network error - please check your internet connection') as any;
      networkError.original = error;
      throw networkError;
    }
    
    throw error;
  }
};

export const debugApiConnection = async (): Promise<any> => {
  console.log('🔍 Testing API connection...');
  
  try {
    const healthUrl = `${API_BASE_URL}/health`;
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
      
      if (data && (data.success === true || data.status === 'success')) {
        console.log('✅ Email verification successful despite HTTP status!');
        return data;
      }
      
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

    if (data.success === true || data.status === 'success') {
      console.log('✅ Email verification successful!');
      
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
    throw error;
  }
};

interface ResendOTPRequest {
  email: string;
  type: 'EmailVerification' | 'passwordReset';
}

interface ResendOTPResponse {
  status: string;
  message: string;
}

class APIError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'APIError';
  }
}

const API_CONFIG = {
  baseUrl: 'https://a2z-backend.fly.dev',
  endpoints: {
    primary: '/app/v1/users/OTPResend'
  }
};

export async function resendVerificationCode(
  email: string,
  type: 'EmailVerification' | 'passwordReset' = 'EmailVerification',
  baseUrl: string = API_CONFIG.baseUrl
): Promise<ResendOTPResponse> {
  const requestBody: ResendOTPRequest = {
    email,
    type
  };

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
    
    console.error(`🚨 Network error:`, error);
    throw new APIError(
      0,
      `Network error: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

export async function debugEndpoints(
  email: string,
  type: 'EmailVerification' | 'passwordReset' = 'EmailVerification',
  baseUrl: string = API_CONFIG.baseUrl
): Promise<void> {
  const requestBody: ResendOTPRequest = { email, type };
  
  console.log(`🔍 Testing different endpoint variations for: ${email}`);
  
  const allEndpoints = [API_CONFIG.endpoints.primary, '/users/OTPResend', '/auth/OTPResend', '/users/OTPResendCode'];
  
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

// Updated handleResendCode with AlertHandler
export const handleResendCode = async (userEmail: string) => {
  try {
    const response = await resendVerificationCode(userEmail, 'EmailVerification');
    
    // Use AlertHandler instead of native alert
    AlertHandler.success(response.message || 'تم إرسال رمز التحقق بنجاح');
    
    return response;
  } catch (error) {
    if (error instanceof APIError) {
      let errorMessage = 'فشل في إرسال رمز التحقق. يرجى المحاولة مرة أخرى';
      
      switch (error.status) {
        case 400:
          errorMessage = 'عنوان بريد إلكتروني غير صالح';
          break;
        case 404:
          errorMessage = 'المستخدم غير موجود';
          break;
        case 429:
          errorMessage = 'طلبات كثيرة جداً. يرجى الانتظار قبل المحاولة مرة أخرى';
          break;
      }
      
      AlertHandler.error(errorMessage);
    } else {
      AlertHandler.error('خطأ في الشبكة. يرجى التحقق من اتصالك');
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

export { UserStorage };

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
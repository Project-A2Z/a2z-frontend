// services/auth/login.ts
import { API_ENDPOINTS, Api } from './../api/endpoints';

// Types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface User {
  _id: string;
  id?: string;
  firstName: string;
  lastName: string;
  email: string;
  role?: string;
  image?: string | null;
  phoneNumber: string;
  department?: string | null;
  salary?: number | null;
  dateOfSubmission?: string | null;
  isVerified?: boolean;
  isEmailVerified: boolean;
  address?: any[];
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
  EmailVerificationToken?: string;
  EmailVerificationExpires?: string;
}

export interface LoginResponse {
  status: string;
  message: string;
  data: {
    user: User;
    token: string;
    refreshToken?: string;
  };
}

export interface LoginError {
  status: string;
  message: string;
  errors?: Record<string, string>;
}

export interface SocialLoginData {
  provider: 'google' | 'facebook';
  accessToken: string;
  // Add other fields as needed based on your API
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

  // Remove user data from localStorage
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
    return this.getUser() !== null && this.getToken() !== null;
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

  // Get authorization header for API requests
  static getAuthHeader(): Record<string, string> {
    const token = this.getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }
}

// Custom error class for authentication errors
export class AuthError extends Error {
  public statusCode?: number;
  public isNetworkError?: boolean;
  public errors?: Record<string, string>;

  constructor(message: string, statusCode?: number, isNetworkError = false, errors?: Record<string, string>) {
    super(message);
    this.name = 'AuthError';
    this.statusCode = statusCode;
    this.isNetworkError = isNetworkError;
    this.errors = errors;
  }
}

// API Configuration
const API_BASE_URL = Api;

// Enhanced Login function with better error handling
export const loginUser = async (credentials: LoginCredentials): Promise<LoginResponse> => {
  console.log('🚀 Starting login...');
  console.log('🔧 API Base URL:', API_BASE_URL);
  console.log('🔧 Login endpoint:', API_ENDPOINTS.AUTH.LOGIN);
  console.log('🔧 Full URL:', `${API_BASE_URL}${API_ENDPOINTS.AUTH.LOGIN}`);
  console.log('📤 Login credentials:', {
    email: credentials.email,
    password: '[HIDDEN]'
  });

  try {
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.AUTH.LOGIN}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(credentials),
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
      throw new AuthError('Server returned invalid response format');
    }

    if (!response.ok) {
      console.log('❌ Login failed with status:', response.status);
      
      // Enhanced error handling for different status codes
      let errorMessage = 'تسجيل الدخول فشل';
      let errorDetails = {};

      switch (response.status) {
        case 400:
          console.log('🔍 400 Bad Request - analyzing response...');
          if (data) {
            errorMessage = data.message || data.error || 'بيانات الطلب غير صحيحة';
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
            errorMessage = 'طلب غير صحيح - يرجى التحقق من البيانات المدخلة';
          }
          break;
          
        case 401:
          errorMessage = data?.message || 'البريد الإلكتروني أو كلمة المرور غير صحيحة';
          break;
          
        case 403:
          errorMessage = data?.message || 'الحساب محظور أو غير مفعل';
          break;
          
        case 422:
          errorMessage = data?.message || 'فشل التحقق - يرجى التحقق من البيانات المدخلة';
          errorDetails = data?.errors || {};
          break;
          
        case 500:
          errorMessage = 'خطأ في الخادم - يرجى المحاولة لاحقاً';
          break;
          
        default:
          errorMessage = data?.message || `خطأ غير متوقع (${response.status})`;
      }

      console.log('🔍 Final error message:', errorMessage);
      console.log('🔍 Error details:', errorDetails);

      // Create comprehensive error object
      throw new AuthError(errorMessage, response.status, false, errorDetails);
    }

    // Success case
    console.log('✅ Login successful!');
    console.log('🎉 Response data:', data);

    // Validate response structure
    if (data.status !== 'success') {
      console.log('❌ Login failed - status is not success:', data.status);
      throw new AuthError(data.message || 'فشل تسجيل الدخول');
    }

    if (!data.data || !data.data.user || !data.data.token) {
      console.log('❌ Invalid response structure:', data);
      throw new AuthError('استجابة الخادم غير صحيحة');
    }

    // Save user data and token to localStorage after successful login
    console.log('💾 Saving user data and token to localStorage...');
    UserStorage.saveUser(data.data.user);
    UserStorage.saveToken(data.data.token);
    
    // If there's a refresh token in the response, save it
    if (data.data.refreshToken) {
      console.log('🔄 Saving refresh token...');
      UserStorage.saveRefreshToken(data.data.refreshToken);
    }

    console.log('✅ User data and token saved successfully!');
    
    return data;

  } catch (error: any) {
    console.error('❌ Login error:', error);
    
    // Handle network errors
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new AuthError('خطأ في الشبكة - يرجى التحقق من اتصال الإنترنت', 0, true);
    }
    
    // Re-throw AuthError as-is
    if (error instanceof AuthError) {
      throw error;
    }
    
    // Handle any other unexpected errors
    throw new AuthError('حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.');
  }
};

// Social login function
export const socialLogin = async (socialData: SocialLoginData): Promise<LoginResponse> => {
  console.log('🚀 Starting social login...');
  console.log('🔧 Provider:', socialData.provider);
  
  try {
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.AUTH.LOGIN_SOCIAL}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(socialData),
    });

    let data;
    try {
      data = await response.json();
    } catch (parseError) {
      console.error('❌ Failed to parse social login response:', parseError);
      throw new AuthError('Server returned invalid response format');
    }

    console.log('📄 Social login response data:', data);

    if (!response.ok) {
      console.log('❌ Social login failed with status:', response.status);
      
      let errorMessage = 'فشل تسجيل الدخول عبر الشبكات الاجتماعية';
      
      switch (response.status) {
        case 400:
          errorMessage = data?.message || 'بيانات تسجيل الدخول الاجتماعي غير صحيحة';
          break;
        case 401:
          errorMessage = data?.message || 'فشل التحقق من هوية الحساب الاجتماعي';
          break;
        default:
          errorMessage = data?.message || `خطأ في تسجيل الدخول الاجتماعي (${response.status})`;
      }

      throw new AuthError(errorMessage, response.status);
    }

    // Success case - same validation and storage as regular login
    if (data.status !== 'success') {
      throw new AuthError(data.message || 'فشل تسجيل الدخول الاجتماعي');
    }

    if (!data.data || !data.data.user || !data.data.token) {
      throw new AuthError('استجابة الخادم غير صحيحة');
    }

    // Save user data and token
    console.log('💾 Saving social login user data and token...');
    UserStorage.saveUser(data.data.user);
    UserStorage.saveToken(data.data.token);
    
    if (data.data.refreshToken) {
      UserStorage.saveRefreshToken(data.data.refreshToken);
    }

    console.log('✅ Social login successful!');
    return data;

  } catch (error: any) {
    console.error('❌ Social login error:', error);
    
    if (error instanceof AuthError) {
      throw error;
    }
    
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new AuthError('خطأ في الشبكة - يرجى التحقق من اتصال الإنترنت', 0, true);
    }
    
    throw new AuthError('حدث خطأ في تسجيل الدخول الاجتماعي');
  }
};

// Logout function
// Logout function - removes user data from localStorage
export const logoutUser = async (): Promise<void> => {
  console.log('🚪 Starting logout process...');
  
  try {
    // Clear all authentication data from localStorage
    UserStorage.removeUser();
    
    console.log('✅ User logged out successfully - all auth data cleared');
    console.log('🧹 Cleared items: user data, auth token, refresh token');
    
    // Optional: You can add any cleanup logic here if needed
    // For example, clearing any other app-specific data
    
  } catch (error) {
    console.error('❌ Error during logout:', error);
    // Even if there's an error, we should still try to clear the data
    UserStorage.removeUser();
    throw new Error('حدث خطأ أثناء تسجيل الخروج');
  }
};
// Authentication Service Class (similar to your register service structure)
export class AuthService {
  /**
   * Login with email and password
   */
  static async login(credentials: LoginCredentials): Promise<LoginResponse> {
    return await loginUser(credentials);
  }

  /**
   * Social login (Google/Facebook)
   */
  static async socialLogin(socialData: SocialLoginData): Promise<LoginResponse> {
    return await socialLogin(socialData);
  }

  /**
   * Logout user
   */
  static async logout(): Promise<void> {
    return await logoutUser();
  }

  /**
   * Get stored token
   */
  static getToken(): string | null {
    return UserStorage.getToken();
  }

  /**
   * Get stored user data
   */
  static getUser(): User | null {
    return UserStorage.getUser();
  }

  /**
   * Check if user is authenticated
   */
  static isAuthenticated(): boolean {
    return UserStorage.isLoggedIn();
  }

  /**
   * Check if user's email is verified
   */
  static isEmailVerified(): boolean {
    const user = UserStorage.getUser();
    return user?.isEmailVerified || user?.isVerified || false;
  }

  /**
   * Clear authentication data
   */
  static clearAuthData(): void {
    UserStorage.removeUser();
  }

  /**
   * Get authorization header for API requests
   */
  static getAuthHeader(): Record<string, string> {
    return UserStorage.getAuthHeader();
  }

  /**
   * Update user data
   */
  static updateUser(updates: Partial<User>): void {
    UserStorage.updateUser(updates);
  }
}

// Utility functions for convenience
export const getCurrentUser = (): User | null => {
  return UserStorage.getUser();
};

export const updateCurrentUser = (updates: Partial<User>): void => {
  UserStorage.updateUser(updates);
};

export const getAuthToken = (): string | null => {
  return UserStorage.getToken();
};

export const isUserAuthenticated = (): boolean => {
  return UserStorage.isLoggedIn();
};

export const isEmailVerified = (): boolean => {
  const user = UserStorage.getUser();
  return user?.isEmailVerified || user?.isVerified || false;
};

export const clearUserAuth = (): void => {
  UserStorage.removeUser();
};

export const getAuthorizationHeader = (): Record<string, string> => {
  return UserStorage.getAuthHeader();
};

// Debug function to test API connectivity
export const debugLoginEndpoint = async (): Promise<any> => {
  console.log('🔍 Testing login endpoint...');
  
  const testCredentials = {
    email: 'test@example.com',
    password: 'testpassword123'
  };
  
  console.log('🧪 Test credentials:', { ...testCredentials, password: '[HIDDEN]' });
  console.log('🌐 Full URL:', `${API_BASE_URL}${API_ENDPOINTS.AUTH.LOGIN}`);
  
  try {
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.AUTH.LOGIN}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(testCredentials),
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
    console.error('❌ Login endpoint test failed:', error);
    return { error: error };
  }
};

// Export the UserStorage class for direct usage if needed
export { UserStorage };

// Default export
export default {
  loginUser,
  socialLogin,
  logoutUser,
  getCurrentUser,
  updateCurrentUser,
  getAuthToken,
  isUserAuthenticated,
  isEmailVerified,
  clearUserAuth,
  getAuthorizationHeader,
  AuthService,
  UserStorage,
  debugLoginEndpoint,
};
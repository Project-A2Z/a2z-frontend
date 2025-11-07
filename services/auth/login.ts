// services/auth/login.ts
import { API_ENDPOINTS, Api } from './../api/endpoints';
import { saveAuthToken } from '@/utils/auth';

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
  idToken: string;
}

// Storage keys
const STORAGE_KEYS = {
  USER: 'user_data',
  TOKEN: 'auth_token',
  REFRESH_TOKEN: 'refresh_token',
  TOKEN_EXPIRY: 'token_expiry',
  LOGIN_TIME: 'login_time',
} as const;

// Configuration for token expiration (in milliseconds)
const TOKEN_CONFIG = {
  // Default expiration time: 24 hours
  DEFAULT_EXPIRY_MS: 24 * 60 * 60 * 1000,
  // Check interval: every 5 minutes
  CHECK_INTERVAL_MS: 5 * 60 * 1000,
  // Warning time before expiry: 5 minutes
  WARNING_BEFORE_EXPIRY_MS: 5 * 60 * 1000,
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
      localStorage.removeItem(STORAGE_KEYS.TOKEN_EXPIRY);
      localStorage.removeItem(STORAGE_KEYS.LOGIN_TIME);
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

  // ✅ FIXED: Check if user is logged in AND token is not expired
  static isLoggedIn(): boolean {
    if (typeof window === 'undefined') return false;
    
    const user = this.getUser();
    const token = localStorage.getItem(STORAGE_KEYS.TOKEN); // Get raw token without validation
    
    // ✅ FIX: If no user or token at all, just return false (don't try to logout)
    if (!user || !token) {
      return false;
    }
    
    // ✅ FIX: Only check validity if we actually have a user and token
    const isTokenValid = this.isTokenValid();
    
    // If token is expired, auto logout
    if (!isTokenValid) {
      //console.log('🔒 Token expired, auto logging out...');
      this.removeUser();
      return false;
    }
    
    return true;
  }

  // Save auth token with expiry time
  static saveToken(token: string, expiryMs?: number): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.TOKEN, token);
      
      // Calculate and save expiry time
      const expiryTime = Date.now() + (expiryMs || TOKEN_CONFIG.DEFAULT_EXPIRY_MS);
      localStorage.setItem(STORAGE_KEYS.TOKEN_EXPIRY, expiryTime.toString());
      
      // Save login time
      localStorage.setItem(STORAGE_KEYS.LOGIN_TIME, Date.now().toString());
      
      //console.log('💾 Token saved with expiry:', new Date(expiryTime).toLocaleString());
    }
  }

  // ✅ FIXED: Get auth token only if it's valid
  static getToken(): string | null {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
      
      // ✅ FIX: If no token exists, just return null (don't check validity)
      if (!token) {
        return null;
      }
      
      // Check if token is valid
      if (this.isTokenValid()) {
        return token;
      }
      
      // ✅ FIX: Token expired - clear auth data
      //console.log('🔒 Token expired in getToken, clearing auth data...');
      this.removeUser();
      
      return null;
    }
    return null;
  }

  // Check if token is still valid
  static isTokenValid(): boolean {
    if (typeof window === 'undefined') return false;
    
    const expiryTime = localStorage.getItem(STORAGE_KEYS.TOKEN_EXPIRY);
    if (!expiryTime) return false;
    
    const now = Date.now();
    const expiry = parseInt(expiryTime, 10);
    
    return now < expiry;
  }

  // Get remaining time until token expires (in milliseconds)
  static getRemainingTime(): number {
    if (typeof window === 'undefined') return 0;
    
    const expiryTime = localStorage.getItem(STORAGE_KEYS.TOKEN_EXPIRY);
    if (!expiryTime) return 0;
    
    const now = Date.now();
    const expiry = parseInt(expiryTime, 10);
    const remaining = expiry - now;
    
    return remaining > 0 ? remaining : 0;
  }

  // Check if token is about to expire soon
  static isTokenExpiringSoon(): boolean {
    const remaining = this.getRemainingTime();
    return remaining > 0 && remaining < TOKEN_CONFIG.WARNING_BEFORE_EXPIRY_MS;
  }

  // Get login time
  static getLoginTime(): Date | null {
    if (typeof window === 'undefined') return null;
    
    const loginTime = localStorage.getItem(STORAGE_KEYS.LOGIN_TIME);
    return loginTime ? new Date(parseInt(loginTime, 10)) : null;
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

// Token expiration monitor
class TokenExpirationMonitor {
  private checkInterval: NodeJS.Timeout | null = null;
  private onExpiry?: () => void;

  start(onExpiry?: () => void) {
    if (typeof window === 'undefined') return;
    
    this.onExpiry = onExpiry;
    
    // Clear existing interval
    this.stop();
    
    // ✅ FIX: Only start monitoring if there's actually a token to monitor
    const hasToken = localStorage.getItem(STORAGE_KEYS.TOKEN);
    if (!hasToken) {
      //console.log('⚠️ No token found, skipping monitor start');
      return;
    }
    
    // Check token validity periodically
    this.checkInterval = setInterval(() => {
      // ✅ FIX: Double-check token exists before validating
      const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
      if (!token) {
        //console.log('⚠️ Token removed, stopping monitor');
        this.stop();
        return;
      }
      
      if (!UserStorage.isTokenValid()) {
        //console.log('⏰ Token expired detected by monitor');
        UserStorage.removeUser();
        
        if (this.onExpiry) {
          this.onExpiry();
        }
        
        this.stop();
      } else if (UserStorage.isTokenExpiringSoon()) {
        const remaining = UserStorage.getRemainingTime();
        const minutes = Math.floor(remaining / 60000);
        //console.log(`⚠️ Token expiring in ${minutes} minutes`);
      }
    }, TOKEN_CONFIG.CHECK_INTERVAL_MS);
    
    //console.log('👁️ Token expiration monitor started');
  }

  stop() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
      //console.log('🛑 Token expiration monitor stopped');
    }
  }
}

// Global token monitor instance
const tokenMonitor = new TokenExpirationMonitor();

// Enhanced Login function with better error handling
export const loginUser = async (credentials: LoginCredentials): Promise<LoginResponse> => {
  //console.log('🚀 Starting login...');
  //console.log('🔧 API Base URL:', API_BASE_URL);
  //console.log('🔧 Login endpoint:', API_ENDPOINTS.AUTH.LOGIN);
  //console.log('🔧 Full URL:', `${API_BASE_URL}${API_ENDPOINTS.AUTH.LOGIN}`);
  //console.log('📤 Login credentials:', {
  //   email: credentials.email,
  //   password: '[HIDDEN]'
  // });

  try {
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.AUTH.LOGIN}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    //console.log('📥 Raw response:', response);
    //console.log('📊 Response status:', response.status);
    //console.log('📊 Response ok:', response.ok);
    //console.log('📊 Response headers:', Object.fromEntries(response.headers.entries()));

    // Try to parse response data
    let data;
    const contentType = response.headers.get('content-type');
    //console.log('📋 Content-Type:', contentType);

    try {
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const textData = await response.text();
        //console.log('📄 Non-JSON response:', textData);
        try {
          data = JSON.parse(textData);
        } catch {
          data = { message: textData };
        }
      }
      //console.log('📄 Parsed response data:', data);
    } catch (parseError) {
      console.error('❌ Failed to parse response:', parseError);
      throw new AuthError('Server returned invalid response format');
    }

    if (!response.ok) {
      //console.log('❌ Login failed with status:', response.status);
      
      let errorMessage = 'تسجيل الدخول فشل';
      let errorDetails = {};

      switch (response.status) {
        case 400:
          //console.log('🔍 400 Bad Request - analyzing response...');
          if (data) {
            errorMessage = data.message || data.error || 'بيانات الطلب غير صحيحة';
            errorDetails = data.errors || data.validationErrors || data.data || {};
            
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

      //console.log('🔍 Final error message:', errorMessage);
      //console.log('🔍 Error details:', errorDetails);

      throw new AuthError(errorMessage, response.status, false, errorDetails);
    }

    // Success case
    //console.log('✅ Login successful!');
    //console.log('🎉 Response data:', data);

    // Validate response structure
    if (data.status !== 'success') {
      //console.log('❌ Login failed - status is not success:', data.status);
      throw new AuthError(data.message || 'فشل تسجيل الدخول');
    }

    if (!data.data || !data.data.user || !data.data.token) {
      //console.log('❌ Invalid response structure:', data);
      throw new AuthError('استجابة الخادم غير صحيحة');
    }

    // Save user data and token to localStorage after successful login
    //console.log('💾 Saving user data and token to localStorage...');
    UserStorage.saveUser(data.data.user);
    UserStorage.saveToken(data.data.token);
    saveAuthToken(data.data.token);
    
    // If there's a refresh token in the response, save it
    if (data.data.refreshToken) {
      //console.log('🔄 Saving refresh token...');
      UserStorage.saveRefreshToken(data.data.refreshToken);
    }

    //console.log('✅ User data and token saved successfully!');
    
    // Start monitoring token expiration
    tokenMonitor.start(() => {
      //console.log('🔒 Token expired - user needs to login again');
      // Trigger custom event for components to listen to
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('tokenExpired'));
      }
    });
    
    return data;

  } catch (error: any) {
    console.error('❌ Login error:', error);
    
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new AuthError('خطأ في الشبكة - يرجى التحقق من اتصال الإنترنت', 0, true);
    }
    
    if (error instanceof AuthError) {
      throw error;
    }
    
    throw new AuthError('حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.');
  }
};

// Social login function
export const socialLogin = async (socialData: SocialLoginData): Promise<LoginResponse> => {
  //console.log('🚀 Starting social login...');
  //console.log('🔧 Provider:', socialData.provider);
  //console.log('🔧 API Base URL:', API_BASE_URL);
  //console.log('🔧 Social login endpoint:', API_ENDPOINTS.AUTH.LOGIN_SOCIAL);

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
    const contentType = response.headers.get('content-type');

    try {
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const textData = await response.text();
        try {
          data = JSON.parse(textData);
        } catch {
          data = { message: textData };
        }
      }
    } catch (parseError) {
      console.error('❌ Failed to parse social login response:', parseError);
      throw new AuthError('Server returned invalid response format');
    }

    if (!response.ok) {
      let errorMessage = 'فشل تسجيل الدخول عبر الشبكات الاجتماعية';
      let errorDetails = {};
      
      switch (response.status) {
        case 400:
          errorMessage = data?.message || data?.error || 'بيانات تسجيل الدخول الاجتماعي غير صحيحة';
          break;
        case 401:
          errorMessage = data?.message || 'فشل التحقق من هوية الحساب الاجتماعي';
          break;
        case 403:
          errorMessage = data?.message || 'الحساب محظور أو غير مفعل';
          break;
        case 500:
          errorMessage = 'خطأ في الخادم - يرجى المحاولة لاحقاً';
          break;
        default:
          errorMessage = data?.message || `خطأ في تسجيل الدخول الاجتماعي (${response.status})`;
      }

      throw new AuthError(errorMessage, response.status, false, errorDetails);
    }

    //console.log('✅ Social login successful!');

    if (data.status !== 'success') {
      throw new AuthError(data.message || 'فشل تسجيل الدخول الاجتماعي');
    }

    if (!data.data || !data.data.user || !data.data.token) {
      throw new AuthError('استجابة الخادم غير صحيحة');
    }

    // Save with expiry tracking
    UserStorage.saveUser(data.data.user);
    UserStorage.saveToken(data.data.token);
    saveAuthToken(data.data.token);
    
    if (data.data.refreshToken) {
      UserStorage.saveRefreshToken(data.data.refreshToken);
    }

    // Start monitoring
    tokenMonitor.start(() => {
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('tokenExpired'));
      }
    });
    
    return data;

  } catch (error: any) {
    console.error('❌ Social login error:', error);
    
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new AuthError('خطأ في الشبكة - يرجى التحقق من اتصال الإنترنت', 0, true);
    }
    
    if (error instanceof AuthError) {
      throw error;
    }
    
    throw new AuthError('حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.');
  }
};

// Logout function
export const logoutUser = async (): Promise<void> => {
  //console.log('🚪 Starting logout process...');
  
  try {
    // Stop token monitoring
    tokenMonitor.stop();
    
    // Clear all authentication data
    UserStorage.removeUser();
    
    //console.log('✅ User logged out successfully');
    
  } catch (error) {
    console.error('❌ Error during logout:', error);
    UserStorage.removeUser();
    throw new Error('حدث خطأ أثناء تسجيل الخروج');
  }
};

// Authentication Service Class
export class AuthService {
  static async login(credentials: LoginCredentials): Promise<LoginResponse> {
    return await loginUser(credentials);
  }

  static async socialLogin(socialData: SocialLoginData): Promise<LoginResponse> {
    return await socialLogin(socialData);
  }

  static async logout(): Promise<void> {
    return await logoutUser();
  }

  static getToken(): string | null {
    return UserStorage.getToken();
  }

  static getUser(): User | null {
    return UserStorage.getUser();
  }

  static isAuthenticated(): boolean {
    return UserStorage.isLoggedIn();
  }

  static isEmailVerified(): boolean {
    const user = UserStorage.getUser();
    return user?.isEmailVerified || user?.isVerified || false;
  }

  static clearAuthData(): void {
    tokenMonitor.stop();
    UserStorage.removeUser();
  }

  static getAuthHeader(): Record<string, string> {
    return UserStorage.getAuthHeader();
  }

  static updateUser(updates: Partial<User>): void {
    UserStorage.updateUser(updates);
  }

  // Token expiration utilities
  static isTokenValid(): boolean {
    return UserStorage.isTokenValid();
  }

  static getRemainingTime(): number {
    return UserStorage.getRemainingTime();
  }

  static isTokenExpiringSoon(): boolean {
    return UserStorage.isTokenExpiringSoon();
  }

  static getLoginTime(): Date | null {
    return UserStorage.getLoginTime();
  }

  static startTokenMonitoring(onExpiry?: () => void): void {
    tokenMonitor.start(onExpiry);
  }

  static stopTokenMonitoring(): void {
    tokenMonitor.stop();
  }
}

// Utility functions
export const getCurrentUser = (): User | null => UserStorage.getUser();
export const updateCurrentUser = (updates: Partial<User>): void => UserStorage.updateUser(updates);
export const getAuthToken = (): string | null => UserStorage.getToken();
export const isUserAuthenticated = (): boolean => UserStorage.isLoggedIn();
export const isEmailVerified = (): boolean => {
  const user = UserStorage.getUser();
  return user?.isEmailVerified || user?.isVerified || false;
};
export const clearUserAuth = (): void => {
  tokenMonitor.stop();
  UserStorage.removeUser();
};
export const getAuthorizationHeader = (): Record<string, string> => UserStorage.getAuthHeader();

// Export classes
export { UserStorage, TokenExpirationMonitor };

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
};
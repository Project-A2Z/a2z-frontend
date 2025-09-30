// services/profile/profile.ts
import { API_ENDPOINTS, Api } from './../api/endpoints';

// Types
export interface Address {
  _id: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  address: string;
  city: string;
  region: string;
  isDefault: boolean;
}

export interface UserProfile {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  image?: string | null;
  isEmailVerified: boolean;
  addresses?: Address[];
  role?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProfileResponse {
  status: string;
  data: {
    user: UserProfile;
  };
}

export interface UpdateProfileData {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  image?: File;
}

export interface UserProfileResponse {
  status: string;
  message: string;
  user: {
    _id: string;
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
    id: string;
  };
}

export interface ApiError {
  status: string;
  message: string;
  errors?: Array<{
    field: string;
    message: string;
  }>;
}

export interface UpdatePasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface AddAddressData {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  address: string;
  city: string;
  region: string;
  isDefault?: boolean;
}

export interface UpdateAddressData extends Partial<AddAddressData> {
  addressId: string;
}

// Custom error class for profile errors
export class ProfileError extends Error {
  public statusCode?: number;
  public isNetworkError?: boolean;
  public errors?: Record<string, string>;

  constructor(message: string, statusCode?: number, isNetworkError = false, errors?: Record<string, string>) {
    super(message);
    this.name = 'ProfileError';
    this.statusCode = statusCode;
    this.isNetworkError = isNetworkError;
    this.errors = errors;
  }
}

// API Configuration
const API_BASE_URL = Api;

// Helper function to get auth token from localStorage
const getAuthToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('auth_token');
  }
  return null;
};

// Helper function to get authorization headers
const getAuthHeaders = (): Record<string, string> => {
  const token = getAuthToken();
  if (!token) {
    throw new ProfileError('لم يتم العثور على رمز المصادقة. يرجى تسجيل الدخول مرة أخرى.', 401);
  }
  
  return {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Authorization': `Bearer ${token}`,
  };
};

// Get User Profile
export const getUserProfile = async (): Promise<ProfileResponse> => {
  console.log('🚀 Fetching user profile...');
  console.log('🔧 Profile endpoint:', `${API_BASE_URL}${API_ENDPOINTS.AUTH.PROFILE}`);

  try {
    const headers = getAuthHeaders();
    
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.AUTH.PROFILE}`, {
      method: 'GET',
      headers: headers,
    });

    console.log('📥 Profile response status:', response.status);

    // Parse response
    let data;
    const contentType = response.headers.get('content-type');
    
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
      console.log('📄 Parsed profile data:', data);
    } catch (parseError) {
      console.error('❌ Failed to parse response:', parseError);
      throw new ProfileError('استجابة الخادم غير صحيحة');
    }

    if (!response.ok) {
      console.log('❌ Failed to fetch profile with status:', response.status);
      
      let errorMessage = 'فشل في جلب بيانات الملف الشخصي';
      
      switch (response.status) {
        case 401:
          errorMessage = data?.message || 'انتهت صلاحية الجلسة. يرجى تسجيل الدخول مرة أخرى.';
          break;
        case 403:
          errorMessage = data?.message || 'غير مصرح لك بالوصول إلى هذه البيانات';
          break;
        case 404:
          errorMessage = data?.message || 'لم يتم العثور على بيانات المستخدم';
          break;
        case 500:
          errorMessage = 'خطأ في الخادم - يرجى المحاولة لاحقاً';
          break;
        default:
          errorMessage = data?.message || `خطأ غير متوقع (${response.status})`;
      }

      throw new ProfileError(errorMessage, response.status);
    }

    // Validate response structure
    if (data.status !== 'success') {
      throw new ProfileError(data.message || 'فشل في جلب بيانات الملف الشخصي');
    }

    // Handle both response structures:
    // 1. { status, data: { user } } - expected structure
    // 2. { status, message, user } - actual API structure
    let userData;
    if (data.data && data.data.user) {
      userData = data.data.user;
    } else if (data.user) {
      userData = data.user;
    } else {
      throw new ProfileError('استجابة الخادم غير صحيحة');
    }

    console.log('✅ Profile fetched successfully!');
    console.log('👤 User data:', userData);
    
    // Update user data in localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('user_data', JSON.stringify(userData));
      console.log('💾 Profile data updated in localStorage');
    }
    
    // Return in expected format
    return {
      status: data.status,
      data: {
        user: userData
      }
    };

  } catch (error: any) {
    console.error('❌ Profile fetch error:', error);
    
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new ProfileError('خطأ في الشبكة - يرجى التحقق من اتصال الإنترنت', 0, true);
    }
    
    if (error instanceof ProfileError) {
      throw error;
    }
    
    throw new ProfileError('حدث خطأ غير متوقع أثناء جلب البيانات');
  }
};

export const updateUserProfile = async (
  profileData: UpdateProfileData,
  token: string = getAuthToken() || ''
): Promise<UserProfileResponse> => {
  try {
    // Create FormData object
    const formData = new FormData();

    // Append only the fields that are provided
    if (profileData.firstName !== undefined) {
      formData.append('firstName', profileData.firstName);
    }

    if (profileData.lastName !== undefined) {
      formData.append('lastName', profileData.lastName);
    }

    if (profileData.phoneNumber !== undefined) {
      formData.append('phoneNumber', profileData.phoneNumber);
    }

    if (profileData.image) {
      formData.append('image', profileData.image);
    }

    // Make the API request
    const response = await fetch(`${Api}${API_ENDPOINTS.AUTH.UPDATE_PROFILE}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        // Note: Don't set Content-Type header when using FormData
        // The browser will set it automatically with the correct boundary
      },
      body: formData,
    });

    // Parse the response
    const data = await response.json();

    // Handle error responses
    if (!response.ok) {
      throw {
        status: data.status || 'error',
        message: data.message || 'Failed to update profile',
        errors: data.errors || [],
      } as ApiError;
    }

    return data as UserProfileResponse;
  } catch (error) {
    // Re-throw API errors
    if ((error as ApiError).status) {
      throw error;
    }

    // Handle network or other errors
    throw {
      status: 'error',
      message: error instanceof Error ? error.message : 'Network error occurred',
    } as ApiError;
  }
};

/**
 * Update user profile with validation
 * @param profileData - Object containing profile fields to update
 * @param token - JWT authentication token
 * @returns Promise with updated user data
 */
export const updateUserProfileWithValidation = async (
  profileData: UpdateProfileData,
  token: string
): Promise<UserProfileResponse> => {
  // Validate phone number format if provided
  if (profileData.phoneNumber) {
    const cleanPhone = profileData.phoneNumber.replace(/[^\d+]/g, '');
    const isValidFormat = /^(\+201|01)\d{9}$/.test(cleanPhone);
    
    if (!isValidFormat) {
      throw {
        status: 'error',
        message: 'رقم الهاتف غير صحيح',
        errors: [{
          field: 'phoneNumber',
          message: 'يجب أن يبدأ رقم الهاتف بـ 01 أو +201 ويتكون من 11 رقماً'
        }]
      } as ApiError;
    }
  }

  // Validate image file if provided
  if (profileData.image) {
    const validImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!validImageTypes.includes(profileData.image.type)) {
      throw {
        status: 'error',
        message: 'نوع الملف غير مدعوم',
        errors: [{
          field: 'image',
          message: 'يجب أن تكون الصورة من نوع JPEG, PNG, GIF, أو WebP'
        }]
      } as ApiError;
    }

    if (profileData.image.size > maxSize) {
      throw {
        status: 'error',
        message: 'حجم الملف كبير جداً',
        errors: [{
          field: 'image',
          message: 'يجب أن لا يتجاوز حجم الصورة 5 ميجابايت'
        }]
      } as ApiError;
    }
  }

  return updateUserProfile(profileData, token);
};

// Update Password
export const updatePassword = async (passwordData: UpdatePasswordData): Promise<{ status: string; message: string }> => {
  console.log('🚀 Updating password...');

  try {
    const headers = getAuthHeaders();
    
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.AUTH.UPDATE_PASSWORD}`, {
      method: 'PATCH',
      headers: headers,
      body: JSON.stringify(passwordData),
    });

    console.log('📥 Password update response status:', response.status);

    let data;
    try {
      data = await response.json();
      console.log('📄 Password update response:', data);
    } catch (parseError) {
      console.error('❌ Failed to parse response:', parseError);
      throw new ProfileError('استجابة الخادم غير صحيحة');
    }

    if (!response.ok) {
      let errorMessage = 'فشل في تحديث كلمة المرور';
      
      switch (response.status) {
        case 400:
          errorMessage = data?.message || 'كلمة المرور الحالية غير صحيحة';
          break;
        case 401:
          errorMessage = data?.message || 'انتهت صلاحية الجلسة. يرجى تسجيل الدخول مرة أخرى.';
          break;
        case 422:
          errorMessage = data?.message || 'كلمة المرور الجديدة غير صالحة';
          break;
        default:
          errorMessage = data?.message || `خطأ في تحديث كلمة المرور (${response.status})`;
      }

      throw new ProfileError(errorMessage, response.status);
    }

    console.log('✅ Password updated successfully!');
    return data;

  } catch (error: any) {
    console.error('❌ Password update error:', error);
    
    if (error instanceof ProfileError) {
      throw error;
    }
    
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new ProfileError('خطأ في الشبكة - يرجى التحقق من اتصال الإنترنت', 0, true);
    }
    
    throw new ProfileError('حدث خطأ غير متوقع أثناء تحديث كلمة المرور');
  }
};

// Add Address
export const addAddress = async (addressData: AddAddressData): Promise<ProfileResponse> => {
  console.log('🚀 Adding new address...');
  console.log('📤 Address data:', addressData);

  try {
    const headers = getAuthHeaders();
    
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.USERS.ADDRESSES}`, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(addressData),
    });

    console.log('📥 Add address response status:', response.status);

    let data;
    try {
      data = await response.json();
      console.log('📄 Add address response:', data);
    } catch (parseError) {
      throw new ProfileError('استجابة الخادم غير صحيحة');
    }

    if (!response.ok) {
      let errorMessage = 'فشل في إضافة العنوان';
      
      switch (response.status) {
        case 400:
          errorMessage = data?.message || 'بيانات العنوان غير صحيحة';
          break;
        case 401:
          errorMessage = data?.message || 'انتهت صلاحية الجلسة';
          break;
        default:
          errorMessage = data?.message || `خطأ في إضافة العنوان (${response.status})`;
      }

      throw new ProfileError(errorMessage, response.status);
    }

    console.log('✅ Address added successfully!');
    
    // Update user data in localStorage
    if (data.data && data.data.user && typeof window !== 'undefined') {
      localStorage.setItem('user_data', JSON.stringify(data.data.user));
    }
    
    return data;

  } catch (error: any) {
    console.error('❌ Add address error:', error);
    
    if (error instanceof ProfileError) {
      throw error;
    }
    
    throw new ProfileError('حدث خطأ غير متوقع أثناء إضافة العنوان');
  }
};

// Update Address
export const updateAddress = async (addressData: UpdateAddressData): Promise<ProfileResponse> => {
  console.log('🚀 Updating address...');
  
  try {
    const headers = getAuthHeaders();
    
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.USERS.UPDATE_ADDRESS}`, {
      method: 'PATCH',
      headers: headers,
      body: JSON.stringify(addressData),
    });

    let data;
    try {
      data = await response.json();
    } catch (parseError) {
      throw new ProfileError('استجابة الخادم غير صحيحة');
    }

    if (!response.ok) {
      throw new ProfileError(data?.message || 'فشل في تحديث العنوان', response.status);
    }

    console.log('✅ Address updated successfully!');
    
    // Update localStorage
    if (data.data && data.data.user && typeof window !== 'undefined') {
      localStorage.setItem('user_data', JSON.stringify(data.data.user));
    }
    
    return data;

  } catch (error: any) {
    if (error instanceof ProfileError) {
      throw error;
    }
    throw new ProfileError('حدث خطأ غير متوقع أثناء تحديث العنوان');
  }
};

// Delete Address
export const deleteAddress = async (addressId: string): Promise<ProfileResponse> => {
  console.log('🚀 Deleting address...');
  
  try {
    const headers = getAuthHeaders();
    
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.USERS.DELETE_ADDRESS}`, {
      method: 'DELETE',
      headers: headers,
      body: JSON.stringify({ addressId }),
    });

    let data;
    try {
      data = await response.json();
    } catch (parseError) {
      throw new ProfileError('استجابة الخادم غير صحيحة');
    }

    if (!response.ok) {
      throw new ProfileError(data?.message || 'فشل في حذف العنوان', response.status);
    }

    console.log('✅ Address deleted successfully!');
    
    // Update localStorage
    if (data.data && data.data.user && typeof window !== 'undefined') {
      localStorage.setItem('user_data', JSON.stringify(data.data.user));
    }
    
    return data;

  } catch (error: any) {
    if (error instanceof ProfileError) {
      throw error;
    }
    throw new ProfileError('حدث خطأ غير متوقع أثناء حذف العنوان');
  }
};

// Profile Service Class
export class ProfileService {
  /**
   * Get user profile
   */
  static async getProfile(): Promise<ProfileResponse> {
    return await getUserProfile();
  }

  /**
   * Update user profile
   */
  static async updateProfile(updateData: UpdateProfileData): Promise<UserProfileResponse> {
    return await updateUserProfile(updateData);
  }

  /**
   * Update password
   */
  static async updatePassword(passwordData: UpdatePasswordData): Promise<{ status: string; message: string }> {
    return await updatePassword(passwordData);
  }

  /**
   * Add new address
   */
  static async addAddress(addressData: AddAddressData): Promise<ProfileResponse> {
    return await addAddress(addressData);
  }

  /**
   * Update existing address
   */
  static async updateAddress(addressData: UpdateAddressData): Promise<ProfileResponse> {
    return await updateAddress(addressData);
  }

  /**
   * Delete address
   */
  static async deleteAddress(addressId: string): Promise<ProfileResponse> {
    return await deleteAddress(addressId);
  }

  /**
   * Check if user is authenticated
   */
  static isAuthenticated(): boolean {
    return getAuthToken() !== null;
  }
}

// Export utility functions
export {
  getUserProfile as getProfile,
  updateUserProfile as updateProfile,
  updatePassword as changePassword,
  addAddress as createAddress,
  updateAddress as editAddress,
  deleteAddress as removeAddress,
};

// Default export
export default ProfileService;
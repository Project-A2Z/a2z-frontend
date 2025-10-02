// services/address/address.ts
import { API_ENDPOINTS, Api } from './../api/endpoints';
import { UserStorage } from './../auth/login';

// Types
export interface AddressData {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  address: string;
  city: string;
  region: string;
  isDefault?: boolean;
}

export interface Address extends AddressData {
  _id: string;
  id?: string;
  createdAt?: string;
}

export interface AddAddressResponse {
  status: string;
  message: string;
  address: Address[];
}

export interface UpdateAddressData extends Partial<AddressData> {
  addressId: string;
}

export interface UpdateAddressResponse {
  status: string;
  message: string;
  address: Address[];
}

export interface DeleteAddressData {
  addressId: string;
}

export interface DeleteAddressResponse {
  status: string;
  message: string;
}

// Custom error class for address errors
export class AddressError extends Error {
  public statusCode?: number;
  public isNetworkError?: boolean;
  public errors?: Record<string, string>;

  constructor(
    message: string,
    statusCode?: number,
    isNetworkError = false,
    errors?: Record<string, string>
  ) {
    super(message);
    this.name = 'AddressError';
    this.statusCode = statusCode;
    this.isNetworkError = isNetworkError;
    this.errors = errors;
  }
}

// API Configuration
const API_BASE_URL = Api;

// Helper function to get auth headers
const getAuthHeaders = (): HeadersInit => {
  const token = UserStorage.getToken();
  
  if (!token) {
    throw new AddressError('لم يتم العثور على رمز المصادقة. يرجى تسجيل الدخول مرة أخرى.', 401);
  }

  return {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Authorization': `Bearer ${token}`,
  };
};

/**
 * Add a new address
 */
export const addAddress = async (addressData: AddressData): Promise<AddAddressResponse> => {
  console.log('🚀 Starting add address...');
  console.log('🔧 API Base URL:', API_BASE_URL);
  console.log('🔧 Add address endpoint:', API_ENDPOINTS.USERS.ADDRESSES);
  console.log('📤 Address data:', addressData);

  try {
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.USERS.ADDRESSES}`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(addressData),
    });

    console.log('📥 Response status:', response.status);

    // Parse response
    const data = await response.json();
    console.log('📄 Response data:', data);

    // If status is 200, just show success message and return
    if (response.status === 200) {
      console.log('✅ Address added successfully!');
      alert(data.message || 'تم إضافة العنوان بنجاح');
      return data;
    }

    // Handle other status codes
    let errorMessage = 'فشل إضافة العنوان';
    
    switch (response.status) {
      case 400:
        errorMessage = data?.message || 'بيانات غير صحيحة - يرجى التحقق من المدخلات';
        break;
      case 401:
        errorMessage = 'غير مصرح - يرجى تسجيل الدخول مرة أخرى';
        break;
      case 403:
        errorMessage = data?.message || 'ليس لديك صلاحية للقيام بهذا الإجراء';
        break;
      case 404:
        errorMessage = data?.message || 'العنوان غير موجود';
        break;
      case 422:
        errorMessage = data?.message || 'فشل التحقق - يرجى التحقق من البيانات';
        break;
      case 500:
        errorMessage = 'خطأ في الخادم - يرجى المحاولة لاحقاً';
        break;
      default:
        errorMessage = data?.message || `خطأ غير متوقع (${response.status})`;
    }

    throw new AddressError(errorMessage, response.status, false, data?.errors);

  } catch (error: any) {
    console.error('❌ Add address error:', error);
    
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new AddressError('خطأ في الشبكة - يرجى التحقق من اتصال الإنترنت', 0, true);
    }
    
    if (error instanceof AddressError) {
      throw error;
    }
    
    throw new AddressError('حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.');
  }
};

/**
 * Update an existing address
 */
export const updateAddress = async (updateData: UpdateAddressData): Promise<UpdateAddressResponse> => {
  console.log('🚀 Starting update address...');
  console.log('🔧 Update address endpoint:', API_ENDPOINTS.USERS.UPDATE_ADDRESS);
  console.log('📤 Update data:', updateData);

  try {
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.USERS.UPDATE_ADDRESS}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(updateData),
    });

    console.log('📥 Response status:', response.status);

    // Parse response
    const data = await response.json();
    console.log('📄 Response data:', data);

    // If status is 200, just show success message and return
    if (response.status === 200) {
      console.log('✅ Address updated successfully!');
      alert(data.message || 'تم تحديث العنوان بنجاح');
      return data;
    }

    // Handle other status codes
    let errorMessage = 'فشل تحديث العنوان';
    
    switch (response.status) {
      case 400:
        errorMessage = data?.message || 'بيانات غير صحيحة - يرجى التحقق من المدخلات';
        break;
      case 401:
        errorMessage = 'غير مصرح - يرجى تسجيل الدخول مرة أخرى';
        break;
      case 403:
        errorMessage = data?.message || 'ليس لديك صلاحية للقيام بهذا الإجراء';
        break;
      case 404:
        errorMessage = data?.message || 'العنوان غير موجود';
        break;
      case 422:
        errorMessage = data?.message || 'فشل التحقق - يرجى التحقق من البيانات';
        break;
      case 500:
        errorMessage = 'خطأ في الخادم - يرجى المحاولة لاحقاً';
        break;
      default:
        errorMessage = data?.message || `خطأ غير متوقع (${response.status})`;
    }

    throw new AddressError(errorMessage, response.status, false, data?.errors);

  } catch (error: any) {
    console.error('❌ Update address error:', error);
    
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new AddressError('خطأ في الشبكة - يرجى التحقق من اتصال الإنترنت', 0, true);
    }
    
    if (error instanceof AddressError) {
      throw error;
    }
    
    throw new AddressError('حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.');
  }
};

/**
 * Delete an address
 */
export const deleteAddress = async (deleteData: DeleteAddressData): Promise<DeleteAddressResponse> => {
  console.log('🚀 Starting delete address...');
  console.log('🔧 Delete address endpoint:', API_ENDPOINTS.USERS.DELETE_ADDRESS);
  console.log('📤 Delete data:', deleteData);

  try {
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.USERS.DELETE_ADDRESS}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
      body: JSON.stringify(deleteData),
    });

    console.log('📥 Response status:', response.status);

    // Parse response
    const data = await response.json();
    console.log('📄 Response data:', data);

    // If status is 200, just show success message and return
    if (response.status === 200) {
      console.log('✅ Address deleted successfully!');
      alert(data.message || 'تم حذف العنوان بنجاح');
      return data;
    }

    // Handle other status codes
    let errorMessage = 'فشل حذف العنوان';
    
    switch (response.status) {
      case 400:
        errorMessage = data?.message || 'بيانات غير صحيحة';
        break;
      case 401:
        errorMessage = 'غير مصرح - يرجى تسجيل الدخول مرة أخرى';
        break;
      case 403:
        errorMessage = data?.message || 'ليس لديك صلاحية للقيام بهذا الإجراء';
        break;
      case 404:
        errorMessage = data?.message || 'العنوان غير موجود';
        break;
      case 500:
        errorMessage = 'خطأ في الخادم - يرجى المحاولة لاحقاً';
        break;
      default:
        errorMessage = data?.message || `خطأ غير متوقع (${response.status})`;
    }

    throw new AddressError(errorMessage, response.status);

  } catch (error: any) {
    console.error('❌ Delete address error:', error);
    
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new AddressError('خطأ في الشبكة - يرجى التحقق من اتصال الإنترنت', 0, true);
    }
    
    if (error instanceof AddressError) {
      throw error;
    }
    
    throw new AddressError('حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.');
  }
};

/**
 * Address Service Class
 */
export class AddressService {
  /**
   * Add a new address
   */
  static async addAddress(addressData: AddressData): Promise<AddAddressResponse> {
    return await addAddress(addressData);
  }

  /**
   * Update an existing address
   */
  static async updateAddress(updateData: UpdateAddressData): Promise<UpdateAddressResponse> {
    return await updateAddress(updateData);
  }

  /**
   * Delete an address
   */
  static async deleteAddress(addressId: string): Promise<DeleteAddressResponse> {
    return await deleteAddress({ addressId });
  }

  /**
   * Check if user is authenticated before making requests
   */
  static isAuthenticated(): boolean {
    return UserStorage.isLoggedIn();
  }
}

// Export convenience functions
export default {
  addAddress,
  updateAddress,
  deleteAddress,
  AddressService,
};
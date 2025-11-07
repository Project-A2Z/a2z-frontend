// services/address/address.ts
import { API_ENDPOINTS, Api } from './../api/endpoints';
import { UserStorage } from './../auth/login';
import AlertHandler from './../Utils/alertHandler';


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

// Local Storage Keys
const STORAGE_KEYS = {
  ADDRESSES: 'user_addresses',
  CACHE_TIMESTAMP: 'addresses_cache_timestamp',
  CACHE_DURATION: 5 * 60 * 1000, // 5 minutes in milliseconds
};

// Address Cache Management
export class AddressCache {
  /**
   * Save addresses to local storage
   */
  static save(addresses: Address[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.ADDRESSES, JSON.stringify(addresses));
      localStorage.setItem(STORAGE_KEYS.CACHE_TIMESTAMP, Date.now().toString());
      //console.log('💾 Addresses saved to cache:', addresses.length);
    } catch (error) {
      console.error('❌ Error saving addresses to cache:', error);
    }
  }

  /**
   * Get addresses from local storage
   */
  static get(): Address[] | null {
    try {
      const cached = localStorage.getItem(STORAGE_KEYS.ADDRESSES);
      if (!cached) {
        //console.log('📭 No cached addresses found');
        return null;
      }

      const addresses = JSON.parse(cached) as Address[];
      //console.log('📬 Retrieved cached addresses:', addresses.length);
      return addresses;
    } catch (error) {
      console.error('❌ Error reading addresses from cache:', error);
      return null;
    }
  }

  /**
   * Check if cache is still valid
   */
  static isValid(): boolean {
    try {
      const timestamp = localStorage.getItem(STORAGE_KEYS.CACHE_TIMESTAMP);
      if (!timestamp) return false;

      const cacheAge = Date.now() - parseInt(timestamp);
      const isValid = cacheAge < STORAGE_KEYS.CACHE_DURATION;
      
      //console.log(`🕐 Cache age: ${Math.round(cacheAge / 1000)}s, Valid: ${isValid}`);
      return isValid;
    } catch (error) {
      console.error('❌ Error checking cache validity:', error);
      return false;
    }
  }

  /**
   * Clear addresses from cache
   */
  static clear(): void {
    try {
      localStorage.removeItem(STORAGE_KEYS.ADDRESSES);
      localStorage.removeItem(STORAGE_KEYS.CACHE_TIMESTAMP);
      //console.log('🗑️ Address cache cleared');
    } catch (error) {
      console.error('❌ Error clearing cache:', error);
    }
  }

  /**
   * Invalidate cache (clear timestamp only)
   */
  static invalidate(): void {
    try {
      localStorage.removeItem(STORAGE_KEYS.CACHE_TIMESTAMP);
      //console.log('⚠️ Address cache invalidated');
    } catch (error) {
      console.error('❌ Error invalidating cache:', error);
    }
  }
}

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
 * Get all addresses (with caching)
 */
export const getAddresses = async (forceRefresh = false): Promise<Address[]> => {
  //console.log('🚀 Getting addresses (forceRefresh:', forceRefresh, ')');

  // Check cache first (unless force refresh)
  if (!forceRefresh && AddressCache.isValid()) {
    const cachedAddresses = AddressCache.get();
    if (cachedAddresses) {
      //console.log('✅ Returning cached addresses');
      return cachedAddresses;
    }
  }

  // Fetch from API
  try {
    //console.log('🌐 Fetching addresses from API...');
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.USERS.ADDRESSES}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    //console.log('📥 Response status:', response.status);
    const data = await response.json();

    if (response.status === 200) {
      const addresses = data.address || [];
      AddressCache.save(addresses);
      return addresses;
    }

    throw new AddressError(
      data?.message || 'فشل تحميل العناوين',
      response.status
    );
  } catch (error: any) {
    console.error('❌ Get addresses error:', error);
    
    // If network error, try to return cached data even if expired
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      const cachedAddresses = AddressCache.get();
      if (cachedAddresses) {
        //console.log('⚠️ Network error, returning stale cached addresses');
        return cachedAddresses;
      }
      throw new AddressError('خطأ في الشبكة - يرجى التحقق من اتصال الإنترنت', 0, true);
    }
    
    if (error instanceof AddressError) {
      throw error;
    }
    
    throw new AddressError('حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.');
  }
};

/**
 * Add a new address
 */
export const addAddress = async (addressData: AddressData): Promise<AddAddressResponse> => {
  //console.log('🚀 Starting add address...');
  //console.log('📤 Address data:', addressData);

  try {
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.USERS.ADDRESSES}`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(addressData),
    });

    //console.log('📥 Response status:', response.status);
    const data = await response.json();

    if (response.status === 200) {
      //console.log('✅ Address added successfully!');
      AlertHandler.success(data.message || 'تم إضافة العنوان بنجاح');
      
      // Update cache with new addresses
      if (data.address) {
        AddressCache.save(data.address);
      } else {
        // Invalidate cache to force refresh on next get
        AddressCache.invalidate();
      }
      
      return data;
    }

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
  //console.log('🚀 Starting update address...');
  //console.log('📤 Update data:', updateData);

  try {
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.USERS.UPDATE_ADDRESS}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(updateData),
    });

    //console.log('📥 Response status:', response.status);
    const data = await response.json();

    if (response.status === 200) {
      //console.log('✅ Address updated successfully!');
      AlertHandler.success(data.message || 'تم تحديث العنوان بنجاح');
      
      // Update cache with updated addresses
      if (data.address) {
        AddressCache.save(data.address);
      } else {
        AddressCache.invalidate();
      }
      
      return data;
    }

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
  //console.log('🚀 Starting delete address...');
  //console.log('📤 Delete data:', deleteData);

  try {
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.USERS.DELETE_ADDRESS}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
      body: JSON.stringify(deleteData),
    });

    //console.log('📥 Response status:', response.status);
    const data = await response.json();

    if (response.status === 200) {
      //console.log('✅ Address deleted successfully!');
      AlertHandler.success(data.message || 'تم حذف العنوان بنجاح');
      
      // Invalidate cache after deletion
      AddressCache.invalidate();
      
      return data;
    }

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
   * Get all addresses (with caching)
   */
  static async getAddresses(forceRefresh = false): Promise<Address[]> {
    return await getAddresses(forceRefresh);
  }

  /**
   * Get addresses from cache only (synchronous)
   */
  static getCachedAddresses(): Address[] | null {
    return AddressCache.get();
  }

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
   * Get a specific address by ID
   */
  static async getAddressById(addressId: string): Promise<Address | null> {
    const addresses = await this.getAddresses();
    return addresses.find(addr => addr._id === addressId || addr.id === addressId) || null;
  }

  /**
   * Get default address
   */
  static async getDefaultAddress(): Promise<Address | null> {
    const addresses = await this.getAddresses();
    return addresses.find(addr => addr.isDefault) || null;
  }

  /**
   * Clear address cache
   */
  static clearCache(): void {
    AddressCache.clear();
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
  getAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
  AddressService,
  AddressCache,
};
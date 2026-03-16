import { Api, buildUrl } from './../api/endpoints';
import { getLocale , getLangQueryParam } from '../api/language';


// Types
export type PaymentStatus = 'Paid' | 'Deposit' | 'Refunded' | 'Cancelled';
export type PaymentWay = 'Cash' | 'Online';
export type PaymentWith = 'InstaPay' | 'Vodafone' ;
export type OrderStatus = string;

export interface CreateOrderData {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  address: string;
  city: string;
  region: string;
  paymentStatus: PaymentStatus;
  paymentWay: PaymentWay;
  paymentWith?: PaymentWith;
  NumOperation?: string;
  image?: File;
  // ADD THESE - Backend needs to know what products are in the order
  cartId?: string; // If backend uses cart ID
  products?: Array<{id: string; quantity: number}>; // Or product details
}

export interface Address {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  address: string;
  city: string;
  region: string;
}

export interface PaymentDetails {
  _id: string;
  userId: string;
  orderId: string;
  paymentStatus: PaymentStatus;
  paymentWay: PaymentWay;
  paymentWith?: PaymentWith;
  totalPrice: number;
  image?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  _id: string;
  productId: string;
  quantity: number;
  price: number;
}

export interface Cart {
  _id: string;
  userId: string;
  totalQty: number;
  totalPrice: number;
  items: CartItem[];
}

export interface Order {
  _id: string;
  cartId: Cart;
  userId: string;
  orderId: string;
  status: OrderStatus;
  address: Address;
  deliveryPrice: number;
  deliveryDate: string;
  paymentDetails: PaymentDetails;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrderResponse {
  status: string;
  message: string;
  data: Order;
}

export interface OrderError {
  status: string;
  message: string;
  errors?: Record<string, string>;
}

// Validation helper
class OrderValidator {
  private static readonly EGYPTIAN_PHONE_REGEX = /^01[0125][0-9]{8}$/;
  
  static validatePhoneNumber(phone: string): boolean {
    return this.EGYPTIAN_PHONE_REGEX.test(phone);
  }

  static validatePaymentStatus(status: string): status is PaymentStatus {
    return ['Paid', 'Deposit', 'Refunded', 'Cancelled'].includes(status);
  }

  static validatePaymentWay(way: string): way is PaymentWay {
    return ['Cash', 'Online'].includes(way);
  }

  static validatePaymentWith(paymentWith: string): paymentWith is PaymentWith {
    return ['InstaPay', 'Vodafone'].includes(paymentWith);
  }

  static validate(data: CreateOrderData): string[] {
    const errors: string[] = [];

    // Required fields
    if (!data.firstName?.trim()) errors.push('First name is required');
    if (!data.lastName?.trim()) errors.push('Last name is required');
    if (!data.phoneNumber?.trim()) errors.push('Phone number is required');
    if (!data.address?.trim()) errors.push('Address is required');
    if (!data.city?.trim()) errors.push('City is required');
    if (!data.region?.trim()) errors.push('Region is required');
    if (!data.paymentStatus) errors.push('Payment status is required');
    if (!data.paymentWay) errors.push('Payment way is required');

    // Phone number format
    if (data.phoneNumber && !this.validatePhoneNumber(data.phoneNumber)) {
      errors.push('Phone number must be in Egyptian format (01XXXXXXXXX)');
    }

    // Payment status validation
    if (data.paymentStatus && !this.validatePaymentStatus(data.paymentStatus)) {
      errors.push('Payment status must be one of: paid, deposit, refunded, cancelled');
    }

    // Payment way validation
    if (data.paymentWay && !this.validatePaymentWay(data.paymentWay)) {
      errors.push('Payment way must be one of: cash, online');
    }

    // Payment with validation for online payments
    if (data.paymentWay === 'Online') {
      if (!data.paymentWith) {
        errors.push('Payment with is required for online payments');
      } else if (!this.validatePaymentWith(data.paymentWith)) {
        errors.push('Payment with must be one of: InstaPay, Vodafone');
      }
    }

    return errors;
  }
}

// File processing helper
class FileProcessor {
  /**
   * Convert File to Blob if needed and ensure proper MIME type
   */
  static async processImageFile(file: File): Promise<Blob> {
    return new Promise((resolve, reject) => {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        reject(new Error('File must be an image'));
        return;
      }

      // Validate file size (5MB limit)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        reject(new Error('File size must be less than 5MB'));
        return;
      }

      // Read file and create a new Blob to ensure it's properly formatted
      const reader = new FileReader();
      
      reader.onload = (e) => {
        if (!e.target?.result) {
          reject(new Error('Failed to read file'));
          return;
        }

        // Create a new Blob from the ArrayBuffer
        const arrayBuffer = e.target.result as ArrayBuffer;
        const blob = new Blob([arrayBuffer], { type: file.type });
        
        resolve(blob);
      };

      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };

      reader.readAsArrayBuffer(file);
    });
  }
}

// Cart Service Helper - to get current cart ID
class CartHelper {
  /**
   * Get the current user's cart ID from localStorage or API
   */
  static getCartId(): string | null {
    // Try to get from localStorage first
    const cartData = localStorage.getItem('cart');
    if (cartData) {
      try {
        const cart = JSON.parse(cartData);
        return cart._id || cart.id || null;
      } catch (e) {
        console.error('Failed to parse cart data:', e);
      }
    }
    return null;
  }

  /**
   * Get cart ID from API
   */
  static async fetchCartId(token: string): Promise<string | null> {
    const locale = getLocale();
    const langQuery = getLangQueryParam(locale);
    const url = buildUrl(`${Api}/cart${langQuery}`);
    try {
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        return data.data?._id || data.data?.id || null;
      }
    } catch (e) {
      console.error('Failed to fetch cart ID:', e);
    }
    return null;
  }
}

// Order Service
export class OrderService {
  private baseUrl: string;
  private token: string | null = null;

  constructor(baseUrl: string = Api) {
    this.baseUrl = baseUrl;
  }

  setToken(token: string): void {
    this.token = token;
  }

  private getHeaders(isMultipart: boolean = false): HeadersInit {
    const headers: HeadersInit = {};
    
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    
    // Don't set Content-Type for multipart/form-data
    // The browser will set it automatically with the boundary
    if (!isMultipart) {
      headers['Content-Type'] = 'application/json';
    }
    
    return headers;
  }

  private async createFormData(data: CreateOrderData): Promise<FormData> {
    const formData = new FormData();

    // Append text fields
    formData.append('firstName', data.firstName);
    formData.append('lastName', data.lastName);
    formData.append('phoneNumber', data.phoneNumber);
    formData.append('address', data.address);
    formData.append('city', data.city);
    formData.append('region', data.region);
    formData.append('paymentStatus', data.paymentStatus);
    formData.append('paymentWay', data.paymentWay);

    if (data.paymentWith) {
      formData.append('paymentWith', data.paymentWith);
    }

    if (data.NumOperation) {
      formData.append('NumOperation', data.NumOperation);
    }

    // IMPORTANT: Add cart ID if available
    if (data.cartId) {
      formData.append('cartId', data.cartId);
      //console.log('✅ Cart ID added to FormData:', data.cartId);
    } else {
      // Try to get cart ID if not provided
      const cartId = CartHelper.getCartId();
      if (cartId) {
        formData.append('cartId', cartId);
        //console.log('✅ Cart ID retrieved and added to FormData:', cartId);
      } else if (this.token) {
        // Last resort: try to fetch from API
        const fetchedCartId = await CartHelper.fetchCartId(this.token);
        if (fetchedCartId) {
          formData.append('cartId', fetchedCartId);
          //console.log('✅ Cart ID fetched from API and added to FormData:', fetchedCartId);
        } else {
          console.warn('⚠️ No cart ID available - this may cause errors');
        }
      }
    }

    // If products array is provided (alternative to cartId)
    if (data.products && data.products.length > 0) {
      formData.append('products', JSON.stringify(data.products));
      //console.log('✅ Products added to FormData:', data.products);
    }

    // Process and append image file if present
    if (data.image) {
      try {
        //console.log('📸 Processing image file:', {
        //   name: data.image.name,
        //   type: data.image.type,
        //   size: data.image.size
        // });

        // Process the file to ensure it's a proper Blob
        const processedBlob = await FileProcessor.processImageFile(data.image);
        
        // Append with explicit filename and MIME type
        formData.append('image', processedBlob, data.image.name);
        
        //console.log('✅ Image processed and added to FormData');
      } catch (error) {
        console.error('❌ Error processing image:', error);
        throw new Error('Failed to process image file');
      }
    }

    return formData;
  }

  async createOrder(data: CreateOrderData): Promise<CreateOrderResponse> {
    //console.log('📦 CreateOrder called with data:', {
    //   ...data,
    //   image: data.image ? {
    //     name: data.image.name,
    //     type: data.image.type,
    //     size: data.image.size
    //   } : undefined
    // });

    // Client-side validation
    const validationErrors = OrderValidator.validate(data);
    if (validationErrors.length > 0) {
      throw new Error(`Validation failed: ${validationErrors.join(', ')}`);
    }

    if (!this.token) {
      throw new Error('Authentication required. Please login first.');
    }

     const locale = getLocale();
    const langQuery = getLangQueryParam(locale);
   

    // Create FormData with processed image and cart data
    const formData = await this.createFormData(data);
    const url = `${this.baseUrl}/orders${langQuery}`;

    // Log FormData contents (for debugging)
    //console.log('📋 FormData contents:');
    for (let [key, value] of formData.entries()) {
      // if (value instanceof Blob) {
      //   //console.log(`${key}:`, {
      //     type: value.type,
      //   //   size: value.size,
      //   //   name: (value as File).name || 'blob'
      //   // });
      // } else {
      //   //console.log(`${key}:`, value);
      // }
    }

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: this.getHeaders(true), // true = multipart
        body: formData,
      });

      const result = await response.json();
      //console.log('📬 Server response:', result);

      if (!response.ok) {
        throw new Error(result.message || `HTTP error! status: ${response.status}`);
      }

      return result as CreateOrderResponse;
    } catch (error) {
      console.error('❌ Create order error:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to create order. Please try again.');
    }
  }

  async getUserOrders(): Promise<any> {
     const locale = getLocale();
    const langQuery = getLangQueryParam(locale);
    
    if (!this.token) {
      throw new Error('Authentication required. Please login first.');
    }

    const url = `${this.baseUrl}/orders/user${langQuery}`;

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || `HTTP error! status: ${response.status}`);
      }

      return result;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to fetch user orders. Please try again.');
    }
  }

  async getOrderDetails(orderId: string): Promise<any> {
      const locale = getLocale();
    const langQuery = getLangQueryParam(locale);
    if (!this.token) {
      throw new Error('Authentication required. Please login first.');
    }

    const url = `${this.baseUrl}/orders/${orderId}${langQuery}`;

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || `HTTP error! status: ${response.status}`);
      }

      return result;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to fetch order details. Please try again.');
    }
  }
}

// Export singleton instance
export const orderService = new OrderService();
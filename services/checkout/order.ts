import { Api, buildUrl } from './../api/endpoints';


// Types
export type PaymentStatus = 'paid' | 'deposit' | 'refunded' | 'cancelled';
export type PaymentWay = 'cash' | 'online';
export type PaymentWith = 'instaPay' | 'vodafone';
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
    return ['paid', 'deposit', 'refunded', 'cancelled'].includes(status);
  }

  static validatePaymentWay(way: string): way is PaymentWay {
    return ['cash', 'online'].includes(way);
  }

  static validatePaymentWith(paymentWith: string): paymentWith is PaymentWith {
    return ['instaPay', 'vodafone'].includes(paymentWith);
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
    if (data.paymentWay === 'online') {
      if (!data.paymentWith) {
        errors.push('Payment with is required for online payments');
      } else if (!this.validatePaymentWith(data.paymentWith)) {
        errors.push('Payment with must be one of: instaPay, vodafone');
      }
    }

    return errors;
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

  private createFormData(data: CreateOrderData): FormData {
    const formData = new FormData();

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

    if (data.image) {
      formData.append('image', data.image);
    }

    return formData;
  }

  async createOrder(data: CreateOrderData): Promise<CreateOrderResponse> {
    // Client-side validation
    const validationErrors = OrderValidator.validate(data);
    if (validationErrors.length > 0) {
      throw new Error(`Validation failed: ${validationErrors.join(', ')}`);
    }

    if (!this.token) {
      throw new Error('Authentication required. Please login first.');
    }

    const formData = this.createFormData(data);
    const url = `${this.baseUrl}/orders`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: this.getHeaders(true),
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || `HTTP error! status: ${response.status}`);
      }

      return result as CreateOrderResponse;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to create order. Please try again.');
    }
  }

  async getUserOrders(): Promise<any> {
    if (!this.token) {
      throw new Error('Authentication required. Please login first.');
    }

    const url = `${this.baseUrl}/orders/user`;

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
    if (!this.token) {
      throw new Error('Authentication required. Please login first.');
    }

    const url = `${this.baseUrl}/orders/${orderId}`;

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


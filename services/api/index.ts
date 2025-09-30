// Export all API services from a single entry point
export { default as apiClient } from './client';
export * as authService from './auth';
export * as productService from './products';
export * as cartService from './cart';
// Export other services as they are created

// Example usage:
// import { authService, productService } from '@/services/api';

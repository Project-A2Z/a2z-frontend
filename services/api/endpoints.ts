export const API_ENDPOINTS = {
  // Authentication endpoints
  AUTH: {
    LOGIN: '/users/login',
    LOGIN_SOCIAL:'/users/signWithSocial',
    REGISTER: '/users/signup',
    
    REFRESH_TOKEN: '/auth/refresh',

    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/users/ResetPassword',//PATCH
    VERIFY_EMAIL: '/users/OTPVerification',
    ACTIVE_CODE: '/app/v1/users/OTPResend',//POST

    PROFILE: '/users/user',//GET
    UPDATE_PROFILE: '/users/user',//PATCH
    UPDATE_PASSWORD: '/users/updatePassword',//PATCH
    
  },

  // User management
  USERS: {
    PROFILE: '/users/user',//GET
    UPDATE: '/users/user',//PATCH 'update user information in profile'
    ADDRESSES: '/users/address',//POST 'add new address'
    UPDATE_ADDRESS: '/users/address',//PATCH 'update address'
    DELETE_ADDRESS: '/users/address',//DELETE 'delete address'
    ORDERS: '/users/orders',
    ORDER_DETAILS: '/users/orders/:id',
    FAVORITES: '/users/favorites',
    ADD_FAVORITE: '/users/favorites/add',
    REMOVE_FAVORITE: '/users/favorites/:id',
  },

  // Products
  PRODUCTS: {
    LIST: '/products',
    FEATURED: '/products/featured',
    NEW_ARRIVALS: '/products/new-arrivals',
    BEST_SELLERS: '/products/best-sellers',
    SEARCH: '/products/search',
    BY_CATEGORY: '/products/category/:categoryId',
    BY_BRAND: '/products/brand/:brandId',
    DETAILS: '/products/:id',
    VARIATIONS: '/products/:id/variations',
    REVIEWS: '/products/:id/reviews',
    ADD_REVIEW: '/products/:id/reviews',
    RELATED: '/products/:id/related',
    SIMILAR: '/products/:id/similar',
  },

  // Categories
  CATEGORIES: {
    LIST: '/categories',
    TREE: '/categories/tree',
    DETAILS: '/categories/:id',
    PRODUCTS: '/categories/:id/products',
    SUB_CATEGORIES: '/categories/:id/subcategories',
  },

  // Brands
  BRANDS: {
    LIST: '/brands',
    DETAILS: '/brands/:id',
    PRODUCTS: '/brands/:id/products',
  },

  // Cart management
  CART: {
    GET: '/cart',
    ADD_ITEM: '/cart/add',
    UPDATE_ITEM: '/cart/update/:itemId',
    REMOVE_ITEM: '/cart/remove/:itemId',
    CLEAR: '/cart/clear',
    APPLY_COUPON: '/cart/apply-coupon',
    REMOVE_COUPON: '/cart/remove-coupon',
    ESTIMATE_SHIPPING: '/cart/estimate-shipping',
  },

  // Orders
  ORDERS: {
    CREATE: '/orders',
    LIST: '/orders',
    DETAILS: '/orders/:id',
    TRACK: '/orders/:id/track',
    CANCEL: '/orders/:id/cancel',
    RETURN: '/orders/:id/return',
    INVOICE: '/orders/:id/invoice',
  },

  // Checkout
  CHECKOUT: {
    INITIALIZE: '/checkout/initialize',
    SHIPPING_METHODS: '/checkout/shipping-methods',
    PAYMENT_METHODS: '/checkout/payment-methods',
    APPLY_COUPON: '/checkout/apply-coupon',
    REMOVE_COUPON: '/checkout/remove-coupon',
    PLACE_ORDER: '/checkout/place-order',
    VALIDATE: '/checkout/validate',
  },

  // Payment
  PAYMENTS: {
    PROCESS: '/payments/process',
    VERIFY: '/payments/verify',
    WEBHOOK: '/payments/webhook',
    METHODS: '/payments/methods',
  },

  // Shipping
  SHIPPING: {
    METHODS: '/shipping/methods',
    RATES: '/shipping/rates',
    TRACK: '/shipping/track/:trackingNumber',
  },

  // Coupons
  COUPONS: {
    VALIDATE: '/coupons/validate',
    APPLY: '/coupons/apply',
  },

  // Reviews and ratings
  REVIEWS: {
    LIST: '/reviews',
    CREATE: '/reviews',
    UPDATE: '/reviews/:id',
    DELETE: '/reviews/:id',
    BY_PRODUCT: '/reviews/product/:productId',
    BY_USER: '/reviews/user/:userId',
  },

  // Wishlist/Favorites
  WISHLIST: {
    GET: '/wishlist',
    ADD: '/wishlist/add',
    REMOVE: '/wishlist/remove/:id',
    MOVE_TO_CART: '/wishlist/move-to-cart/:id',
  },

  // Search
  SEARCH: {
    PRODUCTS: '/search/products',
    SUGGESTIONS: '/search/suggestions',
    RECENT: '/search/recent',
    POPULAR: '/search/popular',
  },

  // Notifications
  NOTIFICATIONS: {
    LIST: '/notifications',
    MARK_READ: '/notifications/:id/read',
    MARK_ALL_READ: '/notifications/mark-all-read',
    DELETE: '/notifications/:id',
    SETTINGS: '/notifications/settings',
  },

  // Support
  SUPPORT: {
    TICKETS: '/support/tickets',
    CREATE_TICKET: '/support/tickets/create',
    TICKET_DETAILS: '/support/tickets/:id',
    ADD_MESSAGE: '/support/tickets/:id/messages',
    CLOSE_TICKET: '/support/tickets/:id/close',
  },

  // Analytics and tracking
  ANALYTICS: {
    PAGE_VIEW: '/analytics/page-view',
    EVENT: '/analytics/event',
    USER_BEHAVIOR: '/analytics/user-behavior',
  },

  // File uploads
  UPLOADS: {
    IMAGE: '/uploads/image',
    DOCUMENT: '/uploads/document',
    AVATAR: '/uploads/avatar',
  },

  // System
  SYSTEM: {
    HEALTH: '/system/health',
    VERSION: '/system/version',
    CONFIG: '/system/config',
  },
} as const;

// Helper function to build dynamic URLs
export const buildUrl = (endpoint: string, params: Record<string, string | number> = {}): string => {
  let url = endpoint;
  
  Object.entries(params).forEach(([key, value]) => {
    url = url.replace(`:${key}`, String(value));
  });
  
  return url;
};

export const Api = 'https://a2z-backend.fly.dev/app/v1';

export type ApiEndpoint = typeof API_ENDPOINTS;
export type EndpointPath = string; 

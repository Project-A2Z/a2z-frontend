import axios from 'axios';
import {Api ,  API_ENDPOINTS } from './endpoints';

// Fallback to production backend if env is not set
const BASE_URL =Api ?? 'https://a2z-backend.fly.dev/app/v1';

const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 15000, // 15 second timeout to prevent hanging
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Public endpoints that don't require authentication
const PUBLIC_ENDPOINTS = [
  '/products',
  '/categories',
  '/brands',
  // Add other public endpoints here
];

// Check if endpoint is public
const isPublicEndpoint = (url?: string): boolean => {
  if (!url) return false;
  return PUBLIC_ENDPOINTS.some(endpoint => url.startsWith(endpoint));
};

// Enhanced request interceptor with timeout and error handling
apiClient.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers = config.headers ?? {};
      (config.headers as any)['Authorization'] = `Bearer ${token}`;
    }
  }

  // Default language: use existing if provided, else 'en'
  const urlHasLang = typeof config.url === 'string' && /[?&]lang=/.test(config.url);
  const params = new URLSearchParams((config.params as any) || {});
  if (!urlHasLang && !params.has('lang')) {
    params.set('lang', 'en');
    config.params = params;
  }

  return config;
});

// Enhanced response interceptor with retry logic for network errors
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const config = error.config;

    // Retry logic for network errors
    if (config && !config._retry && (
      error.message?.includes('socket hang up') ||
      error.message?.includes('timeout') ||
      error.message?.includes('Network Error') ||
      error.code === 'ECONNABORTED' ||
      error.code === 'ECONNRESET' ||
      error.code === 'ERR_NETWORK'
    )) {
      config._retry = true;
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, 2000));
      return apiClient(config);
    }

    // Handle 401 unauthorized - but only for protected endpoints
    // In your response interceptor, change this section:
if (typeof window !== 'undefined' && error?.response?.status === 401) {
  const endpoint = config?.url;
  
  if (!isPublicEndpoint(endpoint)) {
    localStorage.removeItem('auth_token');
    
  }
}

    return Promise.reject(error);
  }
);

export default apiClient;
import axios from 'axios';

// Fallback to production backend if env is not set
const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'https://a2z-backend.fly.dev/app/v1';

const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 15000, // 15 second timeout to prevent hanging
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

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

  //console.log(`🌐 API Request: ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
  return config;
});

// Enhanced response interceptor with retry logic for network errors
apiClient.interceptors.response.use(
  (response) => {
    //console.log(`✅ API Response: ${response.status} ${response.config.method?.toUpperCase()} ${response.config.url}`);
    return response;
  },
  async (error) => {
    // Create a safe error object that can be properly serialized
    const safeError = {
      // Basic error info
      name: error?.name,
      message: error?.message,
      code: error?.code,
      stack: error?.stack,
      
      // Request info
      url: error?.config?.url,
      method: error?.config?.method,
      baseURL: error?.config?.baseURL,
      timeout: error?.config?.timeout,
      
      // Response info
      status: error?.response?.status,
      statusText: error?.response?.statusText,
      headers: error?.response?.headers,
      
      // Request/Response data (stringified to handle circular references)
      requestData: typeof error?.config?.data === 'string' 
        ? error.config.data 
        : JSON.stringify(error?.config?.data || {}),
      
      responseData: (() => {
        try {
          return JSON.stringify(error?.response?.data || {});
        } catch (e) {
          return 'Could not stringify response data';
        }
      })(),
      
      // Additional Axios specific properties
      isAxiosError: error?.isAxiosError,
      toJSON: undefined // Remove non-serializable function
    };

    // Don't log 409 (Conflict) and 404 (Not Found) as errors since they're handled gracefully
    const status = safeError.status;
    if (status !== 409 && status !== 404) {
      console.error('❌ API Error:', JSON.stringify(safeError, null, 2));
    } else {
      // Debug log instead of error for handled cases
      console.debug('API Notice:', {
        status: safeError.status,
        message: safeError.message,
        url: safeError.url,
        method: safeError.method
      });
    }

    // Retry logic for network errors (socket hang up, timeout, etc.)
    const config = error?.config;
    const shouldRetry = config && 
                       !config._retry && 
                       (error.message?.includes('socket hang up') ||
                        error.message?.includes('timeout') ||
                        error.code === 'ECONNABORTED');

    if (shouldRetry) {
      config._retry = true;
      
      // Log retry attempt
      console.log(`🔄 Retrying request (${config._retry}): ${config.method?.toUpperCase()} ${config.url}`);
      
      // Wait before retrying with exponential backoff
      const retryDelay = Math.min(1000 * Math.pow(2, config._retryCount || 0), 10000);
      config._retryCount = (config._retryCount || 0) + 1;
      
      await new Promise(resolve => setTimeout(resolve, retryDelay));
      return apiClient(config);
    }

    if (typeof window !== 'undefined' && error?.response?.status === 401) {
      try {
        // Optionally clear invalid token
        localStorage.removeItem('auth_token');
      } catch {}
      // Redirect to login
      window.location.href = '/login';
    }

    return Promise.reject(error);
  }
);

export default apiClient;
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
    
    const config = error.config;
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

      // console.log(`🔄 Retrying request: ${config.method?.toUpperCase()} ${config.url}`);
      return apiClient(config);
    }

    // Handle 401 unauthorized
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
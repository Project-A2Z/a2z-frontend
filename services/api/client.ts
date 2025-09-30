import axios from 'axios';

// Fallback to production backend if env is not set
const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'https://a2z-backend.fly.dev/app/v1';

const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Attach Authorization header from localStorage token and ensure lang query param
apiClient.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('authToken');
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

// Global 401 handler: redirect to /login
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (typeof window !== 'undefined' && error?.response?.status === 401) {
      try {
        // Optionally clear invalid token
        localStorage.removeItem('authToken');
      } catch {}
      // Redirect to login
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default apiClient;
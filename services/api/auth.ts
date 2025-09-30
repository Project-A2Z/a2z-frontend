import apiClient from './client';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData extends LoginCredentials {
  firstName: string;
  lastName: string;
  phoneNumber: string;
}

export interface ResetPasswordData {
  password: string;
  passwordConfirm: string;
}

export const authService = {
  async login(credentials: LoginCredentials) {
    const response = await apiClient.post('https://a2z-backend.fly.dev/app/v1/users/login', credentials);
    if (typeof window !== 'undefined' && response.data.token) {
      localStorage.setItem('authToken', response.data.token);
    }
    return response.data;
  },

  async register(userData: RegisterData) {
    const response = await apiClient.post('https://a2z-backend.fly.dev/app/v1/users/signup', userData);
    return response.data;
  },

  async logout() {
    try {
      await apiClient.post('https://a2z-backend.fly.dev/app/v1/users/logout');
    } finally {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('authToken');
      }
    }
  },

  async getCurrentUser() {
    const response = await apiClient.get('https://a2z-backend.fly.dev/app/v1/users/me');
    return response.data;
  },

  async forgotPassword(email: string) {
    const response = await apiClient.post('https://a2z-backend.fly.dev/app/v1/users/forgetPassword?lang=en', { email });
    return response.data;
  },

  async verifyCode(code: string, email: string) {
    const response = await apiClient.post('https://a2z-backend.fly.dev/app/v1/users/verifyEmailCode', { code, email });
    return response.data;
  },

  async resetPassword(passwordData: ResetPasswordData) {
    const response = await apiClient.post('https://a2z-backend.fly.dev/app/v1/users/ResetPassword', passwordData);
    return response.data;
  }
};

export default authService;
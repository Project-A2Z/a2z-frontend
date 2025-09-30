// Utility functions for handling authentication state

export const isAuthenticated = (): boolean => {
  if (typeof window === 'undefined') return false;
  return !!localStorage.getItem('authToken');
};

export const getAuthToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('authToken');
};

export const setAuthToken = (token: string): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('authToken', token);
  }
};

export const removeAuthToken = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('authToken');
  }
};

// Check if the current user has a specific role
export const hasRole = (requiredRole: string, userRoles: string[] = []): boolean => {
  return userRoles.includes(requiredRole);
};

// Check if the current user has any of the required roles
export const hasAnyRole = (requiredRoles: string[], userRoles: string[] = []): boolean => {
  return requiredRoles.some(role => userRoles.includes(role));
};

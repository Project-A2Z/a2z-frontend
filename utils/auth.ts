// Save token to localStorage
export const saveAuthToken = (token: string): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('authToken', token);
};

// Check if user is authenticated
export const isAuthenticated = (): boolean => {
  if (typeof window === 'undefined') return false;
  return !!localStorage.getItem('authToken');
};

// Get the auth token
export const getAuthToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('authToken');
};

// Remove token (logout)
export const removeAuthToken = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('authToken');
};

// Example usage in a login function
export const handleLogin = async (username: string, password: string) => {
  try {
    // Your API call here
    const response = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    
    const data = await response.json();
    
    if (data.token) {
      saveAuthToken(data.token);
      return { success: true };
    }
    
    return { success: false, error: 'No token received' };
  } catch (error) {
    return { success: false, error: 'Login failed' };
  }
};

// Example usage in API calls with the token
export const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
  const token = getAuthToken();
  
  const headers = {
    ...options.headers,
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
  
  return fetch(url, { ...options, headers });
};
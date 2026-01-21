import apiClient from "../apiClient";

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await apiClient.post('/api/auth/login', credentials);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    return response.data;
  },

  async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    const response = await apiClient.post('/api/auth/register', {
      email: credentials.email,
      password: credentials.password
    });
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    return response.data;
  },

  async logout(): Promise<void> {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        // Call backend logout endpoint
        await apiClient.post('/api/auth/logout', { token });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Always remove token from localStorage
      localStorage.removeItem('token');
    }
  },

  async getCurrentUser(): Promise<any> {
    const response = await apiClient.get('/api/auth/me');
    return response.data;
  },

  async verifyToken(token: string): Promise<any> {
    const response = await apiClient.post('/api/auth/verify', { token });
    return response.data;
  },

  getStoredToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token');
    }
    return null;
  },
};

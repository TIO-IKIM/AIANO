import { apiClient } from './api';

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  username: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: {
    id: number;
    email: string;
    username: string;
  };
}

export class AuthApiService {
  private static instance: AuthApiService;

  private authToken: string | null = null;

  static getInstance(): AuthApiService {
    if (!AuthApiService.instance) {
      AuthApiService.instance = new AuthApiService();
    }
    return AuthApiService.instance;
  }

  setAuthToken(token: string) {
    this.authToken = token;
    // Also set the token in the API client
    apiClient.setAuthToken(token);
  }

  getAuthToken(): string | null {
    return this.authToken;
  }

  clearAuthToken() {
    this.authToken = null;
    apiClient.clearAuthToken();
  }

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await apiClient.login(credentials);
      this.setAuthToken(response.access_token);
      return response;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Login failed: ${errorMessage}`);
    }
  }

  async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    try {
      const response = await apiClient.register(credentials);
      this.setAuthToken(response.access_token);
      return response;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Registration failed: ${errorMessage}`);
    }
  }

  async logout(): Promise<void> {
    try {
      await apiClient.logout();
    } catch (error) {
      // Logout should always clear local state even if API call fails
      // Error is silently handled to ensure user can always logout
    } finally {
      this.clearAuthToken();
    }
  }

  isAuthenticated(): boolean {
    return !!this.authToken;
  }

  // Initialize auth token from localStorage on app start
  initializeFromStorage(): void {
    const storedToken = localStorage.getItem('auth_token');
    if (storedToken) {
      this.setAuthToken(storedToken);
    }
  }

  // Save auth token to localStorage
  saveToStorage(): void {
    if (this.authToken) {
      localStorage.setItem('auth_token', this.authToken);
    } else {
      localStorage.removeItem('auth_token');
    }
  }
}

export const authApiService = AuthApiService.getInstance();

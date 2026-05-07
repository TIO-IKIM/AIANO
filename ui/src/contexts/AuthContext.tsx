import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
  ReactNode,
} from 'react';

export interface User {
  id: number;
  email: string;
  username: string;
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
  updated_at: string | null;
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

interface AuthContextType {
  user: User | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (
    email: string,
    username: string,
    password: string
  ) => Promise<void>;
  logout: () => void;
  refreshAccessToken: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Get base URL and ensure HTTPS if page is served over HTTPS
const getApiBaseUrl = (): string => {
  const envUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
  
  // Runtime fix: If page is HTTPS and API URL is HTTP, upgrade to HTTPS
  if (
    typeof window !== 'undefined' &&
    window.location.protocol === 'https:' &&
    envUrl.startsWith('http://') &&
    !envUrl.includes('localhost')
  ) {
    const upgradedUrl = envUrl.replace('http://', 'https://');
    return upgradedUrl;
  }
  
  return envUrl;
};

const API_BASE_URL = getApiBaseUrl();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [tokens, setTokens] = useState<AuthTokens | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user && !!tokens;

  // Load auth state from localStorage on mount
  useEffect(() => {
    const loadAuthState = async () => {
      try {
        const storedTokens = localStorage.getItem('auth_tokens');
        if (storedTokens) {
          const parsedTokens = JSON.parse(storedTokens);
          setTokens(parsedTokens);

          // Verify token and get user info
          const response = await fetch(`${API_BASE_URL}/api/v1/auth/me`, {
            headers: {
              Authorization: `Bearer ${parsedTokens.access_token}`,
            },
          });

          if (response.ok) {
            const userData = await response.json();
            setUser(userData);
          } else {
            // Token is invalid, try to refresh
            await refreshAccessToken();
          }
        }
      } catch (error) {
        // Clear invalid tokens on load error
        localStorage.removeItem('auth_tokens');
        setTokens(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadAuthState();
  }, []);

  // Proactive token refresh - refresh tokens before they expire
  useEffect(() => {
    if (!tokens?.access_token) return;

    let refreshTimeout: NodeJS.Timeout;

    const scheduleTokenRefresh = () => {
      try {
        // Decode the JWT token to check expiration
        const tokenParts = tokens.access_token.split('.');
        if (tokenParts.length !== 3) return;

        const payload = JSON.parse(atob(tokenParts[1]));
        const exp = payload.exp * 1000; // Convert to milliseconds
        const now = Date.now();
        const timeUntilExpiry = exp - now;

        // Refresh token if it expires in less than 5 minutes (300,000 ms)
        if (timeUntilExpiry < 5 * 60 * 1000 && timeUntilExpiry > 0) {
          refreshTimeout = setTimeout(
            async () => {
              try {
                await refreshAccessToken();
              } catch (error) {
                // Don't logout on proactive refresh failure, let the next API call handle it
                // The error will be handled when the next API request is made
              }
            },
            Math.max(timeUntilExpiry - 2 * 60 * 1000, 0)
          ); // Refresh 2 minutes before expiry
        }
      } catch (error) {
        // Invalid token format, ignore and let next API call handle authentication
      }
    };

    scheduleTokenRefresh();

    return () => {
      if (refreshTimeout) {
        clearTimeout(refreshTimeout);
      }
    };
  }, [tokens?.access_token]);

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Login failed');
      }

      const tokenData = await response.json();
      setTokens(tokenData);
      localStorage.setItem('auth_tokens', JSON.stringify(tokenData));

      // Get user info
      const userResponse = await fetch(`${API_BASE_URL}/api/v1/auth/me`, {
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`,
        },
      });

      if (userResponse.ok) {
        const userData = await userResponse.json();
        setUser(userData);
      }
    } catch (error) {
      // Re-throw with improved error message if needed
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Login failed');
    }
  };

  const register = async (
    email: string,
    username: string,
    password: string
  ) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, username, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Registration failed');
      }

      await response.json();

      // Auto-login after registration
      await login(email, password);
    } catch (error) {
      // Re-throw with improved error message if needed
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Registration failed');
    }
  };

  const logout = async () => {
    try {
      // Call backend logout API if we have tokens
      if (tokens?.refresh_token) {
        await fetch(`${API_BASE_URL}/api/v1/auth/logout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ refresh_token: tokens.refresh_token }),
        });
      }
    } catch (error) {
      // Continue with local logout even if API call fails
      // Error is silently handled to ensure user can always logout
    } finally {
      // Always clear local state
      setUser(null);
      setTokens(null);
      localStorage.removeItem('auth_tokens');
    }
  };

  // Create a ref to logout function for use in event handlers
  const logoutRef = useRef(logout);
  logoutRef.current = logout;

  // Add a flag to prevent multiple simultaneous refresh attempts
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Listen for token changes from other parts of the app
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'auth_tokens' && e.newValue) {
        try {
          const newTokens = JSON.parse(e.newValue);
          if (newTokens.access_token !== tokens?.access_token) {
            setTokens(newTokens);
          }
        } catch (error) {
          // Invalid token format from storage event, ignore
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [tokens?.access_token]);

  // Listen for session expiration events from API client
  useEffect(() => {
    const handleSessionExpired = async (event: Event) => {
      const customEvent = event as CustomEvent<{ message?: string }>;
      const message =
        customEvent.detail?.message ||
        'Your session has expired. Please log in again.';

      // Logout user (clears tokens and user state)
      await logoutRef.current();

      // Show notification if possible (dispatch event for toast)
      window.dispatchEvent(
        new CustomEvent('show-toast', {
          detail: {
            type: 'warning',
            title: 'Session Expired',
            description: message,
          },
        })
      );

      // Redirect to login page
      const currentPath = window.location.pathname;
      if (!currentPath.startsWith('/auth/')) {
        window.location.href = `/auth/login?redirect=${encodeURIComponent(currentPath)}`;
      }
    };

    window.addEventListener('session-expired', handleSessionExpired);
    return () =>
      window.removeEventListener('session-expired', handleSessionExpired);
  }, []);

  const refreshAccessToken = async () => {
    if (!tokens?.refresh_token) {
      throw new Error('No refresh token available');
    }

    // Prevent multiple simultaneous refresh attempts
    if (isRefreshing) {
      // Wait for the current refresh to complete
      while (isRefreshing) {
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
      // Return the updated tokens after waiting
      try {
        const stored = localStorage.getItem('auth_tokens');
        if (stored) {
          return JSON.parse(stored);
        }
      } catch {
        // Invalid stored tokens, will throw error below
      }
      throw new Error('Token refresh in progress but no valid tokens found');
    }

    setIsRefreshing(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refresh_token: tokens.refresh_token }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        const errorMessage = `Token refresh failed: ${response.status} ${errorText}`;
        throw new Error(errorMessage);
      }

      const tokenData = await response.json();
      setTokens(tokenData);
      localStorage.setItem('auth_tokens', JSON.stringify(tokenData));
      return tokenData;
    } catch (error) {
      // Only logout if it's a real authentication error (401, 403), not a network error
      if (
        error instanceof Error &&
        (error.message.includes('401') ||
          error.message.includes('403') ||
          error.message.includes('Invalid refresh token'))
      ) {
        logout();
      }
      throw error;
    } finally {
      setIsRefreshing(false);
    }
  };

  const value: AuthContextType = {
    user,
    tokens,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
    refreshAccessToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

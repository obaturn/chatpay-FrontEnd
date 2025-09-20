'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiService } from './api';

interface User {
  _id: string;
  username: string;
  email: string;
  walletAddress?: string;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      // Clear any old mock tokens first
      clearInvalidTokens();

      const token = apiService.getToken();
      if (token) {
        try {
          // Validate token with backend
          const profile = await apiService.getProfile();
          if (profile.success && profile.user) {
            setUser(profile.user);
            console.log('Auto-login successful:', profile.user);
          } else {
            // Invalid token - clear it
            console.log('Token validation failed - clearing token');
            apiService.clearToken();
          }
        } catch (error: any) {
          console.error('Token validation failed:', error);
          // Clear invalid token
          console.log('Clearing invalid token from localStorage');
          apiService.clearToken();
        }
      }
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      console.log('Login attempt:', { email, password });
      const response = await apiService.login(email, password);
      console.log('Login response:', response);

      if (response.success && response.user) {
        setUser(response.user);
        console.log('Login successful, user set:', response.user);
      } else {
        throw new Error('Login failed');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      throw new Error(error.message || 'Login failed. Please check your credentials.');
    }
  };

  const register = async (username: string, email: string, password: string) => {
    try {
      console.log('Registration attempt:', { username, email });
      const response = await apiService.register(username, email, password);
      console.log('Registration response:', response);

      if (response.success && response.user) {
        setUser(response.user);
        console.log('Registration successful, user set:', response.user);
      } else {
        throw new Error('Registration failed');
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      throw new Error(error.message || 'Registration failed. Please try again.');
    }
  };

  const logout = () => {
    apiService.clearToken();
    setUser(null);
    // Also clear any other auth-related data
    localStorage.removeItem('authToken');
    console.log('Logged out and cleared all auth data');
  };

  // Clear any invalid tokens on app start
  const clearInvalidTokens = () => {
    const token = localStorage.getItem('authToken');
    if (token && token.startsWith('mock-jwt-token-')) {
      console.log('Clearing old mock token');
      localStorage.removeItem('authToken');
      apiService.clearToken();
    }
  };

  // Manual token clearing function (accessible from browser console)
  const clearAllTokens = () => {
    console.log('Manually clearing all tokens...');
    localStorage.removeItem('authToken');
    apiService.clearToken();
    setUser(null);
    console.log('All tokens cleared. Please refresh the page.');
  };

  // Make clearAllTokens available globally for debugging
  if (typeof window !== 'undefined') {
    (window as any).clearAllTokens = clearAllTokens;
  }

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
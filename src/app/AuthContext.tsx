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
    const token = apiService.getToken();
    if (token) {
      // Check if it's a valid recent token
      const tokenTimestamp = token.split('-').pop();
      const tokenAge = Date.now() - parseInt(tokenTimestamp || '0');
      const isRecentToken = tokenAge < 7 * 24 * 60 * 60 * 1000; // 7 days

      if (token.startsWith('mock-jwt-token-') && isRecentToken) {
        // Valid recent token - auto-login user
        const mockUser = {
          _id: '1',
          username: 'DemoUser',
          email: 'demo@example.com',
          walletAddress: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
        };
        setUser(mockUser);
      } else {
        // Old or invalid token - clear it
        apiService.clearToken();
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    // Mock authentication for demo purposes
    if (email && password) {
      const mockUser = {
        _id: '1',
        username: email.split('@')[0],
        email: email,
        walletAddress: '0x' + Math.random().toString(16).substr(2, 40),
      };
      const mockToken = 'mock-jwt-token-' + Date.now();
      apiService.setToken(mockToken);
      setUser(mockUser);
    } else {
      throw new Error('Invalid credentials');
    }
  };

  const register = async (username: string, email: string, password: string) => {
    // Mock registration for demo purposes
    if (username && email && password) {
      const mockUser = {
        _id: '1',
        username: username,
        email: email,
        walletAddress: '0x' + Math.random().toString(16).substr(2, 40),
      };
      const mockToken = 'mock-jwt-token-' + Date.now();
      apiService.setToken(mockToken);
      setUser(mockUser);
    } else {
      throw new Error('All fields are required');
    }
  };

  const logout = () => {
    apiService.clearToken();
    setUser(null);
  };

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
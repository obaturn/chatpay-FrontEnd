'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiService } from './api';

// Declare Google Identity Services types
declare global {
  interface Window {
    google: {
      accounts: {
        oauth2: {
          initTokenClient: (config: {
            client_id: string;
            scope: string;
            callback: (response: GoogleTokenResponse) => void;
          }) => GoogleTokenClient;
        };
      };
    };
    clearAllTokens: () => void;
  }
}

interface GoogleTokenResponse {
  access_token: string;
}

interface GoogleTokenClient {
  requestAccessToken(): void;
}

interface User {
  _id: string;
  username: string;
  email: string;
  walletAddress?: string;
  displayName?: string;
  profilePicture?: string;
  bio?: string;
  businessType?: string;
  purpose?: string;
  isVerified?: boolean;
  lastActive?: Date;
  isOnline?: boolean;
}

interface ProfileData {
  displayName?: string;
  bio?: string;
  profilePicture?: string;
  businessType?: string;
  purpose?: string;
  preferences?: {
    notifications?: {
      email?: boolean;
      push?: boolean;
    };
  };
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<User | undefined>;
  register: (username: string, email: string, password: string) => Promise<User | undefined>;
  verifyEmail: (email: string, otp: string) => Promise<void>;
  googleLogin: () => Promise<void>;
  updateProfile: (profileData: ProfileData) => Promise<User | undefined>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log('🔄 AuthContext initializing...');

    // Check if we have a valid token and try to restore user session
    const token = localStorage.getItem('authToken');
    if (token) {
      console.log('🔍 Found existing token, validating...');
      // TODO: Optionally validate token with backend here
      // For now, we'll assume the token is valid if it exists
    }

    // Clear any old cached user data (not tokens)
    const cachedUser = localStorage.getItem('user');
    if (cachedUser) {
      console.log('🧹 Clearing cached user data');
      localStorage.removeItem('user');
    }

    setIsLoading(false);
    console.log('✅ AuthContext initialized');
  }, []);

  const login = async (email: string, password: string) => {
    try {
      console.log('Login attempt:', { email, password });
      const response = await apiService.login(email, password);
      console.log('Login response:', response);

      if (response.success && response.user) {
        setUser(response.user);
        console.log('Login successful, user set:', response.user);
        return response.user; // Return the user data
      } else {
        throw new Error('Login failed');
      }
    } catch (error: unknown) {
      console.error('Login error:', error);
      if (error && typeof error === 'object' && 'error' in error) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        throw new Error((error as any).error || 'Login failed. Please check your credentials.');
      }
      const message = error instanceof Error ? error.message : 'Login failed. Please check your credentials.';
      throw new Error(message);
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
        return response.user; // Return the user data
      } else {
        throw new Error('Registration failed');
      }
    } catch (error: unknown) {
      console.error('Registration error:', error);
      const message = error instanceof Error ? error.message : 'Registration failed. Please try again.';
      throw new Error(message);
    }
  };

  const verifyEmail = async (email: string, otp: string) => {
    try {
      console.log('Verifying email with OTP:', { email, otp });
      const response = await apiService.verifyEmail(email, otp);

      if (response.success && response.user) {
        setUser(response.user);
        console.log('Email verified successfully:', response.user);
      } else {
        throw new Error('Email verification failed');
      }
    } catch (error: unknown) {
      console.error('Email verification error:', error);
      const message = error instanceof Error ? error.message : 'Email verification failed';
      throw new Error(message);
    }
  };

  const googleLogin = async () => {
    try {
      console.log('Initiating Google OAuth login...');

      // Check if Google Identity Services is loaded
      if (!window.google) {
        throw new Error('Google Identity Services not loaded. Please refresh the page.');
      }

      // Initialize Google Identity Services
      const client = window.google.accounts.oauth2.initTokenClient({
        client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
        scope: 'openid email profile',
        callback: async (response: GoogleTokenResponse) => {
          if (response.access_token) {
            try {
              console.log('Received access token from Google');

              // Get user info from Google
              const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
                headers: {
                  'Authorization': `Bearer ${response.access_token}`
                }
              });

              if (!userInfoResponse.ok) {
                throw new Error('Failed to get user info from Google');
              }

              const userInfo = await userInfoResponse.json();
              console.log('Google user info:', userInfo);

              // Send user info to backend
              const loginResponse = await apiService.googleLogin({
                code: response.access_token,
                email: userInfo.email,
                name: userInfo.name,
                picture: userInfo.picture
              });

              if (loginResponse.success && loginResponse.user) {
                setUser(loginResponse.user);
                console.log('Google login successful:', loginResponse.user);

                // For Google login, skip email verification and go directly to dashboard
                // The backend already marks Google accounts as verified
                if (loginResponse.user.isVerified) {
                  console.log('Google user is verified, proceeding to dashboard');
                }
              } else {
                throw new Error('Google login failed');
              }
            } catch (error: unknown) {
              console.error('Google login verification error:', error);
              const message = error instanceof Error ? error.message : 'Google login verification failed';
              throw new Error(message);
            }
          } else {
            throw new Error('Google authorization failed');
          }
        }
      });

      // Request access token
      client.requestAccessToken();

    } catch (error: unknown) {
      console.error('Google login error:', error);
      const message = error instanceof Error ? error.message : 'Google login failed. Please try again.';
      throw new Error(message);
    }
  };

  const updateProfile = async (profileData: ProfileData) => {
    try {
      console.log('🔄 Updating profile:', profileData);
      const response = await apiService.updateProfile(profileData);

      if (response.success && response.user) {
        console.log('✅ Profile updated successfully:', response.user);
        console.log('🔍 Updated user verification status:', {
          isVerified: response.user.isVerified,
          hasDisplayName: !!response.user.displayName,
          displayName: response.user.displayName
        });
        setUser(response.user);
        return response.user; // Return the updated user
      } else {
        throw new Error('Profile update failed');
      }
    } catch (error: unknown) {
      console.error('❌ Profile update error:', error);

      // If authentication failed, clear user state and token
      if (error instanceof Error && error.message.includes('Authentication failed')) {
        console.log('🔐 Authentication failed during profile update, clearing user state');
        setUser(null);
        apiService.clearToken();
        localStorage.removeItem('authToken');
        throw new Error('Your session has expired. Please log in again.');
      }

      const message = error instanceof Error ? error.message : 'Profile update failed';
      throw new Error(message);
    }
  };

  const logout = () => {
    apiService.clearToken();
    setUser(null);
    // Also clear any other auth-related data
    localStorage.removeItem('authToken');
    console.log('Logged out and cleared all auth data');
  };

  // Clear any invalid tokens on app start (currently disabled to preserve valid sessions)
  const clearInvalidTokens = () => {
    // TODO: Implement proper token validation
    // For now, we preserve existing tokens to maintain user sessions
    console.log('🔍 Token validation skipped - preserving existing sessions');
  };

  // Manual token clearing function (accessible from browser console)
  const clearAllTokens = () => {
    console.log('🧹 Manually clearing ALL cached data...');
    localStorage.clear(); // Clear ALL localStorage
    sessionStorage.clear(); // Clear ALL sessionStorage
    apiService.clearToken();
    setUser(null);
    console.log('✅ All cached data cleared. Please refresh the page and try fresh authentication.');
  };

  // Make clearAllTokens available globally for debugging
  if (typeof window !== 'undefined') {
    window.clearAllTokens = clearAllTokens;
  }

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    verifyEmail,
    googleLogin,
    updateProfile,
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
// API service for ChatPay application

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// API Response types
interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  token?: string;
  user?: T;
}

// Profile data interface
interface ProfileData {
  displayName?: string;
  bio?: string;
  profilePicture?: string | null;
  businessType?: string;
  preferences?: {
    notifications?: {
      email?: boolean;
      push?: boolean;
    };
  };
}

// Google login data interface
interface GoogleLoginData {
  code?: string;
  email: string;
  name?: string;
  picture?: string;
}

class ApiService {
  private token: string | null = null;

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('authToken', token);
  }

  getToken(): string | null {
    if (!this.token) {
      this.token = localStorage.getItem('authToken');
    }
    return this.token;
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('authToken');
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private async request(endpoint: string, options: RequestInit = {}): Promise<any> {
    const url = `${API_BASE_URL}${endpoint}`;
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    if (this.token) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${this.token}`,
      };
    }

    const response = await fetch(url, config);

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Network error' }));

      console.error('🚨 API Error Details:', {
        endpoint: endpoint,
        method: options.method || 'GET',
        status: response.status,
        statusText: response.statusText,
        error: error,
        url: url
      });

      // Handle specific HTTP status codes
      if (response.status === 401) {
        // Clear invalid token on 401 Unauthorized
        this.clearToken();
        throw new Error('Authentication failed. Please log in again.');
      }

      throw new Error(error.error || error.message || `HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }

  // Authentication
  async login(email: string, password: string) {
    const data = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    if (data.token) {
      this.setToken(data.token);
    }
    return data;
  }

  async register(username: string, email: string, password: string) {
    const data = await this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, email, password }),
    });
    if (data.token) {
      this.setToken(data.token);
    }
    return data;
  }


  async getProfile() {
    return this.request('/auth/profile');
  }

  // Chat
  async getChats() {
    return this.request('/chats');
  }

  async getChatMessages(chatId: string) {
    return this.request(`/chats/${chatId}/messages`);
  }

  async sendMessage(chatId: string, content: string, type: string = 'text') {
    return this.request(`/chats/${chatId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ content, type }),
    });
  }

  async createChat(participants: string[], type: string = 'direct') {
    return this.request('/chats', {
      method: 'POST',
      body: JSON.stringify({ participants, type }),
    });
  }

  // Payments
  async requestPayment(chatId: string, amount: number, receiverWallet: string) {
    return this.request('/payments/request', {
      method: 'POST',
      body: JSON.stringify({ chatId, amount, receiverWallet }),
    });
  }

  async sendPayment(chatId: string, amount: number, receiverWallet: string) {
    return this.request('/payments/send', {
      method: 'POST',
      body: JSON.stringify({ chatId, amount, receiverWallet }),
    });
  }

  async getPaymentHistory() {
    return this.request('/payments/history');
  }

  // Contacts
  async getContacts() {
    return this.request('/contacts');
  }

  async addContact(userId: string) {
    return this.request('/contacts', {
      method: 'POST',
      body: JSON.stringify({ userId }),
    });
  }

  // Email verification
  async verifyEmail(email: string, otp: string) {
    return this.request('/auth/verify-email', {
      method: 'POST',
      body: JSON.stringify({ email, otp }),
    });
  }

  async resendOTP(email: string) {
    return this.request('/auth/resend-otp', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async testEmail(email?: string) {
    return this.request('/auth/test-email', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  // Google OAuth
  async googleLogin(userData: GoogleLoginData) {
    return this.request('/auth/google', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  // Profile management
  async updateProfile(profileData: ProfileData) {
    return this.request('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  }
}

export const apiService = new ApiService();
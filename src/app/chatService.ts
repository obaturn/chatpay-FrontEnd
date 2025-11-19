import { io, Socket } from 'socket.io-client';

interface Payment {
  id: string;
  type: 'request' | 'manual';
  amount?: number;
  receiverWallet?: string;
  paymentMethod?: string;
  referenceId?: string;
  status: 'verified' | 'unverified' | null;
  txHash?: string;
}

interface Message {
  id: string;
  chatId: string;
  senderId: string;
  content: string;
  type: 'text' | 'payment';
  timestamp: Date;
  payment?: Payment;
}

interface Chat {
  id: string;
  name: string;
  participants: string[];
  lastMessage?: Message;
  unreadCount: number;
}

class ChatService {
  private socket: Socket | null = null;
  private backendUrl: string;

  constructor() {
    this.backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';
  }

  // Connect to chat server
  connect(token: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.socket = io(this.backendUrl, {
        auth: { token },
        transports: ['websocket', 'polling'],
      });

      this.socket.on('connect', () => {
        console.log('Connected to chat server');
        resolve();
      });

      this.socket.on('connect_error', (error) => {
        console.error('Chat connection error:', error);
        reject(error);
      });

      this.socket.on('disconnect', () => {
        console.log('Disconnected from chat server');
      });
    });
  }

  // Disconnect from chat server
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  // Join a chat room
  joinChat(chatId: string) {
    if (this.socket) {
      this.socket.emit('join-chat', chatId);
    }
  }

  // Leave a chat room
  leaveChat(chatId: string) {
    if (this.socket) {
      this.socket.emit('leave-chat', chatId);
    }
  }

  // Send a message via API (not socket)
  async sendMessage(chatId: string, content: string, type: 'text' | 'payment' = 'text'): Promise<Message> {
    const response = await fetch(`${this.backendUrl}/api/chats/${chatId}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.getToken()}`,
      },
      body: JSON.stringify({
        content,
        type,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to send message');
    }

    const data = await response.json();
    return data.message;
  }

  // Typing indicators
  startTyping(chatId: string) {
    if (this.socket) {
      this.socket.emit('typing', { chatId });
    }
  }

  stopTyping(chatId: string) {
    if (this.socket) {
      this.socket.emit('stop-typing', { chatId });
    }
  }

  // Event listeners
  onMessage(callback: (message: Message) => void) {
    if (this.socket) {
      this.socket.on('new-message', callback);
    }
  }

  onUserTyping(callback: (data: { chatId: string; userId: string }) => void) {
    if (this.socket) {
      this.socket.on('user-typing', callback);
    }
  }

  onUserStopTyping(callback: (data: { chatId: string; userId: string }) => void) {
    if (this.socket) {
      this.socket.on('user-stop-typing', callback);
    }
  }

  onPaymentNotification(callback: (payment: Payment) => void) {
    if (this.socket) {
      this.socket.on('payment-notification', callback);
    }
  }

  // Remove event listeners
  offMessage() {
    if (this.socket) {
      this.socket.off('new-message');
    }
  }

  offUserTyping() {
    if (this.socket) {
      this.socket.off('user-typing');
    }
  }

  offUserStopTyping() {
    if (this.socket) {
      this.socket.off('user-stop-typing');
    }
  }

  offPaymentNotification() {
    if (this.socket) {
      this.socket.off('payment-notification');
    }
  }

  // API calls for chat management
  async getChats(): Promise<Chat[]> {
    const response = await fetch(`${this.backendUrl}/api/chats`, {
      headers: {
        'Authorization': `Bearer ${this.getToken()}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch chats');
    }

    const data = await response.json();
    return data.chats || [];
  }

  async getMessages(chatId: string, limit = 50, skip = 0): Promise<Message[]> {
    const response = await fetch(`${this.backendUrl}/api/chats/${chatId}/messages?limit=${limit}&skip=${skip}`, {
      headers: {
        'Authorization': `Bearer ${this.getToken()}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch messages');
    }

    const data = await response.json();
    return data.messages || [];
  }

  async createChat(participants: string[]): Promise<Chat> {
    const response = await fetch(`${this.backendUrl}/api/chats`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.getToken()}`,
      },
      body: JSON.stringify({ participants }),
    });

    if (!response.ok) {
      throw new Error('Failed to create chat');
    }

    const data = await response.json();
    return data.chat;
  }

  private getToken(): string {
    // Get token from localStorage or auth context
    return localStorage.getItem('authToken') || '';
  }
}

export const chatService = new ChatService();
export type { Message, Chat };
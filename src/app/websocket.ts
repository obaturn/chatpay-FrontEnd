// WebSocket service for real-time messaging

class WebSocketService {
  private socket: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectInterval = 3000;
  private listeners: { [event: string]: ((data: any) => void)[] } = {};

  connect(token: string) {
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001';

    try {
      this.socket = new WebSocket(`${wsUrl}?token=${token}`);

      this.socket.onopen = () => {
        console.log('WebSocket connected');
        this.reconnectAttempts = 0;
        this.emit('connected');
      };

      this.socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.emit(data.type, data.payload);
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      this.socket.onclose = () => {
        console.log('WebSocket disconnected');
        this.emit('disconnected');
        this.handleReconnect(token);
      };

      this.socket.onerror = (error) => {
        console.error('WebSocket error:', error);
        this.emit('error', error);
      };
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      this.handleReconnect(token);
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }

  private handleReconnect(token: string) {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);

      setTimeout(() => {
        this.connect(token);
      }, this.reconnectInterval);
    } else {
      console.error('Max reconnection attempts reached');
      this.emit('maxReconnectAttemptsReached');
    }
  }

  send(type: string, payload: any = {}) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({ type, payload }));
    } else {
      console.warn('WebSocket is not connected');
    }
  }

  on(event: string, callback: (data: any) => void) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
  }

  off(event: string, callback?: (data: any) => void) {
    if (!this.listeners[event]) return;

    if (callback) {
      this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
    } else {
      delete this.listeners[event];
    }
  }

  private emit(event: string, data?: any) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(callback => callback(data));
    }
  }

  // Chat-specific methods
  joinChat(chatId: string) {
    this.send('joinChat', { chatId });
  }

  leaveChat(chatId: string) {
    this.send('leaveChat', { chatId });
  }

  sendMessage(chatId: string, content: string, type: string = 'text') {
    this.send('sendMessage', { chatId, content, type });
  }

  markAsRead(chatId: string, messageId: string) {
    this.send('markAsRead', { chatId, messageId });
  }

  // Typing indicators
  startTyping(chatId: string) {
    this.send('startTyping', { chatId });
  }

  stopTyping(chatId: string) {
    this.send('stopTyping', { chatId });
  }
}

export const wsService = new WebSocketService();
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { useAuth } from '../src/components/AuthContext';
import ChatList from '../src/app/ChatList';
import Message from '../src/app/Message';
import { chatService, Message as MessageType, Chat as ChatType } from '../src/app/chatService';

export default function ChatPage() {
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();
  const [chats, setChats] = useState<ChatType[]>([]);
  const [selectedChat, setSelectedChat] = useState<ChatType | null>(null);
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showUserSearch, setShowUserSearch] = useState(false);
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<{ id: string; username: string; displayName: string; email: string }[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    initializeChat();
  }, [isAuthenticated]);

  const initializeChat = async () => {
    try {
      setError(null);
      // Connect to chat service
      const token = localStorage.getItem('authToken');
      if (token) {
        await chatService.connect(token);
        setIsConnected(true);

        // Load chats
        const userChats = await chatService.getChats();
        setChats(userChats);

        // Set up real-time listeners
        setupRealTimeListeners();
      } else {
        setError('Authentication token not found. Please log in again.');
      }
    } catch (error) {
      console.error('Failed to initialize chat:', error);
      setError('Failed to connect to chat server. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const setupRealTimeListeners = () => {
    chatService.onMessage((message) => {
      setMessages(prev => [...prev, message]);

      // Update chat's last message
      setChats(prev => prev.map(chat =>
        chat.id === message.chatId
          ? { ...chat, lastMessage: message, unreadCount: chat.id !== selectedChat?.id ? chat.unreadCount + 1 : 0 }
          : chat
      ));
    });

    chatService.onUserTyping((data) => {
      // Handle typing indicators
      console.log('User typing:', data);
    });

    chatService.onPaymentNotification((payment) => {
      console.log('Payment notification:', payment);
    });
  };

  const handleSelectChat = async (chatId: string) => {
    const chat = chats.find(c => c.id === chatId);
    if (!chat) return;

    setSelectedChat(chat);
    setError(null);

    // Mark as read
    setChats(prev => prev.map(c =>
      c.id === chatId ? { ...c, unreadCount: 0 } : c
    ));

    // Leave previous chat room
    if (selectedChat) {
      chatService.leaveChat(selectedChat.id);
    }

    // Join new chat room
    chatService.joinChat(chatId);

    // Load messages
    try {
      const chatMessages = await chatService.getMessages(chatId);
      setMessages(chatMessages);
    } catch (error) {
      console.error('Failed to load messages:', error);
      setError('Failed to load chat messages. Please try refreshing the page.');
    }
  };

  const handleSendMessage = () => {
    if (!selectedChat) return;

    if (selectedFile) {
      handleSendFile();
    } else if (newMessage.trim()) {
      chatService.sendMessage(selectedChat.id, newMessage.trim());
      setNewMessage('');
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleSendFile = async () => {
    if (!selectedFile || !selectedChat) return;

    setIsUploading(true);
    try {
      // TODO: Upload file to backend first
      // const formData = new FormData();
      // formData.append('file', selectedFile);
      // const response = await fetch('/api/upload', { method: 'POST', body: formData });
      // const { fileUrl } = await response.json();

      // For now, just send a message with file info
      const fileMessage = `[File: ${selectedFile.name}]`;
      chatService.sendMessage(selectedChat.id, fileMessage);

      setSelectedFile(null);
      // Reset file input
      const fileInput = document.getElementById('file-input') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
    } catch (error) {
      console.error('File upload failed:', error);
      alert('File upload failed. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const removeSelectedFile = () => {
    setSelectedFile(null);
    const fileInput = document.getElementById('file-input') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };

  const handleNewChat = () => {
    setShowUserSearch(true);
  };

  const handleUserSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      // TODO: Replace with actual API call to search users
      // const response = await fetch(`/api/users/search?q=${encodeURIComponent(query)}`);
      // const users = await response.json();

      // Mock search results
      const mockUsers = [
        { id: '1', username: 'alice', displayName: 'Alice Johnson', email: 'alice@example.com' },
        { id: '2', username: 'bob', displayName: 'Bob Smith', email: 'bob@example.com' },
        { id: '3', username: 'charlie', displayName: 'Charlie Brown', email: 'charlie@example.com' },
      ].filter(user =>
        user.username.toLowerCase().includes(query.toLowerCase()) ||
        user.displayName.toLowerCase().includes(query.toLowerCase())
      );

      setSearchResults(mockUsers);
    } catch (error) {
      console.error('User search failed:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleStartChat = async (userId: string) => {
    try {
      setError(null);
      const chat = await chatService.createChat([userId]);
      setShowUserSearch(false);
      setUserSearchQuery('');
      setSearchResults([]);

      // Add to chats list
      setChats(prev => [...prev, {
        id: chat.id,
        name: chat.name,
        participants: chat.participants,
        lastMessage: undefined,
        unreadCount: 0
      }]);

      // Select the new chat
      handleSelectChat(chat.id);
    } catch (error) {
      console.error('Failed to create chat:', error);
      setError('Failed to create new chat. Please try again.');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Connecting to chat...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Connection Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => {
              setError(null);
              setIsLoading(true);
              initializeChat();
            }}
            className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition duration-200"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* User Search Modal */}
      {showUserSearch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setShowUserSearch(false)} />
          <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Start New Chat</h2>
                <button
                  onClick={() => setShowUserSearch(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="mb-4">
                <input
                  type="text"
                  value={userSearchQuery}
                  onChange={(e) => {
                    setUserSearchQuery(e.target.value);
                    handleUserSearch(e.target.value);
                  }}
                  placeholder="Search users by name or username..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <div className="max-h-64 overflow-y-auto">
                {isSearching ? (
                  <div className="text-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-500 mx-auto mb-2"></div>
                    <p className="text-gray-600 text-sm">Searching...</p>
                  </div>
                ) : searchResults.length === 0 && userSearchQuery ? (
                  <div className="text-center py-4">
                    <p className="text-gray-600">No users found</p>
                  </div>
                ) : (
                  searchResults.map((user) => (
                    <div
                      key={user.id}
                      onClick={() => handleStartChat(user.id)}
                      className="flex items-center space-x-3 p-3 hover:bg-gray-50 cursor-pointer rounded-lg"
                    >
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-sm">
                          {user.displayName.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{user.displayName}</p>
                        <p className="text-sm text-gray-600">@{user.username}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Chat List Sidebar */}
      <ChatList
        chats={chats.map(chat => ({
          id: chat.id,
          name: chat.name,
          lastMessage: chat.lastMessage?.content || '',
          timestamp: chat.lastMessage?.timestamp.toLocaleTimeString() || '',
          unreadCount: chat.unreadCount,
        }))}
        selectedChatId={selectedChat?.id || null}
        onSelectChat={handleSelectChat}
        onNewChat={handleNewChat}
      />

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedChat ? (
          <>
            {/* Chat Header */}
            <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold">
                    {selectedChat.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">{selectedChat.name}</h2>
                  <p className="text-sm text-gray-500">
                    {isConnected ? 'Connected' : 'Connecting...'}
                  </p>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.map((message) => (
                <Message
                  key={message.id}
                  id={message.id}
                  text={message.content}
                  payment={message.payment}
                  timestamp={message.timestamp.toLocaleTimeString()}
                />
              ))}
            </div>

            {/* Message Input */}
            <div className="bg-white border-t border-gray-200 p-4">
              {/* Selected File Preview */}
              {selectedFile && (
                <div className="mb-3 p-3 bg-gray-50 rounded-lg flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="text-2xl">📎</div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{selectedFile.name}</p>
                      <p className="text-xs text-gray-600">{(selectedFile.size / 1024).toFixed(1)} KB</p>
                    </div>
                  </div>
                  <button
                    onClick={removeSelectedFile}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              )}

              <div className="flex space-x-4">
                {/* File Upload Button */}
                <label className="flex items-center justify-center w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-lg cursor-pointer transition duration-200">
                  <input
                    id="file-input"
                    type="file"
                    onChange={handleFileSelect}
                    className="hidden"
                    accept="image/*,video/*,audio/*,application/*,text/*"
                  />
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                  </svg>
                </label>

                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type a message..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  disabled={!isConnected || isUploading}
                />

                <button
                  onClick={handleSendMessage}
                  disabled={(!newMessage.trim() && !selectedFile) || !isConnected || isUploading}
                  className="px-6 py-2 bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white rounded-lg transition duration-200 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {isUploading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Uploading...</span>
                    </>
                  ) : (
                    <span>Send</span>
                  )}
                </button>
              </div>
            </div>
          </>
        ) : (
          /* Empty State */
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="text-6xl mb-4">💬</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Select a chat to start messaging</h3>
              <p className="text-gray-600">Choose a conversation from the sidebar or start a new one</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
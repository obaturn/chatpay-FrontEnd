'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../src/components/AuthContext';
import LandingPage from '@/app/LandingPage';
import LoginForm from '@/components/LoginForm';
import RegisterForm from '@/app/RegisterForm';
import ChatList from '@/app/ChatList';
import Message from '@/app/Message';
import PaymentDrawer from '@/app/PaymentDrawer';
import ProfileSetup from '@/app/ProfileSetup';
import EmailVerification from '@/app/EmailVerification';
import { apiService } from '../src/components/api';
import { chatService, Message as MessageType, Chat as ChatType } from '../src/app/chatService';
import { useCurrentAccount, useWallets, useConnectWallet, useSignTransaction } from '@mysten/dapp-kit';

// Payment interface is now imported from chatService
interface User {
  _id: string;
  username: string;
  email: string;
  displayName?: string;
  profilePicture?: string;
  isVerified?: boolean;
}

function ChatInterface() {
  const { user, logout } = useAuth();
  const currentAccount = useCurrentAccount();
  const wallets = useWallets();
  const { mutate: connectWallet, isPending: isConnecting } = useConnectWallet();
  const signTransaction = useSignTransaction();
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [chats, setChats] = useState<ChatType[]>([]);
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [isLoadingChats, setIsLoadingChats] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [chatServiceConnected, setChatServiceConnected] = useState(false);

  const handleManualConnect = async () => {
    console.log('Manual connect triggered');
    console.log('Available wallets:', wallets);
    console.log('Connection state:', isConnecting);

    if (wallets.length > 0) {
      try {
        console.log('Attempting to connect to wallet:', wallets[0].name);
        console.log('Wallet object:', wallets[0]);

        // Check if wallet has required features
        console.log('Wallet features:', wallets[0].features);

        // Basic check - if wallet exists, assume it has basic features
        // More detailed feature checking can be added later if needed

        await connectWallet({ wallet: wallets[0] });
        console.log('Wallet connection successful');
      } catch (error) {
        console.error('Failed to connect wallet:', error);
        console.error('Error details:', error);

        // Provide more specific error messages
        const errorMessage = error instanceof Error ? error.message : String(error);
        if (errorMessage.includes('User rejected') || errorMessage.includes('rejected')) {
          alert('Connection rejected by user. Please approve the connection in your wallet.');
        } else if (errorMessage.includes('network') || errorMessage.includes('Network')) {
          alert('Network error. Please check your internet connection and try again.');
        } else {
          alert(`Failed to connect wallet: ${errorMessage}`);
        }
      }
    } else {
      console.log('No wallets detected');
      alert('No Sui wallets detected. Please install a Sui wallet extension (Sui Wallet, Ethos, etc.) and refresh the page.');
    }
  };

  const handleConnectButtonClick = () => {
    console.log('🔗 ConnectButton clicked');
    console.log('📱 Current account:', currentAccount);
    console.log('🔌 Available wallets:', wallets);
    console.log('⚡ Connection state:', isConnecting);
    console.log('✍️ Sign transaction available:', !!signTransaction);

    // Check if modal elements exist after a short delay
    setTimeout(() => {
      const modalElements = document.querySelectorAll('[role="dialog"], [data-radix-dialog-overlay], [data-state="open"]');
      console.log('🎭 Modal elements found:', modalElements.length);

      if (modalElements.length === 0) {
        console.log('❌ No modal elements found - modal may not be rendering');
        console.log('🔍 Checking for any dialog-related elements...');

        const allDialogElements = document.querySelectorAll('*[role*="dialog"], *[data-radix*]');
        console.log('📋 All dialog-related elements:', allDialogElements.length);
        allDialogElements.forEach((el, index) => {
          console.log(`📋 Element ${index}:`, el.tagName, el.className, el.getAttribute('role'));
        });
      } else {
        modalElements.forEach((el, index) => {
          console.log(`🎭 Modal element ${index}:`, el);
          const styles = window.getComputedStyle(el);
          console.log(`🎨 Modal ${index} visibility:`, styles.visibility);
          console.log(`🎨 Modal ${index} display:`, styles.display);
          console.log(`🎨 Modal ${index} z-index:`, styles.zIndex);
          console.log(`🎨 Modal ${index} position:`, styles.position);
        });
      }
    }, 500);
  };

  // Initialize chat service connection
  useEffect(() => {
    const initializeChat = async () => {
      if (user) {
        try {
          const token = localStorage.getItem('authToken');
          if (token) {
            await chatService.connect(token);
            setChatServiceConnected(true);

            // Load user's chats
            try {
              const userChats = await chatService.getChats();
              setChats(userChats || []);
            } catch (error) {
              console.error('Failed to load chats:', error);
              setChats([]);
            }

            // Set up real-time listeners
            chatService.onMessage((message) => {
              setMessages(prev => [...prev, message]);

              // Update chat's last message
              setChats(prev => prev.map(chat =>
                chat.id === message.chatId
                  ? { ...chat, lastMessage: message, unreadCount: chat.id !== selectedChatId ? chat.unreadCount + 1 : 0 }
                  : chat
              ));
            });

            chatService.onPaymentNotification((payment) => {
              console.log('Payment notification:', payment);
            });
          }
        } catch (error) {
          console.error('Failed to initialize chat:', error);
        } finally {
          setIsLoadingChats(false);
        }
      }
    };

    initializeChat();

    // Cleanup on unmount
    return () => {
      chatService.disconnect();
    };
  }, [user, selectedChatId]);

  const [newMessage, setNewMessage] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerType, setDrawerType] = useState<'request' | 'paid' | 'send'>('request');

  const handleSendMessage = async () => {
    if (newMessage.trim() && selectedChatId) {
      try {
        await chatService.sendMessage(selectedChatId, newMessage.trim());
        setNewMessage('');
      } catch (error) {
        console.error('Failed to send message:', error);
        // Could show a toast notification here
        alert('Failed to send message. Please try again.');
      }
    }
  };

  const handleSelectChat = async (chatId: string) => {
    const chat = chats.find(c => c.id === chatId);
    if (!chat) return;

    setSelectedChatId(chatId);
    setIsLoadingMessages(true);

    // Leave previous chat room
    if (selectedChatId) {
      chatService.leaveChat(selectedChatId);
    }

    // Join new chat room
    chatService.joinChat(chatId);

    try {
      // Load messages for this chat
      const chatMessages = await chatService.getMessages(chatId);
      setMessages(chatMessages || []);

      // Mark chat as read
      setChats(prev => prev.map(c =>
        c.id === chatId ? { ...c, unreadCount: 0 } : c
      ));
    } catch (error) {
      console.error('Failed to load messages:', error);
      setMessages([]);
    } finally {
      setIsLoadingMessages(false);
    }
  };

  const handleNewChat = () => {
    console.log('New chat');
  };

  const handleLogout = () => {
    logout();
    // Clear any stored authentication
    localStorage.removeItem('authToken');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex">
      {/* Chat List Sidebar */}
      <ChatList
        chats={(chats || []).map(chat => ({
          id: chat.id,
          name: chat.name,
          lastMessage: chat.lastMessage?.content || '',
          timestamp: chat.lastMessage?.timestamp.toLocaleTimeString() || '',
          unreadCount: chat.unreadCount,
        }))}
        selectedChatId={selectedChatId}
        onSelectChat={handleSelectChat}
        onNewChat={() => console.log('New chat - to be implemented')}
      />

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedChatId ? (
          <>
            {/* Header */}
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white p-4 shadow-md flex items-center justify-between relative z-20">
              <div className="flex items-center space-x-3">
                {user?.profilePicture ? (
                  <img
                    src={user.profilePicture}
                    alt="Profile"
                    className="w-10 h-10 rounded-full object-cover border-2 border-white"
                  />
                ) : (
                  <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-lg">
                      {user?.displayName?.charAt(0)?.toUpperCase() || user?.username?.charAt(0)?.toUpperCase() || 'U'}
                    </span>
                  </div>
                )}
                <div>
                  <h1 className="text-lg font-semibold">
                    {user?.displayName || user?.username || 'User'}
                  </h1>
                  <p className="text-sm text-green-200">Online</p>
                </div>
              </div>
              <div className="flex space-x-4">
                <button className="text-white hover:text-green-200 p-2 rounded-full hover:bg-green-700 transition duration-200">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </button>
                <button className="text-white hover:text-green-200 p-2 rounded-full hover:bg-green-700 transition duration-200">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </button>
                <div className="flex items-center space-x-2 wallet-connection-area">
                  {currentAccount ? (
                    <div className="flex items-center space-x-2 bg-green-700 px-3 py-1 rounded-full">
                      <div className="w-2 h-2 bg-green-300 rounded-full"></div>
                      <span className="text-sm font-medium">
                        {currentAccount.address.slice(0, 6)}...{currentAccount.address.slice(-4)}
                      </span>
                    </div>
                  ) : (
                    <button
                      onClick={handleManualConnect}
                      disabled={isConnecting}
                      className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded-lg text-sm font-medium transition duration-200 flex items-center space-x-2"
                      title="Connect your Sui wallet"
                    >
                      <span>{isConnecting ? 'Connecting...' : 'Connect Wallet'}</span>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                      </svg>
                    </button>
                  )}
                  <button
                    onClick={handleLogout}
                    className="text-white hover:text-green-200 p-2 rounded-full hover:bg-green-700 transition duration-200"
                    title="Logout (returns to landing page)"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-gradient-to-br from-purple-50 to-blue-50">
              {isLoadingMessages ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto mb-2"></div>
                    <p className="text-gray-600">Loading messages...</p>
                  </div>
                </div>
              ) : messages.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <div className="text-6xl mb-4">💬</div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No messages yet</h3>
                    <p className="text-gray-600">Start the conversation!</p>
                  </div>
                </div>
              ) : (
                (messages || []).map((msg) => (
                  <Message
                    key={msg.id}
                    id={msg.id}
                    text={msg.content}
                    payment={msg.payment}
                    timestamp={msg.timestamp.toLocaleTimeString()}
                  />
                ))
              )}
            </div>

            {/* Input Area */}
            <div className="bg-white p-4 border-t border-green-200">
              {/* File attachment preview would go here if implemented */}

              <div className="flex items-center space-x-2">
                {/* File Upload Button */}
                <button className="text-green-500 hover:text-green-700 p-2 rounded-full hover:bg-green-50 transition duration-200">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                  </svg>
                </button>

                {/* Message Input */}
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Type a message..."
                  className="flex-1 border border-green-300 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  disabled={!chatServiceConnected}
                />

                {/* Payment Buttons */}
                <button
                  onClick={() => {
                    setDrawerType('send');
                    setDrawerOpen(true);
                  }}
                  className="bg-purple-500 hover:bg-purple-600 text-white font-bold py-2 px-4 rounded-full transition duration-200"
                  title="Send Payment"
                >
                  Send
                </button>

                <button
                  onClick={() => {
                    setDrawerType('request');
                    setDrawerOpen(true);
                  }}
                  className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-full transition duration-200"
                  title="Request Payment"
                >
                  Request
                </button>

                {/* Send Message Button */}
                <button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim() || !chatServiceConnected}
                  className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold py-2 px-4 rounded-full transition duration-200 disabled:cursor-not-allowed"
                >
                  ➤
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50">
            <div className="text-center">
              <div className="text-6xl mb-4">💬</div>
              <h2 className="text-2xl font-semibold text-purple-700 mb-2">Welcome to ChatPay</h2>
              <p className="text-purple-600">Select a chat to start messaging</p>
            </div>
          </div>
        )}
      </div>

      <PaymentDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        type={drawerType}
        onSubmit={(paymentData) => {
          console.log('Payment submitted:', paymentData);
          setDrawerOpen(false);
          // TODO: Integrate with payment service
        }}
      />

    </div>
  );
}

function LandingInterface({ onGetStarted }: { onGetStarted: () => void }) {
  const [currentView, setCurrentView] = useState<'landing' | 'register' | 'login' | 'verify-email' | 'profile-setup'>('landing');
  const [pendingUser, setPendingUser] = useState<User | null>(null);
  const [wasAuthenticated, setWasAuthenticated] = useState(false);
  const { login, register, verifyEmail, updateProfile, user, googleLogin, isAuthenticated } = useAuth();

  // Check if we have a pending profile setup from localStorage
  const getInitialView = () => {
    if (typeof window !== 'undefined') {
      const pendingSetup = localStorage.getItem('pendingProfileSetup');
      if (pendingSetup === 'true') {
        console.log('🔄 Found pending profile setup flag, starting with profile-setup view');
        return 'profile-setup' as const;
      }
    }
    return 'landing' as const;
  };

  const [currentViewState, setCurrentViewState] = useState<'landing' | 'register' | 'login' | 'verify-email' | 'profile-setup'>(getInitialView());

  // Track authentication state changes
  useEffect(() => {
    if (isAuthenticated) {
      setWasAuthenticated(true);
    } else if (wasAuthenticated && !isAuthenticated) {
      // User became unauthenticated after being authenticated (token expired)
      console.log('🔐 User became unauthenticated (token expired), resetting to landing');
      setCurrentViewState('landing');
      setPendingUser(null);

      // Clear any pending flags
      if (typeof window !== 'undefined') {
        localStorage.removeItem('pendingProfileSetup');
      }
    }
  }, [isAuthenticated, wasAuthenticated]);

  // Auto-redirect to profile setup when user becomes authenticated but doesn't have displayName
  useEffect(() => {
    console.log('🔍 LandingInterface effect check:', {
      isAuthenticated,
      hasUser: !!user,
      hasDisplayName: !!user?.displayName,
      currentView: currentViewState,
      userDisplayName: user?.displayName,
      wasAuthenticated
    });

    if (isAuthenticated && user && !user.displayName && currentViewState === 'landing') {
      console.log('🔄 Auto-redirecting authenticated user without displayName to profile setup');
      setCurrentViewState('profile-setup');

      // Clear the localStorage flag since we're handling it here
      if (typeof window !== 'undefined') {
        localStorage.removeItem('pendingProfileSetup');
        console.log('🧹 Cleared pendingProfileSetup flag (handled by effect)');
      }
    }
  }, [isAuthenticated, user, currentViewState, wasAuthenticated]);

  const showLogin = () => {
    setCurrentViewState('login');
  };

  const showRegister = () => {
    setCurrentViewState('register');
  };

  const handleBackToHome = () => {
    setCurrentViewState('landing');
  };

  const handleLogin = async (email: string, password: string) => {
    try {
      console.log('🔐 Starting login process for:', email);
      const userData = await login(email, password);
      console.log('✅ Login successful, returned user:', userData);

      if (userData) {
        setPendingUser(userData);
        console.log('✅ Pending user set to:', userData);
      }

      // Skip email verification and go directly to profile setup if user needs it
      if (userData && userData.displayName) {
        // User already has profile, go to dashboard
        console.log('✅ User has complete profile, going to dashboard');
        onGetStarted();
      } else {
        // User needs profile setup
        console.log('📝 User needs profile setup');
        setCurrentViewState('profile-setup');
      }
    } catch (error) {
      console.error('❌ Login failed:', error);
      throw error;
    }
  };

  const handleRegister = async (username: string, email: string, password: string) => {
    try {
      console.log('📝 Starting registration for:', email);
      const userData = await register(username, email, password);
      console.log('✅ Registration successful, returned user:', userData);
      console.log('🔍 User has displayName:', !!userData?.displayName);

      if (userData) {
        setPendingUser(userData);
        console.log('✅ Pending user set to:', userData);
      }

      // Force navigation to profile setup for new users
      console.log('📝 New user registered, FORCING navigation to profile setup');
      setCurrentViewState('profile-setup');

      // Also set a flag in localStorage to ensure persistence
      if (typeof window !== 'undefined') {
        localStorage.setItem('pendingProfileSetup', 'true');
        console.log('💾 Set pendingProfileSetup flag in localStorage');
      }
    } catch (error: unknown) {
      console.error('❌ Registration failed:', error);
      // Handle specific error cases
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (errorMessage.includes('409') || errorMessage.includes('Conflict')) {
        throw new Error('This email is already registered. Please try logging in instead, or use a different email address.');
      } else if (errorMessage.includes('400') || errorMessage.includes('Bad Request')) {
        throw new Error('Please check your information and try again.');
      } else {
        throw error;
      }
    }
  };

  const handleEmailVerification = () => {
    // Email verification is handled internally by EmailVerification component
    setCurrentViewState('profile-setup');
  };

  const handleProfileComplete = () => {
    console.log('🎉 Profile setup completed, calling onGetStarted()');

    // Clear the pending profile setup flag
    if (typeof window !== 'undefined') {
      localStorage.removeItem('pendingProfileSetup');
      console.log('🧹 Cleared pendingProfileSetup flag from localStorage');
    }

    // Mark onboarding as complete
    onGetStarted();
  };

  console.log('🎨 LandingInterface rendering view:', currentViewState);

  switch (currentViewState) {
    case 'landing':
      console.log('🏠 Showing LandingPage');
      return <LandingPage onLogin={showLogin} onRegister={showRegister} onGoogleLogin={googleLogin} />;
    case 'register':
      console.log('📝 Showing RegisterForm');
      return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
          <RegisterForm
            onRegister={handleRegister}
            onSwitchToLogin={() => setCurrentViewState('login')}
            onBackToHome={handleBackToHome}
          />
        </div>
      );
    case 'login':
      console.log('🔐 Showing LoginForm');
      return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
          <LoginForm
            onLogin={handleLogin}
            onGoogleLogin={googleLogin}
            onSwitchToRegister={() => setCurrentViewState('register')}
            onBackToHome={handleBackToHome}
          />
        </div>
      );
    case 'verify-email':
      console.log('📧 Showing EmailVerification');
      return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
          <EmailVerification
            email={pendingUser?.email || ''}
            onVerified={handleEmailVerification}
            onResend={async () => {
              const email = pendingUser?.email || '';
              console.log('🔄 Attempting to resend OTP for:', email);
              console.log('🔄 Pending user object:', pendingUser);

              if (!email) {
                console.error('❌ No email available for resend OTP');
                throw new Error('No email available. Please try logging in again.');
              }

              try {
                const result = await apiService.resendOTP(email);
                console.log('✅ OTP resent successfully:', result);
              } catch (error: unknown) {
                console.error('❌ Failed to resend OTP:', error);
                const errorMessage = error instanceof Error ? error.message : String(error);
                console.error('Error details:', errorMessage);
                throw error;
              }
            }}
            onSkip={() => setCurrentViewState('profile-setup')}
          />
        </div>
      );
    case 'profile-setup':
      console.log('👤 Showing ProfileSetup');
      return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
          <ProfileSetup
            onComplete={handleProfileComplete}
            onSkip={handleProfileComplete}
          />
        </div>
      );
    default:
      console.log('🏠 Showing default LandingPage');
      return <LandingPage onLogin={showLogin} onRegister={showRegister} />;
  }
}

function App() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);

  useEffect(() => {
    // Check if user has completed the full onboarding process
    console.log('🔍 Checking onboarding completion:', {
      hasUser: !!user,
      isAuthenticated: !!user,
      isVerified: user?.isVerified,
      hasDisplayName: !!user?.displayName,
      displayName: user?.displayName,
      currentOnboardingState: hasCompletedOnboarding
    });

    if (user && user.isVerified && user.displayName) {
      console.log('✅ User has complete profile, setting hasCompletedOnboarding to true');
      setHasCompletedOnboarding(true);
    } else {
      console.log('❌ User needs profile setup, staying on auth flow');
      setHasCompletedOnboarding(false);
    }
  }, [user, hasCompletedOnboarding]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <div className="text-gray-600 text-xl font-semibold">Loading ChatPay...</div>
        </div>
      </div>
    );
  }

  // Always start with landing page - no auto-login
  console.log('🎯 App component render:', {
    isAuthenticated,
    hasCompletedOnboarding,
    userDisplayName: user?.displayName,
    userIsVerified: user?.isVerified
  });

  if (!isAuthenticated || !hasCompletedOnboarding) {
    console.log('🏠 Showing LandingInterface (auth flow)');
    return <LandingInterface onGetStarted={() => {
      console.log('🚀 onGetStarted called, setting hasCompletedOnboarding to true');
      setHasCompletedOnboarding(true);
    }} />;
  }

  console.log('💬 Showing ChatInterface (dashboard)');
  return <ChatInterface />;
}

export default function Home() {
  return <App />;
}
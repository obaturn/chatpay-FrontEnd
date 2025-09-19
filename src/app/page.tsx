'use client';

import { useState } from 'react';
import { AuthProvider, useAuth } from './AuthContext';
import LandingPage from './LandingPage';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';
import ChatList from './ChatList';
import Message from './Message';
import PaymentDrawer from './PaymentDrawer';
import TestContract from './TestContract';
import { useCurrentAccount, useWallets, useConnectWallet, useSignTransaction } from '@mysten/dapp-kit';
import WalletWrapper from '../components/WalletWrapper';

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

interface MessageType {
  id: string;
  text: string;
  payment?: Payment;
  timestamp: string;
}

function ChatInterface() {
  const { user, logout } = useAuth();
  const currentAccount = useCurrentAccount();
  const wallets = useWallets();
  const { mutate: connectWallet, isPending: isConnecting } = useConnectWallet();
  const signTransaction = useSignTransaction();
  const [selectedChatId, setSelectedChatId] = useState<string | null>('1'); // Auto-select first chat
  const [showWalletDebug, setShowWalletDebug] = useState(false);

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
    }, 500); // Increased delay to give modal time to render
  };
  const [messages, setMessages] = useState<MessageType[]>([
    {
      id: '1',
      text: 'Hey! How are you doing?',
      timestamp: '10:25 AM',
    },
    {
      id: '2',
      text: 'I\'m doing great! Thanks for asking.',
      timestamp: '10:26 AM',
    },
    {
      id: '3',
      text: 'I wanted to discuss the payment for the project.',
      timestamp: '10:27 AM',
    },
    {
      id: '4',
      text: 'Payment Request: $50.00 to 0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
      timestamp: '10:28 AM',
      payment: {
        id: 'p1',
        type: 'request',
        amount: 50,
        receiverWallet: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
        status: 'verified',
        txHash: '0x8ba1f109551bD432803012645ac136ddd64DBA72',
      }
    },
  ]);
  const [newMessage, setNewMessage] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerType, setDrawerType] = useState<'request' | 'paid'>('request');

  // Mock chat data
  const chats = [
    {
      id: '1',
      name: 'John Doe',
      lastMessage: 'I wanted to discuss the payment for the project.',
      timestamp: '10:27 AM',
      unreadCount: 0,
    },
    {
      id: '2',
      name: 'Jane Smith',
      lastMessage: 'Thanks for the payment!',
      timestamp: '9:15 AM',
      unreadCount: 1,
    },
    {
      id: '3',
      name: 'Payment Bot',
      lastMessage: 'Your payment request has been sent.',
      timestamp: '8:45 AM',
      unreadCount: 0,
    },
  ];

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      const message: MessageType = {
        id: Date.now().toString(),
        text: newMessage,
        timestamp: new Date().toLocaleTimeString(),
      };
      setMessages([...messages, message]);
      setNewMessage('');
    }
  };

  const handleRequestSubmit = (amount: number, receiverWallet: string) => {
    const message: MessageType = {
      id: Date.now().toString(),
      text: `Payment Request: $${amount} to ${receiverWallet}`,
      timestamp: new Date().toLocaleTimeString(),
      payment: {
        id: Date.now().toString(),
        type: 'request',
        amount,
        receiverWallet,
        status: 'verified', // Mock as verified for request
        txHash: `0x${Math.random().toString(16).substr(2, 64)}`, // Mock tx hash
      }
    };
    setMessages([...messages, message]);
    setDrawerOpen(false);
  };

  const handleDrawerSubmit = (paymentData: {
    amount: number;
    currency: string;
    paymentMethod: string;
    receiverDetails: string;
  }) => {
    if (drawerType === 'request') {
      const message: MessageType = {
        id: Date.now().toString(),
        text: `Payment Request: ${paymentData.currency} ${paymentData.amount} via ${paymentData.paymentMethod}`,
        timestamp: new Date().toLocaleTimeString(),
        payment: {
          id: Date.now().toString(),
          type: 'request',
          amount: paymentData.amount,
          receiverWallet: paymentData.receiverDetails,
          status: 'verified',
          txHash: `0x${Math.random().toString(16).substr(2, 64)}`,
        }
      };
      setMessages([...messages, message]);
    } else {
      // For mark as paid
      const message: MessageType = {
        id: Date.now().toString(),
        text: `Marked as Paid: ${paymentData.currency} ${paymentData.amount} via ${paymentData.paymentMethod}`,
        timestamp: new Date().toLocaleTimeString(),
        payment: {
          id: Date.now().toString(),
          type: 'manual',
          paymentMethod: paymentData.paymentMethod,
          referenceId: paymentData.amount.toString(),
          status: 'unverified',
        }
      };
      setMessages([...messages, message]);
    }
    setDrawerOpen(false);
  };

  const handleNewChat = () => {
    // TODO: Implement new chat creation
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
        chats={chats}
        selectedChatId={selectedChatId}
        onSelectChat={setSelectedChatId}
        onNewChat={handleNewChat}
      />

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedChatId ? (
          <>
            {/* Header */}
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white p-4 shadow-md flex items-center justify-between relative z-20">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold">C</span>
                </div>
                <div>
                  <h1 className="text-lg font-semibold">
                    {chats.find(c => c.id === selectedChatId)?.name || 'Contact'}
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
                    onClick={() => setShowWalletDebug(!showWalletDebug)}
                    className="text-white hover:text-green-200 p-2 rounded-full hover:bg-green-700 transition duration-200"
                    title="Wallet Debug Info"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </button>
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
              {messages.map((msg) => (
                <Message
                  key={msg.id}
                  id={msg.id}
                  text={msg.text}
                  payment={msg.payment}
                  timestamp={msg.timestamp}
                />
              ))}

              {/* Test Panel */}
              <div className="mt-8">
                <TestContract />
              </div>

              {/* Wallet Debug Panel */}
              {showWalletDebug && (
                <div className="mt-4 p-4 bg-gray-100 rounded-lg">
                  <h3 className="text-lg font-semibold mb-2">Wallet Debug Info</h3>
                  <div className="space-y-2 text-sm">
                    <div><strong>Current Account:</strong> {currentAccount?.address || 'Not connected'}</div>
                    <div><strong>Wallet Status:</strong> {currentAccount ? 'Connected' : 'Disconnected'}</div>
                    <div><strong>Connection State:</strong> {isConnecting ? 'Connecting...' : 'Idle'}</div>
                    <div><strong>Available Wallets:</strong> {wallets.length}</div>
                    <div><strong>Sign Transaction Ready:</strong> {signTransaction ? 'Yes' : 'No'}</div>
                    <div><strong>Network:</strong> Sui Testnet</div>
                    <div className="mt-4">
                      <strong>Available Wallets:</strong>
                      <ul className="list-disc list-inside mt-2">
                        {wallets.map((wallet, index) => (
                          <li key={index}>{wallet.name}</li>
                        ))}
                        {wallets.length === 0 && <li>No wallets detected</li>}
                      </ul>
                    </div>
                    <div className="mt-4">
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                        <p className="text-sm text-green-800">
                          <strong>✅ Working Connection:</strong> Use the "Connect Wallet" button above - it successfully opens your Sui wallet!
                        </p>
                      </div>
                      <strong>Instructions:</strong>
                      <ul className="list-disc list-inside mt-2 space-y-1">
                        <li>Install a Sui wallet extension (Sui Wallet, Ethos, etc.)</li>
                        <li>Click the "Connect Wallet" button above</li>
                        <li>Approve the connection in your wallet popup</li>
                        <li>Try creating a crypto payment to test transactions</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Input Area */}
            <div className="bg-white p-4 border-t border-green-200 flex items-center space-x-2">
              <button className="text-green-500 hover:text-green-700 p-2 rounded-full hover:bg-green-50 transition duration-200">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                </svg>
              </button>
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Type a message..."
                className="flex-1 border border-green-300 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <button className="text-green-500 hover:text-green-700 p-2 rounded-full hover:bg-green-50 transition duration-200">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1.586a1 1 0 01.707.293l.707.707A1 1 0 0012.414 11H15m2 0h1.586a1 1 0 01.707.293l.707.707A1 1 0 0021 12.414V15m0 2a2 2 0 01-2 2h-1.586a1 1 0 01-.707-.293l-.707-.707A1 1 0 0016.586 16H15m-2 0H9.414a1 1 0 00-.707.293l-.707.707A1 1 0 007 17.586V19a2 2 0 01-2 2H4a2 2 0 01-2-2v-1.586a1 1 0 01.293-.707l.707-.707A1 1 0 014.414 15H7m2 0v-1.586a1 1 0 01.293-.707l.707-.707A1 1 0 0110.414 12H13" />
                </svg>
              </button>
              <button
                onClick={() => {
                  setDrawerType('request');
                  setDrawerOpen(true);
                }}
                className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-full transition duration-200"
              >
                Request
              </button>
              <button
                onClick={() => {
                  setDrawerType('paid');
                  setDrawerOpen(true);
                }}
                className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-2 px-4 rounded-full transition duration-200"
              >
                Paid
              </button>
              <button
                onClick={handleSendMessage}
                className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold py-2 px-4 rounded-full transition duration-200"
              >
                ➤
              </button>
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
        onSubmit={handleDrawerSubmit}
      />
    </div>
  );
}

function LandingInterface() {
  const [currentView, setCurrentView] = useState<'landing' | 'register' | 'login'>('landing');
  const { login, register } = useAuth();

  const handleGetStarted = () => {
    setCurrentView('register');
  };

  const handleBackToHome = () => {
    setCurrentView('landing');
  };

  const handleLogin = async (email: string, password: string) => {
    await login(email, password);
  };

  const handleRegister = async (username: string, email: string, password: string) => {
    await register(username, email, password);
  };

  switch (currentView) {
    case 'landing':
      return <LandingPage onGetStarted={handleGetStarted} />;
    case 'register':
      return (
        <RegisterForm
          onRegister={handleRegister}
          onSwitchToLogin={() => setCurrentView('login')}
          onBackToHome={handleBackToHome}
        />
      );
    case 'login':
      return (
        <LoginForm
          onLogin={handleLogin}
          onSwitchToRegister={() => setCurrentView('register')}
          onBackToHome={handleBackToHome}
        />
      );
    default:
      return <LandingPage onGetStarted={handleGetStarted} />;
  }
}

function App() {
  const { isAuthenticated, isLoading } = useAuth();

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

  return isAuthenticated ? <ChatInterface /> : <LandingInterface />;
}

export default function Home() {
  return (
    <WalletWrapper>
      <AuthProvider>
        <App />
      </AuthProvider>
    </WalletWrapper>
  );
}

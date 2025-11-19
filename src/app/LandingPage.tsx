'use client';

import { useState } from 'react';

interface LandingPageProps {
  onLogin: () => void;
  onRegister: () => void;
  onGoogleLogin?: () => void;
}

export default function LandingPage({ onLogin, onRegister, onGoogleLogin }: LandingPageProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      icon: "💬",
      title: "Start a Conversation",
      description: "Connect with friends and family through secure messaging"
    },
    {
      icon: "💰",
      title: "Send Money Instantly",
      description: "Request or send payments directly in your chat"
    },
    {
      icon: "🔒",
      title: "Bank-Grade Security",
      description: "Your money and messages are protected by blockchain technology"
    }
  ];

  const nextStep = () => {
    setCurrentStep((prev) => (prev + 1) % steps.length);
  };

  const prevStep = () => {
    setCurrentStep((prev) => (prev - 1 + steps.length) % steps.length);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-lg">₿</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">ChatPay</h1>
              <p className="text-xs text-gray-500">Secure Payments</p>
            </div>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-gray-600 hover:text-gray-900 font-medium">Features</a>
            <a href="#security" className="text-gray-600 hover:text-gray-900 font-medium">Security</a>
            <a href="#how-it-works" className="text-gray-600 hover:text-gray-900 font-medium">How it Works</a>
            <a href="#support" className="text-gray-600 hover:text-gray-900 font-medium">Support</a>
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={onLogin}
              className="text-green-600 hover:text-green-700 font-medium text-sm hidden sm:block"
            >
              Log in
            </button>
            <button
              onClick={onRegister}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium text-sm transition duration-200"
            >
              Sign up
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-green-50 to-blue-50 px-6 py-20">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
                Send Money Like
                <span className="text-green-600 block">Sending a Message</span>
              </h1>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                ChatPay revolutionizes payments by integrating them directly into your conversations.
                Send and receive money instantly with bank-level security powered by blockchain technology.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <button
                  onClick={onRegister}
                  className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-lg font-semibold text-lg transition duration-200 flex items-center justify-center shadow-lg"
                >
                  <span>Start Sending Money</span>
                  <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>

                {onGoogleLogin && (
                  <button
                    onClick={onGoogleLogin}
                    className="border-2 border-gray-300 hover:border-gray-400 text-gray-700 px-8 py-4 rounded-lg font-semibold text-lg transition duration-200 flex items-center justify-center"
                  >
                    <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    Continue with Google
                  </button>
                )}
              </div>

              {/* Trust Indicators */}
              <div className="flex items-center space-x-8 text-sm text-gray-600">
                <div className="flex items-center space-x-2">
                  <span className="text-green-600">🔒</span>
                  <span>Bank-level security</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-green-600">⚡</span>
                  <span>Instant transfers</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-green-600">🌍</span>
                  <span>Global payments</span>
                </div>
              </div>
            </div>

            {/* Phone Demo - WhatsApp Payments Style */}
            <div className="relative">
              {/* Phone Frame */}
              <div className="relative mx-auto w-80 h-[600px] bg-black rounded-[3rem] shadow-2xl border-4 border-black">
                {/* Screen */}
                <div className="w-full h-full bg-white rounded-[2.5rem] overflow-hidden">
                  {/* Status Bar */}
                  <div className="bg-black text-white px-6 py-1 flex justify-between items-center text-xs">
                    <span>9:41</span>
                    <div className="flex items-center space-x-2">
                      <span>📶</span>
                      <span>📶</span>
                      <span>🔋</span>
                    </div>
                  </div>

                  {/* WhatsApp Header */}
                  <div className="bg-green-600 text-white px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <button className="text-white">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                      </button>
                      <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                        <span className="text-sm font-bold">A</span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-sm">Alice Johnson</h3>
                        <p className="text-xs opacity-75">Online</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button className="text-white">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                      </button>
                      <button className="text-white">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* Chat Messages */}
                  <div className="flex-1 bg-[#e5ddd5] p-4 space-y-2 overflow-y-auto" style={{height: 'calc(100% - 140px)'}}>
                    {/* Date separator */}
                    <div className="flex justify-center">
                      <div className="bg-white px-3 py-1 rounded-full text-xs text-gray-500 shadow-sm">
                        Today
                      </div>
                    </div>

                    {/* Payment Request Message */}
                    <div className="flex justify-start mb-4">
                      <div className="bg-white rounded-lg px-4 py-2 max-w-xs shadow-sm">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="text-lg">💰</span>
                          <span className="font-semibold text-gray-900 text-sm">Payment</span>
                        </div>
                        <p className="text-sm text-gray-800 mb-2">Alice requested $50.00</p>
                        <p className="text-xs text-gray-500 mb-3">For lunch</p>
                        <div className="flex space-x-2">
                          <button className="bg-green-600 text-white px-4 py-1 rounded text-xs font-medium">
                            Pay $50.00
                          </button>
                          <button className="border border-gray-300 text-gray-600 px-4 py-1 rounded text-xs">
                            Decline
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Response */}
                    <div className="flex justify-end mb-2">
                      <div className="bg-green-500 text-white rounded-lg px-4 py-2 max-w-xs">
                        <p className="text-sm">Sure! Sending payment now 💳</p>
                        <p className="text-xs opacity-75 mt-1">10:27 AM ✓✓</p>
                      </div>
                    </div>

                    {/* Payment Success Message */}
                    <div className="flex justify-center mb-4">
                      <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-3 text-center max-w-sm">
                        <div className="flex items-center justify-center space-x-2 mb-2">
                          <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center">
                            <span className="text-white text-sm">✓</span>
                          </div>
                          <span className="font-semibold text-green-800 text-sm">Payment Sent</span>
                        </div>
                        <p className="text-sm text-gray-600 mb-1">$50.00 sent to Alice Johnson</p>
                        <p className="text-xs text-gray-500">Transaction ID: 8ba1f109551bD432803012645ac136ddd64DBA72</p>
                        <button className="text-green-600 text-xs font-medium mt-2 hover:underline">
                          View details
                        </button>
                      </div>
                    </div>

                    {/* Thank you message */}
                    <div className="flex justify-start">
                      <div className="bg-white rounded-lg px-4 py-2 max-w-xs shadow-sm">
                        <p className="text-sm text-gray-800">Thank you so much! 🙏</p>
                        <p className="text-xs text-gray-500 mt-1">10:28 AM ✓</p>
                      </div>
                    </div>
                  </div>

                  {/* Message Input */}
                  <div className="bg-white border-t border-gray-200 px-4 py-3 flex items-center space-x-2">
                    <button className="text-gray-400 hover:text-gray-600">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                      </svg>
                    </button>
                    <div className="flex-1 bg-gray-100 rounded-full px-4 py-2 flex items-center">
                      <input
                        type="text"
                        placeholder="Type a message"
                        className="flex-1 bg-transparent outline-none text-sm"
                      />
                      <button className="text-gray-400 hover:text-gray-600 ml-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1.586a1 1 0 01.707.293l.707.707A1 1 0 0012.414 11H15m2 0h1.586a1 1 0 01.707.293l.707.707A1 1 0 0021 12.414V15m0 2a2 2 0 01-2 2h-1.586a1 1 0 01-.707-.293l-.707-.707A1 1 0 0016.586 16H15m-2 0H9.414a1 1 0 00-.707.293l-.707.707A1 1 0 007 17.586V19a2 2 0 01-2 2H4a2 2 0 01-2-2v-1.586a1 1 0 01.293-.707l.707-.707A1 1 0 014.414 15H7m2 0v-1.586a1 1 0 01.293-.707l.707-.707A1 1 0 0110.414 12H13" />
                        </svg>
                      </button>
                    </div>
                    <button className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center text-white">
                      <span className="text-sm">💰</span>
                    </button>
                  </div>
                </div>

                {/* Home Indicator */}
                <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-32 h-1 bg-white rounded-full opacity-50"></div>
              </div>

              {/* Floating Payment Badge */}
              <div className="absolute -top-4 -right-4 bg-green-600 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-lg">
                💸 ChatPay
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Why Choose ChatPay?</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Experience the future of payments with features designed for the modern world
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">💬</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Chat Integration</h3>
              <p className="text-gray-600">Payments happen naturally within your conversations</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">⚡</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Instant Transfers</h3>
              <p className="text-gray-600">Send money anywhere instantly, no waiting required</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🔒</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Bank-Level Security</h3>
              <p className="text-gray-600">Military-grade encryption protects your transactions</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🌍</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Global Payments</h3>
              <p className="text-gray-600">Send money worldwide with low fees</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="bg-gray-50 py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-xl text-gray-600">Getting started with ChatPay is as easy as 1-2-3</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-20 h-20 bg-green-600 text-white rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-bold">
                1
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">Connect Your Wallet</h3>
              <p className="text-gray-600">Link your Sui wallet to start sending and receiving payments securely</p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-green-600 text-white rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-bold">
                2
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">Start a Conversation</h3>
              <p className="text-gray-600">Chat with friends and family using our secure messaging platform</p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-green-600 text-white rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-bold">
                3
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">Send Money Instantly</h3>
              <p className="text-gray-600">Request or send payments directly within your chat conversations</p>
            </div>
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section id="security" className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">Your Security is Our Priority</h2>
              <p className="text-xl text-gray-600 mb-8">
                ChatPay uses cutting-edge blockchain technology and military-grade encryption
                to ensure your money and conversations are always safe.
              </p>

              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-green-600">🔐</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">End-to-End Encryption</h3>
                    <p className="text-gray-600">All messages and payment data are encrypted from sender to receiver</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-green-600">🛡️</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Blockchain Security</h3>
                    <p className="text-gray-600">Transactions are recorded on the immutable Sui blockchain</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-green-600">👤</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Identity Verification</h3>
                    <p className="text-gray-600">Optional KYC verification for enhanced account security</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-2xl p-8">
              <div className="text-center">
                <div className="w-20 h-20 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-white text-3xl">🛡️</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Trusted by Millions</h3>
                <p className="text-gray-600 mb-6">
                  Join thousands of users who trust ChatPay for their daily payment needs
                </p>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-green-600">99.9%</div>
                    <div className="text-sm text-gray-600">Uptime</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-600">$2M+</div>
                    <div className="text-sm text-gray-600">Processed</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-600">50K+</div>
                    <div className="text-sm text-gray-600">Users</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-green-600 py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Start Sending Money?
          </h2>
          <p className="text-xl text-green-100 mb-8">
            Join ChatPay today and experience the future of payments
          </p>
          <button
            onClick={onRegister}
            className="bg-white text-green-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-50 transition duration-200 shadow-lg"
          >
            Get Started Now
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer id="support" className="bg-gray-900 text-white py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold text-lg">₿</span>
                </div>
                <div>
                  <h1 className="text-xl font-bold">ChatPay</h1>
                  <p className="text-sm text-gray-400">Secure Payments</p>
                </div>
              </div>
              <p className="text-gray-400 text-sm mb-4">
                Send money as easily as sending a message. Secure, fast, and reliable payments powered by blockchain.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white">Twitter</a>
                <a href="#" className="text-gray-400 hover:text-white">Facebook</a>
                <a href="#" className="text-gray-400 hover:text-white">LinkedIn</a>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white">Features</a></li>
                <li><a href="#" className="hover:text-white">Security</a></li>
                <li><a href="#" className="hover:text-white">Pricing</a></li>
                <li><a href="#" className="hover:text-white">API</a></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white">Help Center</a></li>
                <li><a href="#" className="hover:text-white">Contact Us</a></li>
                <li><a href="#" className="hover:text-white">Status</a></li>
                <li><a href="#" className="hover:text-white">Community</a></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white">About</a></li>
                <li><a href="#" className="hover:text-white">Blog</a></li>
                <li><a href="#" className="hover:text-white">Careers</a></li>
                <li><a href="#" className="hover:text-white">Press</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © 2024 ChatPay. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-gray-400 hover:text-white text-sm">Privacy Policy</a>
              <a href="#" className="text-gray-400 hover:text-white text-sm">Terms of Service</a>
              <a href="#" className="text-gray-400 hover:text-white text-sm">Cookie Policy</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
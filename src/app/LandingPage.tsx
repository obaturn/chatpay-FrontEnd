'use client';

import { useState } from 'react';

interface LandingPageProps {
  onGetStarted: () => void;
}

export default function LandingPage({ onGetStarted }: LandingPageProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

  const features = [
    {
      icon: "💬",
      title: "Real-time Messaging",
      description: "Instant, secure messaging with end-to-end encryption. Chat with friends, family, and colleagues seamlessly.",
      color: "from-blue-500 to-purple-600"
    },
    {
      icon: "💰",
      title: "Integrated Payments",
      description: "Request and send payments directly through chat. No need for separate payment apps or complicated processes.",
      color: "from-green-500 to-blue-600"
    },
    {
      icon: "🔒",
      title: "Blockchain Security",
      description: "All transactions secured by blockchain technology. Transparent, immutable, and completely secure payments.",
      color: "from-purple-500 to-pink-600"
    },
    {
      icon: "📊",
      title: "Transaction History",
      description: "Keep track of all your payments and transactions in one convenient location with detailed records.",
      color: "from-indigo-500 to-purple-600"
    }
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Freelance Designer",
      content: "ChatPay has revolutionized how I handle client payments. Everything happens right in the chat!",
      avatar: "SJ"
    },
    {
      name: "Mike Chen",
      role: "Small Business Owner",
      content: "The integrated payment system saves me so much time. No more switching between apps!",
      avatar: "MC"
    },
    {
      name: "Emma Davis",
      role: "Digital Marketer",
      content: "Secure, fast, and user-friendly. ChatPay is exactly what the messaging world needed.",
      avatar: "ED"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-100">
        <div className="container mx-auto px-6 py-4">
          <nav className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-xl">💬</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  ChatPay
                </h1>
                <p className="text-gray-500 text-sm">Where Conversations Meet Commerce</p>
              </div>
            </div>
            <div className="flex space-x-6">
              <button className="text-gray-700 hover:text-blue-600 px-4 py-2 transition duration-200 font-medium">
                Features
              </button>
              <button className="text-gray-700 hover:text-blue-600 px-4 py-2 transition duration-200 font-medium">
                About
              </button>
              <button
                onClick={onGetStarted}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-full font-semibold hover:from-blue-700 hover:to-purple-700 transition duration-200 transform hover:scale-105 shadow-md"
              >
                Get Started
              </button>
            </div>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-20">
        <div className="text-center mb-20">
          <div className="inline-block bg-gradient-to-r from-blue-100 to-purple-100 rounded-full px-6 py-2 mb-6">
            <span className="text-blue-600 font-semibold text-sm">✨ New: Integrated Payments</span>
          </div>
          <h2 className="text-5xl md:text-6xl font-bold mb-6 leading-tight text-gray-900">
            Chat, Pay, and
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> Connect</span>
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
            Experience the future of communication with ChatPay - the world's first messaging platform
            that seamlessly integrates secure payments. Send messages, request payments, and settle
            transactions all in one beautiful, intuitive interface.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-12">
            <button
              onClick={onGetStarted}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-4 px-10 rounded-full text-lg transition duration-300 transform hover:scale-105 shadow-lg"
            >
              <span className="flex items-center space-x-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span>Start Your Journey</span>
              </span>
            </button>
            <button className="border-2 border-gray-300 text-gray-700 hover:border-blue-600 hover:text-blue-600 font-bold py-4 px-10 rounded-full text-lg transition duration-300">
              <span className="flex items-center space-x-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1.586a1 1 0 01.707.293l.707.707A1 1 0 0012.414 11H15m2 0h1.586a1 1 0 01.707.293l.707.707A1 1 0 0021 12.414V15m0 2a2 2 0 01-2 2h-1.586a1 1 0 01-.707-.293l-.707-.707A1 1 0 0016.586 16H15m-2 0H9.414a1 1 0 00-.707.293l-.707.707A1 1 0 007 17.586V19a2 2 0 01-2 2H4a2 2 0 01-2-2v-1.586a1 1 0 01.293-.707l.707-.707A1 1 0 014.414 15H7m2 0v-1.586a1 1 0 01.293-.707l.707-.707A1 1 0 0110.414 12H13" />
                </svg>
                <span>Watch Demo</span>
              </span>
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 hover:shadow-xl transition duration-300">
              <div className="text-4xl font-bold text-blue-600 mb-2">10K+</div>
              <div className="text-gray-600 font-medium">Active Users</div>
            </div>
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 hover:shadow-xl transition duration-300">
              <div className="text-4xl font-bold text-purple-600 mb-2">$2M+</div>
              <div className="text-gray-600 font-medium">Payments Processed</div>
            </div>
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 hover:shadow-xl transition duration-300">
              <div className="text-4xl font-bold text-green-600 mb-2">99.9%</div>
              <div className="text-gray-600 font-medium">Uptime</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white py-20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h3 className="text-4xl font-bold text-gray-900 mb-4">Why Choose ChatPay?</h3>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Discover the features that make ChatPay the ultimate communication and payment platform
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-8 shadow-lg border border-gray-100 hover:shadow-xl transition duration-300 transform hover:scale-105"
              >
                <div className="text-5xl mb-6">{feature.icon}</div>
                <h4 className="text-2xl font-bold mb-4 text-gray-900">{feature.title}</h4>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Demo Section */}
      <section className="bg-gradient-to-br from-gray-50 to-blue-50 py-20">
        <div className="container mx-auto px-6">
          <div className="bg-white rounded-3xl p-8 md:p-12 max-w-6xl mx-auto shadow-2xl">
            <div className="text-center mb-12">
              <h3 className="text-4xl font-bold text-gray-900 mb-4">See ChatPay in Action</h3>
              <p className="text-xl text-gray-600">Watch how easy it is to chat and pay</p>
            </div>

            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="bg-gray-900 rounded-2xl p-6 md:p-8 text-green-400 font-mono text-sm shadow-xl overflow-x-auto">
                <div className="mb-4 text-yellow-300 font-bold">💬 ChatPay Conversation</div>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-sm font-bold text-white">JD</div>
                    <div className="flex-1">
                      <div className="text-purple-300 text-xs mb-1">John Doe • 2:30 PM</div>
                      <div className="text-white">Hey Sarah! The project is complete. Ready for payment? 💰</div>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 bg-pink-500 rounded-full flex items-center justify-center text-sm font-bold text-white">SJ</div>
                    <div className="flex-1">
                      <div className="text-purple-300 text-xs mb-1">Sarah Johnson • 2:31 PM</div>
                      <div className="text-white">Absolutely! Let me send the payment right now ✨</div>
                    </div>
                  </div>
                  <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-4 my-4 text-white">
                    <div className="font-bold mb-2 text-yellow-300">💳 Payment Request</div>
                    <div className="text-sm">Amount: $500.00</div>
                    <div className="text-sm">To: 0x742d...44e</div>
                    <div className="text-green-400 mt-2 font-semibold">✅ Payment completed instantly!</div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 bg-pink-500 rounded-full flex items-center justify-center text-sm font-bold text-white">SJ</div>
                    <div className="flex-1">
                      <div className="text-purple-300 text-xs mb-1">Sarah Johnson • 2:32 PM</div>
                      <div className="text-white">Payment sent! Thanks for the great work! 🎉</div>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-3xl font-bold mb-6 text-gray-900">How It Works</h4>
                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <div className="bg-blue-600 text-white w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg">1</div>
                    <div>
                      <h5 className="text-xl font-semibold mb-2 text-gray-900">Start a Conversation</h5>
                      <p className="text-gray-600">Connect with anyone through our secure messaging platform</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="bg-purple-600 text-white w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg">2</div>
                    <div>
                      <h5 className="text-xl font-semibold mb-2 text-gray-900">Request or Send Payment</h5>
                      <p className="text-gray-600">Use built-in payment features to handle transactions seamlessly</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="bg-green-600 text-white w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg">3</div>
                    <div>
                      <h5 className="text-xl font-semibold mb-2 text-gray-900">Secure Blockchain Processing</h5>
                      <p className="text-gray-600">All payments are processed securely on the blockchain</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-white py-20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h3 className="text-4xl font-bold text-gray-900 mb-4">What Our Users Say</h3>
            <p className="text-xl text-gray-600">Join thousands of satisfied users worldwide</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-8 shadow-lg border border-gray-100 hover:shadow-xl transition duration-300">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold mr-4">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <div className="font-bold text-gray-900">{testimonial.name}</div>
                    <div className="text-gray-600 text-sm">{testimonial.role}</div>
                  </div>
                </div>
                <p className="text-gray-700 italic leading-relaxed">"{testimonial.content}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 py-20">
        <div className="container mx-auto px-6">
          <div className="bg-white rounded-3xl p-12 text-center shadow-2xl">
            <h3 className="text-4xl font-bold text-gray-900 mb-6">
              Ready to Transform Your Communication?
            </h3>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Join ChatPay today and experience the future of messaging and payments.
              It's free to get started!
            </p>
            <button
              onClick={onGetStarted}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-4 px-12 rounded-full text-xl transition duration-300 transform hover:scale-105 shadow-lg"
            >
              <span className="flex items-center space-x-2">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span>Get Started Now - It's Free!</span>
              </span>
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-6">
          <div className="border-t border-gray-700 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="mb-4 md:mb-0">
                <h4 className="text-2xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">ChatPay</h4>
                <p className="text-gray-400">Revolutionizing digital communication and payments</p>
              </div>
              <div className="flex space-x-6">
                <a href="#" className="text-gray-400 hover:text-white transition duration-200">Privacy</a>
                <a href="#" className="text-gray-400 hover:text-white transition duration-200">Terms</a>
                <a href="#" className="text-gray-400 hover:text-white transition duration-200">Support</a>
              </div>
            </div>
            <div className="text-center mt-8 text-gray-400">
              © 2024 ChatPay. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
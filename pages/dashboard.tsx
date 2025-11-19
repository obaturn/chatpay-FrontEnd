import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { useAuth } from '../src/components/AuthContext';

export default function DashboardPage() {
  const { isAuthenticated, user, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // If user is not authenticated, redirect to login
    if (!isAuthenticated) {
      router.push('/login');
    }
    // If user is authenticated but doesn't have a complete profile, redirect to profile setup
    else if (isAuthenticated && user && !user.displayName) {
      router.push('/profile-setup');
    }
  }, [isAuthenticated, user, router]);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  if (!isAuthenticated || !user || !user.displayName) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white p-4 shadow-md flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {user.profilePicture ? (
            <img
              src={user.profilePicture}
              alt="Profile"
              className="w-10 h-10 rounded-full object-cover border-2 border-white"
            />
          ) : (
            <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-lg">
                {user.displayName?.charAt(0)?.toUpperCase() || user.username?.charAt(0)?.toUpperCase() || 'U'}
              </span>
            </div>
          )}
          <div>
            <h1 className="text-lg font-semibold">
              Welcome back, {user.displayName || user.username}!
            </h1>
            <p className="text-sm text-green-200">Online</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="text-white hover:text-green-200 p-2 rounded-full hover:bg-green-700 transition duration-200"
          title="Logout"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
        </button>
      </div>

      {/* Main Content */}
      <div className="p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Profile Card */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Profile</h3>
                <p className="text-gray-600 mb-4">Manage your account settings</p>
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium">
                  Edit Profile
                </button>
              </div>

              {/* Chats Card */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-xl">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Messages</h3>
                <p className="text-gray-600 mb-4">Start chatting with friends</p>
                <button
                  onClick={() => router.push('/chat')}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition duration-200"
                >
                  Open Chat
                </button>
              </div>

              {/* Payments Card */}
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-xl">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Payments</h3>
                <p className="text-gray-600 mb-4">Send and receive money</p>
                <div className="flex space-x-2">
                  <button className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition duration-200">
                    Make Payment
                  </button>
                  <button
                    onClick={() => router.push('/transactions')}
                    className="bg-purple-400 hover:bg-purple-500 text-white px-3 py-2 rounded-lg text-sm font-medium transition duration-200"
                  >
                    View History
                  </button>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="mt-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Recent Activity</h3>
              <div className="space-y-4">
                <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                    <span className="text-blue-600 font-semibold">✓</span>
                  </div>
                  <div>
                    <p className="text-gray-900 font-medium">Account created successfully</p>
                    <p className="text-gray-600 text-sm">Welcome to ChatPay!</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { useAuth } from '../src/components/AuthContext';

export default function ProfileSetupPage() {
  const { isAuthenticated, user, updateProfile } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // If user is not authenticated, redirect to login
    if (!isAuthenticated) {
      router.push('/login');
    }
    // If user already has a complete profile, redirect to dashboard
    else if (isAuthenticated && user && user.displayName) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, user, router]);

  const handleProfileComplete = async (profileData: { displayName: string; bio?: string; profilePicture?: string }) => {
    try {
      await updateProfile(profileData);
      router.push('/dashboard');
    } catch (error) {
      console.error('Profile update failed:', error);
    }
  };

  if (!isAuthenticated || !user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Complete Your Profile</h1>
          <p className="text-gray-600">Tell us a bit about yourself</p>
        </div>

        <form className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Display Name
            </label>
            <input
              type="text"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="How should we call you?"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Bio (Optional)
            </label>
            <textarea
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Tell us about yourself..."
              rows={3}
            />
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white font-bold py-3 px-4 rounded-lg transition duration-200"
          >
            Complete Profile
          </button>
        </form>
      </div>
    </div>
  );
}
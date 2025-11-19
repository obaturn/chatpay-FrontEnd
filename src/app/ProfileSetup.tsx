'use client';

import { useState } from 'react';
import { useAuth } from '../components/AuthContext';

interface ProfileSetupProps {
  onComplete: () => void;
  onSkip?: () => void;
}

export default function ProfileSetup({ onComplete, onSkip }: ProfileSetupProps) {
  const { user, updateProfile } = useAuth();
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [businessType, setBusinessType] = useState(user?.businessType || '');
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const businessTypes = [
    'Individual',
    'Small Business',
    'Freelancer',
    'Startup',
    'Enterprise',
    'Non-profit',
    'Other',
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!displayName.trim()) {
      setError('Display name is required');
      return;
    }

    setIsLoading(true);
    try {
      await updateProfile({
        displayName: displayName.trim(),
        bio: bio.trim(),
        businessType: businessType || undefined,
        profilePicture,
      });
      onComplete();
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type and size
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file');
        return;
      }
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setError('Image size must be less than 5MB');
        return;
      }
      setProfilePicture(file);
      setError('');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Complete Your Profile</h1>
          <p className="text-gray-600">Tell us a bit about yourself</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Profile Picture */}
          <div className="flex flex-col items-center">
            <div className="w-24 h-24 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center mb-4 relative">
              {profilePicture ? (
                <img
                  src={URL.createObjectURL(profilePicture)}
                  alt="Profile preview"
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <span className="text-white text-2xl font-bold">
                  {displayName.charAt(0).toUpperCase() || user?.username?.charAt(0).toUpperCase() || 'U'}
                </span>
              )}
              <label className="absolute bottom-0 right-0 bg-white rounded-full p-2 shadow-lg cursor-pointer hover:bg-gray-50 transition duration-200">
                <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                  disabled={isLoading}
                />
              </label>
            </div>
            <p className="text-sm text-gray-500">Click to add profile picture</p>
          </div>

          {/* Display Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Display Name *
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="How others will see you"
              required
              disabled={isLoading}
            />
          </div>

          {/* Bio */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Bio
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
              placeholder="Tell others about yourself..."
              disabled={isLoading}
            />
          </div>

          {/* Business Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Business Type
            </label>
            <select
              value={businessType}
              onChange={(e) => setBusinessType(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              disabled={isLoading}
            >
              <option value="">Select business type</option>
              {businessTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          {/* Submit Buttons */}
          <div className="space-y-3">
            <button
              type="submit"
              disabled={isLoading || !displayName.trim()}
              className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold py-3 px-4 rounded-lg transition duration-200 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Saving...' : 'Complete Profile'}
            </button>

            {onSkip && (
              <button
                type="button"
                onClick={onSkip}
                className="w-full text-gray-600 hover:text-gray-800 py-2 px-4 rounded-lg transition duration-200"
                disabled={isLoading}
              >
                Skip for now
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
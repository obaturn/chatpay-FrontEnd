import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { apiService } from '../../src/components/api';
import { useAuth } from '../../src/components/AuthContext';

interface UserProfile {
    _id: string;
    username: string;
    displayName: string;
    profilePicture?: string;
    bio?: string;
}

export default function UserProfilePage() {
    const router = useRouter();
    const { username } = router.query;
    const { isAuthenticated, user: currentUser } = useAuth();

    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (username && typeof username === 'string') {
            const fetchProfile = async () => {
                try {
                    const response = await apiService.getUserByUsername(username);
                    if (response.success) {
                        setProfile(response.user);
                    } else {
                        setError('User not found');
                    }
                } catch (err) {
                    setError('Failed to load profile');
                    console.error(err);
                } finally {
                    setIsLoading(false);
                }
            };

            fetchProfile();
        }
    }, [username]);

    const handleStartChat = async () => {
        if (!isAuthenticated) {
            // Redirect to login, then back here? Or straight to dashboard?
            // For simplicity, user should login first.
            router.push('/');
            return;
        }

        if (profile && currentUser) {
            if (profile._id === currentUser._id) {
                alert("You can't chat with yourself!");
                return;
            }

            try {
                // Create the chat
                await apiService.createChat([profile._id], 'direct');
                // Redirect to dashboard
                router.push('/');
            } catch (e) {
                console.error("Failed to start chat", e);
                alert("Could not start chat. Please try again.");
            }
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
            </div>
        );
    }

    if (error || !profile) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
                <h1 className="text-2xl font-bold text-gray-800 mb-2">Oops!</h1>
                <p className="text-gray-600">{error || 'User not found'}</p>
                <button
                    onClick={() => router.push('/')}
                    className="mt-4 text-green-600 hover:text-green-700 font-medium"
                >
                    Go Home
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden">
                {/* Cover / Header */}
                <div className="h-32 bg-gradient-to-r from-green-400 to-blue-500"></div>

                <div className="px-8 pb-8">
                    {/* Avatar */}
                    <div className="relative -mt-16 mb-6 flex justify-center">
                        {profile.profilePicture ? (
                            /* eslint-disable-next-line @next/next/no-img-element */
                            <img
                                src={profile.profilePicture}
                                alt={profile.displayName}
                                className="w-32 h-32 rounded-full border-4 border-white shadow-lg object-cover bg-white"
                            />
                        ) : (
                            <div className="w-32 h-32 rounded-full border-4 border-white shadow-lg bg-white flex items-center justify-center text-4xl font-bold text-gray-400">
                                {profile.displayName?.charAt(0).toUpperCase()}
                            </div>
                        )}
                    </div>

                    <div className="text-center">
                        <h1 className="text-2xl font-bold text-gray-900">{profile.displayName}</h1>
                        <p className="text-gray-500 font-medium">@{profile.username}</p>

                        {profile.bio && (
                            <p className="mt-4 text-gray-600 text-sm leading-relaxed">
                                {profile.bio}
                            </p>
                        )}

                        <div className="mt-8 space-y-3">
                            <button
                                onClick={handleStartChat}
                                className="w-full py-3 px-4 bg-green-500 hover:bg-green-600 text-white font-bold rounded-xl shadow-md transform transition hover:-translate-y-0.5"
                            >
                                {isAuthenticated ? 'Start Chatting' : 'Login to Chat'}
                            </button>

                            {!isAuthenticated && (
                                <button
                                    onClick={() => router.push('/')}
                                    className="w-full py-3 px-4 bg-white border border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-50"
                                >
                                    Create an Account
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

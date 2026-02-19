import { useState, useEffect } from 'react';
import { apiService } from './api';
import { useAuth } from './AuthContext';

interface User {
    username: string;
    displayName: string;
    profilePicture?: string;
    isOnline: boolean;
    _id: string;
}

interface NewChatModalProps {
    isOpen: boolean;
    onClose: () => void;
    onStartChat: (userId: string) => void;
}

export default function NewChatModal({ isOpen, onClose, onStartChat }: NewChatModalProps) {
    const { user } = useAuth();
    const [searchTerm, setSearchTerm] = useState('');
    const [results, setResults] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [shareLinkCopied, setShareLinkCopied] = useState(false);

    useEffect(() => {
        if (!isOpen) {
            setSearchTerm('');
            setResults([]);
        }
    }, [isOpen]);

    // Debounced search
    useEffect(() => {
        const timer = setTimeout(async () => {
            if (searchTerm.length >= 2) {
                setIsLoading(true);
                try {
                    const response = await apiService.searchUsers(searchTerm);
                    if (response.success) {
                        setResults(response.users);
                    }
                } catch (error) {
                    console.error('Search failed:', error);
                } finally {
                    setIsLoading(false);
                }
            } else {
                setResults([]);
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [searchTerm]);

    const handleCopyLink = () => {
        if (user?.username) {
            const url = `${window.location.origin}/u/${user.username}`;
            navigator.clipboard.writeText(url);
            setShareLinkCopied(true);
            setTimeout(() => setShareLinkCopied(false), 2000);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0" style={{ zIndex: 9999, backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="flex items-center justify-center min-h-screen p-4">
                <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
                    <div className="p-6">
                        <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                            Start a New Chat
                        </h3>

                        {/* Share Link Section */}
                        <div className="mb-6 p-4 bg-purple-50 rounded-lg border border-purple-100">
                            <p className="text-sm text-purple-800 font-medium mb-2">Invite friends to chat</p>
                            <button
                                onClick={handleCopyLink}
                                className="flex items-center space-x-2 text-sm text-purple-600 hover:text-purple-700 font-semibold"
                            >
                                <span>🔗</span>
                                <span>{shareLinkCopied ? 'Link Copied!' : 'Copy My Profile Link'}</span>
                            </button>
                        </div>

                        {/* Search Input */}
                        <div className="relative mb-4">
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Search by username or name..."
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                autoFocus
                            />
                            <svg className="w-5 h-5 absolute left-3 top-2.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>

                        {/* Results List */}
                        <div className="max-h-60 overflow-y-auto">
                            {isLoading ? (
                                <div className="text-center py-4 text-gray-500">Searching...</div>
                            ) : results.length > 0 ? (
                                <div className="divide-y divide-gray-100">
                                    {results.map((result) => (
                                        <div
                                            key={result._id}
                                            id={`user-${result._id}`}
                                            data-user-id={result._id}
                                            data-user-name={result.displayName}
                                            style={{ padding: '12px', borderBottom: '1px solid #eee', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                                            onClick={(e) => {
                                                console.log('🔔 Row clicked!', result._id);
                                                alert('Click detected for ' + result.displayName);
                                            }}
                                        >
                                            <div className="flex items-center space-x-3">
                                                {result.profilePicture ? (
                                                    <img src={result.profilePicture} alt={result.username} className="w-10 h-10 rounded-full object-cover" />
                                                ) : (
                                                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-bold">
                                                        {result.displayName.charAt(0).toUpperCase()}
                                                    </div>
                                                )}
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900">{result.displayName}</p>
                                                    <p className="text-xs text-gray-500">@{result.username}</p>
                                                </div>
                                            </div>
                                            <button 
                                                className="text-green-600 hover:text-green-700 text-sm font-medium"
                                                onClick={async (e) => {
                                                    e.stopPropagation();
                                                    console.log('🔔 NewChatModal: Message button clicked for user', result._id);
                                                    try {
                                                        await onStartChat(result._id);
                                                    } catch (error) {
                                                        console.error('❌ NewChatModal: onStartChat failed', error);
                                                    } finally {
                                                        onClose();
                                                    }
                                                }}
                                            >
                                                Message
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            ) : searchTerm.length >= 2 ? (
                                <div className="text-center py-4 text-gray-500">No users found</div>
                            ) : null}
                        </div>
                    </div>

                    <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                        <button
                            type="button"
                            onClick={onClose}
                            className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

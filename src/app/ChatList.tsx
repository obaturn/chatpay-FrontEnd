'use client';

import { useState } from 'react';

interface Chat {
  id: string;
  name: string;
  lastMessage: string;
  timestamp: string;
  unreadCount: number;
  avatar?: string;
}

interface ChatListProps {
  chats: Chat[];
  selectedChatId: string | null;
  onSelectChat: (chatId: string) => void;
  onNewChat: () => void;
}

export default function ChatList({ chats, selectedChatId, onSelectChat, onNewChat }: ChatListProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredChats = chats.filter(chat =>
    chat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    chat.lastMessage.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold text-gray-900">Chats</h1>
          <button
            onClick={onNewChat}
            className="text-green-500 hover:text-green-700 p-2 rounded-full hover:bg-green-50 transition duration-200"
            title="New Chat"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search chats..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
          <svg className="w-5 h-5 absolute left-3 top-2.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto">
        {filteredChats.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <div className="text-4xl mb-4">💬</div>
            <p>No chats found</p>
            <p className="text-sm mt-2">Start a new conversation</p>
          </div>
        ) : (
          filteredChats.map((chat) => (
            <div
              key={chat.id}
              onClick={() => onSelectChat(chat.id)}
              className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition duration-200 ${
                selectedChatId === chat.id ? 'bg-green-50 border-r-4 border-r-green-500' : ''
              }`}
            >
              <div className="flex items-center space-x-3">
                {chat.avatar ? (
                  <img
                    src={chat.avatar}
                    alt={chat.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-lg">
                      {chat.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-gray-900 truncate">
                      {chat.name}
                    </h3>
                    <span className="text-xs text-gray-500">
                      {chat.timestamp}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 truncate mt-1">
                    {chat.lastMessage}
                  </p>
                </div>

                {chat.unreadCount > 0 && (
                  <div className="bg-green-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {chat.unreadCount > 99 ? '99+' : chat.unreadCount}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
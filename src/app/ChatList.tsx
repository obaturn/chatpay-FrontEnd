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
  return (
    <div className="w-80 bg-white border-r border-purple-200 flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white p-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold">ChatPay</h1>
        <button
          onClick={onNewChat}
          className="text-white hover:bg-green-700 p-2 rounded-full"
        >
          ✏️
        </button>
      </div>

      {/* Search */}
      <div className="p-4 border-b border-gray-200">
        <input
          type="text"
          placeholder="Search chats..."
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
        />
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto">
        {chats.map((chat) => (
          <div
            key={chat.id}
            onClick={() => onSelectChat(chat.id)}
            className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
              selectedChatId === chat.id ? 'bg-green-50' : ''
            }`}
          >
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
                {chat.avatar ? (
                  <img src={chat.avatar} alt={chat.name} className="w-full h-full rounded-full" />
                ) : (
                  <span className="text-gray-700 font-bold text-lg">
                    {chat.name.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className="text-gray-900 font-medium truncate">{chat.name}</h3>
                  <span className="text-xs text-gray-500">{chat.timestamp}</span>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600 truncate">{chat.lastMessage}</p>
                  {chat.unreadCount > 0 && (
                    <span className="bg-green-500 text-white text-xs rounded-full px-2 py-1">
                      {chat.unreadCount}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
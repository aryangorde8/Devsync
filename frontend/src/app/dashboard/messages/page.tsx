'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';

interface Message {
  id: number;
  sender_name: string;
  sender_email: string;
  subject: string;
  message: string;
  status: string;
  status_display: string;
  is_starred: boolean;
  created_at: string;
}

export default function MessagesPage() {
  const router = useRouter();
  const { isLoading: authLoading, isAuthenticated } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [filter, setFilter] = useState<'all' | 'unread' | 'starred'>('all');

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (isAuthenticated) {
      loadMessages();
    }
  }, [isAuthenticated]);

  const loadMessages = async () => {
    try {
      setIsLoading(true);
      const response = await api.get<{ results: Message[] } | Message[]>('/portfolio/messages/');
      const data = Array.isArray(response) ? response : response.results;
      setMessages(data);
    } catch (err) {
      console.error('Failed to load messages:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const markAsRead = async (id: number) => {
    try {
      await api.post(`/portfolio/messages/${id}/mark_read/`);
      setMessages(messages.map(m => m.id === id ? { ...m, status: 'read' } : m));
    } catch (err) {
      console.error('Failed to mark as read:', err);
    }
  };

  const toggleStarred = async (id: number) => {
    try {
      const response = await api.post<{ is_starred: boolean }>(`/portfolio/messages/${id}/toggle_starred/`);
      setMessages(messages.map(m => m.id === id ? { ...m, is_starred: response.is_starred } : m));
    } catch (err) {
      console.error('Failed to toggle starred:', err);
    }
  };

  const archiveMessage = async (id: number) => {
    try {
      await api.post(`/portfolio/messages/${id}/archive/`);
      setMessages(messages.filter(m => m.id !== id));
      setSelectedMessage(null);
    } catch (err) {
      console.error('Failed to archive:', err);
    }
  };

  const deleteMessage = async (id: number) => {
    if (!confirm('Are you sure you want to delete this message?')) return;
    try {
      await api.delete(`/portfolio/messages/${id}/`);
      setMessages(messages.filter(m => m.id !== id));
      setSelectedMessage(null);
    } catch (err) {
      console.error('Failed to delete:', err);
    }
  };

  const filteredMessages = messages.filter(m => {
    if (filter === 'unread') return m.status === 'unread';
    if (filter === 'starred') return m.is_starred;
    return m.status !== 'archived';
  });

  const handleSelectMessage = (message: Message) => {
    setSelectedMessage(message);
    if (message.status === 'unread') {
      markAsRead(message.id);
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="border-b border-white/10 bg-black/20 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard" className="text-gray-400 hover:text-white">
                ← Back to Dashboard
              </Link>
              <h1 className="text-2xl font-bold text-white">Messages</h1>
              <span className="bg-purple-500/20 text-purple-400 px-2 py-1 rounded text-sm">
                {messages.filter(m => m.status === 'unread').length} unread
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
          {/* Message List */}
          <div className="lg:col-span-1 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 overflow-hidden flex flex-col">
            {/* Filters */}
            <div className="p-4 border-b border-white/10 flex gap-2">
              {(['all', 'unread', 'starred'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 py-1 rounded-lg text-sm capitalize transition-colors ${
                    filter === f
                      ? 'bg-purple-500 text-white'
                      : 'bg-white/5 text-gray-400 hover:bg-white/10'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto">
              {filteredMessages.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <p className="text-4xl mb-2">📭</p>
                  <p>No messages yet</p>
                </div>
              ) : (
                filteredMessages.map((message) => (
                  <div
                    key={message.id}
                    onClick={() => handleSelectMessage(message)}
                    className={`p-4 border-b border-white/5 cursor-pointer transition-colors ${
                      selectedMessage?.id === message.id
                        ? 'bg-purple-500/20'
                        : 'hover:bg-white/5'
                    } ${message.status === 'unread' ? 'bg-white/5' : ''}`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          {message.status === 'unread' && (
                            <span className="w-2 h-2 bg-purple-500 rounded-full" />
                          )}
                          <span className={`font-medium truncate ${
                            message.status === 'unread' ? 'text-white' : 'text-gray-300'
                          }`}>
                            {message.sender_name}
                          </span>
                        </div>
                        <p className="text-sm text-gray-400 truncate">{message.subject}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(message.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleStarred(message.id);
                        }}
                        className="text-xl"
                      >
                        {message.is_starred ? '⭐' : '☆'}
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Message Detail */}
          <div className="lg:col-span-2 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 overflow-hidden">
            {selectedMessage ? (
              <div className="h-full flex flex-col">
                <div className="p-6 border-b border-white/10">
                  <div className="flex items-start justify-between">
                    <div>
                      <h2 className="text-xl font-semibold text-white">{selectedMessage.subject}</h2>
                      <p className="text-gray-400 mt-1">
                        From: {selectedMessage.sender_name} &lt;{selectedMessage.sender_email}&gt;
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        {new Date(selectedMessage.created_at).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => toggleStarred(selectedMessage.id)}
                        className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                        title={selectedMessage.is_starred ? 'Unstar' : 'Star'}
                      >
                        {selectedMessage.is_starred ? '⭐' : '☆'}
                      </button>
                      <button
                        onClick={() => archiveMessage(selectedMessage.id)}
                        className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                        title="Archive"
                      >
                        📥
                      </button>
                      <button
                        onClick={() => deleteMessage(selectedMessage.id)}
                        className="p-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 transition-colors"
                        title="Delete"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                </div>
                <div className="flex-1 p-6 overflow-y-auto">
                  <div className="prose prose-invert max-w-none">
                    <p className="text-gray-300 whitespace-pre-wrap">{selectedMessage.message}</p>
                  </div>
                </div>
                <div className="p-4 border-t border-white/10">
                  <a
                    href={`mailto:${selectedMessage.sender_email}?subject=Re: ${selectedMessage.subject}`}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors"
                  >
                    <span>↩️</span> Reply via Email
                  </a>
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <p className="text-6xl mb-4">✉️</p>
                  <p>Select a message to read</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

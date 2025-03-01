'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

// Mock data for conversations (would be fetched from API in real app)
const MOCK_CONVERSATIONS = [
  {
    id: '1',
    type: 'direct',
    participants: [
      { id: '101', name: 'Alex Johnson', image: '/placeholder.jpg' },
      { id: '1', name: 'Luu Pham', image: '/placeholder.jpg' }
    ],
    lastMessage: {
      content: 'Hey, are you still planning to join the Bali trip?',
      timestamp: '2024-02-28T14:30:00Z',
      senderId: '101'
    },
    unreadCount: 2
  },
  {
    id: '2',
    type: 'direct',
    participants: [
      { id: '102', name: 'Mika Tanaka', image: '/placeholder.jpg' },
      { id: '1', name: 'Luu Pham', image: '/placeholder.jpg' }
    ],
    lastMessage: {
      content: 'I sent you the details for the Tokyo trip!',
      timestamp: '2024-02-27T09:15:00Z',
      senderId: '102'
    },
    unreadCount: 0
  },
  {
    id: '3',
    type: 'group',
    groupName: 'Bali Beach Explorers',
    groupId: '1',
    participants: [
      { id: '101', name: 'Alex Johnson', image: '/placeholder.jpg' },
      { id: '201', name: 'Emma Wilson', image: '/placeholder.jpg' },
      { id: '202', name: 'David Lee', image: '/placeholder.jpg' },
      { id: '1', name: 'Luu Pham', image: '/placeholder.jpg' }
    ],
    lastMessage: {
      content: 'Has everyone booked their flights yet?',
      timestamp: '2024-02-26T18:45:00Z',
      senderId: '101'
    },
    unreadCount: 5
  }
];

// Mock messages for a conversation
const MOCK_MESSAGES = {
  '1': [
    {
      id: '101',
      content: 'Hey, are you still planning to join the Bali trip?',
      timestamp: '2024-02-28T14:30:00Z',
      senderId: '101'
    },
    {
      id: '102',
      content: 'Yes, I\'m definitely coming! Just finalizing some details.',
      timestamp: '2024-02-28T14:35:00Z',
      senderId: '1'
    },
    {
      id: '103',
      content: 'Great! We\'re planning to meet at the airport on June 10th.',
      timestamp: '2024-02-28T14:40:00Z',
      senderId: '101'
    }
  ],
  '2': [
    {
      id: '201',
      content: 'Hi there! I\'m organizing a trip to Tokyo in July.',
      timestamp: '2024-02-27T09:00:00Z',
      senderId: '102'
    },
    {
      id: '202',
      content: 'I sent you the details for the Tokyo trip!',
      timestamp: '2024-02-27T09:15:00Z',
      senderId: '102'
    }
  ],
  '3': [
    {
      id: '301',
      content: 'Welcome everyone to our Bali trip group chat!',
      timestamp: '2024-02-25T10:00:00Z',
      senderId: '101'
    },
    {
      id: '302',
      content: 'I\'m so excited for this trip!',
      timestamp: '2024-02-25T10:05:00Z',
      senderId: '201'
    },
    {
      id: '303',
      content: 'Has everyone booked their flights yet?',
      timestamp: '2024-02-26T18:45:00Z',
      senderId: '101'
    }
  ]
};

export default function Messages() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [conversations, setConversations] = useState(MOCK_CONVERSATIONS);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [showLoginModal, setShowLoginModal] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Check if user is logged in
  useEffect(() => {
    const checkAuth = () => {
      const loggedIn = localStorage.getItem('isLoggedIn') === 'true';
      setIsLoggedIn(loggedIn);
      
      if (!loggedIn) {
        setShowLoginModal(true);
      }
    };
    
    checkAuth();
    setLoading(false);
    
    // Add listener for auth changes
    window.addEventListener('storage', checkAuth);
    return () => window.removeEventListener('storage', checkAuth);
  }, []);
  
  // Handle conversation selection from URL params
  useEffect(() => {
    const userId = searchParams.get('userId');
    const groupId = searchParams.get('groupId');
    
    if (userId) {
      // Find or create direct conversation with this user
      const existingConversation = conversations.find(
        conv => conv.type === 'direct' && conv.participants.some(p => p.id === userId)
      );
      
      if (existingConversation) {
        setSelectedConversation(existingConversation.id);
      } else {
        // In a real app, you would create a new conversation here
        console.log('Would create new conversation with user:', userId);
      }
    } else if (groupId) {
      // Find group conversation
      const groupConversation = conversations.find(
        conv => conv.type === 'group' && conv.groupId === groupId
      );
      
      if (groupConversation) {
        setSelectedConversation(groupConversation.id);
      }
    }
  }, [searchParams, conversations]);
  
  // Load messages when conversation is selected
  useEffect(() => {
    if (selectedConversation) {
      // In a real app, this would fetch messages from API
      setMessages(MOCK_MESSAGES[selectedConversation as keyof typeof MOCK_MESSAGES] || []);
    }
  }, [selectedConversation]);
  
  // Scroll to bottom of messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);
  
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !selectedConversation) return;
    
    // In a real app, this would send the message to the API
    const newMsg = {
      id: Date.now().toString(),
      content: newMessage,
      timestamp: new Date().toISOString(),
      senderId: '1' // Current user ID
    };
    
    // Update messages
    setMessages(prev => [...prev, newMsg]);
    
    // Update conversation last message
    setConversations(prev => 
      prev.map(conv => 
        conv.id === selectedConversation 
          ? {
              ...conv,
              lastMessage: {
                content: newMessage,
                timestamp: new Date().toISOString(),
                senderId: '1'
              }
            }
          : conv
      )
    );
    
    setNewMessage('');
  };
  
  const handleLogin = () => {
    router.push('/login?redirect=/messages');
  };
  
  const getOtherParticipant = (conversation: any) => {
    if (conversation.type === 'direct') {
      return conversation.participants.find((p: any) => p.id !== '1'); // Not current user
    }
    return null;
  };
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-black">Loading messages...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6 text-black">Messages</h1>
        
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4">
            {/* Conversations list */}
            <div className="border-r border-gray-200 md:col-span-1">
              <div className="p-4 border-b border-gray-200">
                <h2 className="font-bold text-black">Conversations</h2>
              </div>
              <div className="overflow-y-auto max-h-[calc(100vh-200px)]">
                {conversations.map(conversation => (
                  <div 
                    key={conversation.id}
                    onClick={() => setSelectedConversation(conversation.id)}
                    className={`p-4 border-b border-gray-200 cursor-pointer hover:bg-gray-50 ${
                      selectedConversation === conversation.id ? 'bg-blue-50' : ''
                    }`}
                  >
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gray-200 rounded-full mr-3"></div>
                      <div className="flex-1">
                        <div className="flex justify-between">
                          <p className="font-medium text-black">
                            {conversation.type === 'direct' 
                              ? getOtherParticipant(conversation)?.name 
                              : conversation.groupName}
                          </p>
                          {conversation.unreadCount > 0 && (
                            <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                              {conversation.unreadCount}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500 truncate">
                          {conversation.lastMessage.content}
                        </p>
                        <p className="text-xs text-gray-400">
                          {new Date(conversation.lastMessage.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Messages */}
            <div className="md:col-span-2 lg:col-span-3 flex flex-col h-[calc(100vh-200px)]">
              {selectedConversation ? (
                <>
                  {/* Conversation header */}
                  <div className="p-4 border-b border-gray-200">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gray-200 rounded-full mr-3"></div>
                      <div>
                        <p className="font-medium text-black">
                          {(() => {
                            const conversation = conversations.find(c => c.id === selectedConversation);
                            if (!conversation) return '';
                            return conversation.type === 'direct'
                              ? getOtherParticipant(conversation)?.name
                              : conversation.groupName;
                          })()}
                        </p>
                        <p className="text-xs text-gray-500">
                          {(() => {
                            const conversation = conversations.find(c => c.id === selectedConversation);
                            if (!conversation) return '';
                            return conversation.type === 'direct'
                              ? 'Direct message'
                              : `${conversation.participants.length} members`;
                          })()}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Messages list */}
                  <div className="flex-1 p-4 overflow-y-auto">
                    <div className="space-y-4">
                      {messages.map(message => (
                        <div 
                          key={message.id}
                          className={`flex ${message.senderId === '1' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl rounded-lg p-3 ${
                              message.senderId === '1'
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-100 text-black'
                            }`}
                          >
                            <p>{message.content}</p>
                            <p className={`text-xs mt-1 ${message.senderId === '1' ? 'text-blue-100' : 'text-gray-500'}`}>
                              {new Date(message.timestamp).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      ))}
                      <div ref={messagesEndRef} />
                    </div>
                  </div>
                  
                  {/* Message input */}
                  <div className="p-4 border-t border-gray-200">
                    <form onSubmit={handleSendMessage} className="flex">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1 border border-gray-300 rounded-l-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <button
                        type="submit"
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-r-md"
                      >
                        Send
                      </button>
                    </form>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-black mb-4">Select a conversation to start messaging</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Login Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4 text-black">Login Required</h2>
            <p className="text-black mb-6">
              You need to be logged in to view and send messages. Please log in or create an account.
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => router.push('/')}
                className="px-4 py-2 border border-gray-300 rounded-md text-black hover:bg-gray-50"
              >
                Go Home
              </button>
              <button
                onClick={handleLogin}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Log In
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 
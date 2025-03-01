'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import AuthOverlay from '@/components/auth/AuthOverlay';

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
  const [loading, setLoading] = useState(true);
  const [conversations, setConversations] = useState(MOCK_CONVERSATIONS);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
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
    
    setLoading(false);
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
  
  const getOtherParticipant = (conversation: any) => {
    if (conversation.type === 'direct') {
      return conversation.participants.find((p: any) => p.id !== '1'); // Not current user
    }
    return null;
  };
  
  const getInitials = (name: string) => {
    if (!name) return '';
    const parts = name.split(' ');
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  };
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-slate-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-700">Loading messages...</p>
        </div>
      </div>
    );
  }
  
  const messageContent = (
    <div className="min-h-screen bg-slate-50">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6 text-slate-900">Messages</h1>
        
        <Card className="overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4">
            {/* Conversations list */}
            <div className="border-r border-slate-200 md:col-span-1">
              <CardHeader className="px-4 py-3 border-b border-slate-200">
                <CardTitle className="text-lg font-semibold">Conversations</CardTitle>
              </CardHeader>
              <div className="overflow-y-auto max-h-[calc(100vh-200px)]">
                {conversations.map(conversation => (
                  <div 
                    key={conversation.id}
                    onClick={() => setSelectedConversation(conversation.id)}
                    className={`p-4 border-b border-slate-200 cursor-pointer hover:bg-slate-50 ${
                      selectedConversation === conversation.id ? 'bg-slate-100' : ''
                    }`}
                  >
                    <div className="flex items-center">
                      <Avatar className="h-10 w-10 mr-3">
                        <AvatarImage src={
                          conversation.type === 'direct' 
                            ? getOtherParticipant(conversation)?.image 
                            : '/placeholder.jpg'
                        } />
                        <AvatarFallback className="bg-slate-200 text-slate-700">
                          {conversation.type === 'direct' 
                            ? getInitials(getOtherParticipant(conversation)?.name || '')
                            : conversation.groupName?.charAt(0) || 'G'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex justify-between">
                          <p className="font-medium text-slate-900">
                            {conversation.type === 'direct' 
                              ? getOtherParticipant(conversation)?.name 
                              : conversation.groupName}
                          </p>
                          {conversation.unreadCount > 0 && (
                            <span className="bg-slate-800 text-white text-xs px-2 py-1 rounded-full">
                              {conversation.unreadCount}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-slate-500 truncate">
                          {conversation.lastMessage.content}
                        </p>
                        <p className="text-xs text-slate-400">
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
                  <div className="p-4 border-b border-slate-200">
                    <div className="flex items-center">
                      <Avatar className="h-10 w-10 mr-3">
                        {(() => {
                          const conversation = conversations.find(c => c.id === selectedConversation);
                          if (!conversation) return null;
                          
                          return (
                            <>
                              <AvatarImage src={
                                conversation.type === 'direct' 
                                  ? getOtherParticipant(conversation)?.image 
                                  : '/placeholder.jpg'
                              } />
                              <AvatarFallback className="bg-slate-200 text-slate-700">
                                {conversation.type === 'direct' 
                                  ? getInitials(getOtherParticipant(conversation)?.name || '')
                                  : conversation.groupName?.charAt(0) || 'G'}
                              </AvatarFallback>
                            </>
                          );
                        })()}
                      </Avatar>
                      <div>
                        <p className="font-medium text-slate-900">
                          {(() => {
                            const conversation = conversations.find(c => c.id === selectedConversation);
                            if (!conversation) return '';
                            return conversation.type === 'direct'
                              ? getOtherParticipant(conversation)?.name
                              : conversation.groupName;
                          })()}
                        </p>
                        <p className="text-xs text-slate-500">
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
                          {message.senderId !== '1' && (
                            <Avatar className="h-8 w-8 mr-2 mt-1 hidden sm:block">
                              <AvatarImage src="/placeholder.jpg" />
                              <AvatarFallback className="bg-slate-200 text-slate-700 text-xs">
                                {(() => {
                                  const conversation = conversations.find(c => c.id === selectedConversation);
                                  if (!conversation) return '';
                                  
                                  if (conversation.type === 'direct') {
                                    return getInitials(getOtherParticipant(conversation)?.name || '');
                                  } else {
                                    const sender = conversation.participants.find(p => p.id === message.senderId);
                                    return getInitials(sender?.name || '');
                                  }
                                })()}
                              </AvatarFallback>
                            </Avatar>
                          )}
                          <div
                            className={`max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg rounded-lg p-3 ${
                              message.senderId === '1'
                                ? 'bg-slate-800 text-white'
                                : 'bg-slate-100 text-slate-900'
                            }`}
                          >
                            <p>{message.content}</p>
                            <p className={`text-xs mt-1 ${message.senderId === '1' ? 'text-slate-300' : 'text-slate-500'}`}>
                              {new Date(message.timestamp).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      ))}
                      <div ref={messagesEndRef} />
                    </div>
                  </div>
                  
                  {/* Message input */}
                  <div className="p-4 border-t border-slate-200">
                    <form onSubmit={handleSendMessage} className="flex gap-2">
                      <Input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1"
                      />
                      <Button type="submit">
                        Send
                      </Button>
                    </form>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center p-6">
                    <div className="w-20 h-20 bg-slate-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-10 w-10 text-slate-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                        />
                      </svg>
                    </div>
                    <h3 className="text-xl font-medium text-slate-900 mb-2">No conversation selected</h3>
                    <p className="text-slate-500">Select a conversation to start messaging</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
  
  return <AuthOverlay>{messageContent}</AuthOverlay>;
} 
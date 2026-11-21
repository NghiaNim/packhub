'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { messageService, Message, User } from '@/lib/services/messageService';

// Mock user data
const MOCK_USERS = [
  {
    id: '101',
    name: 'Alex Johnson',
    image: '/placeholder.jpg',
    lastSeen: new Date().toISOString(),
    isOnline: true
  },
  {
    id: '201',
    name: 'Emma Wilson',
    image: '/placeholder.jpg',
    lastSeen: '2024-03-01T12:30:00',
    isOnline: false
  },
  {
    id: '202',
    name: 'David Lee',
    image: '/placeholder.jpg',
    lastSeen: '2024-03-01T13:45:00',
    isOnline: false
  }
];

// Update the mock conversations to match the Message interface
const MOCK_CONVERSATIONS: Record<string, Message[]> = {
  'user-1': [
    { id: '1', content: 'Hey there! How are you?', senderId: 'current-user', timestamp: '2023-04-01T10:30:00Z', status: 'delivered' },
    { id: '2', content: 'I\'m doing great! Getting ready for my next backpacking trip.', senderId: 'user-1', timestamp: '2023-04-01T10:32:00Z', status: 'read' },
    // ... more messages
  ],
  'user-2': [
    // ... messages
  ],
  // ... other conversations
};

export default function DirectMessage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.id as string;
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  useEffect(() => {
    // Check if user is logged in
    const checkAuth = () => {
      const loggedIn = localStorage.getItem('isLoggedIn') === 'true';
      setIsLoggedIn(loggedIn);
      return loggedIn;
    };

    // Fetch user and message data
    const fetchData = async () => {
      try {
        setLoading(true);
        
        if (!checkAuth()) {
          setLoading(false);
          return;
        }
        
        // Try to get user details from the API
        const userData = await messageService.getUserDetails(userId);
        
        if (userData) {
          setUser(userData);
          
          // Try to get messages from the API
          const messagesData = await messageService.getDirectMessages(userId);
          setMessages(messagesData);
        } else {
          setError('User not found or you don\'t have permission to view this conversation.');
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load conversation. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
    
    // Add listener for auth changes
    window.addEventListener('storage', () => {
      if (checkAuth()) {
        fetchData();
      }
    });
    
    return () => {
      window.removeEventListener('storage', () => {
        checkAuth();
      });
    };
  }, [userId]);
  
  useEffect(() => {
    // Scroll to the bottom when messages change
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);
  
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !isLoggedIn) return;
    
    // Create a temporary message object
    const tempMessage: Message = {
      id: `temp-${Date.now()}`,
      content: newMessage,
      timestamp: new Date().toISOString(),
      senderId: 'current-user',
      status: 'sending'
    };
    
    // Add the message to the UI immediately
    setMessages(prev => [...prev, tempMessage]);
    setNewMessage('');
    
    try {
      // Send the message to the API
      const sentMessage = await messageService.sendMessage(userId, newMessage);
      
      if (sentMessage) {
        // Update the temporary message with the real one
        setMessages(prev => 
          prev.map(msg => 
            msg.id === tempMessage.id ? sentMessage : msg
          )
        );
      } else {
        // If sending failed, update the status to show error
        setMessages(prev => 
          prev.map(msg => 
            msg.id === tempMessage.id 
              ? { ...msg, status: 'delivered' as const, id: Date.now().toString() } 
              : msg
          )
        );
        console.error('Failed to send message');
      }
    } catch (err) {
      console.error('Error sending message:', err);
      
      // If sending failed, update the status to show error
      setMessages(prev => 
        prev.map(msg => 
          msg.id === tempMessage.id 
            ? { ...msg, status: 'delivered' as const, id: Date.now().toString() } 
            : msg
        )
      );
    }
  };
  
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8 flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-black">Loading conversation...</p>
        </div>
      </div>
    );
  }
  
  if (!isLoggedIn) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8 text-center">
        <h2 className="text-2xl font-bold mb-4 text-black">Login Required</h2>
        <p className="text-black mb-6">
          You need to be logged in to view and send messages on BackpackerConnect.
        </p>
        <div className="flex justify-center gap-4">
          <Link 
            href={`/login?redirect=/messages/${userId}`} 
            passHref
          >
            <Button variant="primary">Log In</Button>
          </Link>
          <Link 
            href="/register" 
            passHref
          >
            <Button variant="outline">Sign Up</Button>
          </Link>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8 text-center">
        <h2 className="text-2xl font-bold mb-4 text-black">Error</h2>
        <p className="text-black mb-6">{error}</p>
        <Button
          onClick={() => router.push('/messages')}
          variant="primary"
        >
          Back to Messages
        </Button>
      </div>
    );
  }
  
  if (!user) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8 text-center">
        <h2 className="text-2xl font-bold mb-4 text-black">User Not Found</h2>
        <p className="text-black mb-6">
          This user doesn't exist or you don't have permission to message them.
        </p>
        <Button
          onClick={() => router.push('/messages')}
          variant="primary"
        >
          Back to Messages
        </Button>
      </div>
    );
  }
  
  const formatMessageTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true
    });
  };
  
  const formatMessageDate = (timestamp: string) => {
    const messageDate = new Date(timestamp).toLocaleDateString('en-US', { 
      weekday: 'long', 
      month: 'short', 
      day: 'numeric'
    });
    
    const today = new Date().toLocaleDateString('en-US', { 
      weekday: 'long', 
      month: 'short', 
      day: 'numeric'
    });
    
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayString = yesterday.toLocaleDateString('en-US', { 
      weekday: 'long', 
      month: 'short', 
      day: 'numeric'
    });
    
    if (messageDate === today) return 'Today';
    if (messageDate === yesterdayString) return 'Yesterday';
    return messageDate;
  };
  
  // Group messages by date
  const groupedMessages: { [key: string]: Message[] } = {};
  messages.forEach(message => {
    if (typeof message.timestamp === 'string') {
      const date = new Date(message.timestamp).toLocaleDateString();
      if (!groupedMessages[date]) {
        groupedMessages[date] = [];
      }
      groupedMessages[date].push(message);
    }
  });
  
  return (
    <div className="bg-white rounded-lg shadow-md flex flex-col h-[calc(100vh-16rem)]">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 flex items-center">
        <Avatar className="h-10 w-10 mr-3">
          <AvatarImage src={user.image} alt={user.name} />
          <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <h2 className="font-semibold text-lg text-black">{user.name}</h2>
          <p className="text-xs text-gray-500">
            {user.isOnline ? (
              <span className="text-green-500">Online</span>
            ) : (
              <span>Last seen {user.lastSeen ? new Date(user.lastSeen).toLocaleString() : 'recently'}</span>
            )}
          </p>
        </div>
      </div>
      
      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        {Object.keys(groupedMessages).length > 0 ? (
          Object.keys(groupedMessages).map(date => (
            <div key={date}>
              <div className="flex justify-center my-4">
                <span className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded-full">
                  {formatMessageDate(groupedMessages[date][0].timestamp)}
                </span>
              </div>
              
              {groupedMessages[date].map((message, index) => (
                <div 
                  key={message.id}
                  className={`mb-4 max-w-[80%] ${message.senderId === 'current-user' ? 'ml-auto' : 'mr-auto'}`}
                >
                  <div 
                    className={`p-3 rounded-lg ${
                      message.senderId === 'current-user' 
                        ? 'bg-blue-600 text-white rounded-br-none' 
                        : 'bg-gray-100 text-black rounded-bl-none'
                    }`}
                  >
                    <p>{message.content}</p>
                  </div>
                  <div 
                    className={`flex items-center mt-1 text-xs text-gray-500 ${
                      message.senderId === 'current-user' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <span>{formatMessageTime(message.timestamp)}</span>
                    {message.senderId === 'current-user' && (
                      <span className="ml-2">
                        {message.status === 'sending' && 'Sending...'}
                        {message.status === 'delivered' && 'Delivered'}
                        {message.status === 'read' && (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        )}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ))
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500">No messages yet. Start the conversation!</p>
          </div>
        )}
        <div ref={messagesEndRef} />
      </ScrollArea>
      
      {/* Message Input */}
      <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200">
        <div className="flex items-center space-x-2">
          <Input
            type="text"
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="flex-1"
          />
          <Button type="submit" variant="primary" size="icon" disabled={!newMessage.trim()}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
            </svg>
          </Button>
        </div>
      </form>
    </div>
  );
} 
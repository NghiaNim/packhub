'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';

// Message interface from backend
interface Message {
  id: string;
  content: string;
  message_type: string;
  media_url?: string;
  sender_id: string;
  recipient_id?: string;
  group_id?: string;
  created_at: string;
  is_read: boolean;
  read_by: string[];
}

// Conversation interface from backend
interface Conversation {
  id: string;
  participants: string[];
  last_message?: Message;
  unread_count: number;
  updated_at: string;
}

// User interface
interface User {
  id: string;
  name: string;
  username: string;
  profile_image?: string;
}

export default function Messages() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageText, setMessageText] = useState('');
  const [userData, setUserData] = useState<any>(null);
  const [participantData, setParticipantData] = useState<Record<string, User>>({});
  const [loadingMessages, setLoadingMessages] = useState(false);

  // Check auth status
  useEffect(() => {
    const checkAuth = () => {
      const loggedIn = localStorage.getItem('isLoggedIn') === 'true';
      setIsLoggedIn(loggedIn);
      
      if (loggedIn) {
        try {
          const storedUser = localStorage.getItem('userData');
          if (storedUser) {
            setUserData(JSON.parse(storedUser));
          }
        } catch (error) {
          console.error('Error parsing user data:', error);
        }
      } else {
        // Redirect to login if not logged in
        router.push('/login?redirect=/messages');
      }
      
      setLoading(false);
    };
    
    checkAuth();
    
    // Listen for auth changes
    window.addEventListener('storage', checkAuth);
    return () => window.removeEventListener('storage', checkAuth);
  }, [router]);

  // Load conversations
  useEffect(() => {
    if (!isLoggedIn || !userData) return;
    
    const fetchConversations = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:8000/api/messages/conversations', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch conversations');
        }
        
        const data = await response.json();
        setConversations(data);
        
        // If there's a conversation, select the first one
        if (data.length > 0 && !selectedConversation) {
          setSelectedConversation(data[0].id);
        }
      } catch (error) {
        console.error('Error fetching conversations:', error);
      }
    };
    
    fetchConversations();
    
    // Fetch conversations periodically
    const interval = setInterval(fetchConversations, 10000);
    return () => clearInterval(interval);
  }, [isLoggedIn, userData, selectedConversation]);

  // Load messages for selected conversation
  useEffect(() => {
    if (!selectedConversation || !isLoggedIn) return;
    
    const fetchMessages = async () => {
      setLoadingMessages(true);
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:8000/api/messages/conversations/${selectedConversation}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch messages');
        }
        
        const data = await response.json();
        setMessages(data);
        
        // Mark conversation as read
        await fetch(`http://localhost:8000/api/messages/mark-read/${selectedConversation}`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
      } catch (error) {
        console.error('Error fetching messages:', error);
      } finally {
        setLoadingMessages(false);
      }
    };
    
    fetchMessages();
    
    // Set up polling for new messages
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, [selectedConversation, isLoggedIn]);

  // Fetch user data for participants
  useEffect(() => {
    if (!conversations.length || !isLoggedIn) return;
    
    const fetchParticipantData = async () => {
      const participantIds = new Set<string>();
      
      // Collect all unique participant IDs
      conversations.forEach(conv => {
        conv.participants.forEach(id => {
          if (id !== userData?.id) {
            participantIds.add(id);
          }
        });
      });
      
      // Fetch data for each participant
      const token = localStorage.getItem('token');
      const newParticipantData: Record<string, User> = {};
      
      for (const id of participantIds) {
        try {
          const response = await fetch(`http://localhost:8000/api/users/${id}`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          if (response.ok) {
            const data = await response.json();
            newParticipantData[id] = data;
          }
        } catch (error) {
          console.error(`Error fetching user ${id}:`, error);
        }
      }
      
      setParticipantData(newParticipantData);
    };
    
    fetchParticipantData();
  }, [conversations, isLoggedIn, userData]);

  // Function to start a conversation with a specific user
  const startConversationWithUser = useCallback(async (userId: string) => {
    if (!isLoggedIn || !userData) return;
    
    try {
      // First check if we already have a conversation with this user
      const existingConversation = conversations.find(conv => 
        conv.participants.includes(userId) && conv.participants.includes(userData.id)
      );
      
      if (existingConversation) {
        // If conversation exists, select it
        setSelectedConversation(existingConversation.id);
      } else {
        // Otherwise, send an initial message to create the conversation
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:8000/api/messages/direct', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            content: 'Hi there! I saw your profile and wanted to connect.',
            message_type: 'text',
            recipient_id: userId
          })
        });
        
        if (response.ok) {
          // Refresh conversations to show the new one
          const conversationsResponse = await fetch('http://localhost:8000/api/messages/conversations', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          if (conversationsResponse.ok) {
            const data = await conversationsResponse.json();
            setConversations(data);
            
            // Find and select the new conversation
            const newConversation = data.find((conv: Conversation) => 
              conv.participants.includes(userId) && conv.participants.includes(userData.id)
            );
            
            if (newConversation) {
              setSelectedConversation(newConversation.id);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error starting conversation:', error);
    }
  }, [conversations, isLoggedIn, userData, setSelectedConversation, setConversations]);

  // Check for direct user navigation
  useEffect(() => {
    if (!isLoggedIn || !userData) return;
    
    // Check if we have a user parameter in the URL
    const urlParams = new URLSearchParams(window.location.search);
    const userId = urlParams.get('user');
    
    if (userId) {
      // Start or open conversation with this user
      startConversationWithUser(userId);
      
      // Clear the URL parameter
      router.replace('/messages', { scroll: false });
    }
  }, [isLoggedIn, userData, router, startConversationWithUser]);

  // Send a message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!messageText.trim() || !selectedConversation || !isLoggedIn) return;
    
    try {
      // Get the recipient ID
      const conversation = conversations.find(c => c.id === selectedConversation);
      if (!conversation) return;
      
      const recipientId = conversation.participants.find(id => id !== userData?.id);
      if (!recipientId) return;
      
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8000/api/messages/direct', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          content: messageText,
          message_type: 'text',
          recipient_id: recipientId
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to send message');
      }
      
      // Clear input
      setMessageText('');
      
      // Refresh messages
      const messagesResponse = await fetch(`http://localhost:8000/api/messages/conversations/${selectedConversation}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (messagesResponse.ok) {
        const data = await messagesResponse.json();
        setMessages(data);
      }
      
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  // Get the conversation name (other participant's name)
  const getConversationName = (conversation: Conversation) => {
    if (!userData) return 'Loading...';
    
    const otherParticipantId = conversation.participants.find(id => id !== userData.id);
    if (!otherParticipantId) return 'Unknown';
    
    const participant = participantData[otherParticipantId];
    return participant ? participant.name : 'Loading...';
  };

  // Show login screen if not logged in
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="ml-2">Loading...</p>
      </div>
    );
  }

  // Show login prompt if not logged in
  if (!isLoggedIn) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <h1 className="text-2xl font-bold mb-4">Login Required</h1>
        <p className="text-center mb-6">
          You need to be logged in to access your messages.
        </p>
        <Link
          href="/login?redirect=/messages"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Log In
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-6 px-4">
        <h1 className="text-2xl font-bold mb-6">Messages</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Conversations List */}
          <div className="md:col-span-1">
            <Card className="h-[calc(100vh-180px)]">
              <CardContent className="p-4">
                <h2 className="font-semibold mb-4">Conversations</h2>
                
                <ScrollArea className="h-[calc(100vh-240px)]">
                  {conversations.length === 0 ? (
                    <div className="text-center py-8 text-sm text-muted-foreground">
                      No conversations yet. Start chatting with travelers from the groups page!
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {conversations.map((conversation) => (
                        <div
                          key={conversation.id}
                          onClick={() => setSelectedConversation(conversation.id)}
                          className={`p-3 rounded-md cursor-pointer flex items-center ${
                            selectedConversation === conversation.id
                              ? 'bg-blue-50 border border-blue-200'
                              : 'hover:bg-gray-100'
                          }`}
                        >
                          <Avatar className="h-10 w-10 mr-3">
                            <AvatarImage src={participantData[conversation.participants.find(id => id !== userData?.id) || '']?.profile_image || ''} />
                            <AvatarFallback>
                              {getConversationName(conversation).charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-center">
                              <p className="font-medium truncate">
                                {getConversationName(conversation)}
                              </p>
                              {conversation.unread_count > 0 && (
                                <span className="bg-blue-600 text-white text-xs rounded-full px-2 py-1">
                                  {conversation.unread_count}
                                </span>
                              )}
                            </div>
                            {conversation.last_message && (
                              <p className="text-sm text-gray-500 truncate">
                                {conversation.last_message.content}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
          
          {/* Message Thread */}
          <div className="md:col-span-2">
            <Card className="h-[calc(100vh-180px)] flex flex-col">
              {selectedConversation ? (
                <>
                  {/* Message Header */}
                  <div className="p-4 border-b flex items-center">
                    {conversations.find(c => c.id === selectedConversation) && (
                      <>
                        <Avatar className="h-10 w-10 mr-3">
                          <AvatarImage 
                            src={
                              participantData[
                                conversations
                                  .find(c => c.id === selectedConversation)
                                  ?.participants.find(id => id !== userData?.id) || ''
                              ]?.profile_image || ''
                            } 
                          />
                          <AvatarFallback>
                            {getConversationName(
                              conversations.find(c => c.id === selectedConversation)!
                            ).charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <h2 className="font-semibold">
                          {getConversationName(
                            conversations.find(c => c.id === selectedConversation)!
                          )}
                        </h2>
                      </>
                    )}
                  </div>
                  
                  {/* Messages */}
                  <ScrollArea className="flex-1 p-4">
                    {loadingMessages ? (
                      <div className="space-y-4">
                        <Skeleton className="h-12 w-2/3" />
                        <Skeleton className="h-12 w-2/3 ml-auto" />
                        <Skeleton className="h-12 w-1/2" />
                      </div>
                    ) : messages.length === 0 ? (
                      <div className="h-full flex items-center justify-center text-muted-foreground">
                        <p>No messages yet. Start the conversation!</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {messages.map((message) => (
                          <div
                            key={message.id}
                            className={`flex ${
                              message.sender_id === userData?.id
                                ? 'justify-end'
                                : 'justify-start'
                            }`}
                          >
                            <div
                              className={`rounded-lg px-4 py-2 max-w-[75%] ${
                                message.sender_id === userData?.id
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-gray-200 text-black'
                              }`}
                            >
                              <p>{message.content}</p>
                              <p className="text-xs opacity-70 mt-1">
                                {new Date(message.created_at).toLocaleTimeString([], {
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </ScrollArea>
                  
                  {/* Message Input */}
                  <form onSubmit={handleSendMessage} className="p-4 border-t flex gap-2">
                    <Input
                      type="text"
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      placeholder="Type a message..."
                      className="flex-1"
                    />
                    <Button type="submit" disabled={!messageText.trim()}>
                      Send
                    </Button>
                  </form>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-muted-foreground">
                  <p>Select a conversation or start a new one</p>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
} 
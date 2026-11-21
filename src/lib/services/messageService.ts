import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface User {
  id: string;
  name: string;
  image?: string;
  isOnline?: boolean;
  lastSeen?: string;
}

export interface Message {
  id: string;
  content: string;
  timestamp: string;
  senderId: string;
  status: 'sending' | 'delivered' | 'read';
}

export interface Conversation {
  id: string;
  participants: User[];
  group?: {
    id: string;
    name: string;
    image?: string;
  };
  lastMessage?: {
    content: string;
    timestamp: string;
    isRead: boolean;
    senderId: string;
    senderName?: string;
  };
  unreadCount: number;
}

class MessageService {
  // Check if the user is authenticated
  isAuthenticated(): boolean {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('isLoggedIn') === 'true' && !!localStorage.getItem('token');
    }
    return false;
  }

  // Get the authentication token
  getAuthToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token');
    }
    return null;
  }

  // Get request headers with authorization
  getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    const token = this.getAuthToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    return headers;
  }

  // Get all conversations for the current user
  async getConversations(): Promise<Conversation[]> {
    if (!this.isAuthenticated()) {
      console.error('User is not authenticated');
      return [];
    }

    try {
      const response = await axios.get(`${API_URL}/api/messages/conversations`, {
        headers: this.getHeaders()
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching conversations:', error);
      return [];
    }
  }

  // Get messages for a specific conversation
  async getMessages(conversationId: string): Promise<Message[]> {
    if (!this.isAuthenticated()) {
      console.error('User is not authenticated');
      return [];
    }

    try {
      const response = await axios.get(`${API_URL}/api/messages/${conversationId}`, {
        headers: this.getHeaders()
      });
      return response.data;
    } catch (error) {
      console.error(`Error fetching messages for conversation ${conversationId}:`, error);
      return [];
    }
  }

  // Get direct messages between current user and another user
  async getDirectMessages(userId: string): Promise<Message[]> {
    if (!this.isAuthenticated()) {
      console.error('User is not authenticated');
      return [];
    }

    try {
      const response = await axios.get(`${API_URL}/api/messages/direct/${userId}`, {
        headers: this.getHeaders()
      });
      return response.data;
    } catch (error) {
      console.error(`Error fetching direct messages with user ${userId}:`, error);
      return [];
    }
  }

  // Send a message
  async sendMessage(recipientId: string, content: string, isGroupMessage = false): Promise<Message | null> {
    if (!this.isAuthenticated()) {
      console.error('User is not authenticated');
      return null;
    }

    try {
      const endpoint = isGroupMessage ? 'group' : 'direct';
      const response = await axios.post(`${API_URL}/api/messages/${endpoint}`, {
        recipientId,
        content
      }, {
        headers: this.getHeaders()
      });
      return response.data;
    } catch (error) {
      console.error('Error sending message:', error);
      return null;
    }
  }

  // Mark messages as read
  async markAsRead(messageIds: string[]): Promise<boolean> {
    if (!this.isAuthenticated()) {
      console.error('User is not authenticated');
      return false;
    }

    try {
      await axios.put(`${API_URL}/api/messages/read`, { messageIds }, {
        headers: this.getHeaders()
      });
      return true;
    } catch (error) {
      console.error('Error marking messages as read:', error);
      return false;
    }
  }

  // Get user details
  async getUserDetails(userId: string): Promise<User | null> {
    try {
      const response = await axios.get(`${API_URL}/api/users/${userId}`, {
        headers: this.getHeaders()
      });
      return response.data;
    } catch (error) {
      console.error(`Error fetching user details for ${userId}:`, error);
      return null;
    }
  }

  // Create a new conversation or get existing one
  async getOrCreateConversation(userId: string): Promise<string | null> {
    if (!this.isAuthenticated()) {
      console.error('User is not authenticated');
      return null;
    }

    try {
      const response = await axios.post(`${API_URL}/api/messages/conversations`, {
        participantId: userId
      }, {
        headers: this.getHeaders()
      });
      return response.data.id;
    } catch (error) {
      console.error('Error creating conversation:', error);
      return null;
    }
  }
}

export const messageService = new MessageService(); 
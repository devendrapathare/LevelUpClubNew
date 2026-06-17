import io from 'socket.io-client';

class MessagingService {
  constructor() {
    this.socket = null;
    // Don't cache the token in the constructor, get it fresh each time
  }

  // Initialize socket connection
  initSocket() {
    if (!this.socket) {
      // Use direct URL for socket connection to backend server
      const socketUrl = process.env.NODE_ENV === 'production' ? '' : 'http://localhost:5001';
      
      // Get fresh token each time
      const token = localStorage.getItem('token');
      
      this.socket = io(socketUrl, {
        transports: ['websocket'],
        auth: {
          token: token
        }
      });
      
      // Update token when it changes
      this.socket.on('connect', () => {
        console.log('Socket connected:', this.socket.id);
      });
      
      this.socket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
      });
      
      this.socket.on('disconnect', (reason) => {
        console.log('Socket disconnected:', reason);
      });
    }
    return this.socket;
  }

  // Join socket room
  joinSocket(userId) {
    if (this.socket) {
      this.socket.emit('join', userId);
    }
  }

  // Listen for new messages
  onMessageReceived(callback) {
    if (this.socket) {
      this.socket.on('receiveMessage', callback);
    }
  }

  // Stop listening for messages
  offMessageReceived(callback) {
    if (this.socket) {
      this.socket.off('receiveMessage', callback);
    }
  }

  async getConversations() {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    try {
      const response = await fetch('/api/messaging/conversations', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.msg || 'Failed to fetch conversations');
      }

      const data = await response.json();
      return data.conversations || [];
    } catch (error) {
      console.error('Error fetching conversations:', error);
      throw error;
    }
  }

  async searchUsers(query) {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    try {
      const response = await fetch(`/api/users?name=${encodeURIComponent(query)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.msg || 'Failed to search users');
      }

      const data = await response.json();
      return data.users || [];
    } catch (error) {
      console.error('Error searching users:', error);
      throw error;
    }
  }

  async createConversation(participantIds) {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    try {
      const response = await fetch('/api/messaging/conversations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ participant_ids: participantIds })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.msg || 'Failed to create conversation');
      }

      const data = await response.json();
      return data.conversation;
    } catch (error) {
      console.error('Error creating conversation:', error);
      throw error;
    }
  }

  async getMessages(conversationId) {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    try {
      const response = await fetch(`/api/messaging/conversations/${conversationId}/messages`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.msg || 'Failed to fetch messages');
      }

      const data = await response.json();
      return data.messages || [];
    } catch (error) {
      console.error('Error fetching messages:', error);
      throw error;
    }
  }

  async sendMessage(conversationId, content) {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    try {
      const response = await fetch(`/api/messaging/conversations/${conversationId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ content })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.msg || 'Failed to send message');
      }

      const data = await response.json();
      return data.message;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }

  // Send message via socket for real-time delivery
  sendSocketMessage(conversationId, senderId, content) {
    if (this.socket) {
      this.socket.emit('sendMessage', { conversationId, senderId, content });
    }
  }
}

export default new MessagingService();
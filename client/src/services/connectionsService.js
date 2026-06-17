import api from './api';

class ConnectionsService {
  async getConnections() {
    try {
      // This method should be called with a user ID
      throw new Error('Use getConnectionsForUser(userId) instead');
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch connections');
    }
  }

  async getConnectionsForUser(userId) {
    try {
      const data = await api.getConnections(userId);
      
      // Format connections data (accepted connections)
      const connections = data.connections.map(connection => ({
        id: connection.id,
        name: connection.name,
        role: connection.headline || 'LevelUp Member',
        company: 'Company Info',
        mutualConnections: Math.floor(Math.random() * 10) + 1, // Mock data for now
        avatar: connection.profile_picture_url
      }));

      // Format pending requests
      // Sent requests (current user is the requester)
      const sentRequests = data.sentRequests.map(request => ({
        id: request.id,
        name: request.receiver.name,
        role: request.receiver.headline || 'LevelUp Member',
        company: 'Company Info',
        sent: request.created_at ? new Date(request.created_at).toLocaleDateString() : 'Unknown',
        avatar: request.receiver.profile_picture_url,
        requester_id: request.requester_id,
        receiver_id: request.receiver_id
      }));

      // Received requests (current user is the receiver)
      const receivedRequests = data.receivedRequests.map(request => ({
        id: request.id,
        name: request.requester.name,
        role: request.requester.headline || 'LevelUp Member',
        company: 'Company Info',
        sent: request.created_at ? new Date(request.created_at).toLocaleDateString() : 'Unknown',
        avatar: request.requester.profile_picture_url,
        requester_id: request.requester_id,
        receiver_id: request.receiver_id
      }));

      // Combine sent and received pending requests
      const pendingRequests = [...sentRequests, ...receivedRequests];

      // Format suggested connections
      const suggestedConnections = data.suggestedConnections.map(suggestion => ({
        id: suggestion.id,
        name: suggestion.name,
        role: suggestion.headline || 'LevelUp Member',
        company: 'Company Info',
        mutualConnections: Math.floor(Math.random() * 5) + 1, // Mock data for now
        avatar: suggestion.profile_picture_url
      }));

      return {
        connections,
        pendingRequests,
        suggestedConnections
      };
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch connections');
    }
  }

  async searchUsers(query) {
    try {
      const data = await api.searchUsers(query);
      return data.users || [];
    } catch (error) {
      throw new Error(error.message || 'Failed to search users');
    }
  }

  async getPendingRequests() {
    // This is now handled in getConnectionsForUser
    return [];
  }

  async getSuggestedConnections() {
    // In a real implementation, this would fetch suggested connections from the backend
    // For now, we return mock data
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return [
      {
        id: 'suggestion-1',
        name: "Robert Chen",
        role: "Machine Learning Engineer",
        company: "AI Solutions",
        mutualConnections: 3,
        avatar: null
      },
      {
        id: 'suggestion-2',
        name: "Emma Wilson",
        role: "Marketing Director",
        company: "GrowthHack",
        mutualConnections: 7,
        avatar: null
      },
      {
        id: 'suggestion-3',
        name: "Carlos Mendez",
        role: "DevOps Engineer",
        company: "CloudTech",
        mutualConnections: 2,
        avatar: null
      }
    ];
  }

  async sendConnectionRequest(userId) {
    try {
      const data = await api.sendConnectionRequest(userId);
      return {
        success: true,
        message: data.msg
      };
    } catch (error) {
      throw new Error(error.message || 'Failed to send connection request');
    }
  }

  async acceptConnectionRequest(requestId) {
    try {
      const data = await api.acceptConnectionRequest(requestId);
      return {
        success: true,
        message: data.msg
      };
    } catch (error) {
      throw new Error(error.message || 'Failed to accept connection request');
    }
  }

  async rejectConnectionRequest(requestId) {
    try {
      const data = await api.rejectConnectionRequest(requestId);
      return {
        success: true,
        message: data.msg
      };
    } catch (error) {
      throw new Error(error.message || 'Failed to reject connection request');
    }
  }
}

export default new ConnectionsService();
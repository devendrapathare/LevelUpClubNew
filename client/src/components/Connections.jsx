import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import connectionsService from '../services/connectionsService';

const Connections = () => {
  const { user } = useAuth();
  const [connections, setConnections] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [suggestedConnections, setSuggestedConnections] = useState([]);
  const [activeTab, setActiveTab] = useState('connections');
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (user) {
          const connectionsData = await connectionsService.getConnectionsForUser(user.id);
          
          setConnections(connectionsData.connections);
          setPendingRequests(connectionsData.pendingRequests);
          setSuggestedConnections(connectionsData.suggestedConnections);
        }
      } catch (error) {
        console.error("Error fetching connection data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  useEffect(() => {
    const searchUsers = async () => {
      if (searchQuery.trim() && activeTab === 'suggestions') {
        setSearchLoading(true);
        try {
          const results = await connectionsService.searchUsers(searchQuery);
          setSearchResults(results);
        } catch (error) {
          console.error("Error searching users:", error);
          setSearchResults([]);
        } finally {
          setSearchLoading(false);
        }
      } else {
        setSearchResults([]);
      }
    };

    const delayDebounce = setTimeout(() => {
      searchUsers();
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery, activeTab]);

  const handleConnect = async (userId) => {
    try {
      const result = await connectionsService.sendConnectionRequest(userId);
      alert(result.message);
      
      // Refresh the data to show the updated pending requests
      if (user) {
        const connectionsData = await connectionsService.getConnectionsForUser(user.id);
        setPendingRequests(connectionsData.pendingRequests);
        setSuggestedConnections(connectionsData.suggestedConnections);
      }
    } catch (error) {
      console.error("Error sending connection request:", error);
      alert("Error sending connection request. Please try again.");
    }
  };

  const handleAccept = async (requestId) => {
    try {
      const result = await connectionsService.acceptConnectionRequest(requestId);
      alert(result.message);
      
      // Refresh the data to show the updated connections and pending requests
      if (user) {
        const connectionsData = await connectionsService.getConnectionsForUser(user.id);
        setConnections(connectionsData.connections);
        setPendingRequests(connectionsData.pendingRequests);
      }
    } catch (error) {
      console.error("Error accepting connection request:", error);
      alert("Error accepting connection request. Please try again.");
    }
  };

  const handleReject = async (requestId) => {
    try {
      const result = await connectionsService.rejectConnectionRequest(requestId);
      alert(result.message);
      
      // Refresh the data to show the updated pending requests
      if (user) {
        const connectionsData = await connectionsService.getConnectionsForUser(user.id);
        setPendingRequests(connectionsData.pendingRequests);
      }
    } catch (error) {
      console.error("Error rejecting connection request:", error);
      alert("Error rejecting connection request. Please try again.");
    }
  };

  const handleMessage = async (userId) => {
    try {
      // Navigate to messaging with the user using hash-based routing
      window.location.hash = '#messaging';
      // We can pass the userId through localStorage or URL parameters
      localStorage.setItem('chatWithUserId', userId);
    } catch (error) {
      console.error("Error starting chat:", error);
      alert("Error starting chat. Please try again.");
    }
  };

  // Navigate to user profile
  const navigateToProfile = (userId) => {
    // If user clicks on their own profile, go to their profile page
    if (user && user.id === userId) {
      window.location.hash = '#profile';
    } else {
      // For other users, go to their profile page
      window.location.hash = `#profile-${userId}`;
    }
  };

  if (loading) {
    return <div className="connections">Loading connections...</div>;
  }

  if (!user) {
    return <div className="connections">Please log in to view your connections.</div>;
  }

  return (
    <div className="connections">
      <div className="connections-header">
        <h2>My Network</h2>
        <div className="search-container">
          <input
            type="text"
            placeholder="Search for people..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>
        <div className="tabs">
          <button 
            className={activeTab === 'connections' ? 'active' : ''}
            onClick={() => setActiveTab('connections')}
          >
            Connections ({connections.length})
          </button>
          <button 
            className={activeTab === 'pending' ? 'active' : ''}
            onClick={() => setActiveTab('pending')}
          >
            Pending ({pendingRequests.length})
          </button>
          <button 
            className={activeTab === 'suggestions' ? 'active' : ''}
            onClick={() => setActiveTab('suggestions')}
          >
            Suggestions ({suggestedConnections.length})
          </button>
        </div>
      </div>

      {activeTab === 'connections' && (
        <div className="connections-list">
          {connections.map(connection => (
            <div key={connection.id} className="connection-card">
              <div className="user-info">
                <div className="user-avatar">
                  {connection.avatar ? (
                    <img src={connection.avatar} alt={connection.name} />
                  ) : (
                    <span>{connection.name.charAt(0)}</span>
                  )}
                </div>
                <div className="user-details">
                  <h4 
                    className="clickable-name"
                    onClick={() => navigateToProfile(connection.id)}
                  >
                    {connection.name}
                  </h4>
                  <p>{connection.role || 'LevelUp Member'}</p>
                </div>
              </div>
              <button 
                className="connection-action"
                onClick={() => handleMessage(connection.id)}
              >
                Message
              </button>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'pending' && (
        <div className="pending-requests">
          {pendingRequests.map(request => (
            <div key={request.id} className="connection-card">
              <div className="user-info">
                <div className="user-avatar">
                  {request.avatar ? (
                    <img src={request.avatar} alt={request.name} />
                  ) : (
                    <span>{request.name.charAt(0)}</span>
                  )}
                </div>
                <div className="user-details">
                  <h4 
                    className="clickable-name"
                    onClick={() => navigateToProfile(request.requester_id === user.id ? request.receiver_id : request.requester_id)}
                  >
                    {request.name}
                  </h4>
                  <p>{request.role || 'LevelUp Member'}</p>
                  <p className="request-status">
                    {request.requester_id === user.id ? 'Pending' : 'Received'}
                  </p>
                </div>
              </div>
              <div className="connection-actions">
                {request.requester_id !== user.id ? (
                  <>
                    <button 
                      className="connect-btn"
                      onClick={() => handleAccept(request.id)}
                    >
                      Accept
                    </button>
                    <button 
                      className="connection-action"
                      onClick={() => handleReject(request.id)}
                    >
                      Reject
                    </button>
                  </>
                ) : (
                  <button 
                    className="connection-action"
                    onClick={() => handleReject(request.id)}
                  >
                    Withdraw
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'suggestions' && (
        <div className="suggestions-list">
          {searchQuery.trim() ? (
            searchLoading ? (
              <div className="loading">Searching...</div>
            ) : searchResults.length > 0 ? (
              searchResults.map(suggestion => (
                <div key={suggestion.id} className="connection-card">
                  <div className="user-info">
                    <div className="user-avatar">
                      {suggestion.avatar ? (
                        <img src={suggestion.avatar} alt={suggestion.name} />
                      ) : (
                        <span>{suggestion.name.charAt(0)}</span>
                      )}
                    </div>
                    <div className="user-details">
                      <h4 
                        className="clickable-name"
                        onClick={() => navigateToProfile(suggestion.id)}
                      >
                        {suggestion.name}
                      </h4>
                      <p>{suggestion.headline || 'LevelUp Member'}</p>
                    </div>
                  </div>
                  <button 
                    className="connect-btn"
                    onClick={() => handleConnect(suggestion.id)}
                  >
                    Connect
                  </button>
                </div>
              ))
            ) : (
              <div className="no-results">No users found</div>
            )
          ) : (
            suggestedConnections.map(suggestion => (
              <div key={suggestion.id} className="connection-card">
                <div className="user-info">
                  <div className="user-avatar">
                    {suggestion.avatar ? (
                      <img src={suggestion.avatar} alt={suggestion.name} />
                    ) : (
                      <span>{suggestion.name.charAt(0)}</span>
                    )}
                  </div>
                  <div className="user-details">
                    <h4 
                      className="clickable-name"
                      onClick={() => navigateToProfile(suggestion.id)}
                    >
                      {suggestion.name}
                    </h4>
                    <p>{suggestion.role || 'LevelUp Member'}</p>
                  </div>
                </div>
                <button 
                  className="connect-btn"
                  onClick={() => handleConnect(suggestion.id)}
                >
                  Connect
                </button>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default Connections;
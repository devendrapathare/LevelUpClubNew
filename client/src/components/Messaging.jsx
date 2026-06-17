import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import messagingService from '../services/messagingService';

const Messaging = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearch, setShowSearch] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    // Initialize socket connection
    messagingService.initSocket();
    if (user) {
      messagingService.joinSocket(user.id);
    }

    const fetchConversations = async () => {
      try {
        const conversationData = await messagingService.getConversations();
        setConversations(conversationData);
      } catch (error) {
        console.error("Error fetching conversations:", error);
      } finally {
        setLoading(false);
      }
    };

    // Listen for new messages
    const handleNewMessage = (message) => {
      // If this is for the active conversation, add it to messages
      if (activeConversation && message.conversation_id === activeConversation.id) {
        setMessages(prevMessages => [...prevMessages, message]);
      }
      
      // Update the conversation list with the new message
      setConversations(prevConversations => 
        prevConversations.map(conv => {
          if (conv.id === message.conversation_id) {
            return {
              ...conv,
              last_message: message.content,
              last_message_at: message.sent_at
            };
          }
          return conv;
        }).sort((a, b) => new Date(b.last_message_at) - new Date(a.last_message_at))
      );
    };

    messagingService.onMessageReceived(handleNewMessage);

    if (user) {
      fetchConversations();
    } else {
      setLoading(false);
    }

    // Add socket connection state listeners
    const socket = messagingService.initSocket();
    if (socket) {
      socket.on('connect', () => {
        console.log('Socket connected in Messaging component');
        if (user) {
          messagingService.joinSocket(user.id);
        }
      });
      
      socket.on('disconnect', (reason) => {
        console.log('Socket disconnected in Messaging component:', reason);
      });
    }

    // Check if we need to start a chat with a specific user
    const chatWithUserId = localStorage.getItem('chatWithUserId');
    if (chatWithUserId) {
      // Clear the stored user ID
      localStorage.removeItem('chatWithUserId');
      // Start chat with the user
      handleStartChat(chatWithUserId);
    }

    return () => {
      messagingService.offMessageReceived(handleNewMessage);
      // Clean up socket listeners
      if (socket) {
        socket.off('connect');
        socket.off('disconnect');
      }
    };
  }, [user, activeConversation]);

  useEffect(() => {
    const fetchMessages = async () => {
      if (activeConversation) {
        try {
          const messageData = await messagingService.getMessages(activeConversation.id);
          setMessages(messageData);
        } catch (error) {
          console.error("Error fetching messages:", error);
        }
      } else {
        setMessages([]);
      }
    };

    fetchMessages();
  }, [activeConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (showSearch && searchQuery.trim()) {
      const searchUsers = async () => {
        setSearchLoading(true);
        try {
          const results = await messagingService.searchUsers(searchQuery);
          setSearchResults(results);
        } catch (error) {
          console.error('Search error:', error);
          setSearchResults([]);
        } finally {
          setSearchLoading(false);
        }
      };

      searchUsers();
    } else {
      setSearchResults([]);
      setSearchLoading(false);
    }
  }, [searchQuery, showSearch]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSelectConversation = (conversation) => {
    setActiveConversation(conversation);
    setShowSearch(false);
  };

  const handleStartChat = async (userId) => {
    try {
      // Call API to create new conversation
      const newConversation = await messagingService.createConversation([userId]);
      
      // Update state with new conversation
      setConversations(prev => [newConversation, ...prev]);
      setActiveConversation(newConversation);
      setShowSearch(false);
      setSearchQuery('');
    } catch (error) {
      console.error('Error starting chat:', error);
      alert('Failed to start new chat. Please try again.');
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeConversation) return;

    try {
      // Send via API to ensure persistence
      const message = await messagingService.sendMessage(activeConversation.id, newMessage);
      
      // Update UI immediately
      setMessages(prevMessages => [...prevMessages, message]);
      setNewMessage('');

      // Update the last message in the conversation list
      setConversations(prevConversations => 
        prevConversations.map(conv => {
          if (conv.id === activeConversation.id) {
            return {
              ...conv,
              last_message: newMessage,
              last_message_at: new Date().toISOString()
            };
          }
          return conv;
        }).sort((a, b) => new Date(b.last_message_at) - new Date(a.last_message_at))
      );
    } catch (error) {
      console.error("Error sending message:", error);
      alert("Error sending message. Please try again.");
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString();
    }
  };

  if (loading) {
    return <div className="messaging loading">Loading messages...</div>;
  }

  if (!user) {
    return <div className="messaging">Please log in to access messaging.</div>;
  }

  return (
    <div className="whatsapp-messaging">
      {/* Contacts Sidebar */}
      <div className="contacts-sidebar">
        <div className="contacts-header">
          <h2>Chats</h2>
          <button 
            className="new-chat-btn whatsapp"
            onClick={() => setShowSearch(!showSearch)}
          >
            {showSearch ? '✕' : '+'}
          </button>
        </div>
        
        {showSearch ? (
          <>
            <div className="search-container whatsapp">
              <input
                type="text"
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input whatsapp"
              />
            </div>
            <div className="search-results whatsapp">
              {searchLoading ? (
                <div className="loading-search-results">Loading...</div>
              ) : searchResults.length > 0 ? (
                searchResults.map(user => (
                  <div 
                    key={user.id}
                    className="search-result-item whatsapp"
                    onClick={() => handleStartChat(user.id)}
                  >
                    <div className="avatar">{user.name.charAt(0)}</div>
                    <div className="user-info">
                      <h4>{user.name}</h4>
                      {user.headline && <p className="user-headline">{user.headline}</p>}
                    </div>
                  </div>
                ))
              ) : searchQuery ? (
                <div className="no-results">No users found</div>
              ) : null}
            </div>
          </>
        ) : (
          <>
            <div className="search-container whatsapp">
              <input
                type="text"
                placeholder="Search chats..."
                className="search-input whatsapp"
              />
            </div>
            <div className="conversations-list whatsapp">
              {conversations.map(conversation => {
                // Get the other participant (not the current user)
                const otherParticipant = conversation.participants?.find(
                  p => p.user_id !== user.id
                )?.user;
                
                return (
                  <div 
                    key={conversation.id}
                    className={`conversation-item whatsapp ${activeConversation && activeConversation.id === conversation.id ? 'active' : ''}`}
                    onClick={() => handleSelectConversation(conversation)}
                  >
                    <div className="conversation-avatar">
                      {otherParticipant ? otherParticipant.name.charAt(0) : 'G'}
                      {/* Online indicator - in a real app, this would be based on user status */}
                      <div className="online-indicator"></div>
                    </div>
                    <div className="conversation-info">
                      <div className="conversation-header">
                        <h3>{otherParticipant ? otherParticipant.name : 'Group Chat'}</h3>
                        <span className="timestamp whatsapp">
                          {conversation.last_message_at ? formatTime(conversation.last_message_at) : ''}
                        </span>
                      </div>
                      <p className="last-message">
                        {conversation.last_message || 'No messages yet'}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
      
      {/* Chat Area */}
      <div className={`chat-area ${activeConversation ? 'active' : ''}`}>
        {activeConversation ? (
          <>
            <div className="chat-header whatsapp">
              {(() => {
                // Get the other participant (not the current user)
                const otherParticipant = activeConversation.participants?.find(
                  p => p.user_id !== user.id
                )?.user;
                
                return (
                  <>
                    <div className="avatar">
                      {otherParticipant ? otherParticipant.name.charAt(0) : 'G'}
                    </div>
                    <div className="contact-info">
                      <h3>{otherParticipant ? otherParticipant.name : 'Group Chat'}</h3>
                      <p>Online</p>
                    </div>
                  </>
                );
              })()}
            </div>

            <div className="chat-messages whatsapp">
              {messages.map(message => (
                <div 
                  key={message.id}
                  className={`message ${message.sender_id === user.id ? 'sent' : 'received'}`}
                >
                  {message.sender_id !== user.id && (
                    <div className="avatar">
                      {message.sender?.name ? message.sender.name.charAt(0) : 'U'}
                    </div>
                  )}
                  <div className="message-content">
                    <p>{message.content}</p>
                    <span className="timestamp">{formatTime(message.sent_at)}</span>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <div className="message-input whatsapp">
              <form onSubmit={handleSendMessage}>
                <input
                  type="text"
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                />
                <button type="submit" disabled={!newMessage.trim()}>
                  ↗
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="no-conversation-selected whatsapp">
            <p>Select a chat to start messaging</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Messaging;
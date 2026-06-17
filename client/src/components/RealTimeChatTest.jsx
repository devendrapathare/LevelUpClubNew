import React, { useState, useEffect } from 'react';
import messagingService from '../services/messagingService';

const RealTimeChatTest = () => {
  const [userId, setUserId] = useState('');
  const [message, setMessage] = useState('');
  const [conversationId, setConversationId] = useState('');
  const [status, setStatus] = useState('Not connected');

  useEffect(() => {
    // Initialize socket connection
    messagingService.initSocket();
    
    // Listen for connection status
    if (messagingService.socket) {
      messagingService.socket.on('connect', () => {
        setStatus('Connected');
      });
      
      messagingService.socket.on('disconnect', () => {
        setStatus('Disconnected');
      });
      
      messagingService.socket.on('receiveMessage', (data) => {
        console.log('Received message:', data);
      });
    }
    
    return () => {
      if (messagingService.socket) {
        messagingService.socket.off('connect');
        messagingService.socket.off('disconnect');
        messagingService.socket.off('receiveMessage');
      }
    };
  }, []);

  const handleJoin = () => {
    if (userId) {
      messagingService.joinSocket(userId);
      setStatus('Joined as user: ' + userId);
    }
  };

  const handleSendMessage = () => {
    if (conversationId && userId && message) {
      messagingService.sendSocketMessage(conversationId, userId, message);
      setMessage('');
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>Real-time Chat Test</h2>
      
      <div style={{ marginBottom: '20px' }}>
        <p><strong>Status:</strong> {status}</p>
      </div>
      
      <div style={{ marginBottom: '20px' }}>
        <h3>Join Chat</h3>
        <input
          type="text"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          placeholder="User ID"
          style={{ padding: '8px', fontSize: '16px', marginRight: '10px' }}
        />
        <button onClick={handleJoin} style={{ padding: '8px 16px', fontSize: '16px' }}>
          Join
        </button>
      </div>
      
      <div style={{ marginBottom: '20px' }}>
        <h3>Send Message</h3>
        <input
          type="text"
          value={conversationId}
          onChange={(e) => setConversationId(e.target.value)}
          placeholder="Conversation ID"
          style={{ padding: '8px', fontSize: '16px', display: 'block', marginBottom: '10px', width: '300px' }}
        />
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Message"
          style={{ padding: '8px', fontSize: '16px', display: 'block', marginBottom: '10px', width: '300px', height: '100px' }}
        />
        <button onClick={handleSendMessage} style={{ padding: '8px 16px', fontSize: '16px' }}>
          Send Message
        </button>
      </div>
    </div>
  );
};

export default RealTimeChatTest;
import React, { useState, useEffect } from 'react';

const TestApi = () => {
  const [status, setStatus] = useState('Checking...');
  const [error, setError] = useState(null);

  useEffect(() => {
    const testConnection = async () => {
      try {
        const response = await fetch('/api');
        if (response.ok) {
          const text = await response.text();
          if (text.includes('LevelUp Club API is running')) {
            setStatus('✅ Backend connection successful!');
          } else {
            setStatus('⚠️ Backend responded but content unexpected');
            setError(text);
          }
        } else {
          setStatus('❌ Backend responded with error');
          setError(`Status: ${response.status}`);
        }
      } catch (err) {
        setStatus('❌ Backend connection failed');
        setError(err.message);
      }
    };

    testConnection();
  }, []);

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h2>API Connection Test</h2>
      <p><strong>Status:</strong> {status}</p>
      {error && (
        <div>
          <p><strong>Error Details:</strong></p>
          <pre style={{ background: '#f5f5f5', padding: '10px', borderRadius: '4px' }}>
            {error}
          </pre>
        </div>
      )}
      <p>Frontend is running correctly if you can see this page!</p>
    </div>
  );
};

export default TestApi;
import React, { useState } from 'react';

const TestApi = () => {
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const testEndpoint = async (endpoint, method = 'GET', body = null) => {
    setLoading(true);
    setResult('');
    
    try {
      const config = {
        method,
        headers: {
          'Content-Type': 'application/json',
        }
      };
      
      if (body) {
        config.body = JSON.stringify(body);
      }
      
      const response = await fetch(endpoint, config);
      const data = await response.json();
      setResult(JSON.stringify(data, null, 2));
    } catch (error) {
      setResult(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="test-api">
      <h2>API Testing</h2>
      <div className="test-buttons">
        <button 
          onClick={() => testEndpoint('/api/auth/register', 'POST', {
            name: 'Test User',
            email: `test${Date.now()}@example.com`,
            password: 'password123',
            role: 'student'
          })}
          disabled={loading}
        >
          Test Register
        </button>
        
        <button 
          onClick={() => testEndpoint('/api/')}
          disabled={loading}
        >
          Test Root Endpoint
        </button>
      </div>
      
      {loading && <p>Testing...</p>}
      
      {result && (
        <div className="result">
          <h3>Result:</h3>
          <pre>{result}</pre>
        </div>
      )}
    </div>
  );
};

export default TestApi;
import React, { useState } from "react";

export default function ApiTest() {
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const testLeaderboardApi = async () => {
    setLoading(true);
    setError(null);
    setResponse(null);
    
    try {
      const token = localStorage.getItem('token');
      console.log('Token:', token);
      
      if (!token) {
        throw new Error('No authentication token found');
      }

      const res = await fetch('/api/users/leaderboard', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      console.log('Response status:', res.status);
      console.log('Response headers:', [...res.headers.entries()]);
      
      const text = await res.text();
      console.log('Response text:', text);
      
      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        throw new Error(`Failed to parse JSON: ${text}`);
      }
      
      if (!res.ok) {
        throw new Error(`API Error: ${res.status} - ${data.msg || 'Unknown error'}`);
      }
      
      setResponse(data);
    } catch (err) {
      console.error('API Test Error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-4">
      <h2>API Test</h2>
      <button 
        className="btn btn-primary mb-3" 
        onClick={testLeaderboardApi}
        disabled={loading}
      >
        {loading ? 'Testing...' : 'Test Leaderboard API'}
      </button>
      
      {error && (
        <div className="alert alert-danger">
          <h5>Error:</h5>
          <pre>{error}</pre>
        </div>
      )}
      
      {response && (
        <div className="card p-3">
          <h5>API Response:</h5>
          <pre>{JSON.stringify(response, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}
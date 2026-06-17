import React, { useState } from 'react';
import messagingService from '../services/messagingService';

const UserSearchTest = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return;
    
    setLoading(true);
    try {
      const users = await messagingService.searchUsers(query);
      setResults(users);
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>User Search Test</h2>
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search users..."
          style={{ padding: '8px', fontSize: '16px', flex: 1 }}
        />
        <button 
          onClick={handleSearch}
          disabled={loading}
          style={{ padding: '8px 16px', fontSize: '16px' }}
        >
          {loading ? 'Searching...' : 'Search'}
        </button>
      </div>
      
      <div>
        <h3>Results:</h3>
        {results.length > 0 ? (
          <ul>
            {results.map(user => (
              <li key={user.id} style={{ padding: '10px', borderBottom: '1px solid #eee' }}>
                <strong>{user.name}</strong> - {user.email}
                {user.headline && <p style={{ margin: '5px 0 0 0', color: '#666' }}>{user.headline}</p>}
              </li>
            ))}
          </ul>
        ) : (
          <p>No results found</p>
        )}
      </div>
    </div>
  );
};

export default UserSearchTest;
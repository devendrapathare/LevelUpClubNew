import React, { useState, useEffect } from "react";
import leaderboardService from '../services/leaderboardService';

export default function TestLeaderboard() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchLeaderboard = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await leaderboardService.getLeaderboard();
      console.log('Leaderboard data:', data);
      setLeaderboard(data);
    } catch (err) {
      console.error('Error fetching leaderboard:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  return (
    <div className="container mt-4">
      <h2>Test Leaderboard</h2>
      <button 
        className="btn btn-primary mb-3" 
        onClick={fetchLeaderboard}
        disabled={loading}
      >
        {loading ? 'Loading...' : 'Refresh Leaderboard'}
      </button>
      
      {error && (
        <div className="alert alert-danger">
          Error: {error}
        </div>
      )}
      
      <div className="card p-3">
        <h5>Leaderboard Data:</h5>
        {leaderboard.length > 0 ? (
          <div>
            {leaderboard.map((user, index) => (
              <div key={user.id || index} className="d-flex justify-content-between border-bottom py-2">
                <span>
                  <b>#{index + 1}</b> {user.name}
                  {user.isCurrentUser && (
                    <span className="badge bg-primary ms-2">You</span>
                  )}
                </span>
                <span className="text-muted">
                  Lvl {user.level || 1} | {user.xp || 0} pts
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-muted py-3">
            No leaderboard data available
          </div>
        )}
      </div>
    </div>
  );
}
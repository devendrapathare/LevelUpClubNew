import React, { useState } from "react";

export default function LeaderboardTest() {
  const [leaderboard, setLeaderboard] = useState([
    { id: '1', name: "Alex Johnson", xp: 1250, level: 5, isCurrentUser: true },
    { id: '2', name: "Maria Garcia", xp: 980, level: 4 },
    { id: '3', name: "James Wilson", xp: 750, level: 3 },
    { id: '4', name: "Sarah Chen", xp: 1500, level: 6 },
  ]);

  const handleRefresh = () => {
    // Simulate refreshing the leaderboard
    setLeaderboard([
      { id: '1', name: "Alex Johnson", xp: 1300, level: 5, isCurrentUser: true },
      { id: '4', name: "Sarah Chen", xp: 1500, level: 6 },
      { id: '2', name: "Maria Garcia", xp: 980, level: 4 },
      { id: '3', name: "James Wilson", xp: 750, level: 3 },
    ]);
  };

  return (
    <div className="container mt-4">
      <div className="row">
        <div className="col-md-4">
          <div className="leaderboard-card" style={{ minHeight: '300px' }}>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h6 className="fw-bold text-primary mb-0">🏆 Leaderboard</h6>
              <button 
                className="btn btn-sm btn-outline-secondary rounded-circle p-1 d-flex align-items-center justify-content-center"
                onClick={handleRefresh}
                style={{ width: '24px', height: '24px', fontSize: '12px' }}
              >
                <i className="bi bi-arrow-repeat"></i>
              </button>
            </div>
            <div>
              {leaderboard.length > 0 ? (
                leaderboard.map((user, index) => (
                  <div key={user.id || index} className="leaderboard-item">
                    <span>
                      <b>#{index + 1}</b> {user.name}
                      {user.isCurrentUser && (
                        <span className="badge bg-primary ms-2">You</span>
                      )}
                    </span>
                    <span className="text-muted small">
                      Lvl {user.level || 1} | {user.xp || 0} pts
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-center text-muted py-3">
                  No leaderboard data available
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
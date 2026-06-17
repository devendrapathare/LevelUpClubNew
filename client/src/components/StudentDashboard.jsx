import React, { useState, useEffect, useRef } from "react";
import { useAuth } from '../contexts/AuthContext';
import taskService from '../services/taskService';
import goalsService from '../services/goalsService';
import leaderboardService from '../services/leaderboardService';

export default function StudentDashboard() {
  const { user, logout, refreshUser } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState({});
  const [goals, setGoals] = useState({
    monthly: [],
    yearly: []
  });
  const [generatingTasks, setGeneratingTasks] = useState(false);
  const [leaderboard, setLeaderboard] = useState([]);
  const [refreshingLeaderboard, setRefreshingLeaderboard] = useState(false);
  const leaderboardIntervalRef = useRef(null);
  const [showDropdown, setShowDropdown] = useState(false);

  // Calculate progress to next level
  const xpToNext = user ? 100 * user.level : 100;
  const currentXP = user ? user.xp % xpToNext : 0;
  const progress = Math.min((currentXP / xpToNext) * 100, 100);

  useEffect(() => {
    const fetchUserTasks = async () => {
      if (user) {
        try {
          const userTasks = await taskService.getUserTasks(user.id);
          // Filter to show only incomplete tasks
          const incompleteTasks = userTasks.filter(task => !task.completed);
          setTasks(incompleteTasks);
        } catch (error) {
          console.error("Error fetching tasks:", error);
        } finally {
          setLoading(false);
        }
      }
    };

    const fetchGoals = async () => {
      if (user) {
        try {
          const userGoals = await goalsService.getUserGoals(user.id);
          setGoals(userGoals);
        } catch (error) {
          console.error("Error fetching goals:", error);
        }
      }
    };

    const fetchLeaderboard = async () => {
      if (user) {
        console.log('Fetching leaderboard for user:', user);
        try {
          const leaderboardData = await leaderboardService.getLeaderboard();
          console.log('Leaderboard data in component:', leaderboardData);
          setLeaderboard(leaderboardData);
        } catch (error) {
          console.error("Error fetching leaderboard:", error);
          // Fallback to static data if API fails
          setLeaderboard([
            { id: '1', name: "Alex Johnson", xp: 1250, level: 5, isCurrentUser: true },
            { id: '2', name: "Maria Garcia", xp: 980, level: 4 },
            { id: '3', name: "James Wilson", xp: 750, level: 3 },
            { id: '4', name: "Sarah Chen", xp: 620, level: 3 },
            { id: '5', name: "Robert Brown", xp: 450, level: 2 }
          ]);
        }
      }
    };

    fetchUserTasks();
    fetchGoals();
    fetchLeaderboard();

    // Set up periodic refresh for leaderboard (every 30 seconds)
    const leaderboardInterval = setInterval(fetchLeaderboard, 30000);
    
    // Clean up interval on component unmount
    return () => {
      clearInterval(leaderboardInterval);
    };
  }, [user]);

  const handleFileChange = async (taskId, e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(prev => ({ ...prev, [taskId]: true }));

    try {
      // In a real implementation, this would upload the file
      // For now, we'll simulate the upload
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Upload task and check if all tasks are completed
      const result = await taskService.uploadTask(user.id, taskId, file);
      
      // Refresh user data to update XP
      await refreshUser();
      
      // Refresh tasks to get updated status and filter out completed tasks
      const updatedTasks = await taskService.getUserTasks(user.id);
      // Filter to show only incomplete tasks
      const incompleteTasks = updatedTasks.filter(task => !task.completed);
      setTasks(incompleteTasks);
      
      // If new tasks were generated, show a message
      if (result.newTasksGenerated) {
        alert("Congratulations! All tasks completed. New tasks have been generated based on your career roadmap.");
        // Refresh goals as well since they might have updated
        const userGoals = await goalsService.getUserGoals(user.id);
        setGoals(userGoals);
      } else if (result.allTasksCompleted) {
        // All tasks completed but no new tasks generated yet, refresh to check
        setTimeout(async () => {
          const refreshedTasks = await taskService.getUserTasks(user.id);
          const incompleteRefreshedTasks = refreshedTasks.filter(task => !task.completed);
          setTasks(incompleteRefreshedTasks);
          if (incompleteRefreshedTasks.some(task => !task.completed)) {
            alert("Congratulations! New tasks have been generated based on your career roadmap.");
            const userGoals = await goalsService.getUserGoals(user.id);
            setGoals(userGoals);
          }
        }, 2000);
      }
    } catch (error) {
      console.error("Error uploading task:", error);
      alert("Failed to upload task. Please try again.");
    } finally {
      setUploading(prev => ({ ...prev, [taskId]: false }));
    }
  };

  const handleGenerateNewTasks = async () => {
    setGeneratingTasks(true);
    try {
      // Call the backend API to generate new tasks using Gemini Flash 2.0
      const response = await fetch(`/api/tasks/generate/${user.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        }
      });

      if (!response.ok) {
        throw new Error('Failed to generate new tasks');
      }

      const data = await response.json();
      
      if (data.success) {
        // Refresh tasks to show the newly generated ones
        const updatedTasks = await taskService.getUserTasks(user.id);
        // Filter to show only incomplete tasks
        const incompleteTasks = updatedTasks.filter(task => !task.completed);
        setTasks(incompleteTasks);
        alert("New tasks have been generated based on your career roadmap!");
        
        // Also refresh goals since they might have updated
        const userGoals = await goalsService.getUserGoals(user.id);
        setGoals(userGoals);
      } else {
        throw new Error(data.message || 'Failed to generate new tasks');
      }
    } catch (error) {
      console.error("Error generating new tasks:", error);
      alert("Failed to generate new tasks. Please try again.");
    } finally {
      setGeneratingTasks(false);
    }
  };

  const handleLogout = () => {
    logout();
    window.location.hash = '#login';
  };

  const handleNavigation = (page) => {
    window.location.hash = `#${page}`;
  };

  const handleProfileClick = () => {
    window.location.hash = '#profile';
  };

  return (
    <div className="student-dashboard">
      <style>{`
        .leaderboard-card {
          background: white;
          border-radius: 12px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          padding: 20px;
          height: 100%;
        }
        
        .leaderboard-header {
          font-weight: bold;
          color: #2c3e50;
          margin-bottom: 15px;
          font-size: 1.1rem;
        }
        
        .leaderboard-item {
          display: flex;
          align-items: center;
          padding: 10px 0;
          border-bottom: 1px solid #eee;
        }
        
        .leaderboard-item:last-child {
          border-bottom: none;
        }
        
        .leaderboard-rank {
          font-weight: bold;
          color: #7f8c8d;
          width: 30px;
          font-size: 0.9rem;
        }
        
        .leaderboard-avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: #3498db;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          font-size: 0.8rem;
          margin-right: 10px;
        }
        
        .leaderboard-user {
          flex: 1;
          font-size: 0.9rem;
          color: #2c3e50;
        }
        
        .you-badge {
          background: #3498db;
          color: white;
          padding: 2px 6px;
          border-radius: 10px;
          font-size: 0.7rem;
          margin-left: 5px;
        }
        
        .leaderboard-info {
          text-align: right;
        }
        
        .leaderboard-level {
          font-size: 0.7rem;
          color: #7f8c8d;
        }
        
        .leaderboard-points {
          font-size: 0.9rem;
          font-weight: bold;
          color: #2c3e50;
        }
        
        .current-user {
          background: #e8f4fc;
          border-radius: 8px;
          padding: 8px;
          margin: 5px -8px;
        }
        
        .current-user .leaderboard-user {
          font-weight: bold;
        }
        
        .current-user .leaderboard-points {
          color: #3498db;
        }
      `}</style>
      <div className="dashboard-container">
        {/* Profile + Progress */}
        <div className="row mb-4">
          <div className="col-md-8">
            <div className="profile-card" onClick={handleProfileClick}>
              <div className="profile-info">
                <img 
                  src={user?.profile_picture_url || "https://cdn-icons-png.flaticon.com/512/4333/4333609.png"} 
                  alt="avatar" 
                  width={80} 
                  height={80} 
                  className="rounded-circle" 
                />
                <div>
                  <h5>{user?.name}</h5>
                  <p className="text-muted">{user?.selectedCareer || "Career not selected"}</p>
                  <p className="level-display">Level {user?.level || 1}</p>
                  <small className="text-muted">{user?.xp || 0} XP</small>
                </div>
              </div>
            </div>
            {showDropdown && (
              <div className={`profile-dropdown-menu ${showDropdown ? 'show' : ''}`}>
                {/* Dropdown content */}
                <button 
                  className="btn btn-outline-danger btn-sm w-100"
                  onClick={handleLogout}
                >
                  <i className="bi bi-box-arrow-right me-1"></i> Log out
                </button>
              </div>
            )}
          </div>

          <div className="col-md-4">
            <div className="progress-card">
              <h6>Next Level</h6>
              <p>{xpToNext - currentXP} XP to go</p>
              <div className="progress-container">
                <div className="progress-bar" style={{ width: `${progress}%` }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Goals */}
        <div className="goals-container">
          <div className="goal-box monthly-goals">
            <div className="goal-box-header">
              <span className="goal-box-icon">🎯</span>
              <h3 className="goal-box-title">Monthly Goals</h3>
            </div>
            {goals.monthly && goals.monthly.length > 0 ? (
              goals.monthly.map(goal => (
                <div key={goal.id} className="goal-item">
                  <div className="goal-title">{goal.title}</div>
                  <div className="goal-progress">{goal.completed}/{goal.target} completed</div>
                  <div className="progress">
                    <div 
                      className="progress-bar" 
                      role="progressbar" 
                      style={{ width: `${goal.progress}%` }}
                    ></div>
                  </div>
                  <div className="goal-description">{goal.description}</div>
                </div>
              ))
            ) : (
              <div className="no-goals">
                No monthly goals available. Complete your career assessment to generate personalized goals.
              </div>
            )}
          </div>
          
          <div className="goal-box yearly-goals">
            <div className="goal-box-header">
              <span className="goal-box-icon">🏆</span>
              <h3 className="goal-box-title">Yearly Goals</h3>
            </div>
            {goals.yearly && goals.yearly.length > 0 ? (
              goals.yearly.map(goal => (
                <div key={goal.id} className="goal-item">
                  <div className="goal-title">{goal.title}</div>
                  <div className="goal-progress">{goal.completed}/{goal.target} completed</div>
                  <div className="progress">
                    <div 
                      className="progress-bar" 
                      role="progressbar" 
                      style={{ width: `${goal.progress}%` }}
                    ></div>
                  </div>
                  <div className="goal-description">{goal.description}</div>
                </div>
              ))
            ) : (
              <div className="no-goals">
                No yearly goals available. Complete your career assessment to generate personalized goals.
              </div>
            )}
          </div>
        </div>

        {/* Tasks + Leaderboard */}
        <div className="row mb-5">
          <div className="col-md-8">
            <div className="tasks-header">
              <h2>Your Next Tasks</h2>
              <button 
                className="generate-tasks-btn" 
                onClick={handleGenerateNewTasks}
                disabled={generatingTasks}
              >
                {generatingTasks ? 'Generating...' : 'Generate New Tasks'}
              </button>
            </div>
            
            {loading ? (
              <div>Loading tasks...</div>
            ) : tasks.length === 0 ? (
              <div className="alert alert-info">
                Great job! You've completed all your current tasks. Click "Generate New Tasks" to get more tasks based on your career roadmap.
              </div>
            ) : (
              tasks.map((task) => (
                <div key={task.id} className="task-card">
                  <div className="task-icon">📝</div>
                  <div className="task-content">
                    <div className="task-title">{task.title}</div>
                    <div className="task-description">{task.desc}</div>
                  </div>
                  <label className="upload-btn">
                    {uploading[task.id] ? 'Uploading...' : `Upload (+${task.xp} XP)`}
                    <input 
                      type="file" 
                      hidden 
                      onChange={(e) => handleFileChange(task.id, e)}
                      disabled={uploading[task.id]}
                    />
                  </label>
                </div>
              ))
            )}
          </div>

          <div className="col-md-4">
            <div className="leaderboard-card">
              <h6 className="leaderboard-header">🏆 Leaderboard</h6>
              <div>
                {leaderboard.map((user, index) => (
                  <div 
                    key={user.id || index} 
                    className={`leaderboard-item ${user.isCurrentUser ? 'current-user' : ''}`}
                  >
                    <span className="leaderboard-rank">#{index + 1}</span>
                    <div className="leaderboard-avatar">
                      {user.name.charAt(0)}
                    </div>
                    <div className="leaderboard-user">
                      {user.name}
                      {user.isCurrentUser && <span className="you-badge">You</span>}
                    </div>
                    <div className="leaderboard-info">
                      <div className="leaderboard-level">Lvl {user.level || 1}</div>
                      <div className="leaderboard-points">{user.xp || 0} XP</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <footer>
        &copy; 2025 LevelUp. All rights reserved.
      </footer>
    </div>
  );
}
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import taskService from '../services/taskService';

const TaskHistory = () => {
  const { user } = useAuth();
  const [completedTasks, setCompletedTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTaskHistory = async () => {
      if (user) {
        try {
          const taskHistory = await taskService.getTaskHistory(user.id);
          setCompletedTasks(taskHistory);
        } catch (error) {
          console.error("Error fetching task history:", error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchTaskHistory();
  }, [user]);

  return (
    <div className="task-history">
      <div className="task-history-container">
        <div className="task-history-header">
          <h2>Task History</h2>
          <p>View all your completed tasks and their details</p>
        </div>

        <div className="task-history-content">
          <div className="task-history-box">
            <div className="task-history-box-header">
              <span className="task-history-box-icon">📋</span>
              <h3 className="task-history-box-title">Completed Tasks</h3>
            </div>
            
            {loading ? (
              <div className="task-history-loading">
                <div>Loading task history...</div>
              </div>
            ) : !user ? (
              <div className="task-history-loading">
                <div>Please log in to view your task history.</div>
              </div>
            ) : completedTasks.length === 0 ? (
              <div className="no-completed-tasks">
                <div className="mb-3">
                  <i className="bi bi-journal-check"></i>
                </div>
                <h4>No Completed Tasks Yet</h4>
                <p className="text-muted mb-4">You haven't completed any tasks yet.</p>
                <p>Complete tasks to see them appear here and earn XP!</p>
                <button 
                  className="btn btn-primary"
                  onClick={() => window.location.hash = '#'}
                >
                  Go to Dashboard
                </button>
              </div>
            ) : (
              <div className="completed-tasks-list">
                {completedTasks.map((task, index) => (
                  <div key={index} className="task-history-item">
                    <div className="task-history-item-header">
                      <div>
                        <h4 className="task-history-item-title">{task.title}</h4>
                        <p className="task-history-item-description">{task.description}</p>
                      </div>
                      <span className="task-history-item-badge">+{task.xpEarned} XP</span>
                    </div>
                    
                    <div className="task-meta">
                      <div className="task-meta-item">
                        <i className="bi bi-calendar"></i>
                        <span>Completed on: {task.submittedAt ? new Date(task.submittedAt).toLocaleDateString() : 'N/A'}</span>
                      </div>
                      <div className="task-meta-item">
                        <i className="bi bi-clock"></i>
                        <span>Time: {task.submittedAt ? new Date(task.submittedAt).toLocaleTimeString() : 'N/A'}</span>
                      </div>
                      
                      {task.fileUrl && (
                        <div className="task-file-link">
                          <a href={task.fileUrl} target="_blank" rel="noopener noreferrer" className="btn btn-outline-primary btn-sm">
                            <i className="bi bi-file-earmark"></i> View Submitted File
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskHistory;
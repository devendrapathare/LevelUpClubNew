import React, { useState } from 'react';
import taskService from '../services/taskService';
import { useAuth } from '../contexts/AuthContext';

const TestTaskFunctionality = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');

  const testGetTasks = async () => {
    if (!user) {
      setResult('User not logged in');
      return;
    }

    setLoading(true);
    try {
      const userTasks = await taskService.getUserTasks(user.id);
      setTasks(userTasks);
      setResult(`Successfully fetched ${userTasks.length} tasks`);
    } catch (error) {
      setResult(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const testUploadTask = async () => {
    if (!user) {
      setResult('User not logged in');
      return;
    }

    setLoading(true);
    try {
      // Create a mock file for testing
      const mockFile = new File([''], 'test-task.txt', { type: 'text/plain' });
      const response = await taskService.uploadTask(user.id, 'test-task-id', mockFile);
      setResult(`Upload successful: ${response.message}`);
    } catch (error) {
      setResult(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>Task Functionality Test</h2>
      <p>User: {user ? user.name : 'Not logged in'}</p>
      
      <div style={{ margin: '10px 0' }}>
        <button onClick={testGetTasks} disabled={loading}>
          {loading ? 'Loading...' : 'Test Get Tasks'}
        </button>
        <button onClick={testUploadTask} disabled={loading} style={{ marginLeft: '10px' }}>
          {loading ? 'Uploading...' : 'Test Upload Task'}
        </button>
      </div>

      <div style={{ margin: '10px 0', padding: '10px', backgroundColor: '#f0f0f0' }}>
        <p><strong>Result:</strong> {result}</p>
      </div>

      {tasks.length > 0 && (
        <div>
          <h3>Tasks:</h3>
          <ul>
            {tasks.map((task, index) => (
              <li key={index}>
                {task.title} - {task.desc} (XP: {task.xp}) - {task.completed ? 'Completed' : 'Pending'}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default TestTaskFunctionality;
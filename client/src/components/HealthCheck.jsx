import React, { useState, useEffect } from 'react';

const HealthCheck = () => {
  const [healthStatus, setHealthStatus] = useState({ frontend: 'checking', backend: 'checking' });
  const [details, setDetails] = useState({});

  useEffect(() => {
    const checkHealth = async () => {
      // Check frontend
      setHealthStatus(prev => ({ ...prev, frontend: 'healthy' }));
      
      // Check backend
      try {
        const response = await fetch('/api/health');
        if (response.ok) {
          const data = await response.json();
          setHealthStatus(prev => ({ ...prev, backend: 'healthy' }));
          setDetails(data);
        } else {
          setHealthStatus(prev => ({ ...prev, backend: 'unhealthy' }));
        }
      } catch (error) {
        setHealthStatus(prev => ({ ...prev, backend: 'unhealthy' }));
      }
    };

    checkHealth();
  }, []);

  return (
    <div className="health-check">
      <h2>System Health Check</h2>
      <div className="health-status">
        <div className={`status-item ${healthStatus.frontend}`}>
          <h3>Frontend</h3>
          <p className="status">{healthStatus.frontend}</p>
        </div>
        <div className={`status-item ${healthStatus.backend}`}>
          <h3>Backend</h3>
          <p className="status">{healthStatus.backend}</p>
        </div>
      </div>
      
      {Object.keys(details).length > 0 && (
        <div className="health-details">
          <h3>Backend Details</h3>
          <pre>{JSON.stringify(details, null, 2)}</pre>
        </div>
      )}
      
      <div className="troubleshooting">
        <h3>Troubleshooting Tips</h3>
        <ul>
          <li>If backend shows "unhealthy", make sure the server is running on port 5001</li>
          <li>Check that the Vite proxy in vite.config.js is pointing to the correct backend port</li>
          <li>Verify that no firewall is blocking the connection between frontend and backend</li>
        </ul>
      </div>
    </div>
  );
};

export default HealthCheck;
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import dashboardService from '../services/dashboardService';

const Dashboard = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (user) {
        try {
          const data = await dashboardService.getDashboardData(user.id);
          setDashboardData(data);
        } catch (error) {
          console.error("Error fetching dashboard data:", error);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  if (loading) {
    return <div className="dashboard p-8">Loading dashboard...</div>;
  }

  if (!user) {
    return <div className="p-8 text-center">Please log in to view the dashboard</div>;
  }

  return (
    <div className="dashboard p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
        <div className="user-info bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-2">Welcome back, {user.name}!</h2>
          <p className="text-gray-600 mb-1">Email: {user.email}</p>
          <p className="text-gray-600">Role: {user.role}</p>
        </div>
      </div>
      
      {dashboardData && (
        <div className="dashboard-summary mb-8">
          <div className="stats grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="stat-card bg-white p-6 rounded-lg shadow-md text-center">
              <h3 className="text-3xl font-bold text-blue-600 mb-2">{dashboardData.connectionCount}</h3>
              <p className="text-gray-600">Connections</p>
            </div>
            <div className="stat-card bg-white p-6 rounded-lg shadow-md text-center">
              <h3 className="text-3xl font-bold text-blue-600 mb-2">{dashboardData.jobCount}</h3>
              <p className="text-gray-600">Job Opportunities</p>
            </div>
            <div className="stat-card bg-white p-6 rounded-lg shadow-md text-center">
              <h3 className="text-3xl font-bold text-blue-600 mb-2">{dashboardData.careerRecommendations.length}</h3>
              <p className="text-gray-600">Career Recommendations</p>
            </div>
          </div>
          
          {dashboardData.dailyTasks && dashboardData.dailyTasks.length > 0 && (
            <div className="daily-tasks bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-bold mb-4">Today's Tasks</h3>
              <ul className="list-disc pl-5 space-y-2">
                {dashboardData.dailyTasks.map((task, index) => (
                  <li key={index} className="text-gray-700">{task}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
      
      <div className="dashboard-features">
        <h2 className="text-2xl font-bold mb-6">Platform Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="feature-card bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <h3 className="text-xl font-bold mb-3 text-purple-600">Career Assessment</h3>
            <p className="text-gray-600 mb-4">Complete our comprehensive assessment to get personalized career recommendations</p>
            <button 
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
              onClick={() => window.location.hash = '#assessment'}
            >
              Start Assessment
            </button>
          </div>
          
          <div className="feature-card bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <h3 className="text-xl font-bold mb-3 text-purple-600">AI Recommendations</h3>
            <p className="text-gray-600 mb-4">Get AI-powered career guidance based on your profile</p>
            <button 
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
              onClick={() => window.location.hash = '#assessment'}
            >
              View Recommendations
            </button>
          </div>
          
          <div className="feature-card bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <h3 className="text-xl font-bold mb-3 text-purple-600">Networking</h3>
            <p className="text-gray-600 mb-4">Connect with professionals in your field</p>
            <button 
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
              onClick={() => window.location.hash = '#connections'}
            >
              Find Connections
            </button>
          </div>
          
          <div className="feature-card bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <h3 className="text-xl font-bold mb-3 text-purple-600">Job Marketplace</h3>
            <p className="text-gray-600 mb-4">Browse job opportunities tailored to your skills</p>
            <button 
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
              onClick={() => window.location.hash = '#jobs'}
            >
              Browse Jobs
            </button>
          </div>
          
          <div className="feature-card bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <h3 className="text-xl font-bold mb-3 text-purple-600">Community Feed</h3>
            <p className="text-gray-600 mb-4">Share insights, ask questions, and engage with the community</p>
            <button 
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
              onClick={() => window.location.hash = '#community'}
            >
              Visit Community
            </button>
          </div>
          
          <div className="feature-card bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <h3 className="text-xl font-bold mb-3 text-purple-600">Messaging</h3>
            <p className="text-gray-600 mb-4">Communicate with your connections</p>
            <button 
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
              onClick={() => window.location.hash = '#messaging'}
            >
              View Messages
            </button>
          </div>
          
          <div className="feature-card bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <h3 className="text-xl font-bold mb-3 text-purple-600">Profile</h3>
            <p className="text-gray-600 mb-4">Manage your personal and professional information</p>
            <button 
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
              onClick={() => window.location.hash = '#profile'}
            >
              Edit Profile
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
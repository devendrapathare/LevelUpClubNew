import careerService from './careerService';
import connectionsService from './connectionsService';
import jobsService from './jobsService';

class DashboardService {
  async getDashboardData(userId) {
    // In a real implementation, this would fetch personalized dashboard data from the backend
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Fetch data from various services
    const [careerData, connectionsData, jobsData] = await Promise.all([
      careerService.getCareerRecommendations(userId),
      connectionsService.getConnections(),
      jobsService.getJobs()
    ]);
    
    // Mock response
    return {
      careerRecommendations: careerData.careers.slice(0, 2), // Top 2 recommendations
      dailyTasks: careerData.dailyTasks,
      connectionCount: connectionsData.length,
      jobCount: jobsData.length,
      recentActivity: [
        {
          id: 1,
          type: "connection",
          message: "You have 3 new connection requests",
          timestamp: "2025-10-12T10:30:00Z"
        },
        {
          id: 2,
          type: "job",
          message: "2 new jobs match your profile",
          timestamp: "2025-10-12T09:15:00Z"
        },
        {
          id: 3,
          type: "recommendation",
          message: "New career recommendations available",
          timestamp: "2025-10-11T16:45:00Z"
        }
      ]
    };
  }
}

export default new DashboardService();
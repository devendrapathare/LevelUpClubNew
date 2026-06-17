import api from './api';

class GoalsService {
  async getUserGoals(userId) {
    try {
      const response = await fetch(`/api/goals/${userId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.status === 401) {
        throw new Error('Unauthorized');
      }

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch goals');
      }

      return data.goals;
    } catch (error) {
      // Fallback to mock data if API call fails
      console.error("Error fetching goals from API, using mock data:", error);
      return {
        monthly: [
          {
            id: 1,
            title: "Complete 5 learning modules",
            description: "Focus on core skills required for your chosen career path",
            target: 5,
            completed: 2,
            progress: 40
          },
          {
            id: 2,
            title: "Network with 3 professionals",
            description: "Connect with mentors and peers in your career area",
            target: 3,
            completed: 1,
            progress: 33
          }
        ],
        yearly: [
          {
            id: 1,
            title: "Master key skills for your career",
            description: "Develop proficiency in the core competencies required for your career",
            target: 100,
            completed: 30,
            progress: 30
          },
          {
            id: 2,
            title: "Build 2 portfolio projects",
            description: "Create projects that demonstrate your skills to potential employers",
            target: 2,
            completed: 0,
            progress: 0
          }
        ]
      };
    }
  }

  async updateGoalProgress(userId, goalId, goalType, progress) {
    try {
      const response = await fetch(`/api/goals/${userId}/update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ goalId, goalType, progress }),
      });

      if (response.status === 401) {
        throw new Error('Unauthorized');
      }

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to update goal progress');
      }

      return data;
    } catch (error) {
      throw new Error(error.message || 'Failed to update goal progress');
    }
  }
}

export default new GoalsService();
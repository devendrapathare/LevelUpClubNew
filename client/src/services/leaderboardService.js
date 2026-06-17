class LeaderboardService {
  async getLeaderboard() {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    try {
      const response = await fetch('/api/users/leaderboard', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      console.log('Leaderboard API response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Leaderboard API error response:', errorText);
        
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch (e) {
          errorData = { msg: errorText || `Failed to fetch leaderboard: ${response.status} ${response.statusText}` };
        }
        
        throw new Error(errorData.msg || `Failed to fetch leaderboard: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Leaderboard data received:', data);
      return data.leaderboard || [];
    } catch (error) {
      console.error('Error in leaderboard service:', error);
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('Network error. Please check your connection and try again.');
      }
      throw error;
    }
  }
}

export default new LeaderboardService();
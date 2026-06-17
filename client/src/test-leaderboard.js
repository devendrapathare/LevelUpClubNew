// Simple test script to verify leaderboard functionality
async function testLeaderboard() {
  try {
    console.log('Testing leaderboard service...');
    
    const token = localStorage.getItem('token');
    console.log('Token:', token ? 'Present' : 'Missing');
    
    if (!token) {
      console.log('No token found');
      return;
    }
    
    const response = await fetch('/api/users/leaderboard', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });
    
    console.log('Response status:', response.status);
    
    const text = await response.text();
    console.log('Response text:', text);
    
    let data;
    try {
      data = JSON.parse(text);
      console.log('Parsed data:', data);
    } catch (e) {
      console.log('Failed to parse JSON:', e);
      return;
    }
    
    if (response.ok) {
      console.log('Leaderboard data:', data.leaderboard);
    } else {
      console.log('Error:', data.msg || 'Unknown error');
    }
  } catch (error) {
    console.error('Test error:', error);
  }
}

// Run the test
testLeaderboard();
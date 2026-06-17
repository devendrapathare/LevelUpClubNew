// get-token.js
// Simple script to get a valid token for testing

// Use built-in fetch if available (Node.js 18+)
const fetch = global.fetch || require('node-fetch');

async function getToken() {
  try {
    const response = await fetch('http://localhost:5001/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'alex.johnson@example.com',
        password: 'password123'
      })
    });

    const data = await response.json();
    console.log('Login response:', data);
    
    if (data.token) {
      console.log('Token:', data.token);
    } else {
      console.log('No token received');
    }
  } catch (error) {
    console.error('Error getting token:', error);
  }
}

getToken();
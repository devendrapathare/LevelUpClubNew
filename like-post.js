const http = require('http');

// Get the first post ID from the API
function getFirstPostId() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5001,
      path: '/api/posts',
      method: 'GET'
    };

    const req = http.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          if (response.posts.length > 0) {
            resolve(response.posts[0].id);
          } else {
            reject(new Error('No posts found'));
          }
        } catch (error) {
          reject(error);
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.end();
  });
}

// Like a post
function likePost(postId, token) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5001,
      path: `/api/posts/${postId}/like`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          console.log('Like response:', response);
          resolve(response);
        } catch (error) {
          console.error('Error parsing like response:', error);
          console.log('Raw response:', data);
          resolve(data);
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.write(JSON.stringify({}));
    req.end();
  });
}

// Main function
async function main() {
  try {
    // Use the token we got from the previous script
    const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImlkIjoiNjI5OGM3OWMtYzE5Yy00NmFjLWI1MTctYzEzMGEyOTc5ZjkxIiwiZW1haWwiOiJhbGV4LmpvaG5zb25AZXhhbXBsZS5jb20iLCJyb2xlIjoic3R1ZGVudCJ9LCJpYXQiOjE3NjA2NTMxNTgsImV4cCI6MTc2MTI1Nzk1OH0.Lk2IDupetmzozdLtMCEVcLpx-Ez54cG118W_QCRDBIk';
    
    console.log('Getting first post ID...');
    const postId = await getFirstPostId();
    console.log('First post ID:', postId);
    
    console.log('Liking post...');
    const likeResponse = await likePost(postId, token);
    console.log('Like successful:', likeResponse);
  } catch (error) {
    console.error('Error:', error);
  }
}

main();
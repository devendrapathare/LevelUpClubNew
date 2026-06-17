// test-community-service.js
// Simple script to test the community service

const communityService = require('./services/communityService');

async function testGetUserPosts(userId) {
  try {
    console.log('Testing getUserPosts with userId:', userId);
    const posts = await communityService.getUserPosts(userId);
    console.log('Posts returned:', posts);
    console.log('Number of posts:', posts.length);
  } catch (error) {
    console.error('Error in testGetUserPosts:', error);
  }
}

// Test with the user ID we know has posts
testGetUserPosts('5ab9316a-fdcc-495d-83bb-391b39c987e8');
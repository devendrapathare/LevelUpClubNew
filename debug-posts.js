// debug-posts.js
// Simple script to debug post data structure

async function debugPosts() {
  try {
    // Simulate the API response structure
    const mockApiResponse = {
      msg: "Posts fetched successfully!",
      posts: [
        {
          id: "test-post-1",
          content: "Test post content",
          likes: 5, // This is a number, not an array
          comments: [ // This is an array
            { id: "comment-1", content: "First comment" },
            { id: "comment-2", content: "Second comment" }
          ],
          media_urls: []
        }
      ]
    };
    
    console.log("API Response:", mockApiResponse);
    console.log("Number of posts:", mockApiResponse.posts.length);
    
    // Correct way to access likes (as a number)
    console.log("Likes count:", mockApiResponse.posts[0].likes);
    
    // Correct way to access comments count (as an array length)
    console.log("Comments count:", mockApiResponse.posts[0].comments.length);
    
    // Incorrect way that would cause an error
    try {
      console.log("Trying incorrect access:", mockApiResponse.posts[0].likes.length);
    } catch (error) {
      console.log("Error when accessing likes.length:", error.message);
    }
  } catch (error) {
    console.error("Error in debugPosts:", error);
  }
}

debugPosts();
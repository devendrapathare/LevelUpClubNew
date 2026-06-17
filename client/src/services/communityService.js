class CommunityService {
  async getFeed() {
    try {
      const response = await fetch('/api/posts');
      const data = await response.json();
      return data.posts || [];
    } catch (error) {
      console.error('Error fetching feed:', error);
      return [];
    }
  }

  async getPosts() {
    // Alias for getFeed for backward compatibility
    return this.getFeed();
  }

  async createPost(content, mediaFiles = []) {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    try {
      // Create FormData for file uploads
      const formData = new FormData();
      formData.append('content', content);
      
      // Append media files if any
      if (mediaFiles && mediaFiles.length > 0) {
        mediaFiles.forEach((file) => {
          formData.append('media', file);
        });
      }

      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData
      });

      if (!response.ok) {
        // Check content type to determine how to parse the error
        const contentType = response.headers.get('content-type');
        
        if (contentType && contentType.includes('application/json')) {
          // Handle JSON error response
          const errorData = await response.json();
          throw new Error(errorData.msg || 'Failed to create post');
        } else {
          // Handle text error response
          const errorText = await response.text();
          throw new Error(errorText || 'Failed to create post');
        }
      }

      const data = await response.json();
      return data.post;
    } catch (error) {
      console.error('Error creating post:', error);
      throw error;
    }
  }

  async addComment(postId, content) {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    try {
      const response = await fetch(`/api/posts/${postId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ content })
      });

      if (!response.ok) {
        // Check content type to determine how to parse the error
        const contentType = response.headers.get('content-type');
        
        if (contentType && contentType.includes('application/json')) {
          // Handle JSON error response
          const errorData = await response.json();
          throw new Error(errorData.msg || 'Failed to add comment');
        } else {
          // Handle text error response
          const errorText = await response.text();
          throw new Error(errorText || 'Failed to add comment');
        }
      }

      const data = await response.json();
      return data.comment;
    } catch (error) {
      console.error('Error adding comment:', error);
      throw error;
    }
  }

  async likePost(postId) {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    try {
      const response = await fetch(`/api/posts/${postId}/like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        }
      });

      if (!response.ok) {
        // Check content type to determine how to parse the error
        const contentType = response.headers.get('content-type');
        
        if (contentType && contentType.includes('application/json')) {
          // Handle JSON error response
          const errorData = await response.json();
          throw new Error(errorData.msg || 'Failed to like post');
        } else {
          // Handle text error response
          const errorText = await response.text();
          throw new Error(errorText || 'Failed to like post');
        }
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error liking post:', error);
      throw error;
    }
  }

  async unlikePost(postId) {
    // Unlike is handled by the same endpoint as like
    // The backend toggles like/unlike based on current state
    return await this.likePost(postId);
  }

  async getUserPosts(userId) {
    try {
      const response = await fetch(`/api/posts/user/${userId}`);
      if (!response.ok) {
        // Check content type to determine how to parse the error
        const contentType = response.headers.get('content-type');
        
        if (contentType && contentType.includes('application/json')) {
          // Handle JSON error response
          const errorData = await response.json();
          throw new Error(errorData.msg || 'Failed to fetch user posts');
        } else {
          // Handle text error response
          const errorText = await response.text();
          throw new Error(errorText || 'Failed to fetch user posts');
        }
      }

      const data = await response.json();
      return data.posts || [];
    } catch (error) {
      console.error('Error fetching user posts:', error);
      return [];
    }
  }

  async deletePost(postId) {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    try {
      const response = await fetch(`/api/posts/${postId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });

      if (!response.ok) {
        // Check content type to determine how to parse the error
        const contentType = response.headers.get('content-type');
        
        if (contentType && contentType.includes('application/json')) {
          // Handle JSON error response
          const errorData = await response.json();
          throw new Error(errorData.msg || 'Failed to delete post');
        } else {
          // Handle text error response
          const errorText = await response.text();
          throw new Error(errorText || 'Failed to delete post');
        }
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error deleting post:', error);
      throw error;
    }
  }
}

export default new CommunityService();
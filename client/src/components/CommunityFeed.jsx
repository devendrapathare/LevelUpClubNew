import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import communityService from '../services/communityService';

const defaultAvatar = "https://cdn-icons-png.flaticon.com/512/4333/4333609.png";

const CommunityFeed = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [postContent, setPostContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [mediaFiles, setMediaFiles] = useState([]);
  const [mediaPreviews, setMediaPreviews] = useState([]);
  const [visibleComments, setVisibleComments] = useState({}); // Track which comments are visible
  const fileInputRef = useRef(null);
  const commentInputRefs = useRef({});

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const postData = await communityService.getFeed();
        console.log('Raw post data:', postData); // For debugging
        
        // Transform backend response to match frontend expectations
        const transformedPosts = postData.map(post => {
          // Process author data
          const author = {
            id: post.user?.id || 'unknown',
            name: post.user?.name || 'Unknown User',
            avatar: post.user?.profile_picture_data 
              ? `data:image/jpeg;base64,${post.user.profile_picture_data}`
              : post.user?.profile_picture_url || defaultAvatar
          };

          // Process comments
          const comments = post.comments?.map(comment => ({
            id: comment.id,
            content: comment.content,
            author: {
              id: comment.user?.id || 'unknown',
              name: comment.user?.name || 'Unknown User',
              avatar: comment.user?.profile_picture_data 
                ? `data:image/jpeg;base64,${comment.user.profile_picture_data}`
                : comment.user?.profile_picture_url || defaultAvatar
            }
          })) || [];

          return {
            id: post.id,
            content: post.content,
            author: author,
            createdAt: post.created_at,
            media: post.media_urls ? post.media_urls.map(url => ({ url })) : [],
            likes: post.likes || 0,
            isLiked: post.liked || false,
            comments: comments
          };
        });
        setPosts(transformedPosts);
      } catch (error) {
        console.error("Error fetching posts:", error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchPosts();
    } else {
      setLoading(false);
    }
  }, [user]);

  const handlePostSubmit = async () => {
    if (!postContent.trim()) return;

    try {
      const post = await communityService.createPost(postContent, mediaFiles);
      console.log('Created post:', post); // For debugging
      
      // Transform the new post to match frontend expectations
      const transformedPost = {
        id: post.id,
        content: post.content,
        author: {
          id: post.user?.id || user.id,
          name: post.user?.name || user.name,
          avatar: post.user?.profile_picture_data 
            ? `data:image/jpeg;base64,${post.user.profile_picture_data}`
            : post.user?.profile_picture_url || user.profile_picture_url || defaultAvatar
        },
        createdAt: post.created_at,
        media: post.media_urls ? post.media_urls.map(url => ({ url })) : [],
        likes: post.likes || 0,
        isLiked: post.liked || false,
        comments: post.comments ? post.comments.map(comment => ({
          id: comment.id,
          content: comment.content,
          author: {
            id: user.id,
            name: user.name,
            avatar: user.profile_picture_url || defaultAvatar
          }
        })) : []
      };
      setPosts([transformedPost, ...posts]);
      setPostContent('');
      setMediaFiles([]);
      setMediaPreviews([]);
    } catch (error) {
      console.error("Error creating post:", error);
      alert("Error creating post. Please try again.");
    }
  };

  const handleLike = async (postId) => {
    try {
      // Find the post to determine if it's currently liked
      const post = posts.find(p => p.id === postId);
      if (!post) return;

      let response;
      if (post.isLiked) {
        // Unlike the post
        response = await communityService.unlikePost(postId);
      } else {
        // Like the post
        response = await communityService.likePost(postId);
      }

      // Update the UI with the actual like count from the backend
      setPosts(posts.map(p => {
        if (p.id === postId) {
          return {
            ...p,
            isLiked: !p.isLiked,
            likes: response.likes // Use the like count returned by the backend
          };
        }
        return p;
      }));
    } catch (error) {
      console.error("Error liking post:", error);
      alert("Error updating like. Please try again.");
    }
  };

  const handleAddComment = async (postId, commentContent) => {
    if (!commentContent.trim()) return;

    try {
      const comment = await communityService.addComment(postId, commentContent);
      
      // Transform the new comment to match frontend expectations
      const transformedComment = {
        id: comment.id,
        content: comment.content,
        author: {
          id: user.id,
          name: user.name,
          avatar: user.profile_picture_url || defaultAvatar
        }
      };

      // Update the posts state to include the new comment
      setPosts(posts.map(post => {
        if (post.id === postId) {
          return {
            ...post,
            comments: [...post.comments, transformedComment]
          };
        }
        return post;
      }));

      // Clear the comment input
      if (commentInputRefs.current[postId]) {
        commentInputRefs.current[postId].value = '';
      }
    } catch (error) {
      console.error("Error adding comment:", error);
      alert("Error adding comment. Please try again.");
    }
  };

  const handleCommentSubmit = (postId, e) => {
    e.preventDefault();
    const commentContent = e.target.querySelector('input').value;
    handleAddComment(postId, commentContent);
  };

  const handleMediaChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 5) {
      alert("You can only upload up to 5 images per post.");
      return;
    }
    
    setMediaFiles(files);
    
    // Create preview URLs
    const previews = files.map(file => URL.createObjectURL(file));
    setMediaPreviews(previews);
  };

  const removeMediaPreview = (index) => {
    const newMediaFiles = [...mediaFiles];
    newMediaFiles.splice(index, 1);
    setMediaFiles(newMediaFiles);
    
    const newPreviews = [...mediaPreviews];
    newPreviews.splice(index, 1);
    setMediaPreviews(newPreviews);
  };

  // Toggle visibility of comments for a specific post
  const toggleComments = (postId) => {
    setVisibleComments(prev => ({
      ...prev,
      [postId]: !prev[postId]
    }));
  };

  // Navigate to user profile
  const navigateToProfile = (userId) => {
    // If user clicks on their own profile, go to their profile page
    if (user && user.id === userId) {
      window.location.hash = '#profile';
    } else {
      // For other users, go to their profile page
      window.location.hash = `#profile-${userId}`;
    }
  };

  if (loading) {
    return <div className="community-feed">Loading community feed...</div>;
  }

  return (
    <div className="community-feed">
      <div className="feed-container">
        {/* Create Post */}
        <div className="create-post">
          <div className="post-author">
            <img 
              className="avatar" 
              src={user?.profile_picture_url || defaultAvatar} 
              alt={user?.name} 
              width="50"
              height="50"
            />
            <div className="author-info">
              <h4>{user?.name}</h4>
              <p>{user?.headline || 'LevelUp Member'}</p>
            </div>
          </div>
          
          <textarea
            placeholder="Share your thoughts..."
            value={postContent}
            onChange={(e) => setPostContent(e.target.value)}
          />
          
          {mediaPreviews.length > 0 && (
            <div className="media-preview">
              {mediaPreviews.map((preview, index) => (
                <div key={index} className="preview-container">
                  <img src={preview} alt={`Preview ${index}`} />
                  <button 
                    className="remove-preview"
                    onClick={() => removeMediaPreview(index)}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
          
          <div className="post-actions">
            <div className="media-input">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleMediaChange}
                accept="image/*"
                multiple
                style={{ display: 'none' }}
              />
              <button 
                className="btn"
                onClick={() => fileInputRef.current.click()}
              >
                Add Images
              </button>
              <span className="file-info">
                {mediaFiles.length > 0 ? `${mediaFiles.length} image(s) selected` : 'No images selected'}
              </span>
            </div>
            <button 
              className="post-button"
              onClick={handlePostSubmit}
              disabled={!postContent.trim()}
            >
              Post
            </button>
          </div>
        </div>
        
        {/* Posts List */}
        {posts.length > 0 ? (
          posts.map(post => (
            <div key={post.id} className="post">
              <div className="post-header">
                <img 
                  className="avatar" 
                  src={post?.author?.avatar || defaultAvatar} 
                  alt={post?.author?.name || 'Unknown user'} 
                  width="50"
                  height="50"
                />
                <div className="post-author-info">
                  <h4 
                    className={`clickable-name ${!post?.author?.name ? 'unknown-user' : ''}`}
                    onClick={() => navigateToProfile(post.author.id)}
                  >
                    {post?.author?.name || 'Unknown'}
                  </h4>
                  <p>{post.createdAt ? new Date(post.createdAt).toLocaleString() : ''}</p>
                </div>
              </div>
              
              <div className="post-content">
                <p>{post.content}</p>
              </div>
              
              {post.media?.length > 0 && (
                <div className="post-media">
                  {post.media.map((media, index) => (
                    <img key={index} src={media.url} alt={`Post media ${index}`} />
                  ))}
                </div>
              )}
              
              <div className="post-actions">
                <button 
                  className={`action-button like-button ${post.isLiked ? 'liked' : ''}`}
                  onClick={() => handleLike(post.id)}
                >
                  <span className="action-icon">👍</span> 
                  <span className="action-text">{post.likes} Likes</span>
                </button>
                <button 
                  className="action-button comment-button"
                  onClick={() => toggleComments(post.id)}
                >
                  <span className="action-icon">💬</span> 
                  <span className="action-text">{post.comments.length} Comments</span>
                </button>
              </div>
              
              {/* Comments Section - Only visible when toggled */}
              {visibleComments[post.id] && (
                <div className="post-comments">
                  <form onSubmit={(e) => handleCommentSubmit(post.id, e)} className="add-comment">
                    <img 
                      className="comment-avatar" 
                      src={user?.profile_picture_url || defaultAvatar} 
                      alt={user?.name} 
                      width="40"
                      height="40"
                    />
                    <input 
                      type="text" 
                      className="comment-input" 
                      placeholder="Add a comment..."
                      ref={(el) => (commentInputRefs.current[post.id] = el)}
                    />
                    <button type="submit" className="comment-submit-btn">Post</button>
                  </form>
                  
                  {post.comments?.map(comment => (
                    <div key={comment.id} className="comment">
                      <img 
                        className="comment-avatar" 
                        src={comment?.author?.avatar || defaultAvatar} 
                        alt={comment?.author?.name || 'Unknown user'} 
                        width="40"
                        height="40"
                      />
                      <div className="comment-content">
                        <h5 
                          className="clickable-name"
                          onClick={() => navigateToProfile(comment.author.id)}
                        >
                          {comment?.author?.name || 'Unknown'}
                        </h5>
                        <p>{comment.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="no-posts">
            <p>No posts yet. Be the first to share something!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CommunityFeed;
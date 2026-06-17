const express = require('express');
const router = express.Router();
const multer = require('multer');
const { PrismaClient } = require('../generated/prisma');
const { verifyToken } = require('../middleware/auth');

const prisma = new PrismaClient();

// Configure multer for post image uploads
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    // Accept image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Error handling middleware for multer
const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ msg: 'File size too large. Maximum size is 5MB.' });
    }
  } else if (err) {
    return res.status(400).json({ msg: err.message });
  }
  next();
};

// @route   POST /api/posts
// @desc    Create a new post with binary image support
// @access  Private
router.post('/', verifyToken, upload.array('media', 5), handleMulterError, async (req, res) => {
  const { content, visibility } = req.body;
  const user_id = req.user.id;

  try {
    // Process uploaded media files
    const media_data = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        // Ensure we're storing actual Buffer data
        if (Buffer.isBuffer(file.buffer)) {
          media_data.push(file.buffer);
        } else {
          // Convert to Buffer if needed
          media_data.push(Buffer.from(file.buffer));
        }
      }
    }

    // Create post
    const post = await prisma.post.create({
      data: {
        user_id,
        content,
        media_data: media_data,
        visibility: visibility || 'public'
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            headline: true,
            profile_picture_url: true,
            profile_picture_data: true
          }
        },
        comments: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                profile_picture_url: true,
                profile_picture_data: true
              }
            }
          }
        },
        likes: {
          select: {
            id: true,
            user_id: true
          }
        }
      }
    });

    // Convert profile_picture_data to base64 string if it exists
    const userWithProcessedImage = {
      ...post.user,
      profile_picture_data: post.user.profile_picture_data ? 
        Buffer.from(post.user.profile_picture_data).toString('base64') : 
        null
    };

    // Add base64 URLs for media data for frontend display
    const postWithMediaUrls = {
      ...post,
      media_urls: post.media_data.map((data, index) => {
        // In a real implementation, we would serve these from an endpoint
        // For now, we'll return placeholder URLs
        return `/api/posts/${post.id}/media/${index}`;
      }),
      // Add default values for frontend
      likes: 0, // New post starts with 0 likes
      liked: false, // New post is not liked by current user
      comments: [], // New post starts with 0 comments
      user: userWithProcessedImage
    };

    res.status(201).json({
      msg: 'Post created successfully!',
      post: postWithMediaUrls
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET /api/posts
// @desc    Get feed of posts with binary image support
// @access  Public
router.get('/', async (req, res) => {
  const { visibility, limit = 20, offset = 0 } = req.query;
  
  try {
    // Build where clause based on filters
    const where = {};
    
    if (visibility) {
      where.visibility = visibility;
    }
    
    // For now, we'll fetch all public posts
    // In a real implementation, we would also fetch posts from connections for logged-in users
    
    const posts = await prisma.post.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            headline: true,
            profile_picture_url: true,
            profile_picture_data: true
          }
        },
        comments: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                profile_picture_url: true,
                profile_picture_data: true
              }
            }
          }
        },
        likes: {
          select: {
            id: true,
            user_id: true
          }
        }
      },
      orderBy: {
        created_at: 'desc'
      },
      take: parseInt(limit),
      skip: parseInt(offset)
    });

    // Add media URLs for frontend display
    const postsWithMediaUrls = posts.map(post => {
      // Convert profile_picture_data to base64 string if it exists
      const userWithProcessedImage = {
        ...post.user,
        profile_picture_data: post.user.profile_picture_data ? 
          Buffer.from(post.user.profile_picture_data).toString('base64') : 
          null
      };
      
      // Process comments with profile picture data
      const commentsWithProcessedImages = post.comments.map(comment => ({
        ...comment,
        user: {
          ...comment.user,
          profile_picture_data: comment.user.profile_picture_data ? 
            Buffer.from(comment.user.profile_picture_data).toString('base64') : 
            null
        }
      }));

      return {
        ...post,
        media_urls: post.media_data.map((data, index) => {
          return `/api/posts/${post.id}/media/${index}`;
        }),
        // Add a liked property to indicate if the current user has liked this post
        liked: req.user ? post.likes.some(like => like.user_id === req.user.id) : false,
        // Transform likes to just the count
        likes: post.likes.length,
        user: userWithProcessedImage,
        comments: commentsWithProcessedImages
      };
    });

    res.json({
      msg: 'Posts fetched successfully!',
      posts: postsWithMediaUrls
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET /api/posts/user/:user_id
// @desc    Get posts by user ID with binary image support
// @access  Public
router.get('/user/:user_id', async (req, res) => {
  const { limit = 20, offset = 0 } = req.query;
  const user_id = req.params.user_id;
  
  try {
    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: user_id }
    });

    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    // Fetch posts by user
    const posts = await prisma.post.findMany({
      where: {
        user_id: user_id
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            headline: true,
            profile_picture_url: true,
            profile_picture_data: true
          }
        },
        comments: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                profile_picture_url: true,
                profile_picture_data: true
              }
            }
          }
        },
        likes: {
          select: {
            id: true,
            user_id: true
          }
        }
      },
      orderBy: {
        created_at: 'desc'
      },
      take: parseInt(limit),
      skip: parseInt(offset)
    });

    // Add media URLs for frontend display
    const postsWithMediaUrls = posts.map(post => {
      // Convert profile_picture_data to base64 string if it exists
      const userWithProcessedImage = {
        ...post.user,
        profile_picture_data: post.user.profile_picture_data ? 
          Buffer.from(post.user.profile_picture_data).toString('base64') : 
          null
      };
      
      // Process comments with profile picture data
      const commentsWithProcessedImages = post.comments.map(comment => ({
        ...comment,
        user: {
          ...comment.user,
          profile_picture_data: comment.user.profile_picture_data ? 
            Buffer.from(comment.user.profile_picture_data).toString('base64') : 
            null
        }
      }));

      return {
        ...post,
        media_urls: post.media_data.map((data, index) => {
          return `/api/posts/${post.id}/media/${index}`;
        }),
        // Add a liked property to indicate if the current user has liked this post
        liked: req.user ? post.likes.some(like => like.user_id === req.user.id) : false,
        // Transform likes to just the count
        likes: post.likes.length,
        user: userWithProcessedImage,
        comments: commentsWithProcessedImages
      };
    });

    res.json({
      msg: 'Posts fetched successfully!',
      posts: postsWithMediaUrls
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST /api/posts/:id/comments
// @desc    Add a comment to a post
// @access  Private
router.post('/:id/comments', verifyToken, async (req, res) => {
  const { content } = req.body;
  const post_id = req.params.id;
  const user_id = req.user.id;

  try {
    // Check if post exists
    const post = await prisma.post.findUnique({
      where: { id: post_id }
    });

    if (!post) {
      return res.status(404).json({ msg: 'Post not found' });
    }

    // Create comment
    const comment = await prisma.comment.create({
      data: {
        post_id,
        user_id,
        content
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            profile_picture_url: true
          }
        }
      }
    });

    res.status(201).json({
      msg: 'Comment added successfully!',
      comment
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST /api/posts/:id/like
// @desc    Like/unlike a post
// @access  Private
router.post('/:id/like', verifyToken, async (req, res) => {
  const post_id = req.params.id;
  const user_id = req.user.id;

  try {
    // Check if post exists
    const post = await prisma.post.findUnique({
      where: { id: post_id }
    });

    if (!post) {
      return res.status(404).json({ msg: 'Post not found' });
    }

    // Check if user has already liked the post
    const existingLike = await prisma.like.findUnique({
      where: {
        post_id_user_id: {
          post_id,
          user_id
        }
      }
    });

    if (existingLike) {
      // Unlike the post
      await prisma.like.delete({
        where: {
          post_id_user_id: {
            post_id,
            user_id
          }
        }
      });

      // Get updated like count
      const updatedLikeCount = await prisma.like.count({
        where: { post_id: post_id }
      });

      return res.json({
        msg: 'Post unliked successfully!',
        likes: updatedLikeCount
      });
    } else {
      // Like the post
      const like = await prisma.like.create({
        data: {
          post_id,
          user_id
        }
      });

      // Get updated like count
      const updatedLikeCount = await prisma.like.count({
        where: { post_id: post_id }
      });

      return res.status(201).json({
        msg: 'Post liked successfully!',
        like,
        likes: updatedLikeCount
      });
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   DELETE /api/posts/:id
// @desc    Delete a post
// @access  Private
router.delete('/:id', verifyToken, async (req, res) => {
  const post_id = req.params.id;
  const user_id = req.user.id;

  try {
    // Check if post exists
    const post = await prisma.post.findUnique({
      where: { id: post_id }
    });

    if (!post) {
      return res.status(404).json({ msg: 'Post not found' });
    }

    // Check if user is authorized to delete this post
    if (post.user_id !== user_id && req.user.role !== 'admin') {
      return res.status(403).json({ msg: 'Access denied. You can only delete your own posts.' });
    }

    // Delete associated likes and comments first, then the post
    // Due to foreign key constraints (ON DELETE RESTRICT), we must delete related records manually
    await prisma.like.deleteMany({
      where: { post_id: post_id }
    });

    await prisma.comment.deleteMany({
      where: { post_id: post_id }
    });

    // Now delete the post
    await prisma.post.delete({
      where: { id: post_id }
    });

    res.json({
      msg: 'Post deleted successfully!'
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

// @route   GET /api/posts/:id/media/:index
// @desc    Serve post media image from database
// @access  Public
router.get('/:id/media/:index', async (req, res) => {
  try {
    const { id, index } = req.params;
    
    // Get post with media data
    const post = await prisma.post.findUnique({
      where: { id: id },
      select: {
        media_data: true
      }
    });

    if (!post || !post.media_data || index >= post.media_data.length) {
      return res.status(404).json({ msg: 'Media not found' });
    }

    // Get the specific media data
    const mediaBuffer = post.media_data[parseInt(index)];
    
    if (!mediaBuffer) {
      return res.status(404).json({ msg: 'Media not found' });
    }

    // Check if mediaBuffer is already a Buffer or needs conversion
    let bufferToSend;
    if (Buffer.isBuffer(mediaBuffer)) {
      bufferToSend = mediaBuffer;
    } else if (typeof mediaBuffer === 'object' && mediaBuffer.type === 'Buffer' && Array.isArray(mediaBuffer.data)) {
      // Handle case where buffer was stored as JSON object
      bufferToSend = Buffer.from(mediaBuffer.data);
    } else if (Array.isArray(mediaBuffer)) {
      // Handle case where buffer was stored as array of numbers
      bufferToSend = Buffer.from(mediaBuffer);
    } else if (typeof mediaBuffer === 'object' && !Array.isArray(mediaBuffer)) {
      // Handle case where buffer was stored as object with numeric keys
      // Convert object with numeric keys to array
      const dataArray = [];
      const keys = Object.keys(mediaBuffer).map(Number).sort((a, b) => a - b);
      for (const key of keys) {
        if (typeof key === 'number' && mediaBuffer[key] !== undefined) {
          dataArray.push(mediaBuffer[key]);
        }
      }
      bufferToSend = Buffer.from(dataArray);
    } else {
      // Handle other cases
      return res.status(500).json({ msg: 'Invalid media data format' });
    }

    // Set headers for image
    res.setHeader('Content-Type', 'image/jpeg'); // Default to jpeg
    res.setHeader('Content-Disposition', 'inline');
    
    // Send binary data
    res.send(bufferToSend);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error while retrieving media' });
  }
});

module.exports = router;
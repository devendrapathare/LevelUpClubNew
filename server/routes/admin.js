const express = require('express');
const router = express.Router();
const { PrismaClient } = require('../generated/prisma');
const { verifyToken, authorizeRole } = require('../middleware/auth');

const prisma = new PrismaClient();

// @route   GET /api/admin/reports
// @desc    Get flagged content reports
// @access  Private (Admins only)
router.get('/reports', verifyToken, authorizeRole(['admin']), async (req, res) => {
  try {
    // In a real implementation, this would fetch flagged content from the database
    // For now, we'll return a mock response
    
    const reports = [
      {
        id: "report_1",
        type: "post",
        content_id: "post_123",
        reason: "Inappropriate content",
        reported_by: "user_456",
        created_at: new Date().toISOString()
      },
      {
        id: "report_2",
        type: "comment",
        content_id: "comment_789",
        reason: "Harassment",
        reported_by: "user_321",
        created_at: new Date().toISOString()
      }
    ];

    res.json({
      msg: 'Reports fetched successfully!',
      reports
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST /api/admin/verify-professional
// @desc    Verify a professional user
// @access  Private (Admins only)
router.post('/verify-professional', verifyToken, authorizeRole(['admin']), async (req, res) => {
  const { user_id } = req.body;

  try {
    // Update user role to verified professional
    const user = await prisma.user.update({
      where: { id: user_id },
      data: {
        role: 'professional'
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true
      }
    });

    res.json({
      msg: 'Professional verified successfully!',
      user
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET /api/admin/analytics
// @desc    Get platform analytics
// @access  Private (Admins only)
router.get('/analytics', verifyToken, authorizeRole(['admin']), async (req, res) => {
  try {
    // Get user statistics
    const totalUsers = await prisma.user.count();
    const usersByRole = await prisma.user.groupBy({
      by: ['role'],
      _count: {
        role: true
      }
    });
    
    // Get assessment statistics
    const totalAssessments = await prisma.assessment.count();
    const totalTestAttempts = await prisma.testAttempt.count();
    
    // Get career match statistics
    const totalCareerMatches = await prisma.careerMatch.count();
    
    // Get connection statistics
    const totalConnections = await prisma.connection.count({
      where: { status: 'accepted' }
    });
    
    // Get job statistics
    const totalJobs = await prisma.job.count();
    const totalApplications = await prisma.jobApplication.count();
    
    // Get community statistics
    const totalPosts = await prisma.post.count();
    const totalComments = await prisma.comment.count();
    const totalLikes = await prisma.like.count();

    const analytics = {
      users: {
        total: totalUsers,
        byRole: usersByRole
      },
      assessments: {
        total: totalAssessments,
        attempts: totalTestAttempts
      },
      careerMatches: {
        total: totalCareerMatches
      },
      connections: {
        total: totalConnections
      },
      jobs: {
        total: totalJobs,
        applications: totalApplications
      },
      community: {
        posts: totalPosts,
        comments: totalComments,
        likes: totalLikes
      }
    };

    res.json({
      msg: 'Analytics fetched successfully!',
      analytics
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
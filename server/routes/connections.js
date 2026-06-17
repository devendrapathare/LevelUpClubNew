const express = require('express');
const router = express.Router();
const { PrismaClient } = require('../generated/prisma');
const { verifyToken } = require('../middleware/auth');

const prisma = new PrismaClient();

// @route   POST /api/connections/request
// @desc    Send a connection request
// @access  Private
router.post('/request', verifyToken, async (req, res) => {
  const { receiver_id } = req.body;
  const requester_id = req.user.id;

  try {
    // Check if connection request already exists
    const existingConnection = await prisma.connection.findFirst({
      where: {
        OR: [
          {
            requester_id: requester_id,
            receiver_id: receiver_id
          },
          {
            requester_id: receiver_id,
            receiver_id: requester_id
          }
        ]
      }
    });

    if (existingConnection) {
      return res.status(400).json({ msg: 'Connection request already exists' });
    }

    // Create connection request
    const connection = await prisma.connection.create({
      data: {
        requester_id,
        receiver_id,
        status: 'pending'
      }
    });

    res.status(201).json({
      msg: 'Connection request sent successfully!',
      connection
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST /api/connections/:id/accept
// @desc    Accept a connection request
// @access  Private
router.post('/:id/accept', verifyToken, async (req, res) => {
  try {
    // Check if connection exists and user is the receiver
    const connection = await prisma.connection.findUnique({
      where: { id: req.params.id }
    });

    if (!connection) {
      return res.status(404).json({ msg: 'Connection request not found' });
    }

    if (connection.receiver_id !== req.user.id) {
      return res.status(403).json({ msg: 'Access denied. You can only accept your own connection requests.' });
    }

    // Update connection status to accepted
    const updatedConnection = await prisma.connection.update({
      where: { id: req.params.id },
      data: {
        status: 'accepted',
        accepted_at: new Date()
      }
    });

    res.json({
      msg: 'Connection request accepted!',
      connection: updatedConnection
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST /api/connections/:id/reject
// @desc    Reject a connection request
// @access  Private
router.post('/:id/reject', verifyToken, async (req, res) => {
  try {
    // Check if connection exists and user is the receiver
    const connection = await prisma.connection.findUnique({
      where: { id: req.params.id }
    });

    if (!connection) {
      return res.status(404).json({ msg: 'Connection request not found' });
    }

    if (connection.receiver_id !== req.user.id) {
      return res.status(403).json({ msg: 'Access denied. You can only reject your own connection requests.' });
    }

    // Update connection status to rejected
    const updatedConnection = await prisma.connection.update({
      where: { id: req.params.id },
      data: {
        status: 'rejected'
      }
    });

    res.json({
      msg: 'Connection request rejected.',
      connection: updatedConnection
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET /api/connections/:user_id
// @desc    List connections and pending requests for a user
// @access  Private
router.get('/:user_id', verifyToken, async (req, res) => {
  try {
    // Check if user is authorized to view these connections
    if (req.user.id !== req.params.user_id && req.user.role !== 'admin') {
      return res.status(403).json({ msg: 'Access denied. You can only view your own connections.' });
    }

    // Get sent connection requests (pending)
    const sentRequests = await prisma.connection.findMany({
      where: {
        requester_id: req.params.user_id,
        status: 'pending'
      },
      include: {
        receiver: {
          select: {
            id: true,
            name: true,
            headline: true,
            profile_picture_url: true
          }
        }
      }
    });

    // Get received connection requests (pending)
    const receivedRequests = await prisma.connection.findMany({
      where: {
        receiver_id: req.params.user_id,
        status: 'pending'
      },
      include: {
        requester: {
          select: {
            id: true,
            name: true,
            headline: true,
            profile_picture_url: true
          }
        }
      }
    });

    // Get accepted connections
    const connections = await prisma.connection.findMany({
      where: {
        OR: [
          { requester_id: req.params.user_id },
          { receiver_id: req.params.user_id }
        ],
        status: 'accepted'
      },
      include: {
        requester: {
          select: {
            id: true,
            name: true,
            headline: true,
            profile_picture_url: true
          }
        },
        receiver: {
          select: {
            id: true,
            name: true,
            headline: true,
            profile_picture_url: true
          }
        }
      }
    });

    // Enhance connections with career information
    const enhancedConnections = await Promise.all(connections.map(async (conn) => {
      // Get the other user in the connection
      const otherUser = conn.requester_id === req.params.user_id ? conn.receiver : conn.requester;
      
      // For students, get their career from CareerMatch
      if (otherUser && !otherUser.headline) {
        const careerMatch = await prisma.careerMatch.findFirst({
          where: { user_id: otherUser.id },
          orderBy: { generated_at: 'desc' }
        });
        
        if (careerMatch && careerMatch.matches && careerMatch.matches.length > 0) {
          return {
            ...otherUser,
            headline: careerMatch.matches[0].career_name
          };
        }
      }
      
      return otherUser;
    }));

    // Enhance pending requests with career information
    const enhancedSentRequests = await Promise.all(sentRequests.map(async (request) => {
      // For students, get their career from CareerMatch
      if (request.receiver && !request.receiver.headline) {
        const careerMatch = await prisma.careerMatch.findFirst({
          where: { user_id: request.receiver.id },
          orderBy: { generated_at: 'desc' }
        });
        
        if (careerMatch && careerMatch.matches && careerMatch.matches.length > 0) {
          return {
            ...request,
            receiver: {
              ...request.receiver,
              headline: careerMatch.matches[0].career_name
            }
          };
        }
      }
      
      return request;
    }));

    const enhancedReceivedRequests = await Promise.all(receivedRequests.map(async (request) => {
      // For students, get their career from CareerMatch
      if (request.requester && !request.requester.headline) {
        const careerMatch = await prisma.careerMatch.findFirst({
          where: { user_id: request.requester.id },
          orderBy: { generated_at: 'desc' }
        });
        
        if (careerMatch && careerMatch.matches && careerMatch.matches.length > 0) {
          return {
            ...request,
            requester: {
              ...request.requester,
              headline: careerMatch.matches[0].career_name
            }
          };
        }
      }
      
      return request;
    }));

    // Get user's career information for suggestions
    const userCareerMatch = await prisma.careerMatch.findFirst({
      where: {
        user_id: req.params.user_id
      },
      orderBy: {
        generated_at: 'desc'
      }
    });

    let suggestedConnections = [];
    if (userCareerMatch && userCareerMatch.matches && userCareerMatch.matches.length > 0) {
      // Get the primary career of the current user
      const userPrimaryCareer = userCareerMatch.matches[0].career_name;
      
      // Find other users with the same primary career (excluding current user and existing connections)
      const existingConnectionUserIds = connections
        .map(conn => conn.requester_id === req.params.user_id ? conn.receiver_id : conn.requester_id);
      
      // Get all career matches and filter in application code
      const allCareerMatches = await prisma.careerMatch.findMany({
        where: {
          user_id: {
            not: req.params.user_id
          },
          generated_at: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
          }
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              headline: true,
              profile_picture_url: true
            }
          }
        },
        orderBy: {
          generated_at: 'desc'
        }
      });

      // Filter users who have the same primary career and are not already connected
      const filteredSuggestions = allCareerMatches
        .filter(match => {
          // Check if user is not already connected
          if (existingConnectionUserIds.includes(match.user_id)) {
            return false;
          }
          
          // Check if any of the user's career matches aligns with the current user's primary career
          if (match.matches && Array.isArray(match.matches)) {
            return match.matches.some(career => 
              career.career_name === userPrimaryCareer
            );
          }
          return false;
        })
        .slice(0, 10); // Limit to 10 suggestions

      // Enhance suggested connections with career information
      suggestedConnections = await Promise.all(filteredSuggestions.map(async (match) => {
        // If user doesn't have a headline, use their primary career from CareerMatch
        let headline = match.user.headline;
        if (!headline && match.matches && match.matches.length > 0) {
          headline = match.matches[0].career_name;
        }
        
        return {
          id: match.user.id,
          name: match.user.name,
          headline: headline || 'LevelUp Member',
          profile_picture_url: match.user.profile_picture_url
        };
      }));
    }

    res.json({
      msg: 'Connections fetched successfully!',
      sentRequests: enhancedSentRequests,
      receivedRequests: enhancedReceivedRequests,
      connections: enhancedConnections,
      suggestedConnections
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
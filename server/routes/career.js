const express = require('express');
const router = express.Router();
const { PrismaClient } = require('../generated/prisma');
const { verifyToken } = require('../middleware/auth');
const geminiService = require('../services/ai/geminiService');

const prisma = new PrismaClient();

// @route   POST /api/career/recommend
// @desc    Generate career recommendations using Gemini AI
// @access  Private
router.post('/recommend', verifyToken, async (req, res) => {
  const userId = req.user.id;
  const { snapshot } = req.body;

  try {
    // Get user profile data if not provided in snapshot
    let userData = snapshot;
    if (!userData) {
      // Fetch user profile and assessment data
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          profile: true
        }
      });
      
      // Fetch recent assessment results
      const testAttempts = await prisma.testAttempt.findMany({
        where: { user_id: userId },
        include: {
          assessment: true
        },
        orderBy: { completed_at: 'desc' }
      });
      
      // Format user data for AI
      userData = {
        user_profile: {
          name: user.name,
          headline: user.headline,
          education: user.profile?.education || [],
          skills: user.profile?.skills || []
        },
        test_results: {}, // Format test results
        user_preferences: {}, // Get from user settings
        context: {} // Get from user location, etc.
      };
    }

    // Generate career recommendations using Gemini AI
    const recommendations = await geminiService.generateCareerRecommendations(userData);

    // Store the career recommendation in the database
    const careerMatch = await prisma.careerMatch.create({
      data: {
        user_id: userId,
        input_snapshot: userData,
        gemini_prompt: "Career recommendation prompt", // In a real implementation, store the actual prompt
        gemini_response_raw: recommendations,
        matches: recommendations.matches
      }
    });

    res.status(201).json({
      msg: 'Career recommendations generated successfully!',
      recommendation: careerMatch,
      matches: recommendations.matches
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET /api/career/:user_id
// @desc    Get latest career recommendations for a user
// @access  Private
router.get('/:user_id', verifyToken, async (req, res) => {
  try {
    // Check if user is authorized to view these recommendations
    if (req.user.id !== req.params.user_id && req.user.role !== 'admin') {
      return res.status(403).json({ msg: 'Access denied. You can only view your own career recommendations.' });
    }

    // Get the latest career match for the user
    const careerMatch = await prisma.careerMatch.findFirst({
      where: { user_id: req.params.user_id },
      orderBy: { generated_at: 'desc' }
    });

    if (!careerMatch) {
      return res.status(404).json({ msg: 'No career recommendations found for this user' });
    }

    res.json({
      msg: 'Career recommendations fetched successfully!',
      recommendation: careerMatch
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
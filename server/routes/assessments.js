const express = require('express');
const router = express.Router();
const { PrismaClient } = require('../generated/prisma');
const { verifyToken } = require('../middleware/auth');
const geminiService = require('../services/ai/geminiService');

const prisma = new PrismaClient();

// @route   GET /api/assessments/riasec/questions
// @desc    Get RIASEC assessment questions
// @access  Public
router.get('/riasec/questions', async (req, res) => {
  try {
    // Generate RIASEC questions using Gemini AI
    const assessment = await geminiService.generateRIASECQuestions();
    
    res.json({
      msg: 'RIASEC assessment questions fetched successfully!',
      questions: assessment.questions
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

// @route   POST /api/assessments/riasec/submit
// @desc    Submit RIASEC assessment answers and get career recommendations
// @access  Private
router.post('/riasec/submit', verifyToken, async (req, res) => {
  try {
    const { answers } = req.body;
    const userId = req.user.id;

    // Calculate RIASEC scores based on answers with improved accuracy
    const riasecScores = calculateRIASECScores(answers);
    
    // Get user profile data
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: true
      }
    });

    // Get user's task history for behavioral data
    const taskAssignments = await prisma.taskAssignment.findMany({
      where: { 
        user_id: userId,
        status: 'completed'
      },
      include: {
        task: true
      }
    });

    // Get user's goals for goal alignment data
    const goals = await prisma.goal.findMany({
      where: { user_id: userId }
    });

    // Get user's XP and level for engagement metrics
    const { xp, level } = user;

    // Format user data for AI with enhanced data fusion
    const userData = {
      user_profile: {
        name: user.name,
        headline: user.headline,
        education: user.profile?.education || [],
        experience: user.profile?.experience || [],
        skills: user.profile?.skills || []
      },
      test_results: {
        riasec: riasecScores
      },
      user_preferences: {}, // Get from user settings
      context: {}, // Get from user location, etc.
      behavioral_data: {
        completed_tasks: taskAssignments.length,
        xp: xp,
        level: level,
        task_history: taskAssignments.map(ta => ({
          task_title: ta.task.title,
          xp_earned: ta.xp_earned,
          completed_at: ta.submitted_at
        }))
      },
      goal_data: {
        goals: goals.map(g => ({
          type: g.type,
          title: g.title,
          progress: g.completed / g.target
        }))
      }
    };

    // Generate career recommendations using Gemini AI with enhanced prompt
    const recommendations = await geminiService.generateCareerRecommendations(userData);

    // Store the career recommendation in the database
    const careerMatch = await prisma.careerMatch.create({
      data: {
        user_id: userId,
        input_snapshot: userData,
        gemini_prompt: "Enhanced career recommendation prompt with data fusion",
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
    res.status(500).json({ msg: 'Server error' });
  }
});

// @route   POST /api/assessments/riasec/select-career
// @desc    Select a career from the recommendations
// @access  Private
router.post('/riasec/select-career', verifyToken, async (req, res) => {
  try {
    const { careerId } = req.body;
    const userId = req.user.id;

    // Get the latest career match for the user
    const careerMatch = await prisma.careerMatch.findFirst({
      where: { user_id: userId },
      orderBy: { generated_at: 'desc' }
    });

    if (!careerMatch) {
      return res.status(404).json({ msg: 'No career recommendations found for this user' });
    }

    // Parse the matches JSON if it's a string
    let matches = careerMatch.matches;
    if (typeof matches === 'string') {
      matches = JSON.parse(matches);
    }

    // Find the selected career in the matches
    const selectedCareer = matches.find(match => match.career_id === careerId);
    
    if (!selectedCareer) {
      return res.status(404).json({ msg: 'Selected career not found in recommendations' });
    }

    // Check if user already has a selected career
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    const previousCareer = user.selected_career;

    // Store the selected career in the user's record using raw SQL
    // This bypasses Prisma schema issues
    await prisma.$executeRaw`
      UPDATE "User" 
      SET selected_career = ${selectedCareer.career_name} 
      WHERE id = ${userId}
    `;

    // If user is selecting a new career (different from previous), reset their data
    if (previousCareer && previousCareer !== selectedCareer.career_name) {
      // Reset user's XP to 0
      await prisma.user.update({
        where: { id: userId },
        data: {
          xp: 0,
          level: 1
        }
      });

      // Archive all existing task assignments
      await prisma.taskAssignment.updateMany({
        where: {
          user_id: userId,
          status: {
            not: "archived"
          }
        },
        data: {
          status: "archived"
        }
      });

      // Delete all existing goals
      await prisma.goal.deleteMany({
        where: {
          user_id: userId
        }
      });

      // Generate new tasks and goals for the new career
      // This will happen automatically when the user requests their tasks/goals
    }

    res.json({
      msg: 'Career selected successfully!',
      selectedCareer: selectedCareer,
      careerChanged: previousCareer && previousCareer !== selectedCareer.career_name
    });
  } catch (err) {
    console.error('Error in select-career route:', err.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Helper function to calculate RIASEC scores with improved accuracy
function calculateRIASECScores(answers) {
  // Initialize scores for each category
  const scores = {
    R: 0, // Realistic
    I: 0, // Investigative
    A: 0, // Artistic
    S: 0, // Social
    E: 0, // Enterprising
    C: 0  // Conventional
  };

  // Define question mappings for each RIASEC type
  // Realistic (R) questions
  const realisticQuestions = [
    'q1', 'q7', 'q13', 'q19', 'q25', 'q31'
  ];
  
  // Investigative (I) questions
  const investigativeQuestions = [
    'q2', 'q8', 'q14', 'q20', 'q26', 'q32'
  ];
  
  // Artistic (A) questions
  const artisticQuestions = [
    'q3', 'q9', 'q15', 'q21', 'q27', 'q33'
  ];
  
  // Social (S) questions
  const socialQuestions = [
    'q4', 'q10', 'q16', 'q22', 'q28', 'q34'
  ];
  
  // Enterprising (E) questions
  const enterprisingQuestions = [
    'q5', 'q11', 'q17', 'q23', 'q29', 'q35'
  ];
  
  // Conventional (C) questions
  const conventionalQuestions = [
    'q6', 'q12', 'q18', 'q24', 'q30', 'q36'
  ];

  // Process each answer
  for (const [questionId, answerValue] of Object.entries(answers)) {
    const value = parseInt(answerValue) || 0;
    
    // Add to appropriate category based on question ID
    if (realisticQuestions.includes(questionId)) {
      scores.R += value;
    } else if (investigativeQuestions.includes(questionId)) {
      scores.I += value;
    } else if (artisticQuestions.includes(questionId)) {
      scores.A += value;
    } else if (socialQuestions.includes(questionId)) {
      scores.S += value;
    } else if (enterprisingQuestions.includes(questionId)) {
      scores.E += value;
    } else if (conventionalQuestions.includes(questionId)) {
      scores.C += value;
    }
  }

  // Normalize scores to 0-100 range
  // Each question has a max value of 2, and there are 6 questions per category
  const maxScorePerCategory = 12; // 6 questions * 2 max points each
  
  scores.R = Math.round((scores.R / maxScorePerCategory) * 100);
  scores.I = Math.round((scores.I / maxScorePerCategory) * 100);
  scores.A = Math.round((scores.A / maxScorePerCategory) * 100);
  scores.S = Math.round((scores.S / maxScorePerCategory) * 100);
  scores.E = Math.round((scores.E / maxScorePerCategory) * 100);
  scores.C = Math.round((scores.C / maxScorePerCategory) * 100);

  return scores;
}

module.exports = router;
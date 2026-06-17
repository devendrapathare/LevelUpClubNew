const express = require('express');
const router = express.Router();
const { PrismaClient } = require('../generated/prisma');
const { verifyToken } = require('../middleware/auth');
const geminiService = require('../services/ai/geminiService');

const prisma = new PrismaClient();

// @route   GET /api/goals/:user_id
// @desc    Get personalized goals for a user based on their career path
// @access  Private
router.get('/:user_id', verifyToken, async (req, res) => {
  try {
    // Check if user is authorized to view these goals
    // The JWT payload structure has the user object nested under 'user'
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ msg: 'User not authenticated' });
    }
    
    if (userId !== req.params.user_id && req.user.role !== 'admin') {
      return res.status(403).json({ msg: 'Access denied. You can only view your own goals.' });
    }

    // Validate that the user exists
    const user = await prisma.user.findUnique({
      where: { id: req.params.user_id }
    });
    
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    // Check if user already has goals that are still valid
    const now = new Date();
    const oneMonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
    const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());

    // Get existing goals
    const existingGoals = await prisma.goal.findMany({
      where: { 
        user_id: req.params.user_id 
      },
      orderBy: { 
        created_at: 'desc' 
      }
    });

    // Check if we have recent goals
    let monthlyGoals = existingGoals.filter(goal => goal.type === 'monthly');
    let yearlyGoals = existingGoals.filter(goal => goal.type === 'yearly');

    // Check if we need to generate new goals
    const shouldGenerateMonthly = monthlyGoals.length === 0 || 
      monthlyGoals.some(goal => new Date(goal.created_at) < oneMonthAgo);
    
    const shouldGenerateYearly = yearlyGoals.length === 0 || 
      yearlyGoals.some(goal => new Date(goal.created_at) < oneYearAgo);

    // If we don't need to generate new goals, return existing ones
    if (!shouldGenerateMonthly && !shouldGenerateYearly) {
      return res.json({
        msg: 'Goals fetched successfully!',
        goals: {
          monthly: monthlyGoals.map(goal => ({
            id: goal.id,
            title: goal.title,
            description: goal.description,
            target: goal.target,
            completed: goal.completed,
            progress: goal.target > 0 ? Math.round((goal.completed / goal.target) * 100) : 0
          })),
          yearly: yearlyGoals.map(goal => ({
            id: goal.id,
            title: goal.title,
            description: goal.description,
            target: goal.target,
            completed: goal.completed,
            progress: goal.target > 0 ? Math.round((goal.completed / goal.target) * 100) : 0
          }))
        }
      });
    }

    // Get user's selected career
    let selectedCareerName = user.selected_career;
    let careerDetails = null;
    
    // If no selected career, try to get it from career matches
    if (!selectedCareerName) {
      const careerMatch = await prisma.careerMatch.findFirst({
        where: { user_id: req.params.user_id },
        orderBy: { generated_at: 'desc' }
      });
      
      if (careerMatch && careerMatch.matches && careerMatch.matches.length > 0) {
        // Parse matches if it's a string
        let matches = careerMatch.matches;
        if (typeof matches === 'string') {
          matches = JSON.parse(matches);
        }
        selectedCareerName = matches[0].career_name;
        // Get full career details including skills
        careerDetails = matches[0];
      }
    } else {
      // User has a selected career, get details from latest career match
      const careerMatch = await prisma.careerMatch.findFirst({
        where: { user_id: req.params.user_id },
        orderBy: { generated_at: 'desc' }
      });
      
      if (careerMatch && careerMatch.matches) {
        let matches = careerMatch.matches;
        if (typeof matches === 'string') {
          matches = JSON.parse(matches);
        }
        // Find the selected career in matches
        careerDetails = matches.find(m => m.career_name === selectedCareerName);
      }
    }
    
    // If still no career, return empty goals
    if (!selectedCareerName) {
      return res.json({
        msg: 'Goals fetched successfully!',
        goals: {
          monthly: [],
          yearly: []
        }
      });
    }

    // Get user's RIASEC scores from their latest assessment
    let riasecScores = {};
    const latestCareerMatch = await prisma.careerMatch.findFirst({
      where: { user_id: req.params.user_id },
      orderBy: { generated_at: 'desc' }
    });
    
    if (latestCareerMatch && latestCareerMatch.input_snapshot) {
      let snapshot = latestCareerMatch.input_snapshot;
      if (typeof snapshot === 'string') {
        snapshot = JSON.parse(snapshot);
      }
      riasecScores = snapshot.test_results?.riasec || {};
    }

    // Get user's completed tasks count
    const completedTasksCount = await prisma.taskAssignment.count({
      where: {
        user_id: req.params.user_id,
        status: 'completed'
      }
    });

    // Create comprehensive career object for the AI service
    const careerData = {
      career_name: selectedCareerName,
      required_skills: careerDetails?.required_skills || [],
      description: careerDetails?.description || `Professional career path in ${selectedCareerName}`,
      learning_path: careerDetails?.learning_path || []
    };

    // Generate monthly and yearly goals using AI
    const goalData = {
      career: careerData,
      user: {
        id: req.params.user_id,
        name: user.name,
        level: user.level,
        xp: user.xp,
        completedTasks: completedTasksCount
      },
      riasecScores: riasecScores
    };

    // Generate personalized goals using the AI service
    const generatedGoals = await geminiService.generatePersonalizedGoals(goalData);

    // Delete existing goals if we're regenerating
    if (shouldGenerateMonthly || shouldGenerateYearly) {
      await prisma.goal.deleteMany({
        where: { 
          user_id: req.params.user_id 
        }
      });
    }

    // Store new goals in database
    const monthlyGoalsToCreate = generatedGoals.monthly.map(goal => ({
      user_id: req.params.user_id,
      type: 'monthly',
      title: goal.title,
      description: goal.description,
      target: goal.target,
      completed: goal.completed || 0
    }));

    const yearlyGoalsToCreate = generatedGoals.yearly.map(goal => ({
      user_id: req.params.user_id,
      type: 'yearly',
      title: goal.title,
      description: goal.description,
      target: goal.target,
      completed: goal.completed || 0
    }));

    // Create all goals in database
    const allGoalsToCreate = [...monthlyGoalsToCreate, ...yearlyGoalsToCreate];
    const createdGoals = await prisma.goal.createMany({
      data: allGoalsToCreate
    });

    // Fetch the created goals to return them with IDs
    const newGoals = await prisma.goal.findMany({
      where: { 
        user_id: req.params.user_id 
      },
      orderBy: { 
        created_at: 'desc' 
      }
    });

    monthlyGoals = newGoals.filter(goal => goal.type === 'monthly');
    yearlyGoals = newGoals.filter(goal => goal.type === 'yearly');

    res.json({
      msg: 'Goals fetched successfully!',
      goals: {
        monthly: monthlyGoals.map(goal => ({
          id: goal.id,
          title: goal.title,
          description: goal.description,
          target: goal.target,
          completed: goal.completed,
          progress: goal.target > 0 ? Math.round((goal.completed / goal.target) * 100) : 0
        })),
        yearly: yearlyGoals.map(goal => ({
          id: goal.id,
          title: goal.title,
          description: goal.description,
          target: goal.target,
          completed: goal.completed,
          progress: goal.target > 0 ? Math.round((goal.completed / goal.target) * 100) : 0
        }))
      }
    });
  } catch (err) {
    console.error('Error in goals route:', err.message);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
});

// @route   POST /api/goals/:user_id/update
// @desc    Update goal progress
// @access  Private
router.post('/:user_id/update', verifyToken, async (req, res) => {
  try {
    // Check if user is authorized to update these goals
    if (req.user.id !== req.params.user_id && req.user.role !== 'admin') {
      return res.status(403).json({ msg: 'Access denied. You can only update your own goals.' });
    }

    const { goalId, goalType, progress } = req.body;

    // Update the goal in the database
    const updatedGoal = await prisma.goal.update({
      where: { id: goalId },
      data: { completed: progress }
    });

    res.json({
      msg: 'Goal progress updated successfully!',
      goal: updatedGoal
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
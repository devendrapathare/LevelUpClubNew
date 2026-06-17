const express = require('express');
const router = express.Router();
const { PrismaClient } = require('../generated/prisma');
const { verifyToken } = require('../middleware/auth');
const geminiService = require('../services/ai/geminiService');

const prisma = new PrismaClient();

// @route   POST /api/tasks
// @desc    Create a new task (admin only)
// @access  Private (Admin)
router.post('/', verifyToken, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ msg: 'Access denied. Admins only.' });
    }

    const { title, description, xp_reward } = req.body;

    // Validate input
    if (!title || !description || !xp_reward) {
      return res.status(400).json({ msg: 'Title, description, and XP reward are required' });
    }

    // Create the task
    const task = await prisma.task.create({
      data: {
        title,
        description,
        xp_reward: parseInt(xp_reward)
      }
    });

    res.status(201).json({
      msg: 'Task created successfully!',
      task
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET /api/tasks/user/:user_id
// @desc    Get tasks assigned to a user
// @access  Private
router.get('/user/:user_id', verifyToken, async (req, res) => {
  try {
    // Check if user is authorized to view these tasks
    // The JWT payload structure has the user object nested under 'user'
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ msg: 'User not authenticated' });
    }
    
    if (userId !== req.params.user_id && req.user.role !== 'admin') {
      return res.status(403).json({ msg: 'Access denied. You can only view your own tasks.' });
    }

    // Validate that the user exists
    const user = await prisma.user.findUnique({
      where: { id: req.params.user_id }
    });
    
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    // Get task assignments for the user
    const taskAssignments = await prisma.taskAssignment.findMany({
      where: { 
        user_id: req.params.user_id,
        status: {
          not: "archived"
        }
      },
      include: {
        task: true
      },
      orderBy: { created_at: 'asc' }
    });

    // Format the response
    const tasks = taskAssignments.map(assignment => ({
      id: assignment.id,
      task_id: assignment.task_id,
      title: assignment.task.title,
      description: assignment.task.description,
      xp: assignment.task.xp_reward,
      status: assignment.status,
      file_url: assignment.file_url,
      submitted_at: assignment.submitted_at,
      verified_at: assignment.verified_at,
      xp_earned: assignment.xp_earned,
      created_at: assignment.created_at
    }));

    res.json({
      msg: 'Tasks fetched successfully!',
      tasks
    });
  } catch (err) {
    console.error('Error in tasks route:', err.message);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
});

// @route   POST /api/tasks/generate/:user_id
// @desc    Generate new AI-based tasks for a user based on their career roadmap, level, XP, and previous task history
// @access  Private
router.post('/generate/:user_id', verifyToken, async (req, res) => {
  try {
    // Check if user is authorized to generate tasks for this user
    if (req.user.id !== req.params.user_id && req.user.role !== 'admin') {
      return res.status(403).json({ msg: 'Access denied. You can only generate tasks for yourself.' });
    }

    const userId = req.params.user_id;

    // Get user information including level and XP
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    // Get the latest career match for the user
    const careerMatch = await prisma.careerMatch.findFirst({
      where: { user_id: userId },
      orderBy: { generated_at: 'desc' }
    });

    if (!careerMatch || !careerMatch.matches || careerMatch.matches.length === 0) {
      return res.status(404).json({ msg: 'No career information found for this user' });
    }

    // Get user's selected career from their profile
    const userData = await prisma.user.findUnique({
      where: { id: userId }
    });

    // Parse the matches to find the user's selected career
    let matches = careerMatch.matches;
    if (typeof matches === 'string') {
      matches = JSON.parse(matches);
    }

    // Find the selected career, or fallback to the first match
    let careerData;
    if (userData.selected_career) {
      careerData = matches.find(m => m.career_name === userData.selected_career);
    }
    
    // Fallback to first career if selected career not found
    if (!careerData) {
      careerData = matches[0];
      console.log(`Warning: Selected career "${userData.selected_career}" not found in matches, using "${careerData.career_name}"`);
    }

    console.log(`Generating tasks for career: ${careerData.career_name} (User's selected career: ${userData.selected_career || 'Not set'})`);

    // Get user's task history to understand previous tasks
    const taskHistory = await prisma.taskAssignment.findMany({
      where: { 
        user_id: userId,
        status: 'completed'
      },
      include: {
        task: true
      },
      orderBy: { 
        submitted_at: 'desc' 
      },
      take: 10 // Get last 10 completed tasks
    });

    // Get current pending tasks
    const currentTasks = await prisma.taskAssignment.findMany({
      where: { 
        user_id: userId,
        status: 'pending'
      },
      include: {
        task: true
      }
    });

    // Generate new tasks based on the career roadmap, user level, XP, and task history using AI (Gemini Flash 2.0)
    const taskData = {
      career: careerData,
      user: {
        id: user.id,
        name: user.name,
        level: user.level,
        xp: user.xp
      },
      taskHistory: taskHistory.map(assignment => ({
        title: assignment.task.title,
        description: assignment.task.description,
        xp_reward: assignment.task.xp_reward,
        completed_at: assignment.submitted_at
      })),
      currentTasks: currentTasks.map(assignment => ({
        title: assignment.task.title,
        description: assignment.task.description,
        xp_reward: assignment.task.xp_reward
      }))
    };

    const aiGeneratedTasks = await geminiService.generateDailyTasks(taskData);
    console.log(`AI generated ${aiGeneratedTasks.tasks.length} new tasks`);

    // Archive all current non-archived tasks
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

    // Create new task assignments for the user
    let createdTasks = 0;
    for (const task of aiGeneratedTasks.tasks) {
      try {
        // First, create the task in the database
        const newTask = await prisma.task.create({
          data: {
            title: task.description,
            description: task.description,
            xp_reward: task.xp_reward
          }
        });

        // Then create the assignment
        await prisma.taskAssignment.create({
          data: {
            task_id: newTask.id,
            user_id: userId,
            status: 'pending'
          }
        });

        createdTasks++;
      } catch (error) {
        console.error(`Error creating task: ${error.message}`);
      }
    }

    console.log(`Generated ${createdTasks} new tasks for user ${userId}`);

    res.json({
      success: true,
      msg: `Successfully generated ${createdTasks} new tasks based on your career roadmap!`,
      tasksGenerated: createdTasks
    });
  } catch (err) {
    console.error('Error generating new tasks:', err.message);
    res.status(500).json({ 
      success: false,
      msg: 'Failed to generate new tasks. Please try again.',
      error: err.message 
    });
  }
});

// Helper function to check if all tasks are completed and generate new ones
async function checkAndGenerateNewTasks(userId) {
  try {
    // Get all task assignments for the user that are not archived
    const taskAssignments = await prisma.taskAssignment.findMany({
      where: { 
        user_id: userId,
        status: {
          not: "archived"
        }
      }
    });

    // Check if all tasks are completed
    const allCompleted = taskAssignments.length > 0 && taskAssignments.every(assignment => assignment.status === 'completed');
    
    console.log(`User ${userId} has ${taskAssignments.length} non-archived tasks. All completed: ${allCompleted}`);
    
    if (allCompleted) {
      // Get user information including level and XP
      const user = await prisma.user.findUnique({
        where: { id: userId }
      });

      if (!user) {
        console.log(`User ${userId} not found`);
        return { allCompleted: true, newTasksGenerated: false };
      }

      // Get the latest career match for the user
      const careerMatch = await prisma.careerMatch.findFirst({
        where: { user_id: userId },
        orderBy: { generated_at: 'desc' }
      });

      if (!careerMatch || !careerMatch.matches || careerMatch.matches.length === 0) {
        console.log(`No career information found for user ${userId}`);
        return { allCompleted: true, newTasksGenerated: false };
      }

      // Get user's selected career from their profile
      const userData = await prisma.user.findUnique({
        where: { id: userId }
      });

      // Parse the matches to find the user's selected career
      let matches = careerMatch.matches;
      if (typeof matches === 'string') {
        matches = JSON.parse(matches);
      }

      // Find the selected career, or fallback to the first match
      let careerData;
      if (userData.selected_career) {
        careerData = matches.find(m => m.career_name === userData.selected_career);
      }
      
      // Fallback to first career if selected career not found
      if (!careerData) {
        careerData = matches[0];
        console.log(`Warning: Selected career "${userData.selected_career}" not found in matches, using "${careerData.career_name}"`);
      }

      console.log(`Generating tasks for career: ${careerData.career_name} (User's selected: ${userData.selected_career || 'Not set'})`);
      
      // Get user's task history to understand previous tasks
      const taskHistory = await prisma.taskAssignment.findMany({
        where: { 
          user_id: userId,
          status: 'completed'
        },
        include: {
          task: true
        },
        orderBy: { 
          submitted_at: 'desc' 
        },
        take: 10 // Get last 10 completed tasks
      });

      // Get current pending tasks
      const currentTasks = await prisma.taskAssignment.findMany({
        where: { 
          user_id: userId,
          status: 'pending'
        },
        include: {
          task: true
        }
      });
      
      // Generate new tasks based on the career roadmap, user level, XP, and task history using AI
      const taskData = {
        career: careerData,
        user: {
          id: user.id,
          name: user.name,
          level: user.level,
          xp: user.xp
        },
        taskHistory: taskHistory.map(assignment => ({
          title: assignment.task.title,
          description: assignment.task.description,
          xp_reward: assignment.task.xp_reward,
          completed_at: assignment.submitted_at
        })),
        currentTasks: currentTasks.map(assignment => ({
          title: assignment.task.title,
          description: assignment.task.description,
          xp_reward: assignment.task.xp_reward
        }))
      };
      
      const aiGeneratedTasks = await geminiService.generateDailyTasks(taskData);
      console.log(`AI generated ${aiGeneratedTasks.tasks.length} new tasks`);
      
      // Create new task assignments for the user
      let createdTasks = 0;
      for (const task of aiGeneratedTasks.tasks) {
        try {
          // First, create the task in the database
          const newTask = await prisma.task.create({
            data: {
              title: task.description,
              description: task.description,
              xp_reward: task.xp_reward
            }
          });
          
          // Then create the assignment
          await prisma.taskAssignment.create({
            data: {
              task_id: newTask.id,
              user_id: userId,
              status: 'pending'
            }
          });
          
          createdTasks++;
        } catch (error) {
          console.error(`Error creating task: ${error.message}`);
        }
      }
      
      console.log(`Generated ${createdTasks} new tasks for user ${userId}`);
      return { allCompleted: true, newTasksGenerated: createdTasks > 0 };
    }
    
    return { allCompleted: false, newTasksGenerated: false };
  } catch (error) {
    console.error('Error checking and generating new tasks:', error);
    return { allCompleted: false, newTasksGenerated: false, error: error.message };
  }
}

// @route   POST /api/tasks/:task_id/submit
// @desc    Submit a task with file upload and update XP
// @access  Private
router.post('/:task_id/submit', verifyToken, async (req, res) => {
  try {
    const { file_url } = req.body;

    // Validate input
    if (!file_url) {
      return res.status(400).json({ msg: 'File URL is required' });
    }

    // Check if task assignment exists
    const taskAssignment = await prisma.taskAssignment.findUnique({
      where: { 
        task_id_user_id: {
          task_id: req.params.task_id,
          user_id: req.user.id
        }
      },
      include: {
        task: true
      }
    });

    if (!taskAssignment) {
      return res.status(404).json({ msg: 'Task assignment not found' });
    }

    // Update task assignment
    const updatedAssignment = await prisma.taskAssignment.update({
      where: { 
        task_id_user_id: {
          task_id: req.params.task_id,
          user_id: req.user.id
        }
      },
      data: {
        status: 'completed',
        file_url: file_url,
        submitted_at: new Date(),
        xp_earned: taskAssignment.task.xp_reward
      }
    });

    // Update user's XP
    const user = await prisma.user.findUnique({
      where: { id: req.user.id }
    });

    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    // Calculate new XP and level
    const currentXP = user.xp;
    const currentLevel = user.level;
    const newXP = currentXP + taskAssignment.task.xp_reward;
    
    // Calculate XP needed for next level (simple formula: 100 * level)
    const xpForNextLevel = 100 * currentLevel;
    let newLevel = currentLevel;
    let leveledUp = false;
    
    // Check if user should level up
    if (newXP >= xpForNextLevel) {
      newLevel = currentLevel + 1;
      leveledUp = true;
    }

    // Update user XP and level
    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        xp: newXP,
        level: newLevel
      }
    });

    // Check if all tasks are completed and generate new ones if needed
    const taskCheckResult = await checkAndGenerateNewTasks(req.user.id);
    console.log('Task check result:', taskCheckResult);

    res.json({
      msg: leveledUp ? 'Task submitted successfully! Level up! Congratulations!' : 'Task submitted successfully!',
      xpEarned: taskAssignment.task.xp_reward,
      leveledUp: leveledUp,
      allTasksCompleted: taskCheckResult.allCompleted,
      newTasksGenerated: taskCheckResult.newTasksGenerated,
      assignment: updatedAssignment,
      user: {
        xp: updatedUser.xp,
        level: updatedUser.level
      }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET /api/tasks/:task_id
// @desc    Get a specific task
// @access  Private
router.get('/:task_id', verifyToken, async (req, res) => {
  try {
    // Get the task
    const task = await prisma.task.findUnique({
      where: { id: req.params.task_id }
    });

    if (!task) {
      return res.status(404).json({ msg: 'Task not found' });
    }

    res.json({
      msg: 'Task fetched successfully!',
      task
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET /api/tasks/history/:user_id
// @desc    Get completed task history for a user
// @access  Private
router.get('/history/:user_id', verifyToken, async (req, res) => {
  try {
    // Check if user is authorized to view this history
    if (req.user.id !== req.params.user_id && req.user.role !== 'admin') {
      return res.status(403).json({ msg: 'Access denied. You can only view your own task history.' });
    }

    // Get completed task assignments for the user with task details
    const taskAssignments = await prisma.taskAssignment.findMany({
      where: { 
        user_id: req.params.user_id,
        status: 'completed'
      },
      include: {
        task: true
      },
      orderBy: { 
        submitted_at: 'desc' 
      }
    });

    // Format the response
    const taskHistory = taskAssignments.map(assignment => ({
      id: assignment.id,
      task_id: assignment.task_id,
      title: assignment.task.title,
      description: assignment.task.description,
      xp_reward: assignment.task.xp_reward,
      xp_earned: assignment.xp_earned,
      file_url: assignment.file_url,
      submitted_at: assignment.submitted_at,
      created_at: assignment.created_at
    }));

    res.json({
      msg: 'Task history fetched successfully!',
      taskHistory
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
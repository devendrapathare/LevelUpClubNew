const express = require('express');
const router = express.Router();
const { PrismaClient } = require('../generated/prisma');
const { verifyToken } = require('../middleware/auth');

const prisma = new PrismaClient();

// Test route - This needs to be defined BEFORE the /:id route
router.get('/test', (req, res) => {
  res.json({ msg: 'Test route working' });
});

// @route   GET /api/users
// @desc    Search/filter users
// @access  Public
router.get('/', async (req, res) => {
  const { skills, location, role, career_interest, name } = req.query;
  
  try {
    // Build where clause based on filters
    const where = {};
    
    if (role) {
      where.role = role;
    }
    
    if (location) {
      where.location = {
        contains: location,
        mode: 'insensitive'
      };
    }
    
    // Add name search functionality
    if (name) {
      where.name = {
        contains: name,
        mode: 'insensitive'
      };
    }
    
    // For skills and career_interest, we would need to search in the profile JSON
    // This is a simplified implementation
    
    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        headline: true,
        bio: true,
        location: true,
        profile_picture_url: true,
        xp: true,
        level: true,
        created_at: true
      }
    });

    res.json({
      msg: 'Users fetched successfully!',
      users
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET /api/users/leaderboard
// @desc    Get leaderboard data filtered by user's career
// @access  Private
router.get('/leaderboard', verifyToken, async (req, res) => {
  console.log('Leaderboard route handler called');
  
  try {
    console.log('Leaderboard route called');
    
    // Get user ID from the verified token (set by verifyToken middleware)
    // The JWT payload structure has the user object nested under 'user'
    const userId = req.user?.id;
    console.log('Leaderboard request for user ID:', userId);
    
    if (!userId) {
      console.log('No user ID found in request');
      return res.status(400).json({ msg: 'User ID is required' });
    }
    
    console.log('User ID from token:', userId);
    
    // Validate that the user exists
    console.log('Checking if user exists in database');
    const currentUser = await prisma.user.findUnique({
      where: { id: userId }
    });
    
    console.log('User lookup result:', currentUser);
    
    if (!currentUser) {
      console.log('User not found in database with ID:', userId);
      return res.status(404).json({ msg: 'User not found' });
    }
    
    console.log('Current user found:', currentUser.id, currentUser.name);
    
    // Get the latest career match for the current user
    const currentUserCareerMatch = await prisma.careerMatch.findFirst({
      where: { user_id: userId },
      orderBy: { generated_at: 'desc' }
    });
    
    console.log('Career match for user:', currentUserCareerMatch);

    // If no career match found, return empty leaderboard instead of error
    if (!currentUserCareerMatch || !currentUserCareerMatch.matches || currentUserCareerMatch.matches.length === 0) {
      console.log('No career information found for current user, returning empty leaderboard');
      return res.json({
        msg: 'Leaderboard fetched successfully!',
        leaderboard: []
      });
    }

    // Get the primary career of the current user
    const currentUserPrimaryCareer = currentUserCareerMatch.matches[0].career_name;
    console.log('Current user primary career:', currentUserPrimaryCareer);
    console.log('Current user ID:', userId);

    // Since Prisma doesn't support deep JSON querying easily, we'll fetch all career matches
    // and filter in application code
    const allCareerMatches = await prisma.careerMatch.findMany({
      where: {
        generated_at: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
        }
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            xp: true,
            level: true, // Include level information
            profile_picture_url: true
          }
        }
      },
      orderBy: {
        generated_at: 'desc'
      }
    });
    
    console.log('Total career matches found:', allCareerMatches.length);

    // Filter users who have the same primary career and collect unique users
    const userXpMap = new Map();
    
    allCareerMatches.forEach(match => {
      const user = match.user;
      if (user && match.matches && match.matches.length > 0) {
        // Check if any of the user's career matches aligns with the current user's primary career
        const hasMatchingCareer = match.matches.some(career => 
          career.career_name === currentUserPrimaryCareer
        );
        
        if (hasMatchingCareer) {
          // Keep track of the highest XP for each user
          if (!userXpMap.has(user.id) || userXpMap.get(user.id).xp < user.xp) {
            userXpMap.set(user.id, {
              id: user.id,
              name: user.name,
              xp: user.xp,
              level: user.level, // Include level information
              profile_picture_url: user.profile_picture_url
            });
          }
        }
      }
    });
    
    console.log('Users in leaderboard before sorting:', userXpMap.size);

    // Convert to array and sort by level (descending) then by XP (descending)
    let leaderboard = Array.from(userXpMap.values())
      .sort((a, b) => {
        // First sort by level (higher level first)
        if (b.level !== a.level) {
          return b.level - a.level;
        }
        // If levels are equal, sort by XP (higher XP first)
        return b.xp - a.xp;
      })
      .slice(0, 10); // Top 10 users

    // Mark the current user as "You" in the leaderboard
    console.log('Marking current user in leaderboard. Current user ID:', userId);
    leaderboard = leaderboard.map(user => {
      console.log(`Comparing user ID: ${user.id} (${typeof user.id}) with current user ID: ${userId} (${typeof userId})`);
      // Ensure both IDs are strings for comparison
      if (String(user.id) === String(userId)) {
        console.log('Match found, marking as current user');
        return {
          ...user,
          isCurrentUser: true
        };
      }
      return user;
    });

    console.log('Leaderboard data:', leaderboard);
    console.log('Current user ID:', userId);

    res.json({
      msg: 'Leaderboard fetched successfully!',
      leaderboard: leaderboard
    });
  } catch (err) {
    console.error('Error in leaderboard route:', err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET /api/users/:id
// @desc    Get user profile by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        headline: true,
        bio: true,
        location: true,
        profile_picture_url: true,
        xp: true,
        level: true,
        created_at: true,
        profile: true
      }
    });

    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    res.json({ user });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT /api/users/:id
// @desc    Update user profile
// @access  Private
router.put('/:id', verifyToken, async (req, res) => {
  // Check if user is authorized to update this profile
  if (req.user.id !== req.params.id) {
    return res.status(403).json({ msg: 'Access denied. You can only update your own profile.' });
  }

  const { name, headline, bio, location, profile_picture_url, skills, experience, education } = req.body;
  
  console.log('Profile update request body:', req.body);

  try {
    // Update user basic info
    const userData = {};
    if (name) userData.name = name;
    if (headline) userData.headline = headline;
    if (bio) userData.bio = bio;
    if (location) userData.location = location;
    if (profile_picture_url) userData.profile_picture_url = profile_picture_url;

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: userData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        headline: true,
        bio: true,
        location: true,
        profile_picture_url: true,
        xp: true,
        level: true,
        updated_at: true
      }
    });

    console.log('Updated user data:', updatedUser);

    // Update extended profile if provided
    if (skills || experience || education) {
      console.log('Updating extended profile data:', { skills, experience, education });
      
      // Check if profile exists
      const existingProfile = await prisma.profile.findUnique({
        where: { user_id: req.user.id }
      });

      const profileData = {};
      if (skills) profileData.skills = skills;
      if (experience) profileData.experience = experience;
      if (education) profileData.education = education;

      if (existingProfile) {
        // Update existing profile
        console.log('Updating existing profile');
        await prisma.profile.update({
          where: { user_id: req.user.id },
          data: profileData
        });
      } else {
        // Create new profile
        console.log('Creating new profile');
        await prisma.profile.create({
          data: {
            user_id: req.user.id,
            ...profileData
          }
        });
      }
    }

    res.json({
      msg: 'Profile updated successfully!',
      user: updatedUser
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST /api/users/:id/xp
// @desc    Add XP to user and level up if necessary
// @access  Private
router.post('/:id/xp', verifyToken, async (req, res) => {
  // Check if user is authorized to update this profile
  if (req.user.id !== req.params.id && req.user.role !== 'admin') {
    return res.status(403).json({ msg: 'Access denied. You can only update your own XP.' });
  }

  const { xp } = req.body;

  // Validate input
  if (!xp || isNaN(xp) || xp <= 0) {
    return res.status(400).json({ msg: 'Valid XP amount is required' });
  }

  try {
    // Get current user data
    const user = await prisma.user.findUnique({
      where: { id: req.params.id }
    });

    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    // Calculate new XP and level
    const currentXP = user.xp;
    const currentLevel = user.level;
    const newXP = currentXP + parseInt(xp);
    
    // Calculate XP needed for next level (simple formula: 100 * level)
    const xpForNextLevel = 100 * currentLevel;
    let newLevel = currentLevel;
    
    // Check if user should level up
    if (newXP >= xpForNextLevel) {
      newLevel = currentLevel + 1;
    }

    // Update user XP and level
    const updatedUser = await prisma.user.update({
      where: { id: req.params.id },
      data: {
        xp: newXP,
        level: newLevel
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        xp: true,
        level: true,
        updated_at: true
      }
    });

    res.json({
      msg: newLevel > currentLevel ? 'Level up! Congratulations!' : 'XP updated successfully!',
      user: updatedUser,
      leveledUp: newLevel > currentLevel
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET /api/users/:id/profile-picture
// @desc    Serve profile picture from database
// @access  Public
router.get('/:id/profile-picture', async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
      select: {
        profile_picture_data: true
      }
    });

    if (!user || !user.profile_picture_data) {
      return res.status(404).json({ msg: 'Profile picture not found' });
    }

    // Convert binary data to base64 string
    const base64Data = user.profile_picture_data.toString('base64');
    
    // Determine content type from the data URL
    let contentType = 'image/jpeg';
    if (base64Data.startsWith('/9j/')) {
      contentType = 'image/jpeg';
    } else if (base64Data.startsWith('iVBORw0KGgo')) {
      contentType = 'image/png';
    } else if (base64Data.startsWith('R0lGOD')) {
      contentType = 'image/gif';
    }

    // Set appropriate headers
    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=31536000'); // Cache for 1 year
    
    // Send binary data
    res.send(user.profile_picture_data);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
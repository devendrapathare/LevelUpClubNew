const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('../generated/prisma');

const prisma = new PrismaClient();

// Debug middleware to log request body
router.use((req, res, next) => {
  console.log('Request body:', req.body);
  console.log('Content-Type:', req.get('Content-Type'));
  next();
});

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', async (req, res) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Decoded token in /api/auth/me:', decoded);
    
    // Extract user ID from the decoded token
    const userId = decoded.user?.id;
    if (!userId) {
      console.log('No user ID found in decoded token');
      return res.status(401).json({ msg: 'Invalid token structure' });
    }
    
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      console.log('User not found in database with ID:', userId);
      return res.status(404).json({ msg: 'User not found' });
    }

    // Check if user has completed the career assessment
    // Professionals don't require assessments
    const careerMatch = user.role === 'professional' ? null : await prisma.careerMatch.findFirst({
      where: { user_id: user.id },
      orderBy: { generated_at: 'desc' }
    });

    // Get the selected career if available
    let selectedCareer = user.selected_career;
    // If no selected career is stored, fall back to the first career in matches for backward compatibility
    if (!selectedCareer && careerMatch && careerMatch.matches && careerMatch.matches.length > 0) {
      selectedCareer = careerMatch.matches[0].career_name;
    }

    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      level: user.level,
      xp: user.xp,
      selectedCareer: selectedCareer,
      profile_picture_url: user.profile_picture_url,
      requiresAssessment: user.role !== 'professional' && !careerMatch
    });
  } catch (err) {
    console.error('Token verification error in /api/auth/me:', err.message);
    res.status(401).json({ msg: 'Token is not valid' });
  }
});

// @route   POST /api/auth/register
// @desc    Register new user
// @access  Public
router.post('/register', async (req, res) => {
  // Log the raw request body for debugging
  console.log('Raw body in register route:', req.body);
  
  const { name, email, password, role } = req.body;

  try {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({ msg: 'User already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password_hash: hashedPassword,
        role: role || 'student'
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        profile_picture_url: true,
        created_at: true
      }
    });

    // Generate JWT token
    const payload = {
      user: {
        id: user.id,
        email: user.email,
        role: user.role
      }
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: '7d'
    });

    // Professionals don't require assessments
    const requiresAssessment = user.role !== 'professional';

    res.status(201).json({
      msg: requiresAssessment 
        ? 'User registered successfully! Please complete the career assessment to get personalized recommendations.' 
        : 'User registered successfully! Please set up your profile.',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        profile_picture_url: user.profile_picture_url
      },
      requiresAssessment
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST /api/auth/login
// @desc    Login user and return JWT token
// @access  Public
router.post('/login', async (req, res) => {
  // Log the raw request body for debugging
  console.log('Raw body in login route:', req.body);
  
  const { email, password } = req.body;

  try {
    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return res.status(400).json({ msg: 'Invalid email or password' });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid email or password' });
    }

    // Check if user has completed the career assessment
    // Professionals don't require assessments
    const careerMatch = user.role === 'professional' ? null : await prisma.careerMatch.findFirst({
      where: { user_id: user.id },
      orderBy: { generated_at: 'desc' }
    });

    // Get the selected career if available
    let selectedCareer = user.selected_career;
    // If no selected career is stored, fall back to the first career in matches for backward compatibility
    if (!selectedCareer && careerMatch && careerMatch.matches && careerMatch.matches.length > 0) {
      selectedCareer = careerMatch.matches[0].career_name;
    }

    // Generate JWT token
    const payload = {
      user: {
        id: user.id,
        email: user.email,
        role: user.role
      }
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: '7d'
    });

    res.json({
      msg: 'Login successful!',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        level: user.level,
        xp: user.xp,
        selectedCareer: selectedCareer,
        profile_picture_url: user.profile_picture_url
      },
      requiresAssessment: user.role !== 'professional' && !careerMatch
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
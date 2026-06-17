const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { PrismaClient } = require('../generated/prisma');
const { verifyToken } = require('../middleware/auth');

const prisma = new PrismaClient();

// Configure multer to store file in memory instead of disk
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    // Accept image files for profile pictures
    if (req.originalUrl.includes('profile-picture') && file.mimetype.startsWith('image/')) {
      cb(null, true);
    } 
    // Accept PDF files for resumes
    else if (req.originalUrl.includes('resume') && file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'), false);
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

// @route   POST /api/upload/profile-picture
// @desc    Upload profile picture and store as binary data
// @access  Private
router.post('/profile-picture', verifyToken, upload.single('profilePicture'), handleMulterError, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ msg: 'No file uploaded. Please select a file.' });
    }

    // Convert file buffer to base64 for storage
    const base64Data = req.file.buffer.toString('base64');
    const imageData = `data:${req.file.mimetype};base64,${base64Data}`;
    
    // Update user profile with the new profile picture data
    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        profile_picture_data: req.file.buffer,
        profile_picture_url: imageData // Store as data URL for easy retrieval
      },
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

    res.json({
      msg: 'Profile picture uploaded successfully!',
      user: updatedUser,
      profilePictureUrl: imageData
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error while uploading profile picture' });
  }
});

// @route   POST /api/upload/resume
// @desc    Upload resume PDF and store as binary data
// @access  Private
router.post('/resume', verifyToken, upload.single('resume'), handleMulterError, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ msg: 'No file uploaded. Please select a file.' });
    }

    // Generate a data URL for easy retrieval in the frontend
    const base64Data = req.file.buffer.toString('base64');
    const resumeDataUrl = `data:${req.file.mimetype};base64,${base64Data}`;
    
    // Check if profile exists
    const existingProfile = await prisma.profile.findUnique({
      where: { user_id: req.user.id }
    });

    let updatedProfile;
    if (existingProfile) {
      // Update existing profile with both binary data and data URL
      updatedProfile = await prisma.profile.update({
        where: { user_id: req.user.id },
        data: {
          resume_data: req.file.buffer,
          resume_url: resumeDataUrl
        }
      });
    } else {
      // Create new profile with both binary data and data URL
      updatedProfile = await prisma.profile.create({
        data: {
          user_id: req.user.id,
          resume_data: req.file.buffer,
          resume_url: resumeDataUrl,
          education: [],
          experience: [],
          skills: [],
          certifications: []
        }
      });
    }

    res.json({
      msg: 'Resume uploaded successfully!',
      resumeUrl: resumeDataUrl
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error while uploading resume' });
  }
});

// @route   GET /api/upload/resume/:userId
// @desc    Serve resume PDF from database
// @access  Public
router.get('/resume/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Get profile with resume data
    const profile = await prisma.profile.findUnique({
      where: { user_id: userId },
      select: {
        resume_data: true
      }
    });

    if (!profile || !profile.resume_data) {
      return res.status(404).json({ msg: 'Resume not found' });
    }

    // Set headers for PDF
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'inline; filename="resume.pdf"');
    
    // Send binary data
    res.send(profile.resume_data);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error while retrieving resume' });
  }
});

module.exports = router;
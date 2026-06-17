const express = require('express');
const router = express.Router();
const multer = require('multer');
const { PrismaClient } = require('../generated/prisma');
const { verifyToken } = require('../middleware/auth');
const geminiService = require('../services/ai/geminiService');

const prisma = new PrismaClient();

// Configure multer to store file in memory
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    // Accept PDF files and Word documents
    if (file.mimetype === 'application/pdf' || 
        file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
        file.mimetype === 'application/msword') {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF and Word documents are allowed.'), false);
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

// @route   POST /api/resume/analyze
// @desc    Analyze resume using Gemini AI
// @access  Private
router.post('/analyze', verifyToken, upload.single('resume'), handleMulterError, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ msg: 'No file uploaded. Please select a file.' });
    }

    // Validate that the file is a proper PDF
    if (req.file.mimetype !== 'application/pdf') {
      return res.status(400).json({ msg: 'Currently, only PDF documents are supported for analysis.' });
    }

    // Validate PDF buffer size (should be at least 1KB to be valid)
    if (req.file.buffer.length < 1024) {
      return res.status(400).json({ msg: 'Resume file appears to be corrupted or too small.' });
    }

    // Get user's selected career from the user record
    const user = await prisma.user.findUnique({
      where: { id: req.user.id }
    });

    // Use the selected_career field directly from the user record
    const selectedCareer = user?.selected_career;

    if (!selectedCareer) {
      return res.status(400).json({ msg: 'Please complete your career assessment and select a career before analyzing your resume.' });
    }

    console.log(`Analyzing resume for user ${req.user.id}, career: ${selectedCareer}, file size: ${req.file.buffer.length} bytes`);
    console.log('File buffer type:', typeof req.file.buffer);
    console.log('Is Buffer:', Buffer.isBuffer(req.file.buffer));

    // Analyze resume using Gemini AI with the actual resume buffer and selected career
    // Multer provides a proper Buffer, so we can pass it directly
    const analysis = await geminiService.analyzeResume(req.file.buffer, selectedCareer);

    res.json({
      msg: 'Resume analysis completed successfully!',
      analysis: analysis
    });
  } catch (err) {
    console.error('Resume analysis error:', err.message);
    res.status(500).json({ msg: 'Server error while analyzing resume' });
  }
});

module.exports = router;
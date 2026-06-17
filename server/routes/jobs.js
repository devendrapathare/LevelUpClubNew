const express = require('express');
const router = express.Router();
const { PrismaClient } = require('../generated/prisma');
const { verifyToken, authorizeRole } = require('../middleware/auth');

const prisma = new PrismaClient();

// @route   POST /api/jobs
// @desc    Create a new job posting
// @access  Private (Recruiters only)
router.post('/', verifyToken, authorizeRole(['recruiter']), async (req, res) => {
  const { title, description, requirements, location, remote_flag, salary_range, expires_at } = req.body;
  const recruiter_id = req.user.id;

  try {
    // Create job posting
    const job = await prisma.job.create({
      data: {
        recruiter_id,
        title,
        description,
        requirements,
        location,
        remote_flag: remote_flag || false,
        salary_range,
        expires_at: expires_at ? new Date(expires_at) : null
      }
    });

    res.status(201).json({
      msg: 'Job posted successfully!',
      job
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET /api/jobs
// @desc    List/search jobs
// @access  Public
router.get('/', async (req, res) => {
  const { search, location, remote } = req.query;
  
  try {
    // Build where clause based on filters
    const where = {};
    
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }
    
    if (location) {
      where.location = { contains: location, mode: 'insensitive' };
    }
    
    if (remote === 'true') {
      where.remote_flag = true;
    } else if (remote === 'false') {
      where.remote_flag = false;
    }
    
    // Ensure job hasn't expired
    where.expires_at = {
      gte: new Date()
    };
    
    const jobs = await prisma.job.findMany({
      where,
      include: {
        recruiter: {
          select: {
            id: true,
            name: true,
            headline: true,
            profile_picture_url: true
          }
        }
      },
      orderBy: {
        created_at: 'desc'
      }
    });

    res.json({
      msg: 'Jobs fetched successfully!',
      jobs
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST /api/jobs/:id/apply
// @desc    Apply for a job
// @access  Private (Students only)
router.post('/:id/apply', verifyToken, authorizeRole(['student']), async (req, res) => {
  const { resume_url, message } = req.body;
  const job_id = req.params.id;
  const user_id = req.user.id;

  try {
    // Check if job exists and hasn't expired
    const job = await prisma.job.findUnique({
      where: { 
        id: job_id,
        expires_at: {
          gte: new Date()
        }
      }
    });

    if (!job) {
      return res.status(404).json({ msg: 'Job not found or has expired' });
    }

    // Check if user has already applied
    const existingApplication = await prisma.jobApplication.findUnique({
      where: {
        job_id_user_id: {
          job_id,
          user_id
        }
      }
    });

    if (existingApplication) {
      return res.status(400).json({ msg: 'You have already applied for this job' });
    }

    // Create job application
    const application = await prisma.jobApplication.create({
      data: {
        job_id,
        user_id,
        resume_url,
        message
      }
    });

    res.status(201).json({
      msg: 'Job application submitted successfully!',
      application
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
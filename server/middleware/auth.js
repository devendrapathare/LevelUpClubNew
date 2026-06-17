// middleware/auth.js

const jwt = require('jsonwebtoken');
const { PrismaClient } = require('../generated/prisma');

const prisma = new PrismaClient();

// Async middleware wrapper
function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

// Async verify token middleware
const verifyToken = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers['authorization'];

  // Token format: "Bearer <token>"
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    console.log('No token provided in authorization header');
    return res.status(401).json({ msg: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Decoded token:', decoded);
    
    // The JWT payload structure has the user object nested under 'user'
    req.user = decoded.user; // attach user info to req
    
    // Extract user ID
    const userId = req.user?.id;
    
    if (!userId) {
      console.log('No user ID found in decoded token');
      return res.status(401).json({ msg: 'Invalid token structure' });
    }
    
    // Log the user ID we're about to check
    console.log('Checking for user with ID:', userId);
    
    // Validate that the user actually exists in the database
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });
    
    if (!user) {
      console.log('User not found in database with ID:', userId);
      return res.status(404).json({ msg: 'User not found' });
    }
    
    console.log('User authenticated successfully:', user.id, user.name);
    next(); // allow route handler to continue
  } catch (err) {
    console.log('Token verification error:', err.message);
    return res.status(403).json({ msg: 'Invalid or expired token' });
  }
});

// Role-based authorization middleware
function authorizeRole(roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ msg: 'Access denied. No user authenticated.' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ msg: 'Access denied. Insufficient permissions.' });
    }

    next();
  };
}

module.exports = { verifyToken, authorizeRole };
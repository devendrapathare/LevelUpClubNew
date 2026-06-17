// index.js
const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

// Log environment variables for debugging
console.log('JWT_SECRET loaded:', process.env.JWT_SECRET ? 'YES' : 'NO');
console.log('DATABASE_URL loaded:', process.env.DATABASE_URL ? 'YES' : 'NO');

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: '*',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes - Mount more specific routes before general ones
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/assessments', require('./routes/assessments'));
app.use('/api/career', require('./routes/career'));
app.use('/api/connections', require('./routes/connections'));
app.use('/api/jobs', require('./routes/jobs'));
app.use('/api/posts', require('./routes/community'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/tasks', require('./routes/tasks'));
app.use('/api/goals', require('./routes/goals'));
app.use('/api/upload', require('./routes/upload'));
app.use('/api/resume', require('./routes/resume'));
app.use('/api/messaging', require('./routes/messaging'));

// Serve static files from uploads directory
app.use('/uploads', express.static('uploads'));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    service: 'LevelUp Club API'
  });
});

// Test Route
app.get('/', (req, res) => {
  res.send('LevelUp Club API is running 🚀');
});

// Socket.IO setup
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Store connected users
const connectedUsers = new Map();

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  
  // Handle user joining
  socket.on('join', (userId) => {
    connectedUsers.set(userId, socket.id);
    console.log(`User ${userId} joined with socket ${socket.id}`);
  });
  
  // Handle sending message
  socket.on('sendMessage', async (data) => {
    const { conversationId, senderId, content } = data;
    
    try {
      // Import Prisma client
      const { PrismaClient } = require('./generated/prisma');
      const prisma = new PrismaClient();
      
      // Create message in database
      const message = await prisma.message.create({
        data: {
          conversation_id: conversationId,
          sender_id: senderId,
          content: content
        },
        include: {
          sender: {
            select: {
              id: true,
              name: true,
              profile_picture_url: true
            }
          }
        }
      });
      
      // Update conversation's last message timestamp
      await prisma.conversation.update({
        where: { id: conversationId },
        data: { last_message_at: new Date() }
      });
      
      // Emit message to all participants in the conversation
      const conversationUsers = await prisma.conversationUser.findMany({
        where: { conversation_id: conversationId },
        select: { user_id: true }
      });
      
      conversationUsers.forEach(user => {
        const userSocketId = connectedUsers.get(user.user_id);
        if (userSocketId) {
          io.to(userSocketId).emit('receiveMessage', message);
        }
      });
      
      // Clean up Prisma client
      await prisma.$disconnect();
    } catch (error) {
      console.error('Error sending message:', error);
    }
  });
  
  // Handle user disconnecting
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    // Remove user from connected users map
    for (let [userId, socketId] of connectedUsers.entries()) {
      if (socketId === socket.id) {
        connectedUsers.delete(userId);
        break;
      }
    }
  });
});

// Start Server
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
});
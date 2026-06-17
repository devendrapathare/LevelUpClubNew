const express = require('express');
const router = express.Router();
const { PrismaClient } = require('../generated/prisma');
const { verifyToken } = require('../middleware/auth');

const prisma = new PrismaClient();

// @route   GET /api/conversations
// @desc    List user's conversations
// @access  Private
router.get('/conversations', verifyToken, async (req, res) => {
  try {
    // Get all conversations for the user
    const conversations = await prisma.conversation.findMany({
      where: {
        participants: {
          some: {
            user_id: req.user.id
          }
        }
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                profile_picture_url: true,
                headline: true
              }
            }
          }
        },
        messages: {
          take: 1, // Get only the latest message
          orderBy: {
            sent_at: 'desc'
          }
        }
      },
      orderBy: {
        last_message_at: 'desc'
      }
    });

    // Transform the data to match frontend expectations
    const transformedConversations = conversations.map(conv => {
      const lastMessage = conv.messages[0];
      return {
        ...conv,
        last_message: lastMessage ? lastMessage.content : null,
        last_message_at: lastMessage ? lastMessage.sent_at : conv.last_message_at
      };
    });

    res.json({
      msg: 'Conversations fetched successfully!',
      conversations: transformedConversations
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST /api/conversations
// @desc    Create a new conversation
// @access  Private
router.post('/conversations', verifyToken, async (req, res) => {
  const { participant_ids } = req.body;
  
  // Add the current user to participants if not already included
  const participants = [...new Set([req.user.id, ...participant_ids])];

  try {
    // Check if a conversation with these exact participants already exists
    // First, find conversations where the current user is a participant
    const userConversations = await prisma.conversation.findMany({
      where: {
        participants: {
          some: {
            user_id: req.user.id
          }
        }
      },
      include: {
        participants: true
      }
    });

    // Check if any of these conversations have the exact same participants
    let existingConversation = null;
    for (const conv of userConversations) {
      const convParticipantIds = conv.participants.map(p => p.user_id).sort();
      const newParticipantIds = participants.sort();
      
      if (convParticipantIds.length === newParticipantIds.length &&
          convParticipantIds.every((id, index) => id === newParticipantIds[index])) {
        existingConversation = conv;
        break;
      }
    }

    if (existingConversation) {
      // Fetch the full conversation with participants and last message
      const fullConversation = await prisma.conversation.findUnique({
        where: { id: existingConversation.id },
        include: {
          participants: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  profile_picture_url: true,
                  headline: true
                }
              }
            }
          },
          messages: {
            take: 1,
            orderBy: {
              sent_at: 'desc'
            }
          }
        }
      });

      // Transform the data
      const transformedConversation = {
        ...fullConversation,
        last_message: fullConversation.messages[0] ? fullConversation.messages[0].content : null,
        last_message_at: fullConversation.messages[0] ? fullConversation.messages[0].sent_at : fullConversation.last_message_at
      };

      return res.json({
        msg: 'Conversation already exists',
        conversation: transformedConversation
      });
    }

    // Create new conversation
    const conversation = await prisma.conversation.create({
      data: {
        participants: {
          create: participants.map(user_id => ({
            user_id
          }))
        }
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                profile_picture_url: true,
                headline: true
              }
            }
          }
        }
      }
    });

    res.status(201).json({
      msg: 'Conversation created successfully!',
      conversation: {
        ...conversation,
        last_message: null,
        last_message_at: conversation.last_message_at
      }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST /api/conversations/:id/messages
// @desc    Send a message in a conversation
// @access  Private
router.post('/conversations/:id/messages', verifyToken, async (req, res) => {
  const { content, attachments } = req.body;
  const conversation_id = req.params.id;
  const sender_id = req.user.id;

  try {
    // Check if user is part of the conversation
    const conversationUser = await prisma.conversationUser.findUnique({
      where: {
        conversation_id_user_id: {
          conversation_id,
          user_id: sender_id
        }
      }
    });

    if (!conversationUser) {
      return res.status(403).json({ msg: 'Access denied. You are not part of this conversation.' });
    }

    // Create message
    const message = await prisma.message.create({
      data: {
        conversation_id,
        sender_id,
        content,
        attachments: attachments || null
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
      where: { id: conversation_id },
      data: { last_message_at: new Date() }
    });

    res.status(201).json({
      msg: 'Message sent successfully!',
      message
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET /api/conversations/:id/messages
// @desc    Fetch messages in a conversation
// @access  Private
router.get('/conversations/:id/messages', verifyToken, async (req, res) => {
  const { limit = 50, offset = 0 } = req.query;
  const conversation_id = req.params.id;

  try {
    // Check if user is part of the conversation
    const conversationUser = await prisma.conversationUser.findUnique({
      where: {
        conversation_id_user_id: {
          conversation_id,
          user_id: req.user.id
        }
      }
    });

    if (!conversationUser) {
      return res.status(403).json({ msg: 'Access denied. You are not part of this conversation.' });
    }

    // Fetch messages
    const messages = await prisma.message.findMany({
      where: { conversation_id },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            profile_picture_url: true
          }
        }
      },
      orderBy: {
        sent_at: 'asc'
      },
      take: parseInt(limit),
      skip: parseInt(offset)
    });

    res.json({
      msg: 'Messages fetched successfully!',
      messages
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
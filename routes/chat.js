const express = require('express');
const router = express.Router();
const Chat = require('../models/Chat');

// GET /api/chat - Get last 100 messages
router.get('/', async (req, res) => {
  try {
    const messages = await Chat.find().sort({ createdAt: -1 }).limit(100);
    res.json(messages.reverse()); // Return oldest first
  } catch (err) {
    console.error('Get chat error:', err);
    res.status(500).json({ error: 'Failed to get messages' });
  }
});

// POST /api/chat - Send a message
router.post('/', async (req, res) => {
  try {
    const { userName, text, badge, badgeLevel } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ error: 'Message cannot be empty' });
    }

    const message = new Chat({
      userName: userName || 'Anonymous',
      badge: badge || 'Novice',
      badgeLevel: badgeLevel || 1,
      text: text.trim()
    });

    await message.save();

    // Keep only last 100 messages
    const count = await Chat.countDocuments();
    if (count > 100) {
      const toDelete = count - 100;
      const oldMessages = await Chat.find().sort({ createdAt: 1 }).limit(toDelete);
      const ids = oldMessages.map(m => m._id);
      await Chat.deleteMany({ _id: { $in: ids } });
    }

    console.log(`💬 Chat message from ${userName}: ${text.substring(0, 50)}...`);
    res.json(message);
  } catch (err) {
    console.error('Create chat error:', err);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

module.exports = router;

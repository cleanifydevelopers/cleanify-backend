const express = require('express');
const router = express.Router();
const User = require('../models/User');

// GET /api/users/:name - Get user by name
router.get('/:name', async (req, res) => {
  try {
    let user = await User.findOne({ name: req.params.name });
    if (!user) {
      // Create new user if doesn't exist
      // Extract email from query param if provided
      const email = req.query.email || 'user@example.com';
      user = new User({ name: req.params.name, email });
      user.updateBadge();
      await user.save();
    }
    res.json(user);
  } catch (err) {
    console.error('Get user error:', err);
    res.status(500).json({ error: 'Failed to get user' });
  }
});

// POST /api/users/:name/update-email - Update user email
router.post('/:name/update-email', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email required' });
    }
    
    let user = await User.findOne({ name: req.params.name });
    if (!user) {
      user = new User({ name: req.params.name, email });
    } else {
      user.email = email;
    }
    user.updateBadge();
    await user.save();
    console.log(`📧 User "${req.params.name}" email updated to: ${email}`);
    res.json(user);
  } catch (err) {
    console.error('Update email error:', err);
    res.status(500).json({ error: 'Failed to update email' });
  }
});

// POST /api/users/:name/report-submitted - Increment report count
router.post('/:name/report-submitted', async (req, res) => {
  try {
    let user = await User.findOne({ name: req.params.name });
    if (!user) {
      user = new User({ name: req.params.name });
    }
    user.reportsSubmitted += 1;
    user.updateBadge();
    await user.save();
    console.log(`📊 User "${req.params.name}" now has ${user.reportsSubmitted} reports, badge: ${user.badge}`);
    res.json(user);
  } catch (err) {
    console.error('Update user error:', err);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// GET /api/users/leaderboard/top - Get top 10 users by reports
router.get('/leaderboard/top', async (req, res) => {
  try {
    const users = await User.find().sort({ reportsSubmitted: -1 }).limit(10);
    res.json(users);
  } catch (err) {
    console.error('Leaderboard error:', err);
    res.status(500).json({ error: 'Failed to get leaderboard' });
  }
});

module.exports = router;

const mongoose = require('mongoose');

const ChatSchema = new mongoose.Schema({
  userName: { type: String, default: 'Anonymous' },
  badge: { type: String, default: 'Novice' }, // Store badge with message
  badgeLevel: { type: Number, default: 1 },
  text: { type: String, required: true },
  createdAt: { type: Date, default: Date.now, expires: 2592000 } // Auto-delete after 30 days
});

// Index to keep only last 100 messages
ChatSchema.index({ createdAt: 1 });

module.exports = mongoose.model('Chat', ChatSchema);

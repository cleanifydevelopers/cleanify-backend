const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, default: 'Anonymous' },
  email: { type: String, default: 'user@example.com' },
  reportsSubmitted: { type: Number, default: 0 },
  badge: { type: String, enum: ['Novice', 'Helper', 'Champion', 'Hero'], default: 'Novice' },
  badgeLevel: { type: Number, default: 1 }, // 1-4 corresponding to badge tier
  createdAt: { type: Date, default: Date.now }
});

// Badge tiers based on reports submitted:
// 1-4 reports: Novice (🌱)
// 5-9 reports: Helper (⭐)
// 10-24 reports: Champion (🏆)
// 25+ reports: Hero (👑)

UserSchema.methods.updateBadge = function() {
  if (this.reportsSubmitted >= 25) {
    this.badge = 'Hero';
    this.badgeLevel = 4;
  } else if (this.reportsSubmitted >= 10) {
    this.badge = 'Champion';
    this.badgeLevel = 3;
  } else if (this.reportsSubmitted >= 5) {
    this.badge = 'Helper';
    this.badgeLevel = 2;
  } else {
    this.badge = 'Novice';
    this.badgeLevel = 1;
  }
};

module.exports = mongoose.model('User', UserSchema);

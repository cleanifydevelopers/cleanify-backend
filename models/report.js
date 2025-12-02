const mongoose = require('mongoose');

const TimelineSchema = new mongoose.Schema({
  status: String,
  note: String,
  photo: String,
  at: { type: Date, default: Date.now }
});

const ReportSchema = new mongoose.Schema({
  category: { type: String, required: true },
  description: String,
  photos: [String],
  address: String,
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], index: '2dsphere' } // [lng, lat]
  },
  status: { type: String, default: 'Submitted' },
  votes: { type: Number, default: 0 },
  timeline: [TimelineSchema],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Report', ReportSchema);

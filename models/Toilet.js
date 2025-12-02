const mongoose = require('mongoose');

const ToiletSchema = new mongoose.Schema({
  name: { type: String, required: true },
  address: { type: String, required: true },
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], required: true } // [lng, lat]
  },
  status: { type: String, enum: ['Operational', 'Maintenance', 'Closed'], default: 'Operational' },
  addedBy: { type: String, default: 'Admin' },
  createdAt: { type: Date, default: Date.now }
});

// Index for geospatial queries
ToiletSchema.index({ 'location': '2dsphere' });

module.exports = mongoose.model('Toilet', ToiletSchema);

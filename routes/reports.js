const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Report = require('../models/report');

// POST /api/reports
router.post('/', async (req, res) => {
  try {
    const { category, description, address, lat, lng, photos } = req.body;
    const parsedLat = parseFloat(lat) || 0
    const parsedLng = parseFloat(lng) || 0
    
    console.log('═══════════════════════════════════════');
    console.log('📤 BACKEND - CREATE REPORT');
    console.log('═══════════════════════════════════════');
    console.log('Received from client:', { lat, lng, address });
    console.log('Parsed values:', { parsedLat, parsedLng });
    console.log('Storing in DB as [lng, lat]:', [parsedLng, parsedLat]);
    console.log('Verification - this should be GeoJSON format');
    console.log('═══════════════════════════════════════');
    
    const report = new Report({
      category,
      description,
      address,
      photos: photos || [],
      location: { type: 'Point', coordinates: [parsedLng, parsedLat] }
    });
    await report.save();
    console.log('✅ Report saved with ID:', report._id);
    console.log('✅ Location stored:', report.location);
    res.json({ id: report._id, createdAt: report.createdAt });
  } catch (err) {
    console.error('Create report error:', err);
    res.status(500).json({ error: 'Could not save report: ' + err.message });
  }
});

// GET /api/reports?filter=posted|nearby|city&lat=&lng=&radius=
router.get('/', async (req, res) => {
  try {
    const filter = req.query.filter || 'city';
    if (filter === 'nearby' && req.query.lat && req.query.lng) {
      const lat = parseFloat(req.query.lat);
      const lng = parseFloat(req.query.lng);
      const radius = parseFloat(req.query.radius) || 500; // meters
      // meters -> radians for $geoNear? use $geoNear requires aggregation; instead use $near
      const docs = await Report.find({
        location: {
          $near: {
            $geometry: { type: 'Point', coordinates: [lng, lat] },
            $maxDistance: radius
          }
        }
      }).sort({ createdAt: -1 }).limit(200);
      return res.json(docs);
    }

    // posted: reports submitted by this session - since no auth, interpret as recent
    if (filter === 'posted') {
      const docs = await Report.find().sort({ createdAt: -1 }).limit(20);
      return res.json(docs);
    }

    // city or default - return all
    const docs = await Report.find().sort({ createdAt: -1 }).limit(200);
    res.json(docs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch reports' });
  }
});

// GET /api/reports/:id
router.get('/:id', async (req, res) => {
  try {
    const doc = await Report.findById(req.params.id);
    if (!doc) return res.status(404).json({ error: 'Not found' });
    console.log('═══════════════════════════════════════');
    console.log('📥 BACKEND - GET REPORT ID:', req.params.id);
    console.log('Retrieved location:', doc.location);
    console.log('Coordinates array:', doc.location.coordinates);
    console.log('Format: [lng, lat] =', `[${doc.location.coordinates[0]}, ${doc.location.coordinates[1]}]`);
    console.log('═══════════════════════════════════════');
    res.json(doc);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed' });
  }
});

// POST /api/reports/:id/vote
router.post('/:id/vote', async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);
    if (!report) return res.status(404).json({ error: 'Not found' });
    report.votes = (report.votes || 0) + 1;
    await report.save();
    res.json({ votes: report.votes });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to vote' });
  }
});

// POST /api/reports/:id/solve - DELETE from database (Municipal Worker)
router.post('/:id/solve', async (req, res) => {
  try {
    console.log('🗑️ DELETING report:', req.params.id);
    console.log('🗑️ ID type:', typeof req.params.id);
    
    // Convert string ID to MongoDB ObjectId
    const objectId = new mongoose.Types.ObjectId(req.params.id);
    console.log('🗑️ Converted ObjectId:', objectId);
    
    const deleted = await Report.deleteOne({ _id: objectId });
    console.log('🗑️ Delete result:', deleted);
    
    if (deleted.deletedCount === 0) {
      console.error('❌ Report not found for deletion');
      return res.status(404).json({ error: 'Report not found' });
    }
    
    console.log('✅ Report PERMANENTLY deleted:', req.params.id);
    res.json({ ok: true, deleted: true });
  } catch (err) {
    console.error('❌ Delete error:', err);
    res.status(500).json({ error: 'Failed to delete report' });
  }
});

// POST /api/reports/:id/reopen (optional)
router.post('/:id/reopen', async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);
    if (!report) return res.status(404).json({ error: 'Not found' });
    report.status = 'Reopened';
    report.timeline.push({ status: 'Reopened', note: req.body.note || 'Reopened' });
    await report.save();
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed' });
  }
});

module.exports = router;

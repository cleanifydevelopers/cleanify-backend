const express = require('express');
const router = express.Router();
const Toilet = require('../models/Toilet');

// GET /api/toilets - Get all toilets (optionally filtered by nearby)
// Query: ?nearby=lat,lng
router.get('/', async (req, res) => {
  try {
    const nearby = req.query.nearby;
    
    // Get all toilets from database
    let toilets = await Toilet.find();
    
    if (!nearby) {
      return res.json(toilets);
    }
    
    // Filter by nearby location
    const [latS, lngS] = nearby.split(',');
    const lat = parseFloat(latS);
    const lng = parseFloat(lngS);
    
    if (isNaN(lat) || isNaN(lng)) {
      return res.json(toilets);
    }
    
    // Calculate distance and filter
    const filtered = toilets.map(t => {
      const [toLng, toLat] = t.location.coordinates;
      const dLat = (toLat - lat) * 111000;
      const dLng = (toLng - lng) * 111000;
      const dist = Math.sqrt(dLat * dLat + dLng * dLng);
      return { ...t.toObject(), distance: Math.round(dist) };
    }).sort((a, b) => a.distance - b.distance);
    
    res.json(filtered);
  } catch (err) {
    console.error('Get toilets error:', err);
    res.status(500).json({ error: 'Failed to get toilets' });
  }
});

// POST /api/toilets - Add a new toilet
router.post('/', async (req, res) => {
  try {
    const { name, address, lat, lng, status, addedBy } = req.body;
    
    if (!name || !address || lat === undefined || lng === undefined) {
      return res.status(400).json({ error: 'Missing required fields: name, address, lat, lng' });
    }
    
    const parsedLat = parseFloat(lat);
    const parsedLng = parseFloat(lng);
    
    if (isNaN(parsedLat) || isNaN(parsedLng)) {
      return res.status(400).json({ error: 'Invalid coordinates - must be numbers' });
    }
    
    // Validate coordinate bounds (GeoJSON standard)
    if (parsedLat < -90 || parsedLat > 90) {
      return res.status(400).json({ error: 'Invalid latitude - must be between -90 and 90' });
    }
    
    if (parsedLng < -180 || parsedLng > 180) {
      return res.status(400).json({ error: 'Invalid longitude - must be between -180 and 180' });
    }
    
    const toilet = new Toilet({
      name,
      address,
      location: { type: 'Point', coordinates: [parsedLng, parsedLat] },
      status: status || 'Operational',
      addedBy: addedBy || 'Admin'
    });
    
    await toilet.save();
    console.log(`🚽 New toilet added: ${name} at (${parsedLat}, ${parsedLng})`);
    res.json(toilet);
  } catch (err) {
    console.error('Add toilet error:', err);
    res.status(500).json({ error: 'Failed to add toilet - ' + err.message });
  }
});

// PUT /api/toilets/:id - Update toilet status
router.put('/:id', async (req, res) => {
  try {
    const { status } = req.body;
    const toilet = await Toilet.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!toilet) return res.status(404).json({ error: 'Toilet not found' });
    res.json(toilet);
  } catch (err) {
    console.error('Update toilet error:', err);
    res.status(500).json({ error: 'Failed to update toilet' });
  }
});

// DELETE /api/toilets/:id - Delete a toilet
router.delete('/:id', async (req, res) => {
  try {
    const toilet = await Toilet.findByIdAndDelete(req.params.id);
    if (!toilet) return res.status(404).json({ error: 'Toilet not found' });
    console.log(`🗑️ Toilet deleted: ${toilet.name}`);
    res.json({ ok: true });
  } catch (err) {
    console.error('Delete toilet error:', err);
    res.status(500).json({ error: 'Failed to delete toilet' });
  }
});

module.exports = router;


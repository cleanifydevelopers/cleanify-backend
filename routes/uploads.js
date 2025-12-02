const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

const UPLOAD_DIR = path.join(__dirname, '..', 'uploads');

// Ensure upload dir exists
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, UPLOAD_DIR);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname) || '';
    cb(null, uuidv4() + ext);
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB max
});

// POST /api/uploads (accept multipart/form-data: file)
router.post('/', upload.array('photos', 6), (req, res) => {
  try {
    const files = req.files || [];
    if (!files.length) {
      return res.json({ urls: [] });
    }
    const host = process.env.HOST_URL || `${req.protocol}://${req.get('host')}`;
    const urls = files.map(f => `${host}/uploads/${f.filename}`);
    console.log('Uploaded files:', urls);
    res.json({ urls });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ error: 'Upload failed: ' + err.message });
  }
});

module.exports = router;

require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const reportsRoute = require('./routes/reports');
const uploadsRoute = require('./routes/uploads');
const toiletsRoute = require('./routes/toilets');
const usersRoute = require('./routes/users');
const chatRoute = require('./routes/chat');
const feedbackRoute = require('./routes/feedback');

const app = express();
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Accept', 'Authorization'],
  credentials: false,
  maxAge: 3600
}));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const PORT = process.env.PORT || 4000;
const UPLOAD_DIR = path.join(__dirname, 'uploads');

// Create uploads directory if it doesn't exist
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// static uploads
app.use('/uploads', express.static(UPLOAD_DIR));

app.use('/api/reports', reportsRoute);
app.use('/api/uploads', uploadsRoute);
app.use('/api/toilets', toiletsRoute);
app.use('/api/users', usersRoute);
app.use('/api/chat', chatRoute);
app.use('/api/send-feedback', feedbackRoute);

app.get('/', (req, res) => {
  res.json({ ok: true, msg: 'Cleanify API' });
});

app.get('/api/health', (req, res) => {
  res.json({ ok: true, status: 'healthy', timestamp: new Date().toISOString() });
});

async function start() {
  const mongo = process.env.MONGO_URI || 'mongodb://localhost:27017/cleanify';
  await mongoose.connect(mongo, { useNewUrlParser: true, useUnifiedTopology: true });        
  console.log('Connected to MongoDB');

  const server = app.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`);
  });

  server.on('error', (err) => {
    console.error('Server error:', err);
    process.exit(1);
  });
}

start().catch(err => {
  console.error('Failed to start', err);
  process.exit(1);
});

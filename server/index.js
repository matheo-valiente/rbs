const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const readJson = (file) => {
  const fullPath = path.join(__dirname, 'data', file);
  return JSON.parse(fs.readFileSync(fullPath, 'utf-8'));
};

app.get('/api/products', (req, res) => {
  try {
    res.json(readJson('products.json'));
  } catch (err) {
    res.status(500).json({ error: 'Failed to load products' });
  }
});

app.get('/api/events', (req, res) => {
  try {
    res.json(readJson('events.json'));
  } catch (err) {
    res.status(500).json({ error: 'Failed to load events' });
  }
});

app.get('/api/tracks', (req, res) => {
  try {
    res.json(readJson('tracks.json'));
  } catch (err) {
    res.status(500).json({ error: 'Failed to load tracks' });
  }
});

app.post('/api/contact', (req, res) => {
  const { firstName, lastName, subject, message } = req.body || {};
  console.log('--- NEW CONTACT MESSAGE ---');
  console.log('From:', firstName, lastName);
  console.log('Subject:', subject);
  console.log('Message:', message);
  console.log('---------------------------');
  res.json({ success: true });
});

app.get('/', (req, res) => {
  res.json({ status: 'RBS API running', endpoints: ['/api/products', '/api/events', '/api/tracks', '/api/contact'] });
});

app.listen(PORT, () => {
  console.log(`RBS server running on http://localhost:${PORT}`);
});

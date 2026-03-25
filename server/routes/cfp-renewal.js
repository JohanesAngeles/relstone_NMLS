const express = require('express');
const router  = express.Router();
const { webDB } = require('../config/db');
const mongoose  = require('mongoose');
 
const stateSchema = new mongoose.Schema({}, { strict: false });
const State = webDB.models.State || webDB.model('State', stateSchema);
 
// GET /api/cfp-renewal/info
router.get('/info', async (req, res) => {
  try {
    const state = await State.findOne({ slug: 'cfp-renewal' }).lean();
    if (!state) return res.status(404).json({ message: 'CFP state not found.' });
    res.json(state);
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

module.exports = router;

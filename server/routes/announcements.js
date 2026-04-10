const express      = require('express');
const router       = express.Router();
const Announcement = require('../models/Announcement');

router.get('/', async (req, res) => {
  try {
    const { status, page = 1, limit = 5 } = req.query;
    const now = new Date();

    // Match the Frontend "status=active" filter
    const query = {};
    if (status === 'active') {
      query.is_active = true;
      query.$or = [{ expires_at: null }, { expires_at: { $gt: now } }];
    } else if (status === 'inactive') {
      query.is_active = false;
    }

    const total = await Announcement.countDocuments(query);
    const announcements = await Announcement.find(query)
      .populate('ref_id', 'code') // So the voucher code shows up in the card
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit))
      .lean();

    // React needs these specific keys: announcements, total, page
    res.json({
      announcements,
      total,
      page: Number(page)
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
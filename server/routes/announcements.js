const express      = require('express');
const router       = express.Router();
const Announcement = require('../models/Announcement');

// ── GET /api/announcements ─────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const { status, page = 1, limit = 5 } = req.query;
    const now = new Date();

    const query = {};
    if (status === 'active') {
      query.is_active = true;
      query.$or = [{ expires_at: null }, { expires_at: { $gt: now } }];
    } else if (status === 'inactive') {
      query.is_active = false;
    }

    const total = await Announcement.countDocuments(query);
    const announcements = await Announcement.find(query)
      .populate('ref_id', 'code title')   // covers both Voucher (code) and Course (title)
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit))
      .lean();

    res.json({ announcements, total, page: Number(page) });
  } catch (err) {
    console.error('GET /api/announcements error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// ── GET /api/announcements/:id ─────────────────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id)
      .populate('ref_id', 'code title')
      .lean();

    if (!announcement) {
      return res.status(404).json({ message: 'Announcement not found' });
    }

    res.json(announcement);
  } catch (err) {
    console.error('GET /api/announcements/:id error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// ── POST /api/announcements ────────────────────────────────────────────
router.post('/', async (req, res) => {
  try {
    const { title, message, type, is_active, ref_id, expires_at } = req.body;

    if (!title || !message) {
      return res.status(400).json({ message: '`title` and `message` are required' });
    }

    // Derive ref_model automatically from type so the
    // frontend never has to send it manually
    const refModelMap = {
      voucher:    'Voucher',
      new_course: 'Course',
    };

    const announcement = new Announcement({
      title,
      message,
      type:      type      ?? 'general',
      is_active: is_active ?? true,
      ref_id:    ref_id    || null,
      ref_model: ref_id ? (refModelMap[type] ?? null) : undefined,
      expires_at: expires_at ?? null,
    });

    await announcement.save();
    res.status(201).json(announcement);
  } catch (err) {
    console.error('POST /api/announcements error:', err);

    if (err.name === 'ValidationError') {
      const fields = Object.keys(err.errors).map(k => ({
        field:   k,
        message: err.errors[k].message,
      }));
      return res.status(400).json({ message: 'Validation failed', fields });
    }

    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// ── PATCH /api/announcements/:id ───────────────────────────────────────
router.patch('/:id', async (req, res) => {
  try {
    // If type or ref_id is being updated, re-derive ref_model
    const refModelMap = {
      voucher:    'Voucher',
      new_course: 'Course',
    };

    const updates = { ...req.body };

    if (updates.ref_id && updates.type) {
      updates.ref_model = refModelMap[updates.type] ?? null;
    }

    // Unset ref_id + ref_model if caller explicitly clears ref_id
    if (updates.ref_id === null || updates.ref_id === '') {
      updates.ref_id    = null;
      updates.ref_model = null;
    }

    const updated = await Announcement.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true, runValidators: true }
    ).populate('ref_id', 'code title');

    if (!updated) {
      return res.status(404).json({ message: 'Announcement not found' });
    }

    res.json(updated);
  } catch (err) {
    console.error('PATCH /api/announcements/:id error:', err);

    if (err.name === 'ValidationError') {
      const fields = Object.keys(err.errors).map(k => ({
        field:   k,
        message: err.errors[k].message,
      }));
      return res.status(400).json({ message: 'Validation failed', fields });
    }

    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// ── DELETE /api/announcements/:id ──────────────────────────────────────
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Announcement.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({ message: 'Announcement not found' });
    }

    res.json({ message: 'Deleted successfully', id: req.params.id });
  } catch (err) {
    console.error('DELETE /api/announcements/:id error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
const express    = require('express');
const router     = express.Router();
const RocsLog    = require('../models/RocsLog');
const Enrollment = require('../models/Enrollment');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);

// ── POST /api/rocs/agree ──────────────────────────────────────────────
router.post('/agree', async (req, res) => {
  try {
    const { courseId } = req.body;
    if (!courseId) return res.status(400).json({ message: 'courseId required' });

    const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim()
            || req.socket?.remoteAddress
            || null;
    const ua = req.headers['user-agent'] || null;

    await RocsLog.create({
      user_id:      req.user.id,
      course_id:    courseId,
      ip_address:   ip,
      user_agent:   ua,
      rocs_version: 'V4',
    });

    await Enrollment.findOneAndUpdate(
      { user_id: req.user.id, course_id: courseId },
      { $set: { rocs_agreed: true, rocs_agreed_at: new Date(), status: 'in_progress' } },
      { upsert: true, new: true }
    );

    res.json({ success: true, agreed_at: new Date() });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// ── GET /api/rocs/check/:courseId ─────────────────────────────────────
router.get('/check/:courseId', async (req, res) => {
  try {
    const enrollment = await Enrollment.findOne({
      user_id:   req.user.id,
      course_id: req.params.courseId,
    });

    res.json({
      agreed:    enrollment?.rocs_agreed    || false,
      agreed_at: enrollment?.rocs_agreed_at || null,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
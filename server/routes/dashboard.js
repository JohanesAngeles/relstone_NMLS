const express  = require('express');
const router   = express.Router();
const User     = require('../models/User');
const Course   = require('../models/Course');
const Order    = require('../models/Order');
const authMiddleware = require('../middleware/auth');

// ─────────────────────────────────────────────────────────────────────
// GET /api/dashboard
// ─────────────────────────────────────────────────────────────────────
router.get('/', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select('-password')
      .populate('completions.course_id', 'title type credit_hours nmls_course_id')
      .lean();

    if (!user) return res.status(404).json({ message: 'User not found' });

    // Split completions by type
    const peCompletions = (user.completions || []).filter(
      (c) => String(c.course_id?.type || '').toUpperCase() === 'PE'
    );
    const ceCompletions = (user.completions || []).filter(
      (c) => String(c.course_id?.type || '').toUpperCase() === 'CE'
    );

    // Fetch ALL orders for this student (paid AND pending)
    const orders = await Order.find({ user_id: req.user.id })
      .populate('items.course_id', 'title type credit_hours nmls_course_id price')
      .sort({ createdAt: -1 })
      .lean();

    // Courses the student has already completed (by course_id string)
    const completedIds = new Set(
      (user.completions || []).map((c) => c.course_id?._id?.toString())
    );

    // Build "available courses" from PAID orders
    // These are courses paid for but not yet in completions
    const availableCourses = [];
    orders.forEach((order) => {
      if (String(order.status).toLowerCase() !== 'paid') return;
      (order.items || []).forEach((item) => {
        const cid = item.course_id?._id?.toString();
        if (!cid) return;
        // avoid duplicates and already-completed
        const alreadyAdded = availableCourses.some((a) => a.course_id === cid);
        if (!alreadyAdded) {
          availableCourses.push({
            course_id:    cid,
            title:        item.course_id?.title        || 'Course',
            type:         item.course_id?.type         || '',
            credit_hours: item.course_id?.credit_hours || 0,
            nmls_course_id: item.course_id?.nmls_course_id || '',
            already_completed: completedIds.has(cid),
            order_id:     order._id,
          });
        }
      });
    });

    res.json({
      profile: {
        name:     user.name,
        email:    user.email,
        nmls_id:  user.nmls_id,
        state:    user.state,
        role:     user.role,
      },
      completions: {
        PE:    peCompletions,
        CE:    ceCompletions,
        total: user.completions?.length || 0,
      },
      available_courses: availableCourses,  // ← paid but not yet completed
      orders,
      pending_courses: [],
    });
  } catch (err) {
    console.error('[dashboard]', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────
// GET /api/dashboard/transcript
// ─────────────────────────────────────────────────────────────────────
router.get('/transcript', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select('name email nmls_id state completions')
      .populate('completions.course_id', 'title type credit_hours nmls_course_id')
      .lean();

    if (!user) return res.status(404).json({ message: 'User not found' });

    const transcript = (user.completions || []).map((c) => ({
      course_title:   c.course_id?.title          || 'Unknown',
      nmls_course_id: c.course_id?.nmls_course_id || '—',
      type:           c.course_id?.type           || '—',
      credit_hours:   c.course_id?.credit_hours   || 0,
      completed_at:   c.completed_at,
      certificate_url: c.certificate_url          || null,
    }));

    res.json({
      student: { name: user.name, email: user.email, nmls_id: user.nmls_id, state: user.state },
      transcript,
      total_hours: transcript.reduce((s, t) => s + Number(t.credit_hours || 0), 0),
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────
// POST /api/dashboard/complete/:courseId
// ─────────────────────────────────────────────────────────────────────
router.post('/complete/:courseId', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const alreadyDone = user.completions.some(
      (c) => c.course_id?.toString() === req.params.courseId
    );
    if (alreadyDone) return res.status(400).json({ message: 'Already completed' });

    user.completions.push({
      course_id:       req.params.courseId,
      completed_at:    new Date(),
      certificate_url: null,
    });
    await user.save();

    res.json({ message: 'Course marked as complete' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
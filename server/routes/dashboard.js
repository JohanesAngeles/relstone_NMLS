const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Order = require('../models/Order');
const authMiddleware = require('../middleware/auth');

// @route   GET /api/dashboard
// Get student's full dashboard
router.get('/', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select('-password')
      .populate('completions.course_id', 'title nmls_course_id type credit_hours states_approved');

    const orders = await Order.find({ user_id: req.user.id })
      .populate('items.course_id', 'title nmls_course_id type credit_hours');

    // Separate PE and CE completions
    const completedCourses = user.completions.map(c => ({
      course: c.course_id,
      completed_at: c.completed_at,
      certificate_url: c.certificate_url
    }));

    const completedPE = completedCourses.filter(c => c.course?.type === 'PE');
    const completedCE = completedCourses.filter(c => c.course?.type === 'CE');

    // Pending orders (paid but not yet completed)
    const pendingOrders = orders.filter(o => ['paid', 'pending'].includes(o.status));


    res.json({
      profile: {
        name: user.name,
        email: user.email,
        nmls_id: user.nmls_id,
        state: user.state
      },
      completions: {
        PE: completedPE,
        CE: completedCE,
        total: completedCourses.length
      },
      pending_courses: pendingOrders,
      orders
    });

  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// @route   GET /api/dashboard/transcript
// Get NMLS-reportable transcript
router.get('/transcript', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select('name email nmls_id state completions')
      .populate('completions.course_id', 'title nmls_course_id type credit_hours');

    const transcript = user.completions.map(c => ({
      course_title: c.course_id?.title,
      nmls_course_id: c.course_id?.nmls_course_id,
      type: c.course_id?.type,
      credit_hours: c.course_id?.credit_hours,
      completed_at: c.completed_at,
      certificate_url: c.certificate_url
    }));

    res.json({
      student: {
        name: user.name,
        email: user.email,
        nmls_id: user.nmls_id,
        state: user.state
      },
      transcript
    });

  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// @route   POST /api/dashboard/complete/:courseId
// Mark a course as completed (for testing; in prod this triggers after LMS completion)
router.post('/complete/:courseId', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    // Check if already completed
    const alreadyCompleted = user.completions.some(
      c => c.course_id.toString() === req.params.courseId
    );

    if (alreadyCompleted) {
      return res.status(400).json({ message: 'Course already completed' });
    }

    // Add completion
    user.completions.push({
      course_id: req.params.courseId,
      completed_at: new Date(),
      certificate_url: `https://nmls-certificates.com/${req.user.id}/${req.params.courseId}`
    });

    await user.save();
    res.json({ message: 'Course marked as completed', completions: user.completions });

  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
const express = require('express');
const router  = express.Router();
const User    = require('../models/User');
const Course  = require('../models/Course');
const Order   = require('../models/Order');
const authMiddleware = require('../middleware/auth');

const buildTranscript = async (user) => {
  const completions = user.completions || [];
  if (completions.length === 0) return [];

  const courseIds = completions
    .map((c) => c.course_id?._id || c.course_id)
    .filter(Boolean);

  const courses = await Course.find({ _id: { $in: courseIds } })
    .select('title type credit_hours nmls_course_id state_approval_number states_approved');

  const courseMap = {};
  courses.forEach((c) => { courseMap[String(c._id)] = c; });

  return completions.map((c) => {
    const cId    = String(c.course_id?._id || c.course_id || '');
    const course = courseMap[cId] || {};
    return {
      _id:             c._id,
      course_id: {
        _id:                   cId,
        title:                 course.title                || '—',
        type:                  course.type                 || '—',
        credit_hours:          course.credit_hours         || 0,
        nmls_course_id:        course.nmls_course_id       || '—',
        state_approval_number: course.state_approval_number || '—',
      },
      course_title:    course.title           || '—',
      type:            course.type            || '—',
      credit_hours:    course.credit_hours    || 0,
      nmls_course_id:  course.nmls_course_id  || '—',
      completed_at:    c.completed_at,
      certificate_url: c.certificate_url || null,
      state:           course.states_approved?.[0] || user.state || '—',
    };
  });
};

// GET /api/dashboard
router.get('/', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });

    // ── FIX: accept both 'paid' (old orders) and 'completed' (new orders)
    const orders = await Order.find({
      user_id: req.user.id,
      status:  { $in: ['paid', 'completed'] },
    }).populate('items.course_id', 'title type credit_hours nmls_course_id states_approved pdf_url');

    const completedCourseIds = new Set(
      (user.completions || []).map((c) => String(c.course_id?._id || c.course_id))
    );

    const seen = new Set();
    const available_courses = [];

    orders.forEach((order) => {
      (order.items || []).forEach((item) => {
        const course = item.course_id;
        if (!course) return;
        const courseId = String(course._id);
        if (seen.has(courseId)) return;
        seen.add(courseId);
        available_courses.push({
          course_id:         courseId,
          title:             course.title,
          type:              course.type,
          credit_hours:      course.credit_hours,
          nmls_course_id:    course.nmls_course_id,
          state:             course.states_approved?.[0] || 'Federal',
          already_completed: completedCourseIds.has(courseId),
          progress:          0,
        });
      });
    });

    res.json({
      user: {
        name:    user.name,
        email:   user.email,
        state:   user.state,
        nmls_id: user.nmls_id,
        role:    user.role,
      },
      available_courses,
      orders,
    });
  } catch (err) {
    console.error('GET /dashboard error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET /api/dashboard/transcript
router.get('/transcript', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    const transcript = await buildTranscript(user);
    res.json({ transcript });
  } catch (err) {
    console.error('GET /dashboard/transcript error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// POST /api/dashboard/complete
router.post('/complete', authMiddleware, async (req, res) => {
  try {
    const { courseId } = req.body;
    console.log(`POST /dashboard/complete — user: ${req.user.id}, courseId: ${courseId}`);
    if (!courseId) return res.status(400).json({ message: 'courseId is required' });

    const [user, course] = await Promise.all([
      User.findById(req.user.id),
      Course.findById(courseId).select('title type credit_hours nmls_course_id states_approved'),
    ]);

    if (!user)   return res.status(404).json({ message: 'User not found' });
    if (!course) return res.status(404).json({ message: 'Course not found' });

    const alreadyDone = (user.completions || []).some(
      (c) => String(c.course_id?._id || c.course_id) === String(courseId)
    );

    if (alreadyDone) {
      return res.json({ message: 'Already completed', already_existed: true });
    }

    user.completions.push({ course_id: courseId, completed_at: new Date() });
    await user.save();
    console.log(`✅ Completion saved — user: ${req.user.id}, course: ${courseId}`);

    res.json({
      message:         'Course completion saved successfully',
      already_existed: false,
      completion: { course_id: courseId, course_title: course.title, completed_at: new Date() },
    });
  } catch (err) {
    console.error('POST /dashboard/complete error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
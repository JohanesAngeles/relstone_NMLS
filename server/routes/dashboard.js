const express = require('express');
const router  = express.Router();
const User    = require('../models/User');
const Course  = require('../models/Course');
const Order   = require('../models/Order');
const CourseProgress = require('../models/CourseProgress');
const authMiddleware = require('../middleware/auth');

// ─────────────────────────────────────────────────────────────────────────────
// Helper: build enriched transcript from user.completions
// ─────────────────────────────────────────────────────────────────────────────
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

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/dashboard
// ─────────────────────────────────────────────────────────────────────────────
router.get('/', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });

    // ── FIX: query by BOTH user_id field names to be safe,
    //         and ensure status is exactly 'completed' (lowercase)
    const orders = await Order.find({
      user_id: req.user.id,
      status:  'completed',
    }).populate('items.course_id', 'title type credit_hours nmls_course_id states_approved pdf_url');

    // Set of completed course IDs for quick lookup
    const completedCourseIds = new Set(
      (user.completions || []).map((c) => String(c.course_id?._id || c.course_id))
    );

    const seen = new Set();
    const available_courses = [];

    const progressDocs = await CourseProgress.find({ user_id: req.user.id }).select(
      'course_id completed_idxs current_idx total_steps is_completed last_activity_at reset_at'
    );
    const progressMap = new Map();
    progressDocs.forEach((p) => {
      progressMap.set(String(p.course_id), p);
    });

    orders.forEach((order) => {
      (order.items || []).forEach((item) => {
        const course = item.course_id;
        if (!course) return;
        const courseId = String(course._id);
        if (seen.has(courseId)) return;
        seen.add(courseId);

        const p = progressMap.get(courseId);
        const completedCount = Array.isArray(p?.completed_idxs) ? p.completed_idxs.length : 0;
        const totalSteps = p?.total_steps || 0;
        const percent =
          totalSteps > 0 ? Math.min(100, Math.round((completedCount / totalSteps) * 100)) : 0;

        available_courses.push({
          course_id:         courseId,
          title:             course.title,
          type:              course.type,
          credit_hours:      course.credit_hours,
          nmls_course_id:    course.nmls_course_id,
          state:             course.states_approved?.[0] || 'Federal',
          already_completed: completedCourseIds.has(courseId),
          progress:          percent,
          total_steps:       totalSteps,
          completed_steps:   completedCount,
          current_idx:       p?.current_idx || 0,
          last_activity_at:  p?.last_activity_at || null,
          reset_at:          p?.reset_at || null,
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

// ─────────────────────────────────────────────────────────────────────────────
// Progress APIs (per-user, per-course)
// ─────────────────────────────────────────────────────────────────────────────

// GET /api/dashboard/progress/:courseId
router.get('/progress/:courseId', authMiddleware, async (req, res) => {
  try {
    const { courseId } = req.params;
    if (!courseId) return res.status(400).json({ message: 'courseId is required' });

    const doc = await CourseProgress.findOne({
      user_id: req.user.id,
      course_id: courseId,
    }).select('course_id completed_idxs current_idx total_steps is_completed completed_at last_activity_at reset_at');

    if (!doc) {
      return res.json({
        course_id: courseId,
        completed_idxs: [],
        current_idx: 0,
        total_steps: 0,
        is_completed: false,
        completed_at: null,
        last_activity_at: null,
        reset_at: null,
      });
    }

    res.json(doc);
  } catch (err) {
    console.error('GET /dashboard/progress/:courseId error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// PUT /api/dashboard/progress/:courseId
router.put('/progress/:courseId', authMiddleware, async (req, res) => {
  try {
    const { courseId } = req.params;
    const { completed_idxs, current_idx, total_steps } = req.body || {};
    if (!courseId) return res.status(400).json({ message: 'courseId is required' });

    const update = {
      last_activity_at: new Date(),
    };

    if (Array.isArray(completed_idxs)) update.completed_idxs = completed_idxs;
    if (Number.isFinite(current_idx)) update.current_idx = current_idx;
    if (Number.isFinite(total_steps)) update.total_steps = total_steps;

    const doc = await CourseProgress.findOneAndUpdate(
      { user_id: req.user.id, course_id: courseId },
      { $set: update, $setOnInsert: { user_id: req.user.id, course_id: courseId } },
      { new: true, upsert: true }
    ).select('course_id completed_idxs current_idx total_steps is_completed completed_at last_activity_at reset_at');

    res.json(doc);
  } catch (err) {
    console.error('PUT /dashboard/progress/:courseId error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// POST /api/dashboard/progress/:courseId/reset
router.post('/progress/:courseId/reset', authMiddleware, async (req, res) => {
  try {
    const { courseId } = req.params;
    if (!courseId) return res.status(400).json({ message: 'courseId is required' });

    const doc = await CourseProgress.findOneAndUpdate(
      { user_id: req.user.id, course_id: courseId },
      {
        $set: {
          completed_idxs: [],
          current_idx: 0,
          is_completed: false,
          completed_at: null,
          last_activity_at: new Date(),
          reset_at: new Date(),
        },
        $setOnInsert: { user_id: req.user.id, course_id: courseId },
      },
      { new: true, upsert: true }
    ).select('course_id completed_idxs current_idx total_steps is_completed completed_at last_activity_at reset_at');

    res.json({ message: 'Progress reset', progress: doc });
  } catch (err) {
    console.error('POST /dashboard/progress/:courseId/reset error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/dashboard/transcript
// ─────────────────────────────────────────────────────────────────────────────
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

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/dashboard/complete
// Called by CoursePortal when student passes the final exam.
// ─────────────────────────────────────────────────────────────────────────────
router.post('/complete', authMiddleware, async (req, res) => {
  try {
    const { courseId } = req.body;

    // ── FIX: log incoming data so you can debug if this still fails
    console.log(`POST /dashboard/complete — user: ${req.user.id}, courseId: ${courseId}`);

    if (!courseId) return res.status(400).json({ message: 'courseId is required' });

    const [user, course] = await Promise.all([
      User.findById(req.user.id),
      Course.findById(courseId).select('title type credit_hours nmls_course_id states_approved'),
    ]);

    if (!user)   return res.status(404).json({ message: 'User not found' });
    if (!course) return res.status(404).json({ message: 'Course not found' });

    // Idempotent — don't double-save
    const alreadyDone = (user.completions || []).some(
      (c) => String(c.course_id?._id || c.course_id) === String(courseId)
    );

    if (alreadyDone) {
      console.log(`Course ${courseId} already completed for user ${req.user.id}`);
      return res.json({ message: 'Already completed', already_existed: true });
    }

    user.completions.push({
      course_id:    courseId,
      completed_at: new Date(),
    });

    await user.save();

    // Mark progress completed (doesn't affect transcript; transcript is source of truth)
    await CourseProgress.findOneAndUpdate(
      { user_id: req.user.id, course_id: courseId },
      {
        $set: {
          is_completed: true,
          completed_at: new Date(),
          last_activity_at: new Date(),
        },
        $setOnInsert: { user_id: req.user.id, course_id: courseId },
      },
      { upsert: true }
    );

    console.log(`✅ Completion saved — user: ${req.user.id}, course: ${courseId}`);

    res.json({
      message:         'Course completion saved successfully',
      already_existed: false,
      completion: {
        course_id:    courseId,
        course_title: course.title,
        completed_at: new Date(),
      },
    });
  } catch (err) {
    console.error('POST /dashboard/complete error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────
// GET /api/dashboard/ce-tracker
// ─────────────────────────────────────────────────────────────────────
router.get('/ce-tracker', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select('-password')
      .populate('completions.course_id', 'title type credit_hours nmls_course_id')
      .lean();

    if (!user) return res.status(404).json({ message: 'User not found' });

    // Get only CE completions from the current renewal cycle
    const ceCompletions = (user.completions || []).filter(
      (c) => String(c.course_id?.type || '').toUpperCase() === 'CE'
    );

    // Calculate total CE hours completed in this cycle
    const ceCompleted = ceCompletions.reduce(
      (sum, c) => sum + Number(c.course_id?.credit_hours || 0),
      0
    );

    // State-based CE requirements (default to 30, can be customized per state)
    const stateRequirements = {
      'CA': 36,
      'NY': 24,
      'TX': 30,
      'FL': 24,
      'IL': 24,
      'PA': 24,
      'OH': 24,
      'GA': 24,
      'NC': 24,
      'MI': 24,
      'NJ': 24,
      'VA': 24,
      'WA': 24,
      'AZ': 24,
      'MA': 24,
      'CO': 30,
    };

    const ceRequired = stateRequirements[user.state] || 30;
    const ceRemaining = Math.max(0, ceRequired - ceCompleted);

    // Build completed courses list
    const completedCourses = ceCompletions.map((c) => ({
      title:           c.course_id?.title          || 'Unknown',
      nmls_course_id:  c.course_id?.nmls_course_id || '—',
      credit_hours:    c.course_id?.credit_hours   || 0,
      completed_at:    c.completed_at,
      certificate_url: c.certificate_url           || null,
    }));

    // Determine renewal status
    const renewalStatus = ceRemaining === 0 ? 'completed' : 'in-progress';

    res.json({
      state:              user.state,
      ce_required:        ceRequired,
      ce_completed:       ceCompleted,
      ce_remaining:       ceRemaining,
      renewal_deadline:   user.ce_renewal_deadline,
      renewal_status:     renewalStatus,
      completed_courses:  completedCourses,
    });
  } catch (err) {
    console.error('[ce-tracker]', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;